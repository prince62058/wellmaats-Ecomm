import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import axiosInstance from "@/lib/axiosInstance";

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
  const wishlistProducts = useSelector((s) => s.wishlist?.products || []);
  const { categoryOptionsMap, productBadges } = useSiteSettings();

  // Local product state — avoids Redux productDetails being reset by modal
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [imgSrc, setImgSrc] = useState(FALLBACK);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [qty, setQty] = useState(1);
  const isWishlisted = wishlistProducts.includes(id);

  const loadProduct = useCallback(async (pid) => {
    setProduct(null);
    setLoadError(false);
    try {
      const res = await axiosInstance.get(`/api/shop/products/get/${pid}`);
      if (res.data?.success) {
        setProduct(res.data.data);
        setImgSrc(resolveProductImage(res.data.data?.image));
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    }
  }, []);

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
    if (!user?.id) { navigate("/auth/login"); return; }
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
    if (!user?.id) { navigate("/auth/login"); return; }
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
    <div className="min-h-screen bg-white">
      {/* ── Breadcrumb ── */}
      <div className="bg-leaf/40 border-b border-forest/10 py-3 px-4">
        <div className="container mx-auto flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link to="/shop/home" className="hover:text-forest transition">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop/listing" className="hover:text-forest transition">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/shop/listing?category=${p.category}`} className="hover:text-forest transition capitalize">
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-forest font-medium truncate max-w-[200px]">{p.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-forest mb-6 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* ══ Main Product Section ══ */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* LEFT — Image */}
          <div className="space-y-4">
            <div className="relative bg-leaf/30 rounded-3xl overflow-hidden aspect-square flex items-center justify-center">
              <ProductOfferBadges product={p} className="absolute top-4 left-4 z-10" />
              <button
                onClick={handleWishlist}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 border-red-200"
                    : "bg-white text-forest/40 border-forest/10 hover:text-red-400 hover:bg-red-50"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
              <img
                src={imgSrc}
                alt={p.title}
                onError={() => setImgSrc(FALLBACK)}
                className="w-full h-full object-contain p-6"
              />
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Shield className="w-4 h-4" />, label: "100% Ayurvedic" },
                { icon: <Truck className="w-4 h-4" />, label: "Express Delivery" },
                { icon: <Package className="w-4 h-4" />, label: "Secure Packaging" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 bg-leaf/40 rounded-2xl py-3 px-2 text-center">
                  <span className="text-forest">{b.icon}</span>
                  <span className="text-[11px] font-semibold text-forest">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="space-y-5">
            {/* Category + Share */}
            <div className="flex items-center justify-between">
              <Link
                to={`/shop/listing?category=${p.category}`}
                className="text-gold text-xs font-bold uppercase tracking-widest hover:underline"
              >
                {categoryName}
              </Link>
              <button onClick={handleShare} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-forest transition">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-forest leading-tight">
              {p.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              <StarRatingComponent rating={averageReview} />
              <span className="text-sm font-semibold text-forest">{averageReview.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({reviews?.length || 0} reviews)</span>
              {p.totalStock > 0
                ? <span className="ml-auto text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">✓ In Stock ({p.totalStock} left)</span>
                : <span className="ml-auto text-xs bg-red-50 text-red-600 font-semibold px-2.5 py-1 rounded-full border border-red-200">Out of Stock</span>
              }
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-forest">₹{price}</span>
              {p.salePrice > 0 && (
                <>
                  <span className="text-xl line-through text-muted-foreground">₹{p.price}</span>
                  {discount > 0 && (
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-100">
                      {discount}% OFF — Save ₹{savings}
                    </span>
                  )}
                </>
              )}
            </div>

            {flashActive && timeLeft && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <span className="text-red-500 text-sm font-bold animate-pulse">⏱</span>
                <span className="text-sm font-semibold text-red-700">Flash Sale ends in <span className="font-mono">{timeLeft}</span></span>
              </div>
            )}

            {/* Short description */}
            <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>

            {/* Product badges */}
            <div className="flex flex-wrap gap-2">
              {productBadges.map((badge) => (
                <span key={badge.label} className="flex items-center gap-1.5 bg-leaf px-3 py-1.5 rounded-full text-xs font-semibold text-forest border border-forest/10">
                  <Truck className="w-3.5 h-3.5" /> {badge.label}
                </span>
              ))}
            </div>

            {/* Qty + CTA */}
            {p.totalStock > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-forest/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-forest hover:bg-leaf transition text-lg font-bold"
                    >−</button>
                    <span className="w-10 text-center font-bold text-forest">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(p.totalStock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-forest hover:bg-leaf transition text-lg font-bold"
                    >+</button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAddToCart(p._id, p.totalStock, qty)}
                    variant="outline"
                    className="flex-1 h-13 rounded-2xl border-2 border-forest text-forest hover:bg-leaf font-bold text-sm py-4"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart — ₹{price * qty}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    className="flex-1 h-13 rounded-2xl bg-forest hover:bg-forest/90 font-bold text-sm py-4 shadow-lg"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            ) : (
              <Button disabled className="w-full h-12 rounded-2xl opacity-60">Out of Stock</Button>
            )}

            {/* Dosage callout */}
            {p.dosage && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3 items-start">
                <span className="text-xl">💊</span>
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">Recommended Dosage</p>
                  <p className="text-sm text-amber-700">{p.dosage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ Tabs: Benefits, Ingredients, How to Use, Reviews ══ */}
        <div className="mt-12">
          <Tabs defaultValue="benefits">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-leaf/40 p-1 rounded-2xl mb-6">
              {[
                { value: "benefits", label: "Benefits" },
                { value: "ingredients", label: "Ingredients" },
                { value: "usage", label: "How to Use" },
                { value: "reviews", label: `Reviews (${reviews?.length || 0})` },
              ].map((t) => (
                <TabsTrigger key={t.value} value={t.value}
                  className="flex-1 min-w-[100px] rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-sm">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="benefits">
              <div className="bg-leaf/20 rounded-3xl p-6 border border-forest/10">
                <h3 className="font-display font-bold text-forest text-lg mb-4">Key Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(p.benefits || "Natural Ayurvedic wellness support for daily health.").split(/[,\n]/).filter(Boolean).map((b, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-forest/5">
                      <span className="text-forest mt-0.5">✓</span>
                      <span className="text-sm text-forest/90">{b.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients">
              <div className="bg-leaf/20 rounded-3xl p-6 border border-forest/10">
                <h3 className="font-display font-bold text-forest text-lg mb-4">Active Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {(p.ingredients || "100% natural Ayurvedic herbs").split(/[,\n]/).filter(Boolean).map((ing, i) => (
                    <span key={i} className="bg-white border border-forest/15 text-forest text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                      🌿 {ing.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage">
              <div className="bg-leaf/20 rounded-3xl p-6 border border-forest/10 space-y-5">
                <h3 className="font-display font-bold text-forest text-lg">How to Use</h3>
                {[
                  { icon: "📋", title: "Instructions", text: p.howToUse || "Take with warm water twice daily." },
                  { icon: "💊", title: "Dosage",       text: p.dosage || "As directed by your Ayurvedic physician." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm border border-forest/5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-forest text-sm mb-1">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="bg-leaf/20 rounded-3xl p-6 border border-forest/10 space-y-6">
                {/* Rating summary */}
                <div className="flex items-center gap-6 bg-white rounded-2xl p-5 shadow-sm border border-forest/5">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-forest">{averageReview.toFixed(1)}</p>
                    <StarRatingComponent rating={averageReview} />
                    <p className="text-xs text-muted-foreground mt-1">{reviews?.length || 0} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
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
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {reviews?.length > 0 ? reviews.map((r) => (
                    <div key={r._id} className="flex gap-3 bg-white rounded-2xl p-4 shadow-sm border border-forest/5">
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarFallback className="bg-forest text-white text-sm font-bold">
                          {r.userName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-forest text-sm">{r.userName}</p>
                          <BadgeCheck className="w-3.5 h-3.5 text-forest" />
                          <StarRatingComponent rating={r.reviewValue} />
                        </div>
                        <p className="text-sm text-muted-foreground">{r.reviewMessage}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground text-sm py-4">No reviews yet. Be the first!</p>
                  )}
                </div>

                {/* Write review */}
                {user?.id && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/10 space-y-3">
                    <p className="font-bold text-forest text-sm">Write a Review</p>
                    <StarRatingComponent rating={rating} handleRatingChange={setRating} />
                    <Input
                      value={reviewMsg}
                      onChange={(e) => setReviewMsg(e.target.value)}
                      placeholder="Share your experience with this product..."
                    />
                    <Button
                      onClick={handleAddReview}
                      disabled={!reviewMsg.trim() || !rating}
                      className="w-full bg-forest hover:bg-forest/90"
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
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-forest">More from {categoryName}</h2>
              <Link to={`/shop/listing?category=${p.category}`} className="text-sm text-gold font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
