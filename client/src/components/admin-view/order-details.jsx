import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import {
  getAllOrdersForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import { resolveProductImage } from "@/hooks/use-site-settings";
import {
  formatOrderDateTime,
  getPaymentStatusStyle,
  getStatusMeta,
  ORDER_STATUSES,
  shortOrderId,
} from "@/lib/order-utils";
import {
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  User,
  FileText,
} from "lucide-react";
import { printInvoice } from "@/components/common/InvoiceTemplate";
import { useSiteSettings } from "@/hooks/use-site-settings";

function AdminOrderDetailsView({ orderDetails, onUpdated }) {
  const [updating, setUpdating] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { brandName } = useSiteSettings();

  const statusMeta = getStatusMeta(orderDetails?.orderStatus);
  const itemCount = orderDetails?.cartItems?.reduce((n, i) => n + (i.quantity || 0), 0) || 0;

  async function handleQuickStatus(status) {
    if (!orderDetails?._id || orderDetails.orderStatus === status) return;
    setUpdating(true);
    const result = await dispatch(
      updateOrderStatus({ id: orderDetails._id, orderStatus: status })
    );
    setUpdating(false);
    if (result?.payload?.success) {
      dispatch(getAllOrdersForAdmin());
      onUpdated?.(result.payload.data);
      toast({ title: result.payload.message });
    } else {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }

  return (
    <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="font-display text-forest flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order {shortOrderId(orderDetails?._id)}
          <button
            type="button"
            onClick={() => printInvoice(orderDetails, brandName || "Wellmaats")}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold border border-forest/30 text-forest px-3 py-1.5 rounded-lg hover:bg-forest/5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Download Invoice
          </button>
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-5">
        {/* Status & meta */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${statusMeta.color} text-white border-0 px-3 py-1`}>
            {statusMeta.label}
          </Badge>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getPaymentStatusStyle(orderDetails?.paymentStatus)}`}
          >
            Payment: {orderDetails?.paymentStatus || "pending"}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatOrderDateTime(orderDetails?.orderDate)}
          </span>
        </div>

        {/* Quick status actions */}
        <div className="rounded-xl border border-forest/10 bg-leaf/30 p-4 space-y-3">
          <p className="text-sm font-semibold text-forest">Update Order Status</p>
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <Button
                key={s.id}
                type="button"
                size="sm"
                variant={orderDetails?.orderStatus === s.id ? "default" : "outline"}
                className={
                  orderDetails?.orderStatus === s.id
                    ? `${s.color} hover:opacity-90 text-white border-0`
                    : "border-forest/20"
                }
                disabled={updating}
                onClick={() => handleQuickStatus(s.id)}
              >
                {updating && orderDetails?.orderStatus !== s.id ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : null}
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Products with images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-forest">Items ({itemCount})</p>
            <p className="text-lg font-bold text-forest">₹{orderDetails?.totalAmount}</p>
          </div>
          <ul className="space-y-3">
            {orderDetails?.cartItems?.map((item, idx) => (
              <li
                key={`${item.productId}-${idx}`}
                className="flex gap-3 p-3 rounded-xl border border-forest/10 bg-white"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-leaf/40 shrink-0">
                  <img
                    src={resolveProductImage(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/products/signature.jpg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-forest line-clamp-2">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <p className="font-semibold text-forest shrink-0">
                  ₹{(Number(item.price) || 0) * (item.quantity || 1)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Financial & Delivery Breakdown */}
        <div className="rounded-xl border border-forest/10 bg-leaf/20 p-4 space-y-2 text-xs sm:text-sm">
          {(() => {
            const sub = Number(orderDetails?.subTotal || orderDetails?.totalAmount || 0);
            const rate = orderDetails?.gstRate != null ? orderDetails.gstRate : 5;
            const taxable = orderDetails?.taxableAmount || Number((sub / (1 + rate / 100)).toFixed(2));
            const gst = orderDetails?.gstAmount || Number((sub - taxable).toFixed(2));

            return (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <div>
                    <span>Items Subtotal</span>
                    <span className="text-[10px] text-muted-foreground block">
                      (Includes ₹{gst} GST @ {rate}%)
                    </span>
                  </div>
                  <span className="font-semibold text-forest">₹{sub}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs pl-2">
                  <span>Taxable Base (Excl. Tax)</span>
                  <span className="font-medium">₹{taxable}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs pl-2">
                  <span>CGST ({(rate / 2).toFixed(1)}%) + SGST ({(rate / 2).toFixed(1)}%)</span>
                  <span className="font-medium">₹{(gst / 2).toFixed(2)} + ₹{(gst - gst / 2).toFixed(2)}</span>
                </div>
              </>
            );
          })()}
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="font-semibold text-forest">
              {Number(orderDetails?.deliveryCharges) > 0 ? `₹${orderDetails.deliveryCharges}` : "FREE (Unlocked)"}
            </span>
          </div>
          {orderDetails?.totalWeightGrams > 0 && (
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>Shipment Package Weight</span>
              <span className="font-medium text-gray-700">
                {orderDetails.totalWeightGrams >= 1000
                  ? `${(orderDetails.totalWeightGrams / 1000).toFixed(2)} kg`
                  : `${orderDetails.totalWeightGrams} g`}
              </span>
            </div>
          )}
          {orderDetails?.walletCreditsUsed > 0 && (
            <div className="flex justify-between text-emerald-700 text-xs">
              <span>Wallet Discount Applied</span>
              <span>-₹{orderDetails.walletCreditsUsed}</span>
            </div>
          )}
          <Separator className="my-1 border-forest/10" />
          <div className="flex justify-between text-base font-bold text-forest">
            <span>Total Amount</span>
            <span>₹{orderDetails?.totalAmount}</span>
          </div>
        </div>

        <Separator />

        {/* Customer & shipping */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-forest/10 p-4 space-y-2">
            <p className="text-sm font-semibold text-forest flex items-center gap-2">
              <User className="w-4 h-4" /> Customer
            </p>
            <p className="text-sm font-medium">
              {orderDetails?.customerInfo?.userName || "Guest"}
            </p>
            <p className="text-xs text-muted-foreground break-all">
              {orderDetails?.customerInfo?.email || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-forest/10 p-4 space-y-2">
            <p className="text-sm font-semibold text-forest flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment
            </p>
            <p className="text-sm capitalize">{orderDetails?.paymentMethod || "—"}</p>
            <p className="text-xs text-muted-foreground">
              ID: {orderDetails?.paymentId || orderDetails?.payerId || "—"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-forest/10 p-4 space-y-2">
          <p className="text-sm font-semibold text-forest flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Delivery Address
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{orderDetails?.addressInfo?.address}</p>
            <p>
              {orderDetails?.addressInfo?.city}
              {orderDetails?.addressInfo?.pincode ? ` — ${orderDetails.addressInfo.pincode}` : ""}
            </p>
            {orderDetails?.addressInfo?.phone && (
              <p className="flex items-center gap-1.5 text-forest font-medium">
                <Phone className="w-3.5 h-3.5" />
                {orderDetails.addressInfo.phone}
              </p>
            )}
            {orderDetails?.addressInfo?.notes && (
              <p className="text-xs italic pt-1">Note: {orderDetails.addressInfo.notes}</p>
            )}
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground font-mono break-all">
          Full ID: {orderDetails?._id}
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
