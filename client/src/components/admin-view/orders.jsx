import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import AdminOrderDetailsView from "./order-details";
import { AdminPageHeader, AdminStatCards } from "./page-header";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { resolveProductImage } from "@/hooks/use-site-settings";
import {
  formatOrderDate,
  getPaymentStatusStyle,
  getStatusMeta,
  ORDER_STATUSES,
  shortOrderId,
} from "@/lib/order-utils";
import {
  Clock,
  Eye,
  IndianRupee,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";

function OrderItemThumbnails({ items }) {
  const visible = (items || []).slice(0, 3);
  const extra = (items?.length || 0) - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((item, i) => (
        <div
          key={`${item.productId}-${i}`}
          className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-leaf/40 shadow-sm"
          style={{ zIndex: visible.length - i }}
        >
          <img
            src={resolveProductImage(item.image)}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/products/signature.jpg";
            }}
          />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-10 h-10 rounded-lg border-2 border-white bg-forest/10 flex items-center justify-center text-xs font-bold text-forest">
          +{extra}
        </div>
      )}
    </div>
  );
}

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { orderList, orderDetails, isLoading } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails && selectedOrderId) setOpenDetailsDialog(true);
  }, [orderDetails, selectedOrderId]);

  const stats = useMemo(() => {
    const list = orderList || [];
    const revenue = list.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pending = list.filter((o) => o.orderStatus === "pending").length;
    const shipping = list.filter(
      (o) => o.orderStatus === "inShipping" || o.orderStatus === "inProcess"
    ).length;
    return [
      { label: "Total Orders", value: list.length, icon: ShoppingBag, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Pending", value: pending, icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
      { label: "In Progress", value: shipping, icon: Truck, bg: "bg-violet-50", color: "text-violet-600" },
      { label: "Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, icon: IndianRupee, bg: "bg-emerald-50", color: "text-emerald-600" },
    ];
  }, [orderList]);

  const filteredOrders = useMemo(() => {
    let list = [...(orderList || [])];
    if (statusFilter !== "all") {
      list = list.filter((o) => o.orderStatus === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          String(o._id).toLowerCase().includes(q) ||
          o.customerInfo?.userName?.toLowerCase().includes(q) ||
          o.customerInfo?.email?.toLowerCase().includes(q) ||
          o.addressInfo?.phone?.includes(q) ||
          o.cartItems?.some((i) => i.title?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orderList, statusFilter, search]);

  function handleViewDetails(orderId) {
    setSelectedOrderId(orderId);
    dispatch(getOrderDetailsForAdmin(orderId));
  }

  function closeDialog() {
    setOpenDetailsDialog(false);
    setSelectedOrderId(null);
    dispatch(resetOrderDetails());
  }

  return (
    <div>
      <AdminPageHeader
        title="Order Management"
        subtitle="Track orders, update status, and view customer details with product images"
      />

      <AdminStatCards stats={stats} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer, phone, product..."
            className="pl-9 rounded-xl border-forest/15"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            className={statusFilter === "all" ? "bg-forest" : "border-forest/20"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          {ORDER_STATUSES.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={statusFilter === s.id ? "default" : "outline"}
              className={statusFilter === s.id ? `${s.color} border-0 text-white` : "border-forest/20"}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-forest/10">
          <Package className="w-12 h-12 text-forest/30 mx-auto mb-3" />
          <p className="font-semibold text-forest">No orders found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || statusFilter !== "all"
              ? "Try changing filters or search"
              : "Orders will appear here when customers checkout"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusMeta = getStatusMeta(order.orderStatus);
            const itemCount = order.cartItems?.reduce((n, i) => n + (i.quantity || 0), 0) || 0;
            const firstItem = order.cartItems?.[0];

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-forest/10 p-4 sm:p-5 hover:shadow-md hover:border-forest/20 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: images + info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <OrderItemThumbnails items={order.cartItems} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-forest">{shortOrderId(order._id)}</span>
                        <Badge className={`${statusMeta.color} text-white border-0 text-[10px]`}>
                          {statusMeta.label}
                        </Badge>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getPaymentStatusStyle(order.paymentStatus)}`}
                        >
                          {order.paymentStatus || "pending"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatOrderDate(order.orderDate)}
                        {" · "}
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-medium text-forest mt-1 truncate">
                        {order.customerInfo?.userName || "Customer"}
                        {order.customerInfo?.email && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            · {order.customerInfo.email}
                          </span>
                        )}
                      </p>
                      {firstItem && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {firstItem.title}
                          {order.cartItems.length > 1 && ` +${order.cartItems.length - 1} more`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: amount + action */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-forest">₹{order.totalAmount}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {order.paymentMethod || "online"}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleViewDetails(order._id)}
                      className="bg-forest hover:bg-forest/90 rounded-xl gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={openDetailsDialog} onOpenChange={(open) => !open && closeDialog()}>
        <AdminOrderDetailsView
          orderDetails={orderDetails}
          onUpdated={() => dispatch(getAllOrdersForAdmin())}
        />
      </Dialog>
    </div>
  );
}

export default AdminOrdersView;
