const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    images: { type: [String], default: [] },
    video: { type: String, default: "" },
    title: String,
    description: String,
    mainCategory: { type: String, default: "" },
    category: String,
    subCategory: { type: String, default: "" },
    childCategory: { type: String, default: "" },
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    ingredients: String,
    benefits: String,
    howToUse: String,
    dosage: String,
    isFeatured: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: Date,
    offerLabel: { type: String, default: "Flash Sale" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
