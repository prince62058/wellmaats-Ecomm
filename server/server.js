require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopBlogRouter = require("./routes/shop/blog-routes");
const shopWishlistRouter  = require("./routes/shop/wishlist-routes");
const shopReferralRouter  = require("./routes/shop/referral-routes");
const adminBlogRouter = require("./routes/admin/blog-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");
const commonSiteSettingsRouter = require("./routes/common/site-settings-routes");
const adminSiteSettingsRouter = require("./routes/admin/site-settings-routes");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mern-ecommerce")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("loca.lt") ||
        origin.includes("localtunnel.me") ||
        origin.includes("onrender.com") ||
        origin.includes("replit.dev") ||
        origin.includes("replit.app")
      ) {
        callback(null, true);
      } else {
        callback(null, process.env.CLIENT_URL || "http://localhost:5173");
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/shop/blog", shopBlogRouter);
app.use("/api/shop/wishlist",  shopWishlistRouter);
app.use("/api/shop/referral", shopReferralRouter);
app.use("/api/admin/blog", adminBlogRouter);

app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/common/site-settings", commonSiteSettingsRouter);
app.use("/api/admin/site-settings", adminSiteSettingsRouter);

// Serve React build
const path = require("path");
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);

app.listen(PORT, "0.0.0.0", () => console.log(`Server is now running on port ${PORT}`));
