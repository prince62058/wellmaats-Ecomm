import { useSelector } from "react-redux";
import {
  BRAND,
  PRODUCT_CATEGORIES,
  brandOptionsMap,
  categoryOptionsMap,
  WHY_CHOOSE_US,
  HEALTH_BENEFITS,
  TESTIMONIALS,
  DOCTORS,
  FAQ_ITEMS,
  FOOTER_LINKS,
  TRUST_BADGES,
  PAYMENT_METHODS,
  DELIVERY_PARTNERS,
} from "@/config/brand";

export function buildCategoryOptionsMap(categories) {
  return Object.fromEntries((categories || []).map((c) => [c.id, c.label]));
}
export function buildBrandOptionsMap(brands) {
  return Object.fromEntries((brands || []).map((b) => [b.id, b.label]));
}

const DEFAULT_MARQUEE = [
  "🌿 100% Ayurvedic",
  "🧪 Lab Tested",
  "✅ GMP Certified",
  "🇮🇳 Made in India",
  "🚚 Free Shipping above ₹499",
  "💊 35+ Herbs Extract",
  "⭐ 4.8 Customer Rating",
  "🔒 Secure Payments",
];

const DEFAULT_NAV_LINKS = [
  { label: "Best Sellers", href: "/shop/best-sellers", icon: "🏆" },
  { label: "Offer Zone",   href: "/shop/offer-zone",   icon: "🔥" },
  { label: "Blogs",        href: "/blogs",              icon: "📖" },
  { label: "Track Order",  href: "/shop/account",       icon: "🚚" },
];

export function useSiteSettings() {
  const { data, isLoading } = useSelector((state) => state.siteSettings);

  const productCategories = data?.productCategories?.length
    ? data.productCategories : PRODUCT_CATEGORIES;

  const brands = data?.brands?.length
    ? data.brands : [{ id: "mother-tatwa", label: "Mother Tatwa" }];

  return {
    isLoading,
    settings: data,

    // Brand / contact
    brand:   data?.brand   || BRAND,
    siteUrl: data?.brand?.siteUrl?.trim() || "",
    contact: data?.contact || BRAND.contact,
    social:  data?.social  || [],

    // Header / announcement
    announcementBar: data?.announcementBar || { enabled: true, messages: [] },
    heroSlides:      data?.heroSlides      || [],
    headerNavLinks:  data?.headerNavLinks?.length ? data.headerNavLinks : DEFAULT_NAV_LINKS,
    marqueeMessages: data?.marqueeMessages?.length ? data.marqueeMessages : DEFAULT_MARQUEE,

    // Shop
    productCategories,
    brands,
    categoryOptionsMap: data?.productCategories?.length
      ? buildCategoryOptionsMap(data.productCategories) : categoryOptionsMap,
    brandOptionsMap: data?.brands?.length
      ? buildBrandOptionsMap(data.brands) : brandOptionsMap,

    // Menus & filters
    megaMenu:     data?.megaMenu     || [],
    quickFilters: data?.quickFilters || [],
    promoBanners: data?.promoBanners || [],

    // Content sections
    whyChooseUs:    data?.whyChooseUs?.length    ? data.whyChooseUs    : WHY_CHOOSE_US,
    healthBenefits: data?.healthBenefits?.length ? data.healthBenefits : HEALTH_BENEFITS,
    testimonials:   data?.testimonials?.length   ? data.testimonials   : TESTIMONIALS,
    doctors:        data?.doctors?.length        ? data.doctors        : DOCTORS,
    faq:            data?.faq?.length            ? data.faq            : FAQ_ITEMS,
    stats: data?.stats?.length ? data.stats : [
      { value: 12,  suffix: "+", label: "Ayurvedic Drops",   decimals: 0 },
      { value: 4.8, suffix: "★", label: "Customer Rating",   decimals: 1 },
      { value: 100, suffix: "%", label: "Herbal Formulas",   decimals: 0 },
      { value: 28,  suffix: "",  label: "States Delivered",  decimals: 0 },
    ],
    newsletter: data?.newsletter || {
      title:    "Get ₹100 OFF Your First Order",
      subtitle: "Subscribe to wellness tips & exclusive offers",
    },

    // Footer
    footerLinks:      data?.footerLinks      || FOOTER_LINKS,
    trustBadges:      data?.trustBadges?.length      ? data.trustBadges      : TRUST_BADGES,
    paymentMethods:   data?.paymentMethods?.length   ? data.paymentMethods   : PAYMENT_METHODS,
    deliveryPartners: data?.deliveryPartners?.length ? data.deliveryPartners : DELIVERY_PARTNERS,
    productBadges:    data?.productBadges || [
      { label: "Express Delivery", icon: "Truck" },
      { label: "COD Available",    icon: "Shield" },
    ],
    howItWorks: data?.howItWorks?.length ? data.howItWorks : [
      { emoji: "🌿", tag: "Step 01", title: "Browse & Choose",    desc: "Explore 12+ Ayurvedic drops by wellness need — immunity, gut, stress & more." },
      { emoji: "🛒", tag: "Step 02", title: "Add to Cart",        desc: "Pick your drops, secure checkout with Razorpay — UPI, cards & wallets." },
      { emoji: "🚚", tag: "Step 03", title: "Wellness Delivered", desc: "Pan-India express delivery. Start your daily Ayurvedic routine at home." },
    ],
    herbs: data?.herbs?.length ? data.herbs : [
      { emoji: "🌿", name: "Ashwagandha",  benefit: "Stress & Anxiety"    },
      { emoji: "🌸", name: "Shatavari",    benefit: "Women's Wellness"    },
      { emoji: "❤️", name: "Arjuna",       benefit: "Heart Health"         },
      { emoji: "⚡", name: "Shilajit",     benefit: "Energy & Stamina"    },
      { emoji: "🛡️", name: "Neem",         benefit: "Immunity Boost"      },
      { emoji: "🌙", name: "Brahmi",       benefit: "Mind & Memory"       },
      { emoji: "🌺", name: "Tulsi",        benefit: "Respiratory Care"    },
      { emoji: "🔆", name: "Kutki",        benefit: "Liver Detox"         },
    ],
  };
}

export function resolveProductImage(url) {
  if (!url) return "/products/signature.jpg";
  if (url.startsWith("/") || url.startsWith("http")) return url;
  return "/products/signature.jpg";
}
