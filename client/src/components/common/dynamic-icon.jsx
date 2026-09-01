import React from "react";
import {
  Shield, Heart, Wind, Brain, Bone, Sparkles, Activity, Scale, Droplets,
  Baby, Flame, Stethoscope, Pill, Apple, Cross, HeartPulse, Eye, Smile,
  Coffee, TreePine, Dumbbell, Footprints, Feather, ShieldCheck, FlaskConical,
  Ban, Flag, Truck, Star, Clock, Zap, Award, CheckCircle, Package, Gift,
  ShoppingBag, Plus, Tag, HelpCircle, User, Compass, CircleDot, Thermometer,
  Sun, Moon, Waves, Salad, Utensils, Wheat, Leaf, Citrus
} from "lucide-react";

export const DYNAMIC_ICONS_MAP = {
  Shield,
  Heart,
  Wind,
  Brain,
  Bone,
  Sparkles,
  Activity,
  Scale,
  Droplets,
  Baby,
  Flame,
  Stethoscope,
  Pill,
  Apple,
  Cross,
  HeartPulse,
  Eye,
  Smile,
  Coffee,
  TreePine,
  Dumbbell,
  Footprints,
  Feather,
  ShieldCheck,
  FlaskConical,
  Ban,
  Flag,
  Truck,
  Star,
  Clock,
  Zap,
  Award,
  CheckCircle,
  Package,
  Gift,
  ShoppingBag,
  Plus,
  Tag,
  HelpCircle,
  User,
  Compass,
  CircleDot,
  Thermometer,
  Sun,
  Moon,
  Waves,
  Salad,
  Utensils,
  Wheat,
  Leaf,
  Citrus,
};

export const DEFAULT_CATEGORY_ICONS = {
  "immunity-drops": "Shield",
  "digestive-care": "Flame",
  "liver-care": "Droplets",
  "lung-care": "Wind",
  "heart-wellness": "Heart",
  "stress-relief": "Brain",
  "joint-pain-relief": "Bone",
  "womens-wellness": "Sparkles",
  "mens-wellness": "Activity",
  "diabetes-support": "Stethoscope",
  "weight-management": "Scale",
  "skin-hair-care": "Sparkles",
  "kids-wellness": "Baby",
};

export const ICON_GROUPS = [
  {
    group: "Health & Organs",
    icons: [
      { name: "Heart", label: "Heart Care / Cardio" },
      { name: "HeartPulse", label: "Heart Pulse / Vitals" },
      { name: "Brain", label: "Brain / Mind / Stress" },
      { name: "Bone", label: "Bone & Joint Care" },
      { name: "Droplets", label: "Liver & Detox / Drops" },
      { name: "Flame", label: "Digestion / Agni / Gut" },
      { name: "Wind", label: "Lungs / Breathing Care" },
      { name: "Eye", label: "Eye / Vision Care" },
      { name: "Activity", label: "Energy / Vitality / Men" },
      { name: "Scale", label: "Weight Management" },
      { name: "Stethoscope", label: "Diabetes & Clinic" },
      { name: "Thermometer", label: "Fever & Health Check" },
    ],
  },
  {
    group: "Ayurveda & Nature",
    icons: [
      { name: "Leaf", label: "Herbal / Ayurveda / Natural" },
      { name: "TreePine", label: "Forest & Pure Roots" },
      { name: "Wheat", label: "Diet / Grains / Nutrition" },
      { name: "Salad", label: "Healthy Food & Detox" },
      { name: "Apple", label: "Immunity & Nutrition" },
      { name: "Citrus", label: "Vitamin C & Citrus" },
      { name: "Sun", label: "Morning / Energy / Surya" },
      { name: "Moon", label: "Sleep / Calm / Night" },
      { name: "Waves", label: "Hydration & Flow" },
      { name: "Feather", label: "Lightness & Gentle" },
    ],
  },
  {
    group: "Wellness & Lifestyle",
    icons: [
      { name: "Sparkles", label: "Glow / Skin & Hair / Women" },
      { name: "Baby", label: "Kids & Gentle Wellness" },
      { name: "Smile", label: "Mental Peace & Happiness" },
      { name: "Dumbbell", label: "Fitness & Strength" },
      { name: "Footprints", label: "Daily Routine / Walk" },
      { name: "Coffee", label: "Herbal Tea & Brews" },
      { name: "Utensils", label: "Healthy Meals" },
      { name: "Zap", label: "Fast Action / Energy" },
      { name: "Pill", label: "Capsules & Supplements" },
      { name: "Cross", label: "First Aid & Pure Care" },
    ],
  },
  {
    group: "Trust & Badges",
    icons: [
      { name: "Shield", label: "Immunity & Protection" },
      { name: "ShieldCheck", label: "GMP Certified / Verified" },
      { name: "FlaskConical", label: "Lab Tested & Pure" },
      { name: "Award", label: "Top Rated & Quality" },
      { name: "Star", label: "Bestseller / Rating" },
      { name: "CheckCircle", label: "Guaranteed Authentic" },
      { name: "Truck", label: "Fast Express Delivery" },
      { name: "Clock", label: "Timely Results" },
      { name: "Tag", label: "Discounts & Offers" },
      { name: "Gift", label: "Gift Packs & Combos" },
      { name: "Package", label: "Order Packaging" },
      { name: "ShoppingBag", label: "Store & Shopping" },
      { name: "Flag", label: "Made in India" },
      { name: "Ban", label: "100% Chemical Free" },
    ],
  },
];

export function resolveIconComponent(iconNameOrUrl, categoryId) {
  const target = iconNameOrUrl || (categoryId ? DEFAULT_CATEGORY_ICONS[categoryId] : null) || "Leaf";

  if (typeof target === "function") return target;

  if (typeof target === "string") {
    // Check if image URL
    if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("/")) {
      return function DynamicImageIcon(props) {
        return (
          <img
            src={target}
            alt="icon"
            className={`object-contain ${props.className || "w-6 h-6"}`}
            style={props.style}
          />
        );
      };
    }

    // Direct lookup in map
    if (DYNAMIC_ICONS_MAP[target]) {
      return DYNAMIC_ICONS_MAP[target];
    }

    // Case-insensitive lookup in map
    const lower = target.toLowerCase();
    const foundKey = Object.keys(DYNAMIC_ICONS_MAP).find(
      (k) => k.toLowerCase() === lower
    );
    if (foundKey) {
      return DYNAMIC_ICONS_MAP[foundKey];
    }

    // Emoji or raw character string (non-alphanumeric or short string)
    if (target.length <= 4 || /[\uD800-\uDFFF]/.test(target)) {
      return function EmojiIcon(props) {
        return (
          <span
            className={`inline-flex items-center justify-center select-none leading-none ${props.className || "text-xl"}`}
            style={props.style}
          >
            {target}
          </span>
        );
      };
    }
  }

  return Shield;
}

export function DynamicIcon({ name, icon, categoryId, className = "w-6 h-6", style, fallback = Shield }) {
  const IconComponent = resolveIconComponent(icon || name, categoryId) || fallback;
  return <IconComponent className={className} style={style} />;
}

export default DynamicIcon;
