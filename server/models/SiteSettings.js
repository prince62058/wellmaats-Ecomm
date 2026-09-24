const mongoose = require("mongoose");

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    brand: { company: String, name: String, tagline: String, category: String, logo: String, siteUrl: String },
    themeColors: mongoose.Schema.Types.Mixed,
    contact: { phone: String, email: String, whatsapp: String, office: String, manufacturing: String, hours: String },
    social: [{ platform: String, url: String }],

    // ── Header / Top-of-site ──
    announcementBar: mongoose.Schema.Types.Mixed,   // { enabled, messages: [String] }
    heroSlides: mongoose.Schema.Types.Mixed,         // [{ image, badge, title, subtitle, cta, link, gradient }]
    headerNavLinks: mongoose.Schema.Types.Mixed,     // [{ label, href, icon }]
    marqueeMessages: [String],                       // spinning trust strip in home

    // ── Shop / Categories ──
    productCategories: mongoose.Schema.Types.Mixed,
    brands: mongoose.Schema.Types.Mixed,
    quickFilters: mongoose.Schema.Types.Mixed,

    // ── Mega Menu ──
    megaMenu: mongoose.Schema.Types.Mixed,

    // ── Home Sections ──
    promoBanners: mongoose.Schema.Types.Mixed,

    // ── Content ──
    whyChooseUs: mongoose.Schema.Types.Mixed,
    healthBenefits: mongoose.Schema.Types.Mixed,
    testimonials: mongoose.Schema.Types.Mixed,
    doctors: mongoose.Schema.Types.Mixed,
    faq: mongoose.Schema.Types.Mixed,
    stats: mongoose.Schema.Types.Mixed,
    newsletter: mongoose.Schema.Types.Mixed,

    // ── Footer ──
    footerLinks: mongoose.Schema.Types.Mixed,
    trustBadges: [String],
    paymentMethods: [String],
    deliveryPartners: [String],
    productBadges: mongoose.Schema.Types.Mixed,

    // ── Policies & Legal ──
    policies: mongoose.Schema.Types.Mixed,

    // ── Dynamic Shipping & Delivery Settings ──
    shippingSettings: {
      freeDeliveryThreshold: { type: Number, default: 2499 }, // Orders >= ₹2499 get free delivery
      enableWeightBasedShipping: { type: Boolean, default: true },
      baseShippingCharge: { type: Number, default: 70 },       // Base delivery fee (e.g. ₹70)
      baseWeightLimitGrams: { type: Number, default: 500 },    // Up to 500g
      additionalChargePerKg: { type: Number, default: 40 },    // +₹40 per additional 1000g
      flatFallbackDeliveryCharge: { type: Number, default: 70 },
      deliveryNotice: { type: String, default: "Free delivery on all orders above ₹2,499!" },
    },

    // ── Dynamic Tax / GST Settings ──
    taxSettings: {
      defaultGstRate: { type: Number, default: 5 }, // Default GST % (e.g. 5%)
      gstNumber: { type: String, default: "" }, // GSTIN
      panNumber: { type: String, default: "" },
      pricesIncludeGst: { type: Boolean, default: true }, // Prices displayed are GST inclusive
      taxInvoicePrefix: { type: String, default: "INV-WM" },
    },

    // ── Default Brand Manufacturing & Selling Info ──
    defaultManufacturingDetails: {
      manufacturedBy: { type: String, default: "" },
      manufacturerAddress: { type: String, default: "" },
      mfgLicenseNumber: { type: String, default: "" },
      soldBy: { type: String, default: "Wellmaats Healthcare" },
      sellerAddress: { type: String, default: "" },
      customerCareContact: { type: String, default: "" },
      countryOfOrigin: { type: String, default: "India" },
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
