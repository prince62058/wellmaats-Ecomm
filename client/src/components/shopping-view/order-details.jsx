import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { FileText } from "lucide-react";
import { printInvoice } from "@/components/common/InvoiceTemplate";
import { useSiteSettings } from "@/hooks/use-site-settings";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);
  const { brandName } = useSiteSettings();

  return (
    <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
      <div className="grid gap-5">
        {/* Header row with Invoice button */}
        <div className="flex items-center justify-between mt-4">
          <p className="font-display font-bold text-forest text-lg">Order Details</p>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 border-forest/30 text-forest hover:bg-forest/5 text-xs"
            onClick={() => printInvoice(
              { ...orderDetails, customerInfo: { userName: user?.userName, email: user?.email } },
              brandName || "Wellmaats"
            )}
          >
            <FileText className="w-3.5 h-3.5" /> Download Invoice
          </Button>
        </div>

        {/* Visual Delivery Tracking Stepper */}
        {(() => {
          const status = orderDetails?.orderStatus || "pending";
          if (status === "rejected") {
            return (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <span className="text-base">❌</span>
                <span className="font-semibold">This order has been cancelled or rejected.</span>
              </div>
            );
          }

          const steps = [
            { key: "confirmed", label: "Confirmed" },
            { key: "inProcess", label: "Processing" },
            { key: "inShipping", label: "Shipped" },
            { key: "onTheWay", label: "On The Way" },
            { key: "delivered", label: "Delivered" },
          ];

          const statusIndexMap = {
            pending: 0,
            confirmed: 0,
            inProcess: 1,
            inShipping: 2,
            shipped: 2,
            onTheWay: 3,
            delivered: 4,
          };
          const currentStep = statusIndexMap[status] ?? 0;

          return (
            <div className="bg-[#f8faf8] border border-forest/15 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-forest">
                  Live Order Tracker
                </span>
                <Badge className={
                  status === "onTheWay"
                    ? "bg-cyan-600 text-white font-bold"
                    : status === "delivered"
                    ? "bg-forest text-white font-bold"
                    : "bg-forest-500 text-white"
                }>
                  {status === "onTheWay" ? "🚚 On The Way" : status}
                </Badge>
              </div>

              <div className="relative flex items-center justify-between pt-2">
                <div className="absolute left-2 right-2 top-4 h-1 bg-gray-200 -z-0">
                  <div
                    className="h-full bg-forest transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
                {steps.map((st, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={st.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shadow-xs ${
                          isCurrent
                            ? "bg-forest text-white ring-4 ring-forest/20 scale-110"
                            : isDone
                            ? "bg-forest text-white"
                            : "bg-white text-gray-400 border-2 border-gray-200"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                        isCurrent ? "text-forest font-bold" : isDone ? "text-gray-700" : "text-gray-400"
                      }`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="grid gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm text-forest">Order ID</p>
            <Label className="break-all font-mono text-xs sm:text-sm text-right text-muted-foreground">{orderDetails?._id}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Order Date</p>
            <Label className="text-muted-foreground">{orderDetails?.orderDate?.split("T")?.[0]}</Label>
          </div>
          {(() => {
            const sub = Number(orderDetails?.subTotal || orderDetails?.totalAmount || 0);
            const rate = orderDetails?.gstRate != null ? orderDetails.gstRate : 5;
            const taxable = orderDetails?.taxableAmount || Number((sub / (1 + rate / 100)).toFixed(2));
            const gst = orderDetails?.gstAmount || Number((sub - taxable).toFixed(2));

            return (
              <>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium text-forest">Items Subtotal</p>
                    <span className="text-[11px] text-muted-foreground block">
                      (Includes ₹{gst} GST @ {rate}%)
                    </span>
                  </div>
                  <Label className="font-semibold text-gray-700">₹{sub}</Label>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pl-2">
                  <span>Taxable Base Value</span>
                  <span>₹{taxable}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pl-2">
                  <span>Central GST ({(rate/2).toFixed(1)}%) + State GST ({(rate/2).toFixed(1)}%)</span>
                  <span>₹{(gst/2).toFixed(2)} + ₹{(gst - gst/2).toFixed(2)}</span>
                </div>
              </>
            );
          })()}
          <div className="flex items-center justify-between gap-2 text-sm">
            <div>
              <p className="font-medium text-forest">Delivery Charges</p>
              {orderDetails?.totalWeightGrams > 0 && (
                <span className="text-[11px] text-gray-400 block">
                  Package Wt: {orderDetails.totalWeightGrams >= 1000 ? `${(orderDetails.totalWeightGrams/1000).toFixed(2)} kg` : `${orderDetails.totalWeightGrams} g`}
                </span>
              )}
            </div>
            <Label className="font-semibold text-forest">
              {Number(orderDetails?.deliveryCharges) > 0 ? `₹${orderDetails.deliveryCharges}` : "FREE"}
            </Label>
          </div>
          {orderDetails?.walletCreditsUsed > 0 && (
            <div className="flex items-center justify-between gap-2 text-sm text-emerald-700">
              <p className="font-medium">Wallet Credits</p>
              <Label className="text-emerald-700 font-semibold">-₹{orderDetails.walletCreditsUsed}</Label>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 text-sm pt-1 border-t border-forest/10">
            <p className="font-bold text-forest text-base">Total Amount Paid</p>
            <Label className="font-bold text-forest text-lg">₹{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Payment Method</p>
            <Label className="text-muted-foreground capitalize">{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Payment Status</p>
            <Label className="text-muted-foreground capitalize">{orderDetails?.paymentStatus}</Label>
          </div>
        </div>

        <Separator className="border-forest/10" />

        <div className="grid gap-3">
          <div className="font-display font-bold text-forest text-base">Items Ordered</div>
          <ul className="grid gap-2.5">
            {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
              ? orderDetails?.cartItems.map((item, idx) => (
                  <li key={`${item.title}-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-leaf/20 border border-forest/10 text-xs sm:text-sm">
                    <span className="font-semibold text-forest line-clamp-2">{item.title}</span>
                    <div className="flex items-center justify-between sm:justify-end gap-3 text-muted-foreground shrink-0">
                      <span>Qty: <strong className="text-forest">{item.quantity}</strong></span>
                      <span className="font-bold text-forest">₹{item.price}</span>
                    </div>
                  </li>
                ))
              : null}
          </ul>
        </div>

        <Separator className="border-forest/10" />

        <div className="grid gap-3">
          <div className="font-display font-bold text-forest text-base">Shipping Info</div>
          <div className="p-3 rounded-xl bg-leaf/20 border border-forest/10 text-xs sm:text-sm text-forest/80 space-y-1">
            <p className="font-bold text-forest">{user?.userName}</p>
            <p>{orderDetails?.addressInfo?.address}</p>
            <p>{orderDetails?.addressInfo?.city} — {orderDetails?.addressInfo?.pincode}</p>
            <p>Phone: +91 {orderDetails?.addressInfo?.phone}</p>
            {orderDetails?.addressInfo?.notes && (
              <p className="italic text-muted-foreground">Note: {orderDetails?.addressInfo?.notes}</p>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
