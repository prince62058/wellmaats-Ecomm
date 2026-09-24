import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableCoupons,
  applyCouponCode,
  clearAppliedCoupon,
} from "@/store/shop/coupon-slice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  TicketPercent,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  Loader2,
} from "lucide-react";

export default function CouponSection({ cartSubtotal, onCouponApplied, className = "" }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { availableCoupons, appliedCoupon, isLoading, error } = useSelector(
    (state) => state.shopCoupons
  );

  const [inputCode, setInputCode] = useState("");
  const [showAvailable, setShowAvailable] = useState(false);

  useEffect(() => {
    dispatch(fetchAvailableCoupons());
  }, [dispatch]);

  // When subtotal changes, if an applied coupon has a minOrderAmount requirement that is no longer met, handle it
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderAmount > 0 && cartSubtotal < appliedCoupon.minOrderAmount) {
      toast({
        title: `Coupon "${appliedCoupon.code}" removed because cart subtotal is now below ₹${appliedCoupon.minOrderAmount}`,
        variant: "destructive",
      });
      dispatch(clearAppliedCoupon());
    }
  }, [cartSubtotal, appliedCoupon, dispatch, toast]);

  const handleApply = async (codeToApply) => {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) {
      toast({ title: "Please enter a promo code", variant: "destructive" });
      return;
    }

    try {
      const result = await dispatch(
        applyCouponCode({
          code,
          cartSubtotal,
          userId: user?.id,
          userEmail: user?.email,
        })
      ).unwrap();

      toast({
        title: result?.message || `Coupon "${code}" applied!`,
      });
      setInputCode("");
      setShowAvailable(false);
      if (onCouponApplied) onCouponApplied(result?.data);
    } catch (err) {
      toast({
        title: err?.message || "Failed to apply coupon",
        variant: "destructive",
      });
    }
  };

  const handleRemove = () => {
    dispatch(clearAppliedCoupon());
    toast({ title: "Coupon removed" });
    if (onCouponApplied) onCouponApplied(null);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* If coupon is already applied */}
      {appliedCoupon ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                  {appliedCoupon.code}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  -₹{appliedCoupon.discountValueCalculated} OFF
                </span>
              </div>
              <p className="text-[10px] text-emerald-600 truncate mt-0.5">
                {appliedCoupon.title || "Promotional discount applied successfully"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors shrink-0"
            title="Remove coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Coupon Input Form */
        <div className="bg-white rounded-2xl border border-forest/15 p-3 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-forest">
            <span className="flex items-center gap-1.5">
              <TicketPercent className="w-3.5 h-3.5 text-gold" /> Have a Coupon / Promo Code?
            </span>
            {availableCoupons.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAvailable(!showAvailable)}
                className="text-[11px] text-forest/70 hover:text-forest flex items-center gap-0.5 font-medium underline"
              >
                <span>{availableCoupons.length} Available</span>
                {showAvailable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Enter coupon code..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="pl-8 uppercase font-mono text-xs font-semibold rounded-xl bg-gray-50/70 border-gray-200 h-9"
              />
            </div>
            <Button
              type="button"
              onClick={() => handleApply()}
              disabled={isLoading || !inputCode.trim()}
              className="bg-forest hover:bg-forest/90 text-white rounded-xl text-xs h-9 px-4 font-semibold shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
            </Button>
          </div>

          {/* Expandable list of available promo codes */}
          {showAvailable && availableCoupons.length > 0 && (
            <div className="pt-2 border-t border-forest/5 space-y-2 max-h-48 overflow-y-auto">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Available Offers
              </div>
              {availableCoupons.map((coupon) => {
                const isEligible =
                  coupon.minOrderAmount <= 0 || cartSubtotal >= coupon.minOrderAmount;

                return (
                  <div
                    key={coupon._id}
                    className={`rounded-xl p-2.5 border text-xs flex items-center justify-between gap-2 transition-all ${
                      isEligible
                        ? "bg-forest/5 border-forest/15 hover:border-forest/30"
                        : "bg-gray-50/70 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px] text-forest bg-white px-2 py-0.5 rounded-md border border-forest/10">
                          {coupon.code}
                        </span>
                        <span className="font-semibold text-emerald-700 text-[11px]">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountAmount}% OFF`
                            : `₹${coupon.discountAmount} FLAT`}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {coupon.title || coupon.description || (coupon.minOrderAmount > 0 ? `Min order ₹${coupon.minOrderAmount}` : "Valid on all orders")}
                      </p>
                      {!isEligible && (
                        <p className="text-[9px] text-amber-700 font-medium">
                          Add ₹{coupon.minOrderAmount - cartSubtotal} more to unlock
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      disabled={!isEligible || isLoading}
                      onClick={() => handleApply(coupon.code)}
                      className={`h-7 px-3 text-[10px] font-bold rounded-lg shrink-0 ${
                        isEligible
                          ? "bg-gold hover:bg-gold/90 text-forest"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      APPLY
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
