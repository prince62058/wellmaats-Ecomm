const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    products: [{ type: String }], // product _id strings
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
