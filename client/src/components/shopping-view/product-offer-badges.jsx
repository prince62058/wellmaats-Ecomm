import { Zap, Sparkles } from "lucide-react";
import {
  getDiscountPercent,
  isFlashSaleActive,
} from "@/lib/product-offers";

function ProductOfferBadges({ product, className = "" }) {
  const discount = getDiscountPercent(product);
  const flash = isFlashSaleActive(product);

  if (product?.totalStock === 0) {
    return (
      <div className={className}>
        <span className="inline-flex items-center text-[10px] font-bold bg-gray-900/90 text-white px-2 py-0.5 rounded-full shadow-xs">
          Sold Out
        </span>
      </div>
    );
  }

  // Render ONE clean, compact badge so product packaging/artwork is never obscured
  if (flash) {
    return (
      <div className={className}>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs tracking-tight">
          <Zap className="w-2.5 h-2.5 fill-white" />
          {discount > 0 ? `${discount}% OFF` : product?.offerLabel || "Flash Sale"}
        </span>
      </div>
    );
  }

  if (discount > 0) {
    return (
      <div className={className}>
        <span className="inline-flex items-center text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full shadow-xs">
          {discount}% OFF
        </span>
      </div>
    );
  }

  if (product?.isFeatured) {
    return (
      <div className={className}>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-forest/90 text-white px-2 py-0.5 rounded-full shadow-xs">
          <Sparkles className="w-2.5 h-2.5 text-gold" />
          Featured
        </span>
      </div>
    );
  }

  return null;
}

export default ProductOfferBadges;

