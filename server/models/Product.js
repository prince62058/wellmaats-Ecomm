const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
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
