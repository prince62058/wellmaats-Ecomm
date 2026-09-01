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
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
