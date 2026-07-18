import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useSiteSettings, resolveProductImage } from "@/hooks/use-site-settings";
import ProductOfferBadges from "./product-offer-badges";
import { getDiscountPercent } from "@/lib/product-offers";
import { useEffect, useState } from "react";
import { Eye, ShoppingBag, Star, Heart, Zap } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlistItem } from "@/store/shop/wishlist-slice";
import { useNavigate } from "react-router-dom";
import { useLoginModal } from "@/context/LoginModalContext";

const FALLBACK_IMG = "/products/signature.jpg";

function ShoppingProductTile({ product, handleGetProductDetails, handleAddtoCart }) {
  const { categoryOptionsMap } = useSiteSettings();
  const [imgSrc, setImgSrc] = useState(resolveProductImage(product?.image));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const wishlistProducts = useSelector((s) => s.wishlist?.products || []);
  const isWishlisted = wishlistProducts.includes(product?._id);
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    setImgSrc(resolveProductImage(product?.image));
  }, [product?.image, product?._id]);

  const price = product?.salePrice > 0 ? product.salePrice : product?.price;
  const discount = getDiscountPercent(product);
  const savings = product?.salePrice > 0 ? product.price - product.salePrice : 0;
  const categoryName = categoryOptionsMap[product?.category] || product?.category?.replace(/-/g, " ") || "Wellness";

  function handleWishlist(e) {
    e.stopPropagation();
    if (!user?.id) { openLoginModal(); return; }
    dispatch(toggleWishlistItem({ userId: user.id, productId: product._id }));
  }

  function handleBuyNow(e) {
    e.stopPropagation();
    handleAddtoCart?.(product?._id, product?.totalStock);
    setTimeout(() => navigate("/shop/checkout"), 400);
  }

  return (
    <Card className="group w-full h-full flex flex-col bg-white rounded-2xl border border-forest/10 overflow-hidden hover:shadow-xl hover:border-forest/25 hover:-translate-y-1 transition-all duration-300">
      <div
        onClick={() => navigate(`/shop/product/${product?._id}`)}
        className="cursor-pointer relative"
      >
        <div className="relative overflow-hidden bg-leaf/30 aspect-[4/5]">
          <img
            src={imgSrc}
            alt={product?.title}
            loading="lazy"
            onError={() => { if (imgSrc !== FALLBACK_IMG) setImgSrc(FALLBACK_IMG); }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <span className="flex items-center gap-1.5 text-white text-xs font-medium bg-forest/80 backdrop-blur px-4 py-2 rounded-full">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </span>
          </div>
          {/* Offer badges */}
          <ProductOfferBadges product={product} className="absolute top-3 left-3 z-10" />
          {/* Wishlist heart */}
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
              isWishlisted
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-white/90 text-forest/40 border border-forest/10 hover:text-red-400 hover:bg-red-50"
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
          </button>
        </div>

        <CardContent className="p-4 pb-2 flex-1">
          <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1">
            {categoryName}
          </p>
          <h2 className="font-display text-sm font-bold text-forest mb-1.5 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product?.title}
          </h2>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(product?.averageReview || 4.5) ? "fill-gold text-gold" : "fill-forest/10 text-forest/10"}`} />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              ({product?.averageReview?.toFixed(1) || "4.5"})
            </span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-forest">₹{price}</span>
            {product?.salePrice > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">₹{product?.price}</span>
                {discount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>
          {savings > 0 && (
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              You save ₹{savings}
            </p>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-2.5 sm:p-3 pt-2 mt-auto flex flex-col gap-1.5">
        {product?.totalStock === 0 ? (
          <Button disabled className="w-full rounded-full opacity-50 h-9 text-xs">
            Out of Stock
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
              variant="outline"
              className="w-full rounded-full h-9 border-forest text-forest hover:bg-leaf font-semibold text-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span className="truncate">Add to Cart</span>
            </Button>
            <Button
              onClick={handleBuyNow}
              className="w-full rounded-full h-9 bg-gold hover:bg-gold/90 text-white font-semibold text-xs shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span className="truncate">Buy Now</span>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
