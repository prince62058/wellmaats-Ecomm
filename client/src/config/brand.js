export const BRAND = {
  company: "Wellmaats",
  name: "Mother Tatwa",
  tagline: "Nature Cures Life",
  category: "Ayurvedic Wellness & Herbal Drops",
  colors: {
    forest: "#108644",
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

export const MAIN_CATEGORIES = [
  {
    id: "health-wellness",
    label: "Health & Wellness",
    subCategories: [
      {
        id: "immunity-drops",
        label: "Immunity Boosters",
        icon: "Shield",
        childCategories: [
          { id: "daily-immunity", label: "Daily Immunity Drops" },
          { id: "kids-immunity", label: "Kids Immunity Drops" },
          { id: "tulsi-drops", label: "Tulsi & Giloy Drops" },
        ],
      },
      {
        id: "digestive-care",
        label: "Digestive & Gut Health",
        icon: "Flame",
        childCategories: [
          { id: "gut-health", label: "Gut Health & Digestion" },
          { id: "acidity-gas", label: "Gas & Acidity Relief" },
          { id: "constipation-care", label: "Constipation Drops" },
        ],
      },
      {
        id: "liver-care",
        label: "Liver Detox & Care",
        icon: "Droplets",
        childCategories: [
          { id: "liver-detox", label: "Liver Detox & Cleanse" },
          { id: "fatty-liver", label: "Fatty Liver Support" },
        ],
      },
      {
        id: "lung-care",
        label: "Respiratory & Lung Care",
        icon: "Wind",
        childCategories: [
          { id: "cough-cold", label: "Cough & Cold Relief" },
          { id: "breathing-vitality", label: "Breathing & Lung Vitality" },
        ],
      },
      {
        id: "heart-wellness",
        label: "Heart & Cardio Health",
        icon: "Heart",
        childCategories: [
          { id: "cardio-care", label: "Cardio Health" },
          { id: "cholesterol-balance", label: "Cholesterol Balance" },
        ],
      },
      {
        id: "diabetes-support",
        label: "Diabetes & Sugar Care",
        icon: "Stethoscope",
        childCategories: [
          { id: "sugar-control", label: "Blood Sugar Control" },
          { id: "metabolic-health", label: "Metabolism Support" },
        ],
      },
    ],
  },
  {
    id: "skin-personal-care",
    label: "Skin & Personal Care",
    subCategories: [
      {
        id: "face-care",
        label: "Face Care",
        icon: "Sparkles",
        childCategories: [
          { id: "face-serum", label: "Face Serums & Glow" },
          { id: "acne-spot", label: "Acne & Spot Clear" },
          { id: "face-oil", label: "Kumkumadi & Face Oils" },
        ],
      },
      {
        id: "hair-care",
        label: "Hair & Scalp Care",
        icon: "Sparkles",
        childCategories: [
          { id: "hair-growth", label: "Hair Fall & Growth Drops" },
          { id: "anti-dandruff", label: "Anti-Dandruff Drops" },
          { id: "scalp-nourish", label: "Scalp Nourishment" },
        ],
      },
      {
        id: "skin-hair-care",
        label: "Skin & Hair Care",
        icon: "Sparkles",
        childCategories: [
          { id: "hair-growth", label: "Hair Fall & Growth Drops" },
          { id: "skin-glow", label: "Skin Glow & Brightening" },
          { id: "face-serum", label: "Face Serums" },
        ],
      },
    ],
  },
  {
    id: "lifestyle-vitality",
    label: "Lifestyle & Vitality",
    subCategories: [
      {
        id: "mens-wellness",
        label: "Men's Wellness",
        icon: "Activity",
        childCategories: [
          { id: "vitality-stamina", label: "Vitality & Stamina" },
          { id: "daily-energy", label: "Energy & Strength" },
          { id: "beard-care", label: "Beard & Grooming" },
        ],
      },
      {
        id: "womens-wellness",
        label: "Women's Wellness",
        icon: "Sparkles",
        childCategories: [
          { id: "hormonal-balance", label: "Hormonal Balance" },
          { id: "pcos-period-care", label: "PCOS & Period Care" },
          { id: "glow-vitality", label: "Glow & Vitality" },
        ],
      },
      {
        id: "stress-relief",
        label: "Stress Relief & Sleep",
        icon: "Brain",
        childCategories: [
          { id: "deep-sleep", label: "Deep Sleep Drops" },
          { id: "anxiety-calm", label: "Mind Calm & Anxiety" },
        ],
      },
      {
        id: "joint-pain-relief",
        label: "Joint & Bone Care",
        icon: "Bone",
        childCategories: [
          { id: "arthritis-joint", label: "Joint & Bone Strength" },
          { id: "muscle-relief", label: "Muscle & Knee Pain" },
        ],
      },
      {
        id: "weight-management",
        label: "Weight Management",
        icon: "Scale",
        childCategories: [
          { id: "fat-burn-detox", label: "Fat Burn & Detox" },
          { id: "appetite-control", label: "Metabolism Booster" },
        ],
      },
      {
        id: "kids-wellness",
        label: "Kids Wellness",
        icon: "Baby",
        childCategories: [
          { id: "kids-daily-drops", label: "Kids Daily Drops" },
          { id: "appetite-growth", label: "Appetite & Growth" },
        ],
      },
    ],
  },
];

// Flat product categories for backward compatibility
export const PRODUCT_CATEGORIES = MAIN_CATEGORIES.flatMap((m) =>
  (m.subCategories || []).map((s) => ({
    id: s.id,
    label: s.label,
    icon: s.icon || "Leaf",
    mainCategory: m.id,
    mainCategoryLabel: m.label,
    subCategories: s.childCategories || [],
  }))
);

export const mainCategoryOptionsMap = Object.fromEntries(
  MAIN_CATEGORIES.map((m) => [m.id, m.label])
);

export const categoryOptionsMap = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.id, c.label])
);

export const subCategoryOptionsMap = Object.fromEntries(
  PRODUCT_CATEGORIES.flatMap((c) => (c.subCategories || []).map((sc) => [sc.id, sc.label]))
);

export const childCategoryOptionsMap = subCategoryOptionsMap;

export const brandOptionsMap = {
  "mother-tatwa": "Mother Tatwa",
  "wellmaats": "Wellmaats",
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
    { label: "About Us", href: "/about-us" },
    { label: "Our Story", href: "/about-us" },
    { label: "Mission", href: "/about-us" },
    { label: "Careers", href: "/careers" },
  ],
  shop: [
    { label: "All Products", href: "/shop/listing" },
    { label: "Best Sellers", href: "/shop/best-sellers" },
    { label: "Offer Zone", href: "/shop/offer-zone" },
    { label: "New Arrivals", href: "/shop/listing" },
  ],
  support: [
    { label: "Contact Us", href: "/contact-us" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return Policy", href: "/refund-policy" },
    { label: "Track Order", href: "/shop/account" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return & Refund Policy", href: "/refund-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
  learn: [
    { label: "Health Blog", href: "/blogs" },
    { label: "Ayurveda Guide", href: "/ayurveda-guide" },
    { label: "Dosha Balancing", href: "/ayurveda-guide" },
  ],
};

export const DEFAULT_POLICIES = {
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "August 2026 | Wellmaats",
    sections: [
      {
        heading: "1. Information Collection",
        content: "We collect essential information to process your orders, including your name, shipping address, email address, and phone number. We strictly do not store raw credit/debit card numbers or netbanking passwords on our servers.",
      },
      {
        heading: "2. How We Use Your Data",
        content: "Your data is used exclusively for fulfilling and delivering your Ayurvedic product shipments, sending tracking updates and delivery SMS/Email alerts, and providing customer support assistance for dosage and formulation inquiries.",
      },
      {
        heading: "3. 256-Bit SSL Security",
        content: "All online transactions and customer communications are encrypted using industry-standard 256-bit SSL encryption. We do not sell or rent your personal information to any third parties.",
      },
      {
        heading: "4. Grievance Redressal",
        content: "For any privacy concerns, data inquiries, or grievance redressal, you can contact our dedicated support team directly via email or helpline number.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    lastUpdated: "User Agreement & Sales Terms | Wellmaats",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content: "By browsing or placing an order on Wellmaats, you agree to comply with and be bound by these terms, our privacy policy, and applicable laws in India.",
      },
      {
        heading: "2. Product Descriptions & Pricing",
        content: "Prices listed on the website are in Indian Rupees (INR) and include GST. While we strive for absolute accuracy, we reserve the right to correct pricing or typographical errors before order dispatch.",
      },
      {
        heading: "3. Order Fulfillment",
        content: "Orders are processed upon verification. In the rare event an item is out of stock, our team will notify you immediately for a replacement or complete refund.",
      },
      {
        heading: "4. Jurisdiction",
        content: "Any legal proceedings or disputes related to orders placed on this platform shall be subject to the exclusive jurisdiction of the competent courts in Noida, Uttar Pradesh.",
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    lastUpdated: "Pan-India Express Dispatch from Haridwar Hub",
    dispatchText: "24hr Dispatch",
    dispatchSubtext: "Orders shipped on priority",
    freeShippingText: "Free Shipping",
    freeShippingSubtext: "On all orders above ₹499",
    trackingText: "Live Tracking",
    trackingSubtext: "SMS & Email updates",
    sections: [
      {
        heading: "1. Delivery Timelines",
        content: "• Metro Cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata): 2–3 Business Days.\n• Rest of India (Tier 2 & Tier 3 Cities): 3–5 Business Days.\n• Remote / North-East: 4–7 Business Days.",
      },
      {
        heading: "2. Courier Partners",
        content: "We ship via trusted logistics partners: Delhivery, Blue Dart, DTDC, Xpressbees, and India Post.",
      },
      {
        heading: "3. Order Tracking",
        content: "You will receive real-time tracking links via SMS, WhatsApp, and Email as soon as your parcel is dispatched from our facility.",
      },
    ],
  },
  refund: {
    title: "Return & Refund Policy",
    lastUpdated: "7-Day Easy Replacement & Money-Back Guarantee",
    sections: [
      {
        heading: "1. 7-Day Return Eligibility",
        content: "If your item is damaged in transit, defective, or incorrect, you are eligible for an instant free replacement or 100% refund within 7 days of delivery.",
      },
      {
        heading: "2. How to Claim",
        content: "Send photos of the damaged outer box and product to our support email or WhatsApp our customer helpline with your Order ID.",
      },
      {
        heading: "3. Refund Timeline",
        content: "Refunds for prepaid orders are credited back to your original payment method in 3–5 business days. For COD orders, refund is transferred directly to your UPI/Bank Account within 24–48 hours.",
      },
      {
        heading: "4. Cancellation Policy",
        content: "Orders can be cancelled before dispatch without any cancellation fee. Once dispatched, standard return procedures apply.",
      },
    ],
  },
  disclaimer: {
    title: "Medical & Product Disclaimer",
    lastUpdated: "Ayurvedic Dietary Supplements Guidelines",
    sections: [
      {
        heading: "1. Dietary Supplement Notice",
        content: "The Ayurvedic drops, tonics, and herbal extracts provided by Wellmaats are traditional Ayurvedic dietary supplements manufactured under Ayush guidelines. They are formulated to promote holistic balance and vitality and are not intended to diagnose, cure, mitigate, or treat any chronic medical condition.",
      },
      {
        heading: "2. Physician Consultation",
        content: "Always consult your licensed physician or Ayurvedic practitioner prior to starting any herbal regimen, particularly if you are pregnant, nursing, taking prescription allopathic medications, or suffering from a severe pre-existing condition.",
      },
      {
        heading: "3. Individual Results",
        content: "Herbal formulations work harmoniously with natural body physiology. Results may vary depending on individual body constitution (Prakriti/Dosha) and adherence to healthy lifestyle habits.",
      },
    ],
  },
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
