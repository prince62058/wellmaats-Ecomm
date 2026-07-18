const mongoose = require("mongoose");

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    brand: {
      company: String,
      name: String,
      tagline: String,
      category: String,
    },
    contact: {
      phone: String,
      email: String,
      whatsapp: String,
      office: String,
      manufacturing: String,
      hours: String,
    },
    social: [{ platform: String, url: String }],
    productCategories: [{ id: String, label: String }],
    megaMenu: mongoose.Schema.Types.Mixed,
    brands: [{ id: String, label: String }],
    footerLinks: mongoose.Schema.Types.Mixed,
    trustBadges: [String],
    paymentMethods: [String],
    deliveryPartners: [String],
    productBadges: [{ label: String, icon: String }],
    whyChooseUs: [{ icon: String, title: String, desc: String }],
    healthBenefits: [{ title: String, desc: String }],
    testimonials: [{ name: String, city: String, rating: Number, text: String, verified: Boolean }],
    doctors: [{ name: String, title: String, exp: String, specialty: String }],
    faq: [{ q: String, a: String }],
    stats: [{ value: Number, suffix: String, label: String, decimals: Number }],
    newsletter: { title: String, subtitle: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
