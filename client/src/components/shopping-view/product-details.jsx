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
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useSiteSettings, resolveProductImage } from "@/hooks/use-site-settings";
import { getDiscountPercent, isFlashSaleActive, getTimeLeft } from "@/lib/product-offers";
import ProductOfferBadges from "./product-offer-badges";
import { BadgeCheck, Truck, Shield } from "lucide-react";

const badgeIcons = { Truck, Shield };

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { toast } = useToast();
  const { categoryOptionsMap, productBadges } = useSiteSettings();
  const [imgSrc, setImgSrc] = useState("/products/signature.jpg");

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

  useEffect(() => {
    setImgSrc(resolveProductImage(productDetails?.image));
  }, [productDetails?.image]);

  const averageReview = reviews?.length
    ? reviews.reduce((s, r) => s + r.reviewValue, 0) / reviews.length
    : productDetails?.averageReview || 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] lg:max-w-[75vw] max-h-[90vh] overflow-y-auto p-0">
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="relative bg-leaf p-4 sm:p-8 flex items-center justify-center">
            <ProductOfferBadges product={productDetails} className="absolute top-4 left-4 z-10" />
            <img
              src={imgSrc}
              alt={productDetails?.title}
              className="max-h-[400px] w-full object-contain rounded-2xl shadow-xl"
              onError={() => setImgSrc("/products/signature.jpg")}
            />
          </div>
          <div className="p-4 sm:p-8">
            <p className="text-gold text-sm font-medium uppercase tracking-wide">
              {categoryOptionsMap[productDetails?.category]}
            </p>
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
                className="w-full mt-6 bg-forest hover:bg-forest/90 py-6 text-lg"
                onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
              >
                Add to Cart — ₹{price}
              </Button>
            )}

            <Tabs defaultValue="benefits" className="mt-8">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
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
