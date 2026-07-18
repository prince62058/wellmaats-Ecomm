require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Feature = require("./models/Feature");
const User = require("./models/User");
const Order = require("./models/Order");
const Cart = require("./models/Cart");
const Address = require("./models/Address");
const Review = require("./models/Review");
const SiteSettings = require("./models/SiteSettings");
const defaultSiteSettings = require("./data/defaultSiteSettings");

const IMG = {
  signature: "/products/signature.jpg",
  liver: "/products/liver.jpg",
  immunity: "/products/immunity.jpg",
  gut: "/products/gut.jpg",
  heart: "/products/heart.jpg",
  joint: "/products/joint.jpg",
  hair: "/products/hair.jpg",
  women: "/products/women.jpg",
  lung: "/products/lung.jpg",
  stress: "/products/stress.jpg",
  diabetes: "/products/diabetes.jpg",
  kids: "/products/kids.jpg",
};

const flashEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

const products = [
  {
    title: "Mother Tatwa Drops",
    description: "Signature Ayurvedic herbal drops for daily immunity and vitality.",
    category: "immunity-drops",
    brand: "mother-tatwa",
    price: 599,
    salePrice: 499,
    totalStock: 200,
    averageReview: 4.8,
    isFeatured: true,
    isFlashSale: true,
    flashSaleEndsAt: flashEnd,
    offerLabel: "Flash Sale",
    image: IMG.signature,
    ingredients: "Tulsi, Ashwagandha, Giloy, Amla, Mulethi",
    benefits: "Boosts immunity, increases energy, supports overall wellness",
    howToUse: "Take 10-15 drops in half glass of warm water",
    dosage: "Twice daily, morning and evening before meals",
  },
  {
    title: "Liver Detox Drops",
    description: "Natural liver cleanse formula with Kutki and Bhumi Amla.",
    category: "liver-care",
    brand: "mother-tatwa",
    price: 649,
    salePrice: 549,
    totalStock: 150,
    averageReview: 4.7,
    isFeatured: true,
    isFlashSale: true,
    flashSaleEndsAt: flashEnd,
    offerLabel: "Flash Sale",
    image: IMG.liver,
    ingredients: "Kutki, Bhumi Amla, Kalmegh, Punarnava, Triphala",
    benefits: "Detoxifies liver, improves digestion, reduces bloating",
    howToUse: "10 drops in water on empty stomach",
    dosage: "Once daily in the morning",
  },
  {
    title: "Immunity Booster",
    description: "Power-packed immunity drops with Giloy and Tulsi extract.",
    category: "immunity-drops",
    brand: "mother-tatwa",
    price: 549,
    salePrice: 0,
    totalStock: 300,
    averageReview: 4.9,
    isFeatured: true,
    image: IMG.immunity,
    ingredients: "Giloy, Tulsi, Ashwagandha, Turmeric, Black Pepper",
    benefits: "Strengthens immune response, fights seasonal infections",
    howToUse: "Mix 15 drops in warm water or honey",
    dosage: "Twice daily",
  },
  {
    title: "Gut Health Drops",
    description: "Digestive wellness drops for a happy, healthy gut.",
    category: "digestive-care",
    brand: "mother-tatwa",
    price: 599,
    salePrice: 499,
    totalStock: 180,
    averageReview: 4.6,
    isFeatured: true,
    image: IMG.gut,
    ingredients: "Triphala, Ajwain, Saunf, Jeera, Hing",
    benefits: "Improves digestion, reduces acidity, supports gut flora",
    howToUse: "10 drops after meals in warm water",
    dosage: "Twice daily after lunch and dinner",
  },
  {
    title: "Heart Care Drops",
    description: "Ayurvedic formula for cardiovascular wellness and circulation.",
    category: "heart-wellness",
    brand: "mother-tatwa",
    price: 699,
    salePrice: 599,
    totalStock: 120,
    averageReview: 4.5,
    isFeatured: true,
    image: IMG.heart,
    ingredients: "Arjuna, Garlic, Cinnamon, Hawthorn, Brahmi",
    benefits: "Supports heart health, maintains healthy cholesterol",
    howToUse: "10 drops in water before breakfast",
    dosage: "Once daily in the morning",
  },
  {
    title: "Joint Relief Drops",
    description: "Herbal relief for joint pain, stiffness and inflammation.",
    category: "joint-pain-relief",
    brand: "mother-tatwa",
    price: 649,
    salePrice: 549,
    totalStock: 160,
    averageReview: 4.7,
    isFeatured: true,
    image: IMG.joint,
    ingredients: "Shallaki, Nirgundi, Guggul, Rasna, Ginger",
    benefits: "Reduces joint pain, improves mobility, anti-inflammatory",
    howToUse: "15 drops in warm milk or water",
    dosage: "Twice daily",
  },
  {
    title: "Hair Growth Drops",
    description: "Bhringraj-powered drops for stronger, thicker hair naturally.",
    category: "skin-hair-care",
    brand: "mother-tatwa",
    price: 549,
    salePrice: 449,
    totalStock: 220,
    averageReview: 4.6,
    isFeatured: true,
    image: IMG.hair,
    ingredients: "Bhringraj, Amla, Brahmi, Methi, Coconut Oil extract",
    benefits: "Reduces hair fall, promotes growth, nourishes scalp",
    howToUse: "10 drops orally + massage 5 drops on scalp",
    dosage: "Once daily",
  },
  {
    title: "Women's Care Drops",
    description: "Hormonal balance and wellness drops for women's health.",
    category: "womens-wellness",
    brand: "mother-tatwa",
    price: 699,
    salePrice: 599,
    totalStock: 140,
    averageReview: 4.8,
    isFeatured: true,
    image: IMG.women,
    ingredients: "Shatavari, Ashoka, Lodhra, Aloe Vera, Manjistha",
    benefits: "Balances hormones, supports menstrual health, boosts vitality",
    howToUse: "10 drops in warm water",
    dosage: "Twice daily",
  },
  {
    title: "Lung Care Drops",
    description: "Respiratory support with Vasaka and Mulethi for clear breathing.",
    category: "lung-care",
    brand: "mother-tatwa",
    price: 599,
    salePrice: 0,
    totalStock: 170,
    averageReview: 4.5,
    isFeatured: false,
    image: IMG.lung,
    ingredients: "Vasaka, Mulethi, Tulsi, Pippali, Kantakari",
    benefits: "Clears airways, soothes cough, supports lung function",
    howToUse: "10 drops in warm water with honey",
    dosage: "Twice daily",
  },
  {
    title: "Stress Relief Drops",
    description: "Calming Ashwagandha and Brahmi blend for mental peace.",
    category: "stress-relief",
    brand: "mother-tatwa",
    price: 549,
    salePrice: 449,
    totalStock: 190,
    averageReview: 4.7,
    isFeatured: false,
    image: IMG.stress,
    ingredients: "Ashwagandha, Brahmi, Jatamansi, Shankhpushpi, Tagar",
    benefits: "Reduces stress, improves sleep, calms anxiety",
    howToUse: "10 drops in warm milk before bed",
    dosage: "Once daily at night",
  },
  {
    title: "Diabetes Support Drops",
    description: "Blood sugar management with Karela and Jamun extracts.",
    category: "diabetes-support",
    brand: "mother-tatwa",
    price: 649,
    salePrice: 0,
    totalStock: 130,
    averageReview: 4.4,
    isFeatured: false,
    image: IMG.diabetes,
    ingredients: "Karela, Jamun, Gudmar, Fenugreek, Cinnamon",
    benefits: "Helps maintain healthy blood sugar levels naturally",
    howToUse: "10 drops in water before meals",
    dosage: "Twice daily before lunch and dinner",
  },
  {
    title: "Kids Wellness Drops",
    description: "Gentle herbal drops safe for children's daily immunity.",
    category: "kids-wellness",
    brand: "mother-tatwa",
    price: 449,
    salePrice: 399,
    totalStock: 250,
    averageReview: 4.9,
    isFeatured: false,
    image: IMG.kids,
    ingredients: "Tulsi, Amla, Yashtimadhu, Vacha, Pippali",
    benefits: "Boosts child immunity, improves appetite, safe daily use",
    howToUse: "5-8 drops in juice or warm water",
    dosage: "Once daily for children 5+",
  },
];

const features = [
  { image: "/products/signature.jpg" },
  { image: "/products/gut.jpg" },
  { image: "/products/lung.jpg" },
];

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mern-ecommerce";
  await mongoose.connect(uri);

  // Reset transactional data — fresh start for manual testing
  const [orders, carts, addresses, reviews] = await Promise.all([
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Address.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log(
    `Cleared: ${orders.deletedCount} orders, ${carts.deletedCount} carts, ${addresses.deletedCount} addresses, ${reviews.deletedCount} reviews`
  );

  await Product.deleteMany({});
  await Feature.deleteMany({});
  await Product.insertMany(products);
  await Feature.insertMany(features);
  await SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $setOnInsert: defaultSiteSettings },
    { upsert: true }
  );
  console.log(`Seeded ${products.length} Mother Tatwa products & ${features.length} banners`);

  const bcrypt = require("bcryptjs");
  const users = [
    { userName: "Admin", email: "localtest@example.com", password: "secret123", role: "admin" },
    { userName: "Test User", email: "user@example.com", password: "user123", role: "user" },
  ];
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await User.findOneAndUpdate(
      { email: u.email },
      { $set: { userName: u.userName, password: hash, role: u.role } },
      { upsert: true }
    );
  }
  console.log("Seeded admin + test user accounts");
  console.log("\n✅ Fresh start ready — 0 orders, 0 carts, 0 addresses");
  console.log("   Admin: localtest@example.com / secret123");
  console.log("   User:  user@example.com / user123\n");

  await mongoose.disconnect();
  console.log("Mother Tatwa seed complete");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
