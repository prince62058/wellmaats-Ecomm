#!/usr/bin/env node
/**
 * End-to-end API flow test for Mother Tatwa MERN app
 */
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const FormData = require("form-data");

const BASE = `http://localhost:${process.env.PORT || 5001}`;
let cookie = "";
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`❌ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function api(method, url, data, opts = {}) {
  const res = await axios({
    method,
    url: BASE + url,
    data,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(opts.headers || {}),
    },
    validateStatus: () => true,
    maxRedirects: 0,
  });

  const setCookie = res.headers["set-cookie"];
  if (setCookie?.length) {
    cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  }
  return res;
}

async function setupUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require("./models/User");
  const bcrypt = require("bcryptjs");

  const users = [
    { userName: "Admin Test", email: "localtest@example.com", password: "secret123", role: "admin" },
    { userName: "User Test", email: "user@example.com", password: "user123", role: "user" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await User.findOneAndUpdate(
      { email: u.email },
      { $set: { userName: u.userName, password: hash, role: u.role } },
      { upsert: true }
    );
  }
  await mongoose.disconnect();
}

async function run() {
  console.log("\n🧪 Mother Tatwa — Full Flow Test\n");
  console.log(`Server: ${BASE}\n`);

  // ── Setup test users in Atlas ──
  try {
    await setupUsers();
    pass("DB: Test users ready", "admin + customer");
  } catch (e) {
    fail("DB: Test users", e.message);
    process.exit(1);
  }

  // ── 1. Public APIs ──
  let r = await api("get", "/api/common/site-settings/get");
  if (r.data?.success && r.data?.data?.brand?.name) {
    pass("Site Settings", r.data.data.brand.name);
  } else fail("Site Settings", JSON.stringify(r.data));

  r = await api("get", "/api/common/feature/get");
  if (r.data?.success && r.data?.data?.length > 0) {
    pass("Home Banners", `${r.data.data.length} banners`);
  } else fail("Home Banners");

  r = await api("get", "/api/shop/products/get");
  if (r.data?.success && r.data?.data?.length >= 12) {
    pass("Shop Products", `${r.data.data.length} products`);
  } else fail("Shop Products", `count=${r.data?.data?.length}`);

  r = await api("get", "/api/shop/products/get?flashSale=true");
  const flashCount = r.data?.data?.length || 0;
  if (r.data?.success && flashCount > 0) {
    pass("Flash Sale Filter", `${flashCount} products`);
  } else fail("Flash Sale Filter");

  r = await api("get", "/api/shop/products/get?onSale=true");
  if (r.data?.success && r.data?.data?.length > 0) {
    pass("On Discount Filter", `${r.data.data.length} products`);
  } else fail("On Discount Filter");

  const productId = r.data?.data?.[0]?._id;
  r = await api("get", `/api/shop/products/get/${productId}`);
  if (r.data?.success && r.data?.data?.title) {
    pass("Product Details", r.data.data.title);
  } else fail("Product Details");

  r = await api("get", "/api/shop/search/mother");
  if (r.data?.success) {
    pass("Search", `${r.data.data?.length || 0} results for 'mother'`);
  } else fail("Search");

  // ── 2. Customer auth + cart + address ──
  cookie = "";
  r = await api("post", "/api/auth/login", {
    email: "user@example.com",
    password: "user123",
  });
  let userId = r.data?.user?.id;
  if (r.data?.success && userId) {
    pass("Customer Login", r.data.user.userName);
  } else fail("Customer Login", r.data?.message);

  r = await api("get", "/api/auth/check-auth");
  if (r.data?.success) pass("Auth Check (customer)");
  else fail("Auth Check (customer)");

  r = await api("post", "/api/shop/cart/add", {
    userId,
    productId,
    quantity: 1,
  });
  if (r.data?.success) pass("Add to Cart");
  else fail("Add to Cart", r.data?.message);

  r = await api("get", `/api/shop/cart/get/${userId}`);
  if (r.data?.success && r.data?.data?.items?.length > 0) {
    pass("Fetch Cart", `${r.data.data.items.length} item(s)`);
  } else fail("Fetch Cart");

  r = await api("post", "/api/shop/address/add", {
    userId,
    address: "123 Test Street, MG Road",
    city: "Mumbai",
    pincode: "400001",
    phone: "9876543210",
    notes: "Test delivery",
  });
  let addressId = r.data?.data?._id;
  if (r.data?.success && addressId) {
    pass("Add Address", addressId);
  } else fail("Add Address", r.data?.message);

  r = await api("get", `/api/shop/address/get/${userId}`);
  if (r.data?.success && r.data?.data?.length > 0) {
    pass("Fetch Addresses", `${r.data.data.length} address(es)`);
  } else fail("Fetch Addresses");

  // ── 3. Order create (Razorpay) ──
  const cartRes = await api("get", `/api/shop/cart/get/${userId}`);
  const cartItems = cartRes.data?.data?.items || [];
  const totalAmount = cartItems.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0
  );

  r = await api("post", "/api/shop/order/create", {
    userId,
    cartId: cartRes.data?.data?._id,
    cartItems: cartItems.map((i) => ({
      productId: i.productId,
      title: i.title || "Test Product",
      image: i.image || "/products/signature.jpg",
      price: String(i.price),
      quantity: i.quantity,
    })),
    addressInfo: {
      addressId,
      address: "123 Test Street",
      city: "Mumbai",
      pincode: "400001",
      phone: "9876543210",
      notes: "Test",
    },
    orderStatus: "pending",
    paymentMethod: "razorpay",
    paymentStatus: "pending",
    totalAmount,
    orderDate: new Date(),
    orderUpdateDate: new Date(),
  });

  if (r.data?.success && r.data?.razorpayOrderId) {
    pass("Create Order (Razorpay)", `orderId=${r.data.orderId}`);

    // ── Payment capture (simulates Razorpay success callback) ──
    const razorpayOrderId = r.data.razorpayOrderId;
    const orderId = r.data.orderId;
    const razorpayPaymentId = `pay_test_${Date.now()}`;
    const razorpaySignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    r = await api("post", "/api/shop/order/capture", {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    });

    if (r.data?.success && r.data?.data?.paymentStatus === "paid") {
      pass("Payment Capture", `paid · status=${r.data.data.orderStatus}`);
    } else fail("Payment Capture", r.data?.message || JSON.stringify(r.data));

    // Cart should clear after successful payment
    r = await api("get", `/api/shop/cart/get/${userId}`);
    const cartEmpty = !r.data?.data?.items?.length;
    if (cartEmpty) pass("Cart Cleared After Payment");
    else fail("Cart Cleared After Payment", `${r.data?.data?.items?.length} items remain`);

    r = await api("get", `/api/shop/order/details/${orderId}`);
    if (r.data?.success && r.data?.data?.paymentStatus === "paid") {
      pass("Paid Order Details", `₹${r.data.data.totalAmount}`);
    } else fail("Paid Order Details");
  } else fail("Create Order", r.data?.message || JSON.stringify(r.data));

  r = await api("get", `/api/shop/order/list/${userId}`);
  if (r.data?.success && r.data?.data?.length > 0) {
    pass("Customer Order History", `${r.data.data.length} order(s)`);
  } else fail("Customer Order History");

  // ── 4. Admin flow ──
  cookie = "";
  r = await api("post", "/api/auth/login", {
    email: "localtest@example.com",
    password: "secret123",
  });
  if (r.data?.success && r.data?.user?.role === "admin") {
    pass("Admin Login", r.data.user.email);
  } else fail("Admin Login", r.data?.message || `role=${r.data?.user?.role}`);

  r = await api("get", "/api/admin/products/get");
  if (r.data?.success && r.data?.data?.length > 0) {
    pass("Admin Products List", `${r.data.data.length} products`);
  } else fail("Admin Products List");

  // Cloudinary upload test
  const imgPath = path.join(__dirname, "../client/public/products/signature.jpg");
  if (fs.existsSync(imgPath)) {
    const form = new FormData();
    form.append("my_file", fs.createReadStream(imgPath));
    r = await api("post", "/api/admin/products/upload-image", form, {
      headers: form.getHeaders(),
    });
    if (r.data?.success && r.data?.result?.secure_url) {
      pass("Cloudinary Upload", r.data.result.secure_url.slice(0, 60) + "...");
    } else fail("Cloudinary Upload", r.data?.message || JSON.stringify(r.data));
  } else {
    fail("Cloudinary Upload", "sample image not found");
  }

  r = await api("get", "/api/admin/orders/get");
  if (r.data?.success) {
    pass("Admin Orders List", `${r.data.data?.length || 0} order(s)`);
    if (r.data.data?.length > 0) {
      const orderId = r.data.data[0]._id;
      r = await api("get", `/api/admin/orders/details/${orderId}`);
      if (r.data?.success && r.data?.data?.cartItems?.length > 0) {
        pass("Admin Order Details", `${r.data.data.cartItems.length} item(s) with images`);
        r = await api("put", `/api/admin/orders/update/${orderId}`, {
          orderStatus: "confirmed",
        });
        if (r.data?.success) pass("Admin Update Order Status", "→ confirmed");
        else fail("Admin Update Order Status", r.data?.message);
      } else fail("Admin Order Details");
    }
  } else fail("Admin Orders List");

  r = await api("get", "/api/common/site-settings/get");
  if (r.data?.success) pass("Site Settings (post-admin)");
  else fail("Site Settings (post-admin)");

  // ── 5. Client reachable ──
  try {
    const clientRes = await axios.get("http://localhost:5173", { validateStatus: () => true });
    if (clientRes.status === 200) pass("Client Dev Server", "localhost:5173");
    else fail("Client Dev Server", `status ${clientRes.status}`);
  } catch (e) {
    fail("Client Dev Server", e.message);
  }

  // ── Summary ──
  const passed = results.filter((x) => x.ok).length;
  const failed = results.filter((x) => !x.ok).length;
  console.log("\n" + "─".repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${results.length}`);
  if (failed > 0) {
    console.log("\nFailed tests:");
    results.filter((x) => !x.ok).forEach((x) => console.log(`  • ${x.name}: ${x.detail}`));
    process.exit(1);
  }
  console.log("\n🎉 All flows working!\n");
}

run().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
