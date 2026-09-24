import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import CouponSection from "./coupon-section";
import { ShoppingBag, Leaf, Truck, Sparkles, Tag } from "lucide-react";
import { calculateDeliveryCharge } from "@/lib/shipping-calculator";
import { calculateCartTaxBreakdown } from "@/lib/tax-calculator";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const siteSettingsData = useSelector((state) => state.siteSettings?.data);
  const appliedCoupon = useSelector((state) => state.shopCoupons?.appliedCoupon);

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const itemCount = cartItems?.reduce((n, i) => n + i.quantity, 0) || 0;

  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discountValueCalculated || 0) : 0;
  const discountedSubtotal = Math.max(0, totalCartAmount - couponDiscount);

  const shippingInfo = calculateDeliveryCharge(
    cartItems,
    discountedSubtotal,
    siteSettingsData?.shippingSettings
  );

  const taxInfo = calculateCartTaxBreakdown(
    cartItems,
    siteSettingsData?.taxSettings?.defaultGstRate || 5
  );

  const finalPayable = discountedSubtotal + (shippingInfo.deliveryCharge || 0);

  return (
    <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
      <div className="bg-forest text-white px-6 py-5">
        <SheetHeader>
          <SheetTitle className="text-white font-display text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            Your Cart
            {itemCount > 0 && (
              <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full font-bold ml-1">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
      </div>

      {/* Free Delivery Progress Nudge */}
      {cartItems && cartItems.length > 0 && (
        <div className="bg-leaf/40 px-6 py-3 border-b border-forest/10 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-forest">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-forest" />
              {shippingInfo.isFree ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold" /> FREE Delivery Unlocked!
                </span>
              ) : (
                <span>Add <strong>₹{shippingInfo.amountNeededForFree}</strong> more for <strong>FREE Delivery</strong></span>
              )}
            </span>
            <span className="text-[11px] text-forest/70 font-bold">{shippingInfo.freeDeliveryProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-forest/15 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                shippingInfo.isFree ? "bg-emerald-600" : "bg-forest"
              }`}
              style={{ width: `${shippingInfo.freeDeliveryProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item.productId} cartItem={item} />
          ))
        ) : (
          <div className="text-center py-16">
            <Leaf className="w-12 h-12 text-forest/15 mx-auto mb-4" />
            <p className="font-display text-lg font-bold text-forest mb-1">Cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some wellness drops</p>
          </div>
        )}
      </div>

      {cartItems && cartItems.length > 0 && (
        <div className="border-t border-forest/10 px-6 py-5 bg-leaf/30 space-y-3">
          {/* Dynamic Coupon Component */}
          <CouponSection cartSubtotal={totalCartAmount} />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <div>
                <span>Items Subtotal</span>
                <span className="block text-[10px] text-gray-400">
                  (Incl. ₹{taxInfo.gstAmount} GST)
                </span>
              </div>
              <span className="font-semibold text-gray-800">₹{totalCartAmount}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-700">
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Tag className="w-3.5 h-3.5" /> Coupon Discount ({appliedCoupon?.code})
                </span>
                <span className="font-bold text-sm">-₹{couponDiscount}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1">
                <span>Delivery Charges</span>
                {shippingInfo.totalWeightGrams > 0 && (
                  <span className="text-[11px] text-gray-400">({shippingInfo.weightFormatted})</span>
                )}
              </span>
              <span className={`font-semibold ${shippingInfo.isFree ? "text-emerald-700" : "text-gray-800"}`}>
                {shippingInfo.isFree ? "FREE" : `+₹${shippingInfo.deliveryCharge}`}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-forest/10">
              <div>
                <span className="text-base font-bold text-forest block">Estimated Total</span>
                <span className="text-[10px] text-muted-foreground block">
                  Taxable: ₹{taxInfo.taxableAmount} + GST: ₹{taxInfo.gstAmount}
                </span>
              </div>
              <span className="text-2xl font-bold text-forest">₹{finalPayable}</span>
            </div>
          </div>

          <Button
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full rounded-full h-12 bg-forest hover:bg-forest/90 font-semibold text-base mt-2"
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;
