import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useSiteSettings, resolveProductImage } from "@/hooks/use-site-settings";
import ProductOfferBadges from "./product-offer-badges";
import { getDiscountPercent } from "@/lib/product-offers";
import { useEffect, useState } from "react";
import { Eye, ShoppingBag, Star } from "lucide-react";

const FALLBACK_IMG = "/products/signature.jpg";

function ShoppingProductTile({ product, handleGetProductDetails, handleAddtoCart }) {
  const { categoryOptionsMap } = useSiteSettings();
  const [imgSrc, setImgSrc] = useState(resolveProductImage(product?.image));

  useEffect(() => {
    setImgSrc(resolveProductImage(product?.image));
  }, [product?.image, product?._id]);
  const price = product?.salePrice > 0 ? product.salePrice : product?.price;
  const discount = getDiscountPercent(product);
  const categoryName = categoryOptionsMap[product?.category] || product?.category?.replace(/-/g, " ") || "Wellness";

  return (
    <Card className="group w-full h-full flex flex-col bg-white rounded-2xl border border-forest/10 overflow-hidden hover:shadow-xl hover:border-forest/25 hover:-translate-y-1 transition-all duration-300">
      <div
        onClick={() => handleGetProductDetails(product?._id)}
        className="cursor-pointer relative"
      >
        <div className="relative overflow-hidden bg-leaf/30 aspect-[4/5]">
          <img
            src={imgSrc}
            alt={product?.title}
            loading="lazy"
            onError={() => {
              if (imgSrc !== FALLBACK_IMG) setImgSrc(FALLBACK_IMG);
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <span className="flex items-center gap-1.5 text-white text-xs font-medium bg-forest/80 backdrop-blur px-4 py-2 rounded-full">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </span>
          </div>
          <ProductOfferBadges product={product} className="absolute top-3 left-3 z-10" />
        </div>

        <CardContent className="p-4 flex-1">
          <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1.5">
            {categoryName}
          </p>
          <h2 className="font-display text-base font-bold text-forest mb-2 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product?.title}
          </h2>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product?.averageReview || 4.5)
                      ? "fill-gold text-gold"
                      : "fill-forest/10 text-forest/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product?.averageReview?.toFixed(1) || "4.5"}
            </span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-forest">₹{price}</span>
            {product?.salePrice > 0 && (
              <>
                <span className="text-sm text-muted-foreground line-through">₹{product?.price}</span>
                {discount > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Save {discount}%
                  </span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-4 pt-0 mt-auto">
        {product?.totalStock === 0 ? (
          <Button disabled className="w-full rounded-full opacity-50 h-10">
            Out of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full rounded-full h-10 bg-forest hover:bg-forest/90 font-semibold shadow-sm group/btn"
          >
            <ShoppingBag className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
