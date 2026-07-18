module.exports = {
  key: "site",
  brand: {
    company: "Wellmaats",
    name: "Mother Tatwa",
    tagline: "Nature Cures Life",
    category: "Ayurvedic Wellness & Herbal Drops",
  },
  contact: {
    phone: "+91 98765 43210",
    email: "hello@wellmaats.com",
    whatsapp: "+919876543210",
    office: "Wellmaats Corporate Office, Sector 62, Noida, UP 201301",
    manufacturing: "Wellmaats Ayurvedic Unit, Haridwar, Uttarakhand",
    hours: "Mon–Sat, 9:00 AM – 7:00 PM IST",
  },
  social: [
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "Facebook", url: "https://facebook.com" },
    { platform: "Youtube", url: "https://youtube.com" },
    { platform: "Linkedin", url: "https://linkedin.com" },
    { platform: "WhatsApp", url: "https://wa.me/919876543210" },
  ],
  headerNavLinks: [
    { label: "Best Sellers", href: "/shop/best-sellers", icon: "🏆" },
    { label: "Offer Zone",   href: "/shop/offer-zone",   icon: "🔥" },
    { label: "Blogs",        href: "/blogs",              icon: "📖" },
    { label: "Track Order",  href: "/shop/account",       icon: "🚚" },
    { label: "Gift Cards",   href: "/shop/listing",       icon: "🎁" },
  ],
  marqueeMessages: [
    "🌿 100% Ayurvedic",
    "🧪 Lab Tested",
    "✅ GMP Certified",
    "🇮🇳 Made in India",
    "🚚 Free Shipping above ₹499",
    "💊 35+ Herbs Extract",
    "⭐ 4.8 Customer Rating",
    "🔒 Secure Payments",
    "↩️ 14-Day Easy Returns",
    "🌱 No Harmful Chemicals",
  ],
  quickFilters: [
    { label: "All Products", category: "all" },
    { label: "Immunity", category: "immunity-drops" },
    { label: "Digestive Care", category: "digestive-care" },
    { label: "Liver Detox", category: "liver-care" },
    { label: "Stress & Sleep", category: "stress-relief" },
    { label: "Heart Health", category: "heart-wellness" },
    { label: "Joint Relief", category: "joint-pain-relief" },
    { label: "Women's Health", category: "womens-wellness" },
    { label: "Men's Vitality", category: "mens-wellness" },
    { label: "Skin & Hair", category: "skin-hair-care" },
    { label: "Kids Wellness", category: "kids-wellness" },
    { label: "Diabetes", category: "diabetes-support" },
  ],
  promoBanners: [
    {
      badge: "Limited Time Offer",
      title: "Buy 2 Get 1 FREE",
      subtitle: "On all Immunity & Liver Care drops. Authentic Ayurvedic formulas.",
      cta: "Shop Now",
      link: "/shop/listing?category=immunity-drops",
      bgGradient: "linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #40916c 100%)",
      productImage: "/products/immunity.jpg",
    },
    {
      badge: "New Launch",
      title: "Women's Wellness Range",
      subtitle: "Shatavari & hormonal balance drops — crafted for Indian women.",
      cta: "Explore Now",
      link: "/shop/listing?category=womens-wellness",
      bgGradient: "linear-gradient(135deg, #4a1942 0%, #8b3a8b 60%, #c77dff 100%)",
      productImage: "/products/women.jpg",
    },
    {
      badge: "Best Seller",
      title: "Stress Relief & Sleep Drops",
      subtitle: "Ashwagandha + Brahmi formula for calm mind and deep sleep.",
      cta: "Buy Now",
      link: "/shop/listing?category=stress-relief",
      bgGradient: "linear-gradient(135deg, #1a2a4a 0%, #2d4a8b 60%, #4a7dcf 100%)",
      productImage: "/products/stress.jpg",
    },
  ],
  megaMenu: [
    {
      id: "immunity-drops", label: "Immunity & Wellness", icon: "Shield",
      href: "/shop/listing?category=immunity-drops",
      columns: [
        { heading: "Products", items: [
          { name: "Immunity Booster Drops", href: "/shop/listing?category=immunity-drops" },
          { name: "Multi-Herb Complex", href: "/shop/listing?category=immunity-drops" },
          { name: "Tulsi Drops", href: "/shop/listing?category=immunity-drops" },
        ]},
        { heading: "Shop By Concern", items: [
          { name: "Cold & Flu", href: "/shop/listing?category=immunity-drops" },
          { name: "Seasonal Immunity", href: "/shop/listing?category=immunity-drops" },
          { name: "Daily Wellness", href: "/shop/listing?category=immunity-drops" },
        ]},
        { heading: "For Whom", items: [
          { name: "Adults", href: "/shop/listing?category=immunity-drops" },
          { name: "Elderly", href: "/shop/listing?category=immunity-drops" },
          { name: "Working Professionals", href: "/shop/listing?category=immunity-drops" },
        ]},
      ],
    },
    {
      id: "digestive-care", label: "Digestive Health", icon: "Flame",
      href: "/shop/listing?category=digestive-care",
      columns: [
        { heading: "Products", items: [
          { name: "Gut Health Drops", href: "/shop/listing?category=digestive-care" },
          { name: "Digestive Enzyme Drops", href: "/shop/listing?category=digestive-care" },
          { name: "Triphala Drops", href: "/shop/listing?category=digestive-care" },
        ]},
        { heading: "Concerns", items: [
          { name: "Acidity & Gas", href: "/shop/listing?category=digestive-care" },
          { name: "Constipation", href: "/shop/listing?category=digestive-care" },
          { name: "Bloating", href: "/shop/listing?category=digestive-care" },
          { name: "IBS Support", href: "/shop/listing?category=digestive-care" },
        ]},
      ],
    },
    {
      id: "liver-care", label: "Liver & Detox", icon: "Droplets",
      href: "/shop/listing?category=liver-care",
      columns: [
        { heading: "Products", items: [
          { name: "Liver Detox Drops", href: "/shop/listing?category=liver-care" },
          { name: "Kutki Drops", href: "/shop/listing?category=liver-care" },
          { name: "Detox Complex", href: "/shop/listing?category=liver-care" },
        ]},
        { heading: "Concerns", items: [
          { name: "Fatty Liver", href: "/shop/listing?category=liver-care" },
          { name: "Detoxification", href: "/shop/listing?category=liver-care" },
          { name: "Jaundice Recovery", href: "/shop/listing?category=liver-care" },
        ]},
      ],
    },
    {
      id: "lung-care", label: "Respiratory Care", icon: "Wind",
      href: "/shop/listing?category=lung-care",
      columns: [
        { heading: "Products", items: [
          { name: "Lung Care Drops", href: "/shop/listing?category=lung-care" },
          { name: "Vasaka Drops", href: "/shop/listing?category=lung-care" },
          { name: "Breath Easy Complex", href: "/shop/listing?category=lung-care" },
        ]},
        { heading: "Concerns", items: [
          { name: "Asthma Support", href: "/shop/listing?category=lung-care" },
          { name: "Cough & Cold", href: "/shop/listing?category=lung-care" },
          { name: "Pollution Defense", href: "/shop/listing?category=lung-care" },
        ]},
      ],
    },
    {
      id: "heart-wellness", label: "Heart Health", icon: "Heart",
      href: "/shop/listing?category=heart-wellness",
      columns: [
        { heading: "Products", items: [
          { name: "Heart Care Drops", href: "/shop/listing?category=heart-wellness" },
          { name: "Arjuna Drops", href: "/shop/listing?category=heart-wellness" },
          { name: "Cardio Support", href: "/shop/listing?category=heart-wellness" },
        ]},
        { heading: "Concerns", items: [
          { name: "Blood Pressure", href: "/shop/listing?category=heart-wellness" },
          { name: "Cholesterol", href: "/shop/listing?category=heart-wellness" },
          { name: "Heart Strength", href: "/shop/listing?category=heart-wellness" },
        ]},
      ],
    },
    {
      id: "stress-relief", label: "Stress & Sleep", icon: "Brain",
      href: "/shop/listing?category=stress-relief",
      columns: [
        { heading: "Products", items: [
          { name: "Stress Relief Drops", href: "/shop/listing?category=stress-relief" },
          { name: "Ashwagandha Drops", href: "/shop/listing?category=stress-relief" },
          { name: "Sleep Well Drops", href: "/shop/listing?category=stress-relief" },
        ]},
        { heading: "Concerns", items: [
          { name: "Anxiety", href: "/shop/listing?category=stress-relief" },
          { name: "Insomnia", href: "/shop/listing?category=stress-relief" },
          { name: "Mental Fatigue", href: "/shop/listing?category=stress-relief" },
          { name: "Mood Balance", href: "/shop/listing?category=stress-relief" },
        ]},
      ],
    },
    {
      id: "joint-pain-relief", label: "Joint & Bone Care", icon: "Bone",
      href: "/shop/listing?category=joint-pain-relief",
      columns: [
        { heading: "Products", items: [
          { name: "Joint Relief Drops", href: "/shop/listing?category=joint-pain-relief" },
          { name: "Shallaki Drops", href: "/shop/listing?category=joint-pain-relief" },
          { name: "Bone Strength Complex", href: "/shop/listing?category=joint-pain-relief" },
        ]},
        { heading: "Concerns", items: [
          { name: "Arthritis", href: "/shop/listing?category=joint-pain-relief" },
          { name: "Knee Pain", href: "/shop/listing?category=joint-pain-relief" },
          { name: "Inflammation", href: "/shop/listing?category=joint-pain-relief" },
        ]},
      ],
    },
    {
      id: "womens-wellness", label: "Women's Wellness", icon: "Sparkles",
      href: "/shop/listing?category=womens-wellness",
      columns: [
        { heading: "Products", items: [
          { name: "Women's Care Drops", href: "/shop/listing?category=womens-wellness" },
          { name: "Shatavari Drops", href: "/shop/listing?category=womens-wellness" },
          { name: "Hormonal Balance", href: "/shop/listing?category=womens-wellness" },
        ]},
        { heading: "Concerns", items: [
          { name: "PCOS Support", href: "/shop/listing?category=womens-wellness" },
          { name: "Menstrual Health", href: "/shop/listing?category=womens-wellness" },
          { name: "Fertility Support", href: "/shop/listing?category=womens-wellness" },
          { name: "Menopause", href: "/shop/listing?category=womens-wellness" },
        ]},
      ],
    },
    {
      id: "mens-wellness", label: "Men's Wellness", icon: "Activity",
      href: "/shop/listing?category=mens-wellness",
      columns: [
        { heading: "Products", items: [
          { name: "Men's Vitality Drops", href: "/shop/listing?category=mens-wellness" },
          { name: "Shilajit Drops", href: "/shop/listing?category=mens-wellness" },
          { name: "Stamina Booster", href: "/shop/listing?category=mens-wellness" },
        ]},
        { heading: "Concerns", items: [
          { name: "Energy & Stamina", href: "/shop/listing?category=mens-wellness" },
          { name: "Testosterone Support", href: "/shop/listing?category=mens-wellness" },
          { name: "Performance", href: "/shop/listing?category=mens-wellness" },
        ]},
      ],
    },
    {
      id: "diabetes-support", label: "Diabetes Support", icon: "Stethoscope",
      href: "/shop/listing?category=diabetes-support",
      columns: [
        { heading: "Products", items: [
          { name: "Diabetes Support Drops", href: "/shop/listing?category=diabetes-support" },
          { name: "Karela Drops", href: "/shop/listing?category=diabetes-support" },
          { name: "Blood Sugar Balance", href: "/shop/listing?category=diabetes-support" },
        ]},
        { heading: "Concerns", items: [
          { name: "Blood Sugar", href: "/shop/listing?category=diabetes-support" },
          { name: "Insulin Sensitivity", href: "/shop/listing?category=diabetes-support" },
          { name: "Weight with Diabetes", href: "/shop/listing?category=diabetes-support" },
        ]},
      ],
    },
    {
      id: "skin-hair-care", label: "Skin & Hair Care", icon: "Sparkles",
      href: "/shop/listing?category=skin-hair-care",
      columns: [
        { heading: "Products", items: [
          { name: "Hair Growth Drops", href: "/shop/listing?category=skin-hair-care" },
          { name: "Skin Glow Drops", href: "/shop/listing?category=skin-hair-care" },
          { name: "Bhringraj Drops", href: "/shop/listing?category=skin-hair-care" },
        ]},
        { heading: "Concerns", items: [
          { name: "Hair Fall", href: "/shop/listing?category=skin-hair-care" },
          { name: "Dandruff", href: "/shop/listing?category=skin-hair-care" },
          { name: "Acne & Skin", href: "/shop/listing?category=skin-hair-care" },
          { name: "Anti-Aging", href: "/shop/listing?category=skin-hair-care" },
        ]},
      ],
    },
    {
      id: "kids-wellness", label: "Kids Wellness", icon: "Baby",
      href: "/shop/listing?category=kids-wellness",
      columns: [
        { heading: "Products", items: [
          { name: "Kids Wellness Drops", href: "/shop/listing?category=kids-wellness" },
          { name: "Kids Immunity Drops", href: "/shop/listing?category=kids-wellness" },
          { name: "Growth Support", href: "/shop/listing?category=kids-wellness" },
        ]},
        { heading: "Age Groups", items: [
          { name: "2–5 Years", href: "/shop/listing?category=kids-wellness" },
          { name: "6–12 Years", href: "/shop/listing?category=kids-wellness" },
          { name: "Teens", href: "/shop/listing?category=kids-wellness" },
        ]},
      ],
    },
  ],
  productCategories: [
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
  ],
  brands: [{ id: "mother-tatwa", label: "Mother Tatwa" }],
  footerLinks: {
    company: [
      { label: "About Us", href: "#" },
      { label: "Our Story", href: "#" },
      { label: "Mission", href: "#" },
      { label: "Careers", href: "#" },
    ],
    shop: [
      { label: "All Products", href: "/shop/listing" },
      { label: "Best Sellers", href: "/shop/listing" },
      { label: "New Arrivals", href: "/shop/listing" },
    ],
    support: [
      { label: "Contact Us", href: "#" },
      { label: "FAQ", href: "#faq" },
      { label: "Track Order", href: "/shop/account" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
    learn: [
      { label: "Health Blog", href: "#" },
      { label: "Ayurveda Guide", href: "#" },
    ],
  },
  trustBadges: [
    "GMP Certified", "ISO Certified", "FSSAI", "Made in India",
    "Secure Payments", "7-Day Return", "Fast Delivery",
  ],
  paymentMethods: ["Visa", "MasterCard", "RuPay", "UPI", "PhonePe", "Google Pay", "Paytm"],
  deliveryPartners: ["Delhivery", "Blue Dart", "DTDC", "Xpressbees", "India Post"],
  productBadges: [
    { label: "Express Delivery", icon: "Truck" },
    { label: "COD Available", icon: "Shield" },
  ],
  whyChooseUs: [
    { icon: "Leaf", title: "100% Ayurvedic", desc: "Pure herbal formulations rooted in ancient wisdom" },
    { icon: "ShieldCheck", title: "GMP Certified", desc: "Manufactured in certified facilities" },
    { icon: "FlaskConical", title: "Lab Tested", desc: "Every batch tested for purity and potency" },
    { icon: "Ban", title: "No Chemicals", desc: "Free from harmful additives and preservatives" },
    { icon: "Heart", title: "Safe for Daily Use", desc: "Gentle, effective, and non-habit forming" },
    { icon: "Flag", title: "Made in India", desc: "Proudly crafted for Indian wellness needs" },
    { icon: "Truck", title: "Fast Delivery", desc: "Pan-India express shipping available" },
    { icon: "Lock", title: "Secure Payments", desc: "UPI, cards, wallets & COD protected" },
  ],
  healthBenefits: [
    { title: "Improve Immunity", desc: "Strengthen natural defence with adaptogenic herbs" },
    { title: "Better Digestion", desc: "Support gut health and nutrient absorption" },
    { title: "Respiratory Support", desc: "Clear breathing and lung vitality naturally" },
    { title: "Heart Health", desc: "Promote cardiovascular wellness daily" },
    { title: "Energy Boost", desc: "Sustained vitality without caffeine crashes" },
    { title: "Detoxification", desc: "Cleanse liver and body toxins gently" },
    { title: "Better Sleep", desc: "Calm mind for restful, deep sleep" },
    { title: "Stress Relief", desc: "Balance cortisol and emotional wellbeing" },
  ],
  testimonials: [
    { name: "Priya Sharma", city: "Delhi", rating: 5, text: "Immunity Booster drops changed my energy levels in 3 weeks!", verified: true },
    { name: "Rahul Verma", city: "Mumbai", rating: 5, text: "Liver Detox Drops helped my digestion. Premium quality!", verified: true },
    { name: "Anita Desai", city: "Bangalore", rating: 5, text: "Women's Care Drops are gentle and effective.", verified: true },
  ],
  doctors: [
    { name: "Dr. Arjun Patel", title: "Ayurvedic Physician", exp: "18+ years", specialty: "Herbal Medicine & Detox" },
    { name: "Dr. Meera Iyer", title: "Wellness Consultant", exp: "12+ years", specialty: "Women's Holistic Health" },
    { name: "Dr. Vikram Singh", title: "Ayurvedic Expert", exp: "20+ years", specialty: "Immunity & Respiratory Care" },
  ],
  faq: [
    { q: "Are Mother Tatwa products 100% Ayurvedic?", a: "Yes. All formulations use authentic Ayurvedic herbs with no harmful chemicals." },
    { q: "How long before I see results?", a: "Most customers notice improvements within 30–60 days of consistent daily use." },
    { q: "Is COD available?", a: "Yes. Cash on Delivery is available across most pin codes in India." },
    { q: "What is the dosage?", a: "Typically 10–15 drops twice daily in water or as directed on the label." },
  ],
  stats: [
    { value: 12, suffix: "+", label: "Ayurvedic Drops", decimals: 0 },
    { value: 4.8, suffix: "★", label: "Customer Rating", decimals: 1 },
    { value: 100, suffix: "%", label: "Herbal Formulas", decimals: 0 },
    { value: 28, suffix: "", label: "States Delivered", decimals: 0 },
  ],
  newsletter: {
    title: "Join the Wellness Circle",
    subtitle: "Get Ayurvedic tips, offers & new product alerts in your inbox.",
  },
};
