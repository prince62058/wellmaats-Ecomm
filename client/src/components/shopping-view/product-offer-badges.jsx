import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import {
  getDiscountPercent,
  isFlashSaleActive,
  getTimeLeft,
} from "@/lib/product-offers";

function ProductOfferBadges({ product, className = "" }) {
  const discount = getDiscountPercent(product);
  const flash = isFlashSaleActive(product);
  const timeLeft = flash && product?.flashSaleEndsAt ? getTimeLeft(product.flashSaleEndsAt) : null;

  if (product?.totalStock === 0) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <Badge className="bg-red-500/90 text-white border-0 shadow w-fit">Sold Out</Badge>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 items-start ${className}`}>
      {flash && (
        <Badge className="bg-red-600 text-white border-0 shadow font-bold gap-1 w-fit animate-pulse text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5">
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
          {product?.offerLabel || "Flash Sale"}
        </Badge>
      )}
      {discount > 0 && (
        <Badge className={`border-0 shadow font-bold w-fit text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 ${flash ? "bg-orange-500 text-white" : "bg-gold text-white"}`}>
          {discount}% OFF
        </Badge>
      )}
      {product?.isFeatured && !flash && (
        <Badge className="bg-forest/90 text-white border-0 shadow w-fit text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5">Featured</Badge>
      )}
      {timeLeft && (
        <span className="text-[9px] sm:text-[10px] font-semibold bg-black/60 text-white px-1.5 sm:px-2 py-0.5 rounded-full">
          ⏱ {timeLeft}
        </span>
      )}
    </div>
  );
}

export default ProductOfferBadges;
