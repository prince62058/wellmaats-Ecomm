/**
 * One-off migration: copies every Cloudinary-hosted media file referenced in
 * MongoDB (users.avatar, products.image/images/video, sitesettings.brand.logo,
 * sitesettings.heroSlides[].image, ...) into the DigitalOcean Space configured
 * via DO_SPACES_* env vars, then rewrites the DB documents to point at the
 * new Spaces URL.
 *
 * Safe to re-run: any URL that is already on digitaloceanspaces.com is skipped.
 *
 * Usage:
 *   node scripts/migrate-cloudinary-to-spaces.js            # dry run (no DB writes)
 *   node scripts/migrate-cloudinary-to-spaces.js --apply     # actually upload + update DB
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const https = require("https");
const http = require("http");
const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const APPLY = process.argv.includes("--apply");

const REGION = process.env.DO_SPACES_REGION || "sgp1";
const ENDPOINT = process.env.DO_SPACES_ENDPOINT || `https://${REGION}.digitaloceanspaces.com`;
const BUCKET = process.env.DO_SPACES_BUCKET;
const FOLDER = process.env.DO_SPACES_FOLDER || "Wellmaats";
// Path-style URL — see helpers/spaces.js for why (dotted bucket name breaks
// DO's wildcard TLS cert on virtual-hosted-style URLs).
const CDN_URL = process.env.DO_SPACES_CDN_URL || `${ENDPOINT}/${BUCKET}`;

if (!process.env.DO_SPACES_KEY || !process.env.DO_SPACES_SECRET || !BUCKET) {
  console.error("Missing DO_SPACES_KEY / DO_SPACES_SECRET / DO_SPACES_BUCKET in server/.env");
  process.exit(1);
}

const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(downloadBuffer(res.headers.location));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`GET ${url} -> ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers["content-type"] }));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

function extFromUrl(url, contentType) {
  const clean = url.split("?")[0];
  const last = clean.split("/").pop();
  if (last && last.includes(".")) return last.split(".").pop().toLowerCase();
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "video/mp4": "mp4",
  };
  return (contentType && map[contentType]) || "bin";
}

// path -> new URL cache, so the same source URL used in multiple fields
// (e.g. image + images[0]) is only uploaded once.
const urlCache = new Map();

async function migrateUrl(oldUrl) {
  if (!oldUrl || typeof oldUrl !== "string") return oldUrl;
  if (!oldUrl.includes("cloudinary")) return oldUrl;
  if (urlCache.has(oldUrl)) return urlCache.get(oldUrl);

  const secureUrl = oldUrl.replace(/^http:\/\//, "https://");
  console.log(`  downloading ${secureUrl}`);
  const { buffer, contentType } = await downloadBuffer(secureUrl);
  const ext = extFromUrl(secureUrl, contentType);
  const key = `${FOLDER}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

  if (APPLY) {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType || "application/octet-stream",
        ACL: "public-read",
      })
    );
  }

  const newUrl = `${CDN_URL}/${key}`;
  console.log(`  -> ${newUrl} (${(buffer.length / 1024).toFixed(1)} KB)${APPLY ? "" : " [dry-run]"}`);
  urlCache.set(oldUrl, newUrl);
  return newUrl;
}

// Recursively walk an object, replacing any cloudinary string it finds via
// migrateUrl(). Returns true if anything changed.
async function migrateInPlace(obj) {
  let changed = false;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "string" && obj[i].includes("cloudinary")) {
        obj[i] = await migrateUrl(obj[i]);
        changed = true;
      } else if (obj[i] && typeof obj[i] === "object") {
        if (await migrateInPlace(obj[i])) changed = true;
      }
    }
  } else if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === "string" && v.includes("cloudinary")) {
        obj[k] = await migrateUrl(v);
        changed = true;
      } else if (v && typeof v === "object") {
        if (await migrateInPlace(v)) changed = true;
      }
    }
  }
  return changed;
}

async function migrateCollection(db, name) {
  const coll = db.collection(name);
  const docs = await coll.find({}).toArray();
  let migratedDocs = 0;

  for (const doc of docs) {
    const before = JSON.stringify(doc);
    const changed = await migrateInPlace(doc);
    if (changed) {
      console.log(`[${name}] ${doc._id} updated`);
      migratedDocs++;
      if (APPLY) {
        const { _id, ...rest } = doc;
        await coll.updateOne({ _id }, { $set: rest });
      }
    }
    void before;
  }
  return { total: docs.length, migratedDocs };
}

async function main() {
  console.log(`Mode: ${APPLY ? "APPLY (writing to Spaces + DB)" : "DRY RUN (no writes, pass --apply to persist)"}`);
  console.log(`Target bucket: ${BUCKET}, folder: ${FOLDER}, CDN base: ${CDN_URL}\n`);

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = ["users", "products", "sitesettings"];
  const report = {};
  for (const name of collections) {
    console.log(`\n=== ${name} ===`);
    report[name] = await migrateCollection(db, name);
  }

  console.log("\n=== Summary ===");
  for (const [name, r] of Object.entries(report)) {
    console.log(`${name}: ${r.migratedDocs}/${r.total} documents updated`);
  }
  console.log(`Unique files migrated: ${urlCache.size}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
