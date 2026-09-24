import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { toggleWishlistItem } from "@/store/shop/wishlist-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useSiteSettings, resolveProductImage } from "@/hooks/use-site-settings";
import { getDiscountPercent, isFlashSaleActive, getTimeLeft } from "@/lib/product-offers";
import ProductOfferBadges from "@/components/shopping-view/product-offer-badges";
import StarRatingComponent from "@/components/common/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  ShoppingBag, Zap, Heart, ArrowLeft, BadgeCheck,
  Truck, Shield, Package, Star, ChevronRight, Share2,
  ChevronLeft, Play, Receipt,
} from "lucide-react";
import { calculateTaxBreakdown } from "@/lib/tax-calculator";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import axiosInstance from "@/lib/axiosInstance";
import { useLoginModal } from "@/context/LoginModalContext";

const FALLBACK = "/products/signature.jpg";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { productList } = useSelector((s) => s.shopProducts);
  const { cartItems } = useSelector((s) => s.shopCart);
  const { user } = useSelector((s) => s.auth);
  const { reviews } = useSelector((s) => s.shopReview);
  const siteSettingsData = useSelector((s) => s.siteSettings?.data);
  const wishlistProducts = useSelector((s) => s.wishlist?.products || []);
  const { categoryOptionsMap, subCategoryOptionsMap, productBadges } = useSiteSettings();
  const { openLoginModal } = useLoginModal();

  // Local product state — avoids Redux productDetails being reset by modal
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [qty, setQty] = useState(1);
  const isWishlisted = wishlistProducts.includes(id);

  const loadProduct = useCallback(async (pid) => {
    setProduct(null);
    setLoadError(false);
    setActiveMediaIndex(0);
    try {
      const res = await axiosInstance.get(`/api/shop/products/get/${pid}`);
      if (res.data?.success) {
        setProduct(res.data.data);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    }
  }, []);

  const mediaList = useMemo(() => {
    if (!product) return [];
    const imgs = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [FALLBACK];

    const list = imgs.map((url) => ({ type: "image", url: resolveProductImage(url) }));
    if (product.video) {
      list.push({ type: "video", url: product.video });
    }
    return list;
  }, [product]);

  const activeMedia = mediaList[activeMediaIndex] || mediaList[0] || { type: "image", url: FALLBACK };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadProduct(id);
  }, [id, loadProduct]);

  useEffect(() => {
    if (product?._id) dispatch(getReviews(product._id));
  }, [product?._id, dispatch]);

  // Load related products (same category)
  useEffect(() => {
    if (!productList?.length) {
      dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
    }
  }, []);

  const p = product;
  const price = p?.salePrice > 0 ? p.salePrice : p?.price;
  const discount = getDiscountPercent(p);
  const savings = p?.salePrice > 0 ? (p.price - p.salePrice) : 0;
  const flashActive = isFlashSaleActive(p);
  const timeLeft = flashActive && p?.flashSaleEndsAt ? getTimeLeft(p.flashSaleEndsAt) : null;
  const categoryName = categoryOptionsMap[p?.category] || p?.category?.replace(/-/g, " ") || "Wellness";

  const averageReview = reviews?.length
    ? reviews.reduce((s, r) => s + r.reviewValue, 0) / reviews.length
    : p?.averageReview || 0;

  const related = (productList || [])
    .filter((x) => x._id !== id && x.category === p?.category)
    .slice(0, 4);

  function handleAddToCart(productId, totalStock, quantity = qty) {
    if (!user?.id) { openLoginModal(); return; }
    const existing = (cartItems.items || []).find((i) => i.productId === productId);
    if (existing && existing.quantity + quantity > totalStock) {
      toast({ title: `Only ${totalStock} units available`, variant: "destructive" });
      return;
    }
    dispatch(addToCart({ userId: user.id, productId, quantity })).then((d) => {
      if (d?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        toast({ title: "Added to cart ✓" });
      }
    });
  }

  function handleBuyNow() {
    handleAddToCart(p._id, p.totalStock);
    setTimeout(() => navigate("/shop/checkout"), 400);
  }

  function handleWishlist() {
    if (!user?.id) { openLoginModal(); return; }
    dispatch(toggleWishlistItem({ userId: user.id, productId: id }));
  }

  function handleAddReview() {
    if (!rating || !reviewMsg.trim()) return;
    dispatch(addReview({
      productId: p._id,
      userId: user?.id,
      userName: user?.userName,
      reviewMessage: reviewMsg,
      reviewValue: rating,
    })).then((d) => {
      if (d.payload.success) {
        setRating(0); setReviewMsg("");
        dispatch(getReviews(p._id));
        toast({ title: "Review submitted!" });
      }
    });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: p?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!" });
    }
  }

  if (!p) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading product…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      {/* ── Breadcrumb ── */}
      <div className="bg-leaf/40 border-b border-forest/10 py-2.5 px-3 sm:px-4 w-full overflow-hidden">
        <div className="container mx-auto flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide whitespace-nowrap">
          <Link to="/shop/home" className="hover:text-forest transition shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-forest/30" />
          <Link to="/shop/listing" className="hover:text-forest transition shrink-0">Products</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-forest/30" />
          <Link to={`/shop/listing?category=${p.category}`} className="hover:text-forest transition capitalize shrink-0">
            {categoryName}
          </Link>
          {p.subCategory && subCategoryOptionsMap[p.subCategory] && (
            <>
              <ChevronRight className="w-3 h-3 shrink-0 text-forest/30" />
              <Link
                to={`/shop/listing?category=${p.category}&subCategory=${p.subCategory}`}
                className="hover:text-forest transition font-medium shrink-0"
              >
                {subCategoryOptionsMap[p.subCategory]}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 shrink-0 text-forest/30" />
          <span className="text-forest font-medium truncate max-w-[140px] sm:max-w-[240px] shrink-0">{p.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 lg:pb-8 w-full max-w-full overflow-hidden">
        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-forest mb-3 sm:mb-6 transition group"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* ══ Main Product Section ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-14 w-full max-w-full">

          {/* LEFT — Media Gallery */}
          <div className="space-y-3 sm:space-y-4 w-full min-w-0 max-w-full">
            <div className="relative w-full max-w-full bg-[#f8faf8] border border-forest/10 rounded-2xl sm:rounded-3xl overflow-hidden aspect-square flex items-center justify-center shadow-sm group">
              {/* Wishlist button - top left */}
              <button
                onClick={handleWishlist}
                className={`absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all border ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 border-red-200"
                    : "bg-white text-forest/40 border-forest/10 hover:text-red-400 hover:bg-red-50"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>

              {/* Offer badge (20% OFF, 30% OFF, Flash Sale) - top right */}
              <ProductOfferBadges product={p} className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 max-w-[70%]" />

              {activeMedia.type === "video" ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={p.title}
                  onError={(e) => { e.target.src = FALLBACK; }}
                  className="w-full h-full object-contain p-2 sm:p-6 transition-transform duration-500 group-hover:scale-105 select-none"
                />
              )}

              {/* Navigation Arrows */}
              {mediaList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1))}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md text-forest hover:bg-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md text-forest hover:bg-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                    aria-label="Next media"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                    {activeMediaIndex + 1} / {mediaList.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaList.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 px-0.5 scrollbar-hide w-full max-w-full">
                {mediaList.map((item, idx) => (
                  <button
                    key={`${item.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-14 sm:w-20 h-14 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 bg-white shrink-0 transition-all ${
                      activeMediaIndex === idx
                        ? "border-forest ring-2 ring-forest/20 scale-105 shadow-md"
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-forest/10 flex flex-col items-center justify-center text-forest">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-forest" />
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase mt-0.5">Video</span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = FALLBACK; }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full max-w-full">
              {[
                { icon: <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: "100% Ayurvedic" },
                { icon: <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: "Express Delivery" },
                { icon: <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: "Secure Packaging" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1 bg-leaf/40 rounded-xl sm:rounded-2xl py-2 sm:py-3 px-1 sm:px-2 text-center">
                  <span className="text-forest">{b.icon}</span>
                  <span className="text-[9px] sm:text-[11px] font-semibold text-forest leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="space-y-4 sm:space-y-5 w-full min-w-0 max-w-full">
            {/* Category + Share */}
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/shop/listing?category=${p.category}`}
                className="text-gold text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:underline truncate"
              >
                {categoryName}
              </Link>
              <button onClick={handleShare} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-forest transition shrink-0">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Title */}
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-forest leading-snug break-words">
              {p.title}
            </h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <StarRatingComponent rating={averageReview} />
                <span className="text-xs sm:text-sm font-semibold text-forest">{averageReview.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({reviews?.length || 0} reviews)</span>
              </div>
              {p.totalStock > 0
                ? <span className="text-[11px] sm:text-xs bg-forest-50 text-forest-700 font-semibold px-2.5 py-0.5 sm:py-1 rounded-full border border-forest-200">✓ In Stock ({p.totalStock})</span>
                : <span className="text-[11px] sm:text-xs bg-red-50 text-red-600 font-semibold px-2.5 py-0.5 sm:py-1 rounded-full border border-red-200">Out of Stock</span>
              }
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest">₹{price}</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                (Incl. of all taxes / {p?.gstRate ?? 5}% GST)
              </span>
              {p.salePrice > 0 && (
                <>
                  <span className="text-base sm:text-xl line-through text-muted-foreground">₹{p.price}</span>
                  {discount > 0 && (
                    <span className="text-xs sm:text-sm font-bold text-red-600 bg-red-50 px-2.5 py-0.5 sm:py-1 rounded-xl border border-red-100">
                      {discount}% OFF — Save ₹{savings}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Dynamic GST Breakdown Pill */}
            {(() => {
              const tb = calculateTaxBreakdown(price, p?.gstRate ?? 5);
              return (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mt-1 flex-wrap">
                  <Receipt className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Base Price: <strong>₹{tb.taxableAmount}</strong></span>
                  <span className="text-emerald-300">•</span>
                  <span>GST ({tb.gstRate}%): <strong>₹{tb.gstAmount}</strong> (CGST ₹{tb.cgstAmount} + SGST ₹{tb.sgstAmount})</span>
                  <span className="text-emerald-300">•</span>
                  <span className="text-emerald-700 font-medium">Delivery extra</span>
                </div>
              );
            })()}

            {flashActive && timeLeft && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs sm:text-sm">
                <span className="text-red-500 font-bold animate-pulse">⏱</span>
                <span className="font-semibold text-red-700">Flash Sale ends in <span className="font-mono font-bold">{timeLeft}</span></span>
              </div>
            )}

            {/* Short description */}
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{p.description}</p>

            {/* Product badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {productBadges.map((badge) => (
                <span key={badge.label} className="flex items-center gap-1 bg-leaf px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-forest border border-forest/10">
                  <Truck className="w-3 h-3" /> {badge.label}
                </span>
              ))}
            </div>

            {/* Product Measurables: Type, Size, Weight */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-leaf/30 border border-forest/15">
              {p.productType && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-white text-forest px-3 py-1.5 rounded-xl border border-forest/15 font-semibold shadow-xs">
                  <span>💊 Form:</span>
                  <strong>{p.productType}</strong>
                </span>
              )}
              {p.sizeValue && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-white text-forest px-3 py-1.5 rounded-xl border border-forest/15 font-semibold shadow-xs">
                  <span>📦 Pack Size:</span>
                  <strong>{p.sizeValue} {p.sizeUnit || ""}</strong>
                </span>
              )}
              {(p.grossWeightInGrams || p.netWeight) && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-white text-forest px-3 py-1.5 rounded-xl border border-forest/15 font-semibold shadow-xs">
                  <span>⚖️ Net/Pkg Wt:</span>
                  <strong>
                    {p.grossWeightInGrams
                      ? (p.grossWeightInGrams >= 1000
                          ? `${(p.grossWeightInGrams / 1000).toFixed(2)} kg`
                          : `${p.grossWeightInGrams} g`)
                      : `${p.netWeight} ${p.weightUnit || "gm"}`}
                  </strong>
                </span>
              )}
            </div>

            {/* Qty + CTA */}
            {p.totalStock > 0 ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-forest/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-forest hover:bg-leaf transition text-base font-bold"
                    >−</button>
                    <span className="w-9 text-center font-bold text-forest text-sm">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(p.totalStock, q + 1))}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-forest hover:bg-leaf transition text-base font-bold"
                    >+</button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <Button
                    onClick={() => handleAddToCart(p._id, p.totalStock, qty)}
                    variant="outline"
                    className="w-full sm:flex-1 h-11 sm:h-13 rounded-2xl font-bold text-xs sm:text-sm py-3 sm:py-4 btn-dynamic-secondary"
                  >
                    <ShoppingBag className="w-4 h-4 mr-1.5 shrink-0" />
                    <span className="truncate">Add to Cart — ₹{price * qty}</span>
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="buynow"
                    className="w-full sm:flex-1 h-11 sm:h-13 rounded-2xl font-bold text-xs sm:text-sm py-3 sm:py-4 shadow-lg btn-dynamic-buynow"
                  >
                    <Zap className="w-4 h-4 mr-1.5 shrink-0" />
                    Buy Now
                  </Button>
                </div>
              </div>
            ) : (
              <Button disabled className="w-full h-11 sm:h-12 rounded-2xl opacity-60">Out of Stock</Button>
            )}

            {/* Dosage callout */}
            {p.dosage && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start">
                <span className="text-lg sm:text-xl">💊</span>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">Recommended Dosage</p>
                  <p className="text-xs sm:text-sm text-amber-700">{p.dosage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ Tabs: Benefits, Ingredients, How to Use, Reviews ══ */}
        <div className="mt-10 sm:mt-14 w-full min-w-0 max-w-full">
          <Tabs defaultValue="benefits" className="w-full min-w-0 max-w-full">
            <div className="w-full overflow-x-auto scrollbar-hide pb-2">
              <TabsList className="inline-flex h-auto gap-1 bg-leaf/40 p-1 rounded-2xl">
                {[
                  { value: "benefits", label: "Benefits" },
                  { value: "ingredients", label: "Ingredients" },
                  { value: "usage", label: "How to Use" },
                  { value: "compliance", label: "Manufactured & Sold By" },
                  { value: "reviews", label: `Reviews (${reviews?.length || 0})` },
                ].map((t) => (
                  <TabsTrigger key={t.value} value={t.value}
                    className="shrink-0 rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-sm px-3 sm:px-4 py-2">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="benefits">
              <div className="bg-leaf/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-forest/10 w-full min-w-0">
                <h3 className="font-display font-bold text-forest text-base sm:text-lg mb-3 sm:mb-4">Key Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {(p.benefits || "Natural Ayurvedic wellness support for daily health.").split(/[,\n]/).filter(Boolean).map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white rounded-xl p-3 shadow-sm border border-forest/5">
                      <span className="text-forest mt-0.5 text-xs">✓</span>
                      <span className="text-xs sm:text-sm text-forest/90 leading-relaxed">{b.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients">
              <div className="bg-leaf/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-forest/10 w-full min-w-0">
                <h3 className="font-display font-bold text-forest text-base sm:text-lg mb-3 sm:mb-4">Active Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {(p.ingredients || "100% natural Ayurvedic herbs").split(/[,\n]/).filter(Boolean).map((ing, i) => (
                    <span key={i} className="bg-white border border-forest/15 text-forest text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
                      🌿 {ing.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage">
              <div className="bg-leaf/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-forest/10 space-y-3.5 sm:space-y-5 w-full min-w-0">
                <h3 className="font-display font-bold text-forest text-base sm:text-lg">How to Use</h3>
                {[
                  { icon: "📋", title: "Instructions", text: p.howToUse || "Take with warm water twice daily." },
                  { icon: "💊", title: "Dosage",       text: p.dosage || "As directed by your Ayurvedic physician." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm border border-forest/5">
                    <span className="text-xl sm:text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-forest text-xs sm:text-sm mb-0.5 sm:mb-1">{item.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="bg-leaf/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-forest/10 space-y-4 w-full min-w-0">
                <h3 className="font-display font-bold text-forest text-base sm:text-lg">
                  Manufacturing &amp; Seller Compliance
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Manufactured By */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-forest/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-forest font-bold text-sm">
                      <span className="text-xl">🏭</span>
                      <span>Manufactured By</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {p.manufacturingDetails?.manufacturedBy || siteSettingsData?.defaultManufacturingDetails?.manufacturedBy || "Sanjeevani Ayurvedic Formulations Pvt. Ltd."}
                    </p>
                    {(p.manufacturingDetails?.manufacturerAddress || siteSettingsData?.defaultManufacturingDetails?.manufacturerAddress) && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {p.manufacturingDetails?.manufacturerAddress || siteSettingsData?.defaultManufacturingDetails?.manufacturerAddress}
                      </p>
                    )}
                    {(p.manufacturingDetails?.mfgLicenseNumber || siteSettingsData?.defaultManufacturingDetails?.mfgLicenseNumber) && (
                      <p className="text-xs text-forest font-bold pt-1">
                        Ayush / Mfg Lic: {p.manufacturingDetails?.mfgLicenseNumber || siteSettingsData?.defaultManufacturingDetails?.mfgLicenseNumber}
                      </p>
                    )}
                  </div>

                  {/* Marketed & Sold By */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-forest/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-forest font-bold text-sm">
                      <span className="text-xl">🏷️</span>
                      <span>Marketed &amp; Sold By</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {p.manufacturingDetails?.soldBy || siteSettingsData?.defaultManufacturingDetails?.soldBy || "Wellmaats Healthcare / Mother Tatwa"}
                    </p>
                    {(p.manufacturingDetails?.sellerAddress || siteSettingsData?.defaultManufacturingDetails?.sellerAddress) && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {p.manufacturingDetails?.sellerAddress || siteSettingsData?.defaultManufacturingDetails?.sellerAddress}
                      </p>
                    )}
                  </div>

                  {/* Country & Customer Care */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-forest/10 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-forest uppercase tracking-wide">Country of Origin</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {p.manufacturingDetails?.countryOfOrigin || "India (Bharath)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-forest uppercase tracking-wide">Customer Care Support</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {p.manufacturingDetails?.customerCareContact || siteSettingsData?.defaultManufacturingDetails?.customerCareContact || siteSettingsData?.contact?.email || "care@wellmaats.in"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="bg-leaf/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-forest/10 space-y-4 sm:space-y-6 w-full min-w-0">
                {/* Rating summary */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-forest/5">
                  <div className="text-center shrink-0">
                    <p className="text-3xl sm:text-5xl font-bold text-forest">{averageReview.toFixed(1)}</p>
                    <StarRatingComponent rating={averageReview} />
                    <p className="text-xs text-muted-foreground mt-1">{reviews?.length || 0} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {[5,4,3,2,1].map((star) => {
                      const count = reviews?.filter((r) => Math.round(r.reviewValue) === star).length || 0;
                      const pct = reviews?.length ? Math.round((count / reviews.length) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-right text-muted-foreground">{star}</span>
                          <Star className="w-3 h-3 fill-gold text-gold" />
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gold h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-3 sm:space-y-4 max-h-72 overflow-y-auto pr-1">
                  {reviews?.length > 0 ? reviews.map((r) => (
                    <div key={r._id} className="flex gap-2.5 sm:gap-3 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm border border-forest/5">
                      <Avatar className="w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                        <AvatarFallback className="bg-forest text-white text-xs sm:text-sm font-bold">
                          {r.userName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-forest text-xs sm:text-sm truncate">{r.userName}</p>
                          <BadgeCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                          <StarRatingComponent rating={r.reviewValue} />
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{r.reviewMessage}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground text-xs sm:text-sm py-4">No reviews yet. Be the first!</p>
                  )}
                </div>

                {/* Write review */}
                {user?.id && (
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-forest/10 space-y-3">
                    <p className="font-bold text-forest text-sm">Write a Review</p>
                    <StarRatingComponent rating={rating} handleRatingChange={setRating} />
                    <Input
                      value={reviewMsg}
                      onChange={(e) => setReviewMsg(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="text-xs sm:text-sm"
                    />
                    <Button
                      onClick={handleAddReview}
                      disabled={!reviewMsg.trim() || !rating}
                      className="w-full bg-forest hover:bg-forest/90 h-10 text-xs sm:text-sm"
                    >
                      Submit Review
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ══ Related Products ══ */}
        {related.length > 0 && (
          <div className="mt-10 sm:mt-14 w-full min-w-0 max-w-full">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-display text-lg sm:text-xl font-bold text-forest">More from {categoryName}</h2>
              <Link to={`/shop/listing?category=${p.category}`} className="text-xs sm:text-sm text-gold font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-full">
              {related.map((rel) => (
                <ShoppingProductTile
                  key={rel._id}
                  product={rel}
                  handleGetProductDetails={(rid) => navigate(`/shop/product/${rid}`)}
                  handleAddtoCart={(pid, stock) => handleAddToCart(pid, stock, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      {p && p.totalStock > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-forest/15 px-3.5 py-2.5 shadow-2xl flex items-center justify-between gap-2 safe-area-bottom w-full">
          <div className="flex flex-col min-w-0 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold text-forest">₹{price}</span>
              {p.salePrice > 0 && (
                <span className="text-xs line-through text-muted-foreground">₹{p.price}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-1 max-w-[240px] justify-end">
            <Button
              onClick={() => handleAddToCart(p._id, p.totalStock, 1)}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs h-9 px-2.5 sm:px-3 border-forest/25 text-forest btn-dynamic-secondary"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1 shrink-0" />
              Add
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="buynow"
              size="sm"
              className="rounded-xl font-bold text-xs h-9 px-3 sm:px-3.5 flex-1 shadow-md btn-dynamic-buynow"
            >
              <Zap className="w-3.5 h-3.5 mr-1 shrink-0" />
              Buy Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
