import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useSiteSettings, resolveProductImage } from "@/hooks/use-site-settings";
import ProductOfferBadges from "./product-offer-badges";
import { getDiscountPercent } from "@/lib/product-offers";
import { useEffect, useState } from "react";
import { Eye, ShoppingBag, Star, Heart, Zap, Video } from "lucide-react";
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

  const productImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : product?.image
    ? [product.image]
    : [];

  const secondaryImg = productImages.length > 1 ? resolveProductImage(productImages[1]) : null;

  useEffect(() => {
    setImgSrc(resolveProductImage(product?.image || productImages[0]));
  }, [product?.image, product?.images, product?._id]);

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
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-50/80 to-leaf/15 aspect-square flex items-center justify-center p-2 sm:p-2.5">
          {/* Primary image */}
          <img
            src={imgSrc}
            alt={product?.title}
            loading="lazy"
            onError={() => { if (imgSrc !== FALLBACK_IMG) setImgSrc(FALLBACK_IMG); }}
            className={`w-full h-full object-contain object-center transition-all duration-500 ${
              secondaryImg ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
            }`}
          />

          {/* Secondary hover image if available */}
          {secondaryImg && (
            <img
              src={secondaryImg}
              alt={`${product?.title} alternate`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain object-center p-2 sm:p-2.5 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
            <span className="flex items-center gap-1.5 text-white text-xs font-semibold bg-forest/85 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </span>
          </div>

          {/* Wishlist heart - top left */}
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute top-2 left-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs backdrop-blur-xs transition-all ${
              isWishlisted
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-white/85 text-forest/40 border border-forest/10 hover:text-red-400 hover:bg-white"
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500" : ""}`} />
          </button>

          {/* Offer badges (20% OFF, 30% OFF, Flash Sale) - top right */}
          <ProductOfferBadges product={product} className="absolute top-2 right-2 z-10 max-w-[70%]" />

          {/* Video badge if available */}
          {product?.video && (
            <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
              <Video className="w-2.5 h-2.5 text-blue-400" /> Video
            </span>
          )}
        </div>

        <CardContent className="p-2.5 sm:p-4 pb-1.5 sm:pb-2 flex-1">
          <p className="text-[9px] sm:text-[10px] text-gold font-bold uppercase tracking-wider sm:tracking-widest mb-0.5 sm:mb-1 truncate">
            {categoryName}
          </p>
          <h2 className="font-display text-xs sm:text-sm font-bold text-forest mb-1 line-clamp-2 leading-tight sm:leading-snug min-h-[2.1rem] sm:min-h-[2.5rem]">
            {product?.title}
          </h2>
          {/* Packaging / Type badge */}
          {(product?.sizeValue || product?.productType) && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium mb-1">
              <span className="bg-leaf/80 text-forest px-1.5 py-0.5 rounded border border-forest/15 font-semibold text-[9px]">
                {product?.productType || "Capsule"}
              </span>
              {product?.sizeValue && (
                <span className="text-gray-500 font-medium">· {product.sizeValue} {product.sizeUnit || ""}</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${s <= Math.round(product?.averageReview || 4.5) ? "fill-gold text-gold" : "fill-forest/10 text-forest/10"}`} />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">
              ({product?.averageReview?.toFixed(1) || "4.5"})
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-lg font-bold text-forest">₹{price}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-normal">
              (Incl. GST)
            </span>
            {product?.salePrice > 0 && (
              <>
                <span className="text-[11px] sm:text-xs text-muted-foreground line-through">₹{product?.price}</span>
                {discount > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-forest-700 bg-forest-50 px-1 sm:px-1.5 py-0.5 rounded">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>
          {savings > 0 && (
            <p className="text-[9px] sm:text-[10px] text-forest-600 font-semibold mt-0.5">
              You save ₹{savings}
            </p>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-2 sm:p-3 pt-1 sm:pt-2 mt-auto flex flex-col gap-1 sm:gap-1.5">
        {product?.totalStock === 0 ? (
          <Button disabled className="w-full rounded-xl sm:rounded-full opacity-50 h-8 sm:h-9 text-[11px] sm:text-xs">
            Out of Stock
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
              variant="outline"
              className="w-full rounded-xl sm:rounded-full h-8 sm:h-9 font-semibold text-[11px] sm:text-xs btn-dynamic-secondary px-2"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
              <span className="truncate">Add to Cart</span>
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="buynow"
              className="w-full rounded-xl sm:rounded-full h-8 sm:h-9 font-semibold text-[11px] sm:text-xs btn-dynamic-buynow px-2"
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
              <span className="truncate">Buy Now</span>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
