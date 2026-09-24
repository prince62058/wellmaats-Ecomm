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
        <span className="inline-flex items-center text-[10px] font-bold bg-gray-900/90 text-white px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap select-none">
          Sold Out
        </span>
      </div>
    );
  }

  // Render ONE clean, compact badge so product packaging/artwork is never obscured
  if (flash) {
    return (
      <div className={className}>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-sm tracking-tight whitespace-nowrap select-none">
          <Zap className="w-2.5 h-2.5 fill-white shrink-0" />
          {discount > 0 ? `${discount}% OFF` : product?.offerLabel || "Flash Sale"}
        </span>
      </div>
    );
  }

  if (discount > 0) {
    return (
      <div className={className}>
        <span className="inline-flex items-center text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap select-none">
          {discount}% OFF
        </span>
      </div>
    );
  }

  if (product?.isFeatured) {
    return (
      <div className={className}>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-forest/90 text-white px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap select-none">
          <Sparkles className="w-2.5 h-2.5 text-gold shrink-0" />
          Featured
        </span>
      </div>
    );
  }

  return null;
}

export default ProductOfferBadges;

