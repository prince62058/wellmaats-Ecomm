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

export function useSiteSettings() {
  const { data, isLoading } = useSelector((state) => state.siteSettings);

  const productCategories = data?.productCategories?.length
    ? data.productCategories
    : PRODUCT_CATEGORIES;

  const brands = data?.brands?.length ? data.brands : [{ id: "mother-tatwa", label: "Mother Tatwa" }];

  return {
    isLoading,
    settings: data,
    megaMenu: data?.megaMenu || [],
    quickFilters: data?.quickFilters || [],
    promoBanners: data?.promoBanners || [],
    brand: data?.brand || BRAND,
    contact: data?.contact || BRAND.contact,
    social: data?.social || [],
    productCategories,
    brands,
    categoryOptionsMap: data?.productCategories?.length
      ? buildCategoryOptionsMap(data.productCategories)
      : categoryOptionsMap,
    brandOptionsMap: data?.brands?.length
      ? buildBrandOptionsMap(data.brands)
      : brandOptionsMap,
    whyChooseUs: data?.whyChooseUs?.length ? data.whyChooseUs : WHY_CHOOSE_US,
    healthBenefits: data?.healthBenefits?.length ? data.healthBenefits : HEALTH_BENEFITS,
    testimonials: data?.testimonials?.length ? data.testimonials : TESTIMONIALS,
    doctors: data?.doctors?.length ? data.doctors : DOCTORS,
    faq: data?.faq?.length ? data.faq : FAQ_ITEMS,
    footerLinks: data?.footerLinks || FOOTER_LINKS,
    trustBadges: data?.trustBadges?.length ? data.trustBadges : TRUST_BADGES,
    paymentMethods: data?.paymentMethods?.length ? data.paymentMethods : PAYMENT_METHODS,
    deliveryPartners: data?.deliveryPartners?.length ? data.deliveryPartners : DELIVERY_PARTNERS,
    productBadges: data?.productBadges || [
      { label: "Express Delivery", icon: "Truck" },
      { label: "COD Available", icon: "Shield" },
    ],
    stats: data?.stats?.length
      ? data.stats
      : [
          { value: 12, suffix: "+", label: "Ayurvedic Drops", decimals: 0 },
          { value: 4.8, suffix: "★", label: "Customer Rating", decimals: 1 },
          { value: 100, suffix: "%", label: "Herbal Formulas", decimals: 0 },
          { value: 28, suffix: "", label: "States Delivered", decimals: 0 },
        ],
    newsletter: data?.newsletter || {
      title: "Get ₹100 OFF Your First Order",
      subtitle: "Subscribe to wellness tips & exclusive offers",
    },
  };
}

export function resolveProductImage(url) {
  if (!url) return "/products/signature.jpg";
  if (url.startsWith("/") || url.startsWith("http")) return url;
  return "/products/signature.jpg";
}
