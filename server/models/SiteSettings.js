const mongoose = require("mongoose");

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    brand: { company: String, name: String, tagline: String, category: String, logo: String },
    contact: { phone: String, email: String, whatsapp: String, office: String, manufacturing: String, hours: String },
    social: [{ platform: String, url: String }],

    // ── Header / Top-of-site ──
    announcementBar: mongoose.Schema.Types.Mixed,   // { enabled, messages: [String] }
    heroSlides: mongoose.Schema.Types.Mixed,         // [{ image, badge, title, subtitle, cta, link, gradient }]
    headerNavLinks: mongoose.Schema.Types.Mixed,     // [{ label, href, icon }]
    marqueeMessages: [String],                       // spinning trust strip in home

    // ── Shop / Categories ──
    productCategories: [{ id: String, label: String }],
    brands: [{ id: String, label: String }],
    quickFilters: [{ label: String, category: String }],

    // ── Mega Menu ──
    megaMenu: mongoose.Schema.Types.Mixed,

    // ── Home Sections ──
    promoBanners: mongoose.Schema.Types.Mixed,

    // ── Content ──
    whyChooseUs: [{ icon: String, title: String, desc: String }],
    healthBenefits: [{ title: String, desc: String }],
    testimonials: [{ name: String, city: String, rating: Number, text: String, verified: Boolean }],
    doctors: [{ name: String, title: String, exp: String, specialty: String }],
    faq: [{ q: String, a: String }],
    stats: [{ value: Number, suffix: String, label: String, decimals: Number }],
    newsletter: { title: String, subtitle: String },

    // ── Footer ──
    footerLinks: mongoose.Schema.Types.Mixed,
    trustBadges: [String],
    paymentMethods: [String],
    deliveryPartners: [String],
    productBadges: [{ label: String, icon: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
