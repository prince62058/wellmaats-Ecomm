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

    // Dynamic Product Type / Dosage Form (Capsule, Tablet, Syrup, Powder, Oil, Ointment, etc.)
    productType: { type: String, default: "Capsule" },

    // Tax & GST Compliance (Dynamic per product)
    gstRate: { type: Number, default: 5 }, // GST % (default 5% for Ayurvedic products)
    hsnCode: { type: String, default: "3004" }, // HSN code (default 3004 for medicaments)
    isTaxInclusive: { type: Boolean, default: true }, // Selling price includes GST

    // Size / Packaging (e.g. 60 Capsules, 200 ml, 100 gm)
    sizeValue: { type: String, default: "" },
    sizeUnit: { type: String, default: "" },

    // Measurable Weight (for shipping fee calculation & product specs)
    netWeight: { type: Number, default: 0 },
    weightUnit: { type: String, default: "gm" }, // gm, kg, ml, l
    grossWeightInGrams: { type: Number, default: 250 }, // Total package weight in grams for delivery calculation

    // Dynamic Manufacturing & Seller Details
    manufacturingDetails: {
      manufacturedBy: { type: String, default: "" },
      manufacturerAddress: { type: String, default: "" },
      mfgLicenseNumber: { type: String, default: "" },
      soldBy: { type: String, default: "" },
      sellerAddress: { type: String, default: "" },
      customerCareContact: { type: String, default: "" },
      countryOfOrigin: { type: String, default: "India" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
