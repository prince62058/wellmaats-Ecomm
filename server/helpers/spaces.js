const crypto = require("crypto");
const multer = require("multer");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const REGION = process.env.DO_SPACES_REGION || "sgp1";
const ENDPOINT = process.env.DO_SPACES_ENDPOINT || `https://${REGION}.digitaloceanspaces.com`;
const BUCKET = process.env.DO_SPACES_BUCKET;
const FOLDER = process.env.DO_SPACES_FOLDER || "Wellmaats";
// Path-style URL (bucket in the path, not the hostname). Required when the
// bucket name contains a dot (e.g. "marketingkart.aii") — DO's wildcard TLS
// cert (*.sgp1.digitaloceanspaces.com) does not match a dotted subdomain, so
// virtual-hosted-style URLs (bucket.sgp1.digitaloceanspaces.com) fail TLS
// verification in browsers/curl. Path-style always works.
const CDN_URL = process.env.DO_SPACES_CDN_URL || `${ENDPOINT}/${BUCKET}`;

const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

const storage = new multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for high-res images & product videos
});

function guessExtension(mimetype = "", originalname = "") {
  if (originalname && originalname.includes(".")) {
    return originalname.split(".").pop().toLowerCase();
  }
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return map[mimetype] || "bin";
}

/**
 * Upload a file buffer to DigitalOcean Spaces.
 * Kept API-compatible with the old Cloudinary helper: returns an object with
 * `url` / `secure_url` and `public_id` so existing controllers don't need to change.
 */
async function uploadBufferToSpaces(buffer, mimetype, originalname = "") {
  const ext = guessExtension(mimetype, originalname);
  const key = `${FOLDER}/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype || "application/octet-stream",
      ACL: "public-read",
    })
  );

  const url = `${CDN_URL}/${key}`;
  return { url, secure_url: url, public_id: key };
}

/**
 * Accepts either a raw Buffer or a base64 data URI (to mirror the old
 * `imageUploadUtil(dataUri)` signature used across the codebase).
 */
async function imageUploadUtil(fileOrDataUri, mimetypeHint, originalname) {
  if (Buffer.isBuffer(fileOrDataUri)) {
    return uploadBufferToSpaces(fileOrDataUri, mimetypeHint, originalname);
  }

  if (typeof fileOrDataUri === "string" && fileOrDataUri.startsWith("data:")) {
    const match = fileOrDataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URI passed to imageUploadUtil");
    const [, mimetype, b64] = match;
    const buffer = Buffer.from(b64, "base64");
    return uploadBufferToSpaces(buffer, mimetype, originalname);
  }

  throw new Error("imageUploadUtil expects a Buffer or a base64 data URI");
}

async function deleteFromSpaces(keyOrUrl) {
  let key = keyOrUrl;
  if (keyOrUrl.startsWith("http")) {
    const url = new URL(keyOrUrl);
    key = url.pathname.replace(/^\//, "");
  }
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { upload, imageUploadUtil, uploadBufferToSpaces, deleteFromSpaces, s3, BUCKET, FOLDER, CDN_URL };
