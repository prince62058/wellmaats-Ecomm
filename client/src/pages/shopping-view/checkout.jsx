import Address from "@/components/shopping-view/address";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { capturePayment, createNewOrder } from "@/store/shop/order-slice";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Lock, ShieldCheck, Truck, Leaf } from "lucide-react";

function ShoppingCheckout() {
  const { brand } = useSiteSettings();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const items = cartItems?.items || [];

  const totalCartAmount = items.length
    ? items.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price) *
            currentItem?.quantity,
        0
      )
    : 0;

  function openRazorpayCheckout(paymentData) {
    if (typeof window.Razorpay === "undefined") {
      toast({ title: "Payment SDK failed to load.", variant: "destructive" });
      setIsPaymemntStart(false);
      return;
    }

    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: brand.name,
      description: "Ayurvedic Wellness Order",
      order_id: paymentData.razorpayOrderId,
      prefill: { name: user?.userName, email: user?.email },
      theme: { color: "#1F6B4F" },
      handler: function (response) {
        dispatch(
          capturePayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: paymentData.orderId,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            sessionStorage.removeItem("currentOrderId");
            navigate("/shop/payment-success");
          } else {
            toast({ title: "Payment verification failed.", variant: "destructive" });
          }
        });
      },
      modal: { ondismiss: () => setIsPaymemntStart(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      setIsPaymemntStart(false);
      toast({ title: "Payment failed. Please try again.", variant: "destructive" });
    });
    rzp.open();
  }

  function handleInitiateRazorpayPayment() {
    if (!items.length) {
      toast({ title: "Your cart is empty.", variant: "destructive" });
      return;
    }
    if (!currentSelectedAddress) {
      toast({ title: "Please select a delivery address.", variant: "destructive" });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    setIsPaymemntStart(true);
    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        openRazorpayCheckout(data.payload);
      } else {
        setIsPaymemntStart(false);
        toast({
          title: data?.payload?.message || "Unable to start payment.",
          variant: "destructive",
        });
      }
    });
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <Leaf className="w-12 h-12 text-forest/40 mb-4" />
        <h2 className="font-display text-2xl font-bold text-forest mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some wellness drops to checkout</p>
        <Link to="/shop/listing">
          <Button className="btn-gold rounded-full px-8">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf via-white to-leaf/30">
      {/* Compact branded header — no random banner image */}
      <div className="bg-forest text-white">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <p className="text-gold/90 text-xs font-medium tracking-[0.3em] uppercase mb-2">
            Secure Checkout
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Complete Your Order</h1>
          <p className="text-white/70 text-sm mt-2">
            {items.length} item{items.length > 1 ? "s" : ""} · {brand.name} by {brand.company}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Order summary — first on mobile */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-forest/10 shadow-lg overflow-hidden">
              <div className="bg-forest/5 px-6 py-4 border-b border-forest/10">
                <h2 className="font-display text-xl font-bold text-forest">Order Summary</h2>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[340px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="pb-4 border-b border-forest/5 last:border-0 last:pb-0">
                    <UserCartItemsContent cartItem={item} />
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-leaf/40 border-t border-forest/10 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalCartAmount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-forest font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold text-forest pt-2 border-t border-forest/10">
                  <span>Total</span>
                  <span>₹{totalCartAmount}</span>
                </div>
              </div>

              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {[
                  { icon: ShieldCheck, label: "Secure Pay" },
                  { icon: Truck, label: "Fast Delivery" },
                  { icon: Lock, label: "COD Available" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 text-[11px] text-forest/70 bg-white border border-forest/10 rounded-full px-2.5 py-1"
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                ))}
              </div>

              <div className="px-6 pb-6">
                <Button
                  onClick={handleInitiateRazorpayPayment}
                  disabled={isPaymentStart}
                  className="w-full h-12 rounded-full bg-forest hover:bg-forest/90 text-base font-semibold shadow-md"
                >
                  {isPaymentStart ? "Opening Razorpay..." : `Pay ₹${totalCartAmount}`}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground mt-3">
                  UPI · Cards · Net Banking · Wallets · COD
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="lg:col-span-3 order-2 lg:order-1 min-w-0">
            <Address
              selectedId={currentSelectedAddress}
              setCurrentSelectedAddress={setCurrentSelectedAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
