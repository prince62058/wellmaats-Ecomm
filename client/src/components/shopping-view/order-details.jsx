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

        <div className="grid gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm text-forest">Order ID</p>
            <Label className="break-all font-mono text-xs sm:text-sm text-right text-muted-foreground">{orderDetails?._id}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Order Date</p>
            <Label className="text-muted-foreground">{orderDetails?.orderDate?.split("T")?.[0]}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Order Price</p>
            <Label className="font-bold text-forest text-base">₹{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Payment Method</p>
            <Label className="text-muted-foreground capitalize">{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Payment Status</p>
            <Label className="text-muted-foreground capitalize">{orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-forest">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 capitalize font-bold ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-forest-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-forest"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
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
