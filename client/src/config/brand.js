export const BRAND = {
  company: "Wellmaats",
  name: "Mother Tatwa",
  tagline: "Nature Cures Life",
  category: "Ayurvedic Wellness & Herbal Drops",
  colors: {
    forest: "#1F6B4F",
    white: "#FFFFFF",
    gold: "#C8A54A",
    leaf: "#F5FFF3",
  },
  contact: {
    phone: "+91 98765 43210",
    email: "hello@wellmaats.com",
    whatsapp: "+919876543210",
    office: "Wellmaats Corporate Office, Sector 62, Noida, UP 201301",
    manufacturing: "Wellmaats Ayurvedic Unit, Haridwar, Uttarakhand",
    hours: "Mon–Sat, 9:00 AM – 7:00 PM IST",
  },
};

export const PRODUCT_CATEGORIES = [
  { id: "immunity-drops", label: "Immunity Drops" },
  { id: "digestive-care", label: "Digestive Care" },
  { id: "liver-care", label: "Liver Care" },
  { id: "lung-care", label: "Lung Care" },
  { id: "heart-wellness", label: "Heart Wellness" },
  { id: "stress-relief", label: "Stress Relief" },
  { id: "joint-pain-relief", label: "Joint Pain Relief" },
  { id: "womens-wellness", label: "Women's Wellness" },
  { id: "mens-wellness", label: "Men's Wellness" },
  { id: "diabetes-support", label: "Diabetes Support" },
  { id: "weight-management", label: "Weight Management" },
  { id: "skin-hair-care", label: "Skin & Hair Care" },
  { id: "kids-wellness", label: "Kids Wellness" },
];

export const categoryOptionsMap = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.id, c.label])
);

export const brandOptionsMap = {
  "mother-tatwa": "Mother Tatwa",
};

export const WHY_CHOOSE_US = [
  { icon: "Leaf", title: "100% Ayurvedic", desc: "Pure herbal formulations rooted in ancient wisdom" },
  { icon: "ShieldCheck", title: "GMP Certified", desc: "Manufactured in certified facilities" },
  { icon: "FlaskConical", title: "Lab Tested", desc: "Every batch tested for purity and potency" },
  { icon: "Ban", title: "No Chemicals", desc: "Free from harmful additives and preservatives" },
  { icon: "Heart", title: "Safe for Daily Use", desc: "Gentle, effective, and non-habit forming" },
  { icon: "Flag", title: "Made in India", desc: "Proudly crafted for Indian wellness needs" },
  { icon: "Truck", title: "Fast Delivery", desc: "Pan-India express shipping available" },
  { icon: "Lock", title: "Secure Payments", desc: "UPI, cards, wallets & COD protected" },
];

export const HEALTH_BENEFITS = [
  { title: "Improve Immunity", desc: "Strengthen natural defence with adaptogenic herbs" },
  { title: "Better Digestion", desc: "Support gut health and nutrient absorption" },
  { title: "Respiratory Support", desc: "Clear breathing and lung vitality naturally" },
  { title: "Heart Health", desc: "Promote cardiovascular wellness daily" },
  { title: "Energy Boost", desc: "Sustained vitality without caffeine crashes" },
  { title: "Detoxification", desc: "Cleanse liver and body toxins gently" },
  { title: "Better Sleep", desc: "Calm mind for restful, deep sleep" },
  { title: "Stress Relief", desc: "Balance cortisol and emotional wellbeing" },
];

export const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Delhi", rating: 5, text: "Immunity Booster drops changed my energy levels in 3 weeks. Truly Ayurvedic quality!", verified: true },
  { name: "Rahul Verma", city: "Mumbai", rating: 5, text: "Liver Detox Drops helped my digestion. Mother Tatwa feels premium and trustworthy.", verified: true },
  { name: "Anita Desai", city: "Bangalore", rating: 5, text: "Women's Care Drops are gentle and effective. Fast delivery and beautiful packaging.", verified: true },
  { name: "Dr. Kavita Mehta", city: "Jaipur", rating: 5, text: "I recommend Mother Tatwa to my patients. Clean ingredients and consistent results.", verified: true },
];

export const DOCTORS = [
  { name: "Dr. Arjun Patel", title: "Ayurvedic Physician", exp: "18+ years", specialty: "Herbal Medicine & Detox" },
  { name: "Dr. Meera Iyer", title: "Wellness Consultant", exp: "12+ years", specialty: "Women's Holistic Health" },
  { name: "Dr. Vikram Singh", title: "Ayurvedic Expert", exp: "20+ years", specialty: "Immunity & Respiratory Care" },
];

export const FAQ_ITEMS = [
  { q: "Are Mother Tatwa products 100% Ayurvedic?", a: "Yes. All formulations use authentic Ayurvedic herbs with no harmful chemicals or artificial preservatives." },
  { q: "How long before I see results?", a: "Most customers notice improvements within 30–60 days of consistent daily use as recommended." },
  { q: "Is COD available?", a: "Yes. Cash on Delivery is available across most pin codes in India." },
  { q: "Can I take drops with other medicines?", a: "Consult your physician before combining with prescription medicines. Our drops are generally safe for daily use." },
  { q: "What is the dosage?", a: "Typically 10–15 drops twice daily in water or as directed on the product label." },
  { q: "Do you offer subscriptions?", a: "Yes. Subscribe & Save for automatic monthly delivery at a discounted price." },
];

export const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "#" },
    { label: "Our Story", href: "#" },
    { label: "Mission", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Investor Relations", href: "#" },
  ],
  shop: [
    { label: "All Products", href: "/shop/listing" },
    { label: "Best Sellers", href: "/shop/listing" },
    { label: "New Arrivals", href: "/shop/listing" },
    { label: "Combo Packs", href: "/shop/listing" },
    { label: "Gift Boxes", href: "/shop/listing" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "FAQ", href: "#faq" },
    { label: "Shipping Policy", href: "#" },
    { label: "Return Policy", href: "#" },
    { label: "Track Order", href: "/shop/account" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Disclaimer", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
  learn: [
    { label: "Health Blog", href: "#" },
    { label: "Ayurveda Guide", href: "#" },
    { label: "Nutrition Tips", href: "#" },
    { label: "Wellness Articles", href: "#" },
  ],
};

export const TRUST_BADGES = [
  "GMP Certified", "ISO Certified", "FSSAI", "Made in India",
  "Secure Payments", "SSL Protected", "7-Day Return", "Fast Delivery",
];

export const PAYMENT_METHODS = ["Visa", "MasterCard", "RuPay", "UPI", "PhonePe", "Google Pay", "Paytm"];
export const DELIVERY_PARTNERS = ["Delhivery", "Blue Dart", "DTDC", "Xpressbees", "India Post"];

export const PAGE_BANNERS = {
  account: "https://images.unsplash.com/photo-1441974231530-c6167db127fb?w=1400&h=400&fit=crop",
  checkout: "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=1400&h=400&fit=crop",
};
