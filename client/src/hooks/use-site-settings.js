import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  BRAND,
  MAIN_CATEGORIES,
  PRODUCT_CATEGORIES,
  mainCategoryOptionsMap,
  brandOptionsMap,
  categoryOptionsMap,
  subCategoryOptionsMap,
  childCategoryOptionsMap,
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
export function buildSubCategoryOptionsMap(categories) {
  return Object.fromEntries(
    (categories || []).flatMap((c) => (c.subCategories || []).map((sc) => [sc.id, sc.label]))
  );
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

const DEFAULT_BRANDS = [
  { id: "mother-tatwa", label: "Mother Tatwa" },
  { id: "wellmaats", label: "Wellmaats" },
];

const DEFAULT_THEME_COLORS = {
  primaryBtnBg: "#065f3d",
  primaryBtnText: "#ffffff",
  primaryBtnHover: "#04432b",
  secondaryBtnBg: "#ffffff",
  secondaryBtnText: "#065f3d",
  secondaryBtnBorder: "#065f3d",
  buyNowBtnBg: "#c8963e",
  buyNowBtnText: "#ffffff",
};

const DEFAULT_STATS = [
  { value: 12,  suffix: "+", label: "Ayurvedic Drops",   decimals: 0 },
  { value: 4.8, suffix: "★", label: "Customer Rating",   decimals: 1 },
  { value: 100, suffix: "%", label: "Herbal Formulas",   decimals: 0 },
  { value: 28,  suffix: "",  label: "States Delivered",  decimals: 0 },
];

const DEFAULT_NEWSLETTER = {
  title:    "Get ₹100 OFF Your First Order",
  subtitle: "Subscribe to wellness tips & exclusive offers",
};

const DEFAULT_PRODUCT_BADGES = [
  { label: "Express Delivery", icon: "Truck" },
  { label: "COD Available",    icon: "Shield" },
];

const DEFAULT_HOW_IT_WORKS = [
  { emoji: "🌿", tag: "Step 01", title: "Browse & Choose",    desc: "Explore 12+ Ayurvedic drops by wellness need — immunity, gut, stress & more." },
  { emoji: "🛒", tag: "Step 02", title: "Add to Cart",        desc: "Pick your drops, secure checkout with Razorpay — UPI, cards & wallets." },
  { emoji: "🚚", tag: "Step 03", title: "Wellness Delivered", desc: "Pan-India express delivery. Start your daily Ayurvedic routine at home." },
];

const DEFAULT_HERBS = [
  { emoji: "🌿", name: "Ashwagandha",  benefit: "Stress & Anxiety"    },
  { emoji: "🌸", name: "Shatavari",    benefit: "Women's Wellness"    },
  { emoji: "❤️", name: "Arjuna",       benefit: "Heart Health"         },
  { emoji: "⚡", name: "Shilajit",     benefit: "Energy & Stamina"    },
  { emoji: "🛡️", name: "Neem",         benefit: "Immunity Boost"      },
  { emoji: "🌙", name: "Brahmi",       benefit: "Mind & Memory"       },
  { emoji: "🌺", name: "Tulsi",        benefit: "Respiratory Care"    },
  { emoji: "🔆", name: "Kutki",        benefit: "Liver Detox"         },
];

const defaultSubMap = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.id, c.subCategories || []])
);

export function useSiteSettings() {
  const { data, isLoading } = useSelector((state) => state.siteSettings);

  return useMemo(() => {
    const mainCategories = data?.mainCategories?.length
      ? data.mainCategories
      : MAIN_CATEGORIES;

    const megaMenuIconMap = Object.fromEntries(
      (data?.megaMenu || []).map((m) => [m.id, m.icon]).filter(([, icon]) => Boolean(icon))
    );

    const defaultCatIconMap = Object.fromEntries(
      PRODUCT_CATEGORIES.map((c) => [c.id, c.icon])
    );

    const productCategories = (data?.productCategories?.length
      ? data.productCategories : PRODUCT_CATEGORIES).map((c) => ({
        ...c,
        icon: c.icon || megaMenuIconMap[c.id] || defaultCatIconMap[c.id] || "Leaf",
        subCategories: c.subCategories && c.subCategories.length > 0
          ? c.subCategories
          : defaultSubMap[c.id] || [],
      }));

    const brands = data?.brands?.length ? data.brands : DEFAULT_BRANDS;

    return {
      isLoading,
      settings: data,

      // Brand / contact / theme
      brand:   data?.brand   || BRAND,
      siteUrl: data?.brand?.siteUrl?.trim() || "",
      contact: data?.contact || BRAND.contact,
      social:  data?.social  || [],
      themeColors: data?.themeColors || DEFAULT_THEME_COLORS,

      // Header / announcement
      announcementBar: data?.announcementBar || { enabled: true, messages: [] },
      heroSlides:      data?.heroSlides      || [],
      headerNavLinks:  data?.headerNavLinks?.length ? data.headerNavLinks : DEFAULT_NAV_LINKS,
      marqueeMessages: data?.marqueeMessages?.length ? data.marqueeMessages : DEFAULT_MARQUEE,

      // Shop 3-level categories
      mainCategories,
      mainCategoryOptionsMap,
      productCategories,
      brands,
      categoryOptionsMap: data?.productCategories?.length
        ? buildCategoryOptionsMap(data.productCategories) : categoryOptionsMap,
      subCategoryOptionsMap: data?.productCategories?.length
        ? buildSubCategoryOptionsMap(data.productCategories) : subCategoryOptionsMap,
      childCategoryOptionsMap: data?.productCategories?.length
        ? buildSubCategoryOptionsMap(data.productCategories) : childCategoryOptionsMap,
      getSubCategories: (catId) => {
        const found = productCategories.find((c) => c.id === catId);
        return found?.subCategories || [];
      },
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
      stats:          data?.stats?.length          ? data.stats          : DEFAULT_STATS,
      newsletter:     data?.newsletter             || DEFAULT_NEWSLETTER,

      // Footer
      footerLinks:      data?.footerLinks            || FOOTER_LINKS,
      trustBadges:      data?.trustBadges?.length      ? data.trustBadges      : TRUST_BADGES,
      paymentMethods:   data?.paymentMethods?.length   ? data.paymentMethods   : PAYMENT_METHODS,
      deliveryPartners: data?.deliveryPartners?.length ? data.deliveryPartners : DELIVERY_PARTNERS,
      productBadges:    data?.productBadges          || DEFAULT_PRODUCT_BADGES,
      howItWorks:       data?.howItWorks?.length     ? data.howItWorks       : DEFAULT_HOW_IT_WORKS,
      herbs:            data?.herbs?.length          ? data.herbs            : DEFAULT_HERBS,
    };
  }, [data, isLoading]);
}

export function resolveProductImage(url) {
  if (!url) return "/products/signature.jpg";
  if (url.startsWith("/") || url.startsWith("http")) return url;
  return "/products/signature.jpg";
}
