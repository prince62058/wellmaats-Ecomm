import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState, useMemo } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useSiteSettings, resolveProductImage } from "@/hooks/use-site-settings";
import { getDiscountPercent, isFlashSaleActive, getTimeLeft } from "@/lib/product-offers";
import ProductOfferBadges from "./product-offer-badges";
import { BadgeCheck, Truck, Shield, ArrowUpRight, ChevronLeft, ChevronRight, Play, Film } from "lucide-react";
import { Link } from "react-router-dom";

const badgeIcons = { Truck, Shield };

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { toast } = useToast();
  const { categoryOptionsMap, productBadges } = useSiteSettings();

  // Combine images and video into a unified media list
  const mediaList = useMemo(() => {
    if (!productDetails) return [];
    const imgs = Array.isArray(productDetails.images) && productDetails.images.length > 0
      ? productDetails.images
      : productDetails.image
      ? [productDetails.image]
      : ["/products/signature.jpg"];

    const list = imgs.map((url) => ({ type: "image", url: resolveProductImage(url) }));
    if (productDetails.video) {
      list.push({ type: "video", url: productDetails.video });
    }
    return list;
  }, [productDetails]);

  const activeMedia = mediaList[activeMediaIndex] || mediaList[0] || { type: "image", url: "/products/signature.jpg" };

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [productDetails?._id]);

  const price = productDetails?.salePrice > 0 ? productDetails.salePrice : productDetails?.price;
  const discount = getDiscountPercent(productDetails);
  const flashActive = isFlashSaleActive(productDetails);
  const timeLeft = flashActive && productDetails?.flashSaleEndsAt
    ? getTimeLeft(productDetails.flashSaleEndsAt)
    : null;

  function handleAddToCart(productId, totalStock) {
    const items = cartItems.items || [];
    const existing = items.find((item) => item.productId === productId);
    if (existing && existing.quantity + 1 > totalStock) {
      toast({ title: `Only ${existing.quantity} can be added`, variant: "destructive" });
      return;
    }
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Added to cart" });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    dispatch(addReview({
      productId: productDetails?._id,
      userId: user?.id,
      userName: user?.userName,
      reviewMessage: reviewMsg,
      reviewValue: rating,
    })).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({ title: "Review added!" });
      }
    });
  }

  useEffect(() => {
    if (productDetails) dispatch(getReviews(productDetails._id));
  }, [productDetails, dispatch]);

  const averageReview = reviews?.length
    ? reviews.reduce((s, r) => s + r.reviewValue, 0) / reviews.length
    : productDetails?.averageReview || 0;

  function prevMedia(e) {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  }

  function nextMedia(e) {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] lg:max-w-[75vw] max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Media Gallery */}
          <div className="relative bg-[#f8faf8] p-4 sm:p-6 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-gray-100">
            <ProductOfferBadges product={productDetails} className="absolute top-4 left-4 z-10" />

            {/* Main Media Preview */}
            <div className="relative w-full aspect-square max-h-[380px] sm:max-h-[420px] flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-sm border border-forest/10 group">
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
                  alt={productDetails?.title}
                  className="w-full h-full object-contain p-4 transition-all duration-300 group-hover:scale-105"
                  onError={(e) => { e.target.src = "/products/signature.jpg"; }}
                />
              )}

              {/* Next/Prev Navigation Arrows */}
              {mediaList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevMedia}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md text-forest hover:bg-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMedia}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md text-forest hover:bg-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {activeMediaIndex + 1} / {mediaList.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaList.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1 px-1 scrollbar-none">
                {mediaList.map((item, idx) => (
                  <button
                    key={`${item.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                      activeMediaIndex === idx
                        ? "border-forest ring-2 ring-forest/20 scale-105"
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-forest/10 flex flex-col items-center justify-center text-forest">
                        <Play className="w-4 h-4 fill-forest" />
                        <span className="text-[8px] font-bold uppercase mt-0.5">Video</span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "/products/signature.jpg"; }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 sm:p-8">
            <div className="flex items-start justify-between gap-2">
              <p className="text-gold text-sm font-medium uppercase tracking-wide">
                {categoryOptionsMap[productDetails?.category]}
              </p>
              <Link
                to={`/shop/product/${productDetails?._id}`}
                onClick={handleDialogClose}
                className="flex items-center gap-1 text-xs font-semibold text-forest border border-forest/20 hover:bg-forest hover:text-white px-3 py-1.5 rounded-full transition-all shrink-0"
              >
                Full Page <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-forest mt-1">
              {productDetails?.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <StarRatingComponent rating={averageReview} />
              <span className="text-sm text-muted-foreground">({averageReview.toFixed(1)})</span>
            </div>
            <div className="flex items-baseline gap-3 mt-4 flex-wrap">
              <span className="text-3xl font-bold text-forest">₹{price}</span>
              {productDetails?.salePrice > 0 && (
                <>
                  <span className="text-lg line-through text-muted-foreground">₹{productDetails?.price}</span>
                  {discount > 0 && (
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                      {discount}% OFF — You save ₹{productDetails.price - productDetails.salePrice}
                    </span>
                  )}
                </>
              )}
            </div>
            {flashActive && timeLeft && (
              <p className="text-sm text-red-600 font-semibold mt-2">⏱ Flash sale ends in {timeLeft}</p>
            )}
            <p className="text-muted-foreground mt-3">{productDetails?.description}</p>

            <div className="flex flex-wrap gap-3 mt-4 text-xs">
              {productBadges.map((badge) => {
                const Icon = badgeIcons[badge.icon] || Truck;
                return (
                  <span key={badge.label} className="flex items-center gap-1 bg-leaf px-3 py-1 rounded-full text-forest">
                    <Icon className="w-3 h-3" /> {badge.label}
                  </span>
                );
              })}
            </div>

            {productDetails?.totalStock === 0 ? (
              <Button disabled className="w-full mt-6">Out of Stock</Button>
            ) : (
              <Button
                className="w-full mt-6 btn-dynamic-primary py-6 text-lg"
                onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
              >
                Add to Cart — ₹{price}
              </Button>
            )}

            <Tabs defaultValue="benefits" className="mt-8">
              <TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-1 h-auto p-1">
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="usage">How to Use</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="benefits" className="mt-4 text-sm text-muted-foreground">
                {productDetails?.benefits || "Natural Ayurvedic wellness support for daily health."}
              </TabsContent>
              <TabsContent value="ingredients" className="mt-4 text-sm text-muted-foreground">
                {productDetails?.ingredients || "100% natural Ayurvedic herbs."}
              </TabsContent>
              <TabsContent value="usage" className="mt-4 text-sm space-y-2">
                <p><strong>How to use:</strong> {productDetails?.howToUse || "Take with warm water."}</p>
                <p><strong>Dosage:</strong> {productDetails?.dosage || "As directed by physician."}</p>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4 max-h-48 overflow-auto">
                {reviews?.length > 0 ? reviews.map((r) => (
                  <div key={r._id} className="flex gap-3 mb-4">
                    <Avatar className="w-8 h-8"><AvatarFallback>{r.userName[0]}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-1">
                        {r.userName}
                        <BadgeCheck className="w-3 h-3 text-forest" />
                      </p>
                      <StarRatingComponent rating={r.reviewValue} />
                      <p className="text-sm text-muted-foreground">{r.reviewMessage}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                <Separator className="my-4" />
                <Label className="text-sm">Write a review</Label>
                <StarRatingComponent rating={rating} handleRatingChange={setRating} />
                <Input value={reviewMsg} onChange={(e) => setReviewMsg(e.target.value)} placeholder="Share your experience..." className="mt-2" />
                <Button onClick={handleAddReview} disabled={!reviewMsg.trim()} className="mt-2 w-full" size="sm">
                  Submit Review
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
