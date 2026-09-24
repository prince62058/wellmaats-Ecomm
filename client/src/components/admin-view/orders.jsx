import { useEffect, useMemo, useState } from "react";
import { Dialog } from "../ui/dialog";
import AdminOrderDetailsView from "./order-details";
import { AdminPageHeader, AdminStatCards } from "./page-header";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin, getOrderDetailsForAdmin, resetOrderDetails,
  fetchTransactionStats,
} from "@/store/admin/order-slice";
import { Input } from "../ui/input";
import { resolveProductImage } from "@/hooks/use-site-settings";
import {
  formatOrderDate, getPaymentStatusStyle, getStatusMeta,
  ORDER_STATUSES, shortOrderId,
} from "@/lib/order-utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Clock, Eye, IndianRupee, Loader2, Package,
  Search, ShoppingBag, Truck, BarChart3, TrendingUp,
  Calendar, CalendarDays, CheckCircle2,
} from "lucide-react";
import { printInvoice } from "@/components/common/InvoiceTemplate";
import { useSiteSettings } from "@/hooks/use-site-settings";

/* ──────── Sub-components ──────── */
function OrderItemThumbnails({ items }) {
  const visible = (items || []).slice(0, 3);
  const extra   = (items?.length || 0) - visible.length;
  return (
    <div className="flex items-center -space-x-2 shrink-0">
      {visible.map((item, i) => (
        <div key={`${item.productId}-${i}`}
          className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden bg-gray-100 shadow-sm"
          style={{ zIndex: visible.length - i }}>
          <img src={resolveProductImage(item.image)} alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "/products/signature.jpg"; }} />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-10 h-10 rounded-xl border-2 border-white bg-forest/10 flex items-center justify-center text-xs font-bold text-forest">
          +{extra}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.color} text-white`}>
      {meta.label}
    </span>
  );
}

/* ──────── Transaction Stats Bar Chart Tooltip ──────── */
function TxTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-3 py-2 text-xs">
      <p className="font-bold text-forest mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
          {p.name === "revenue" ? `₹${Number(p.value).toLocaleString("en-IN")}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
}

/* ──────── Transactions Panel ──────── */
const PERIODS = [
  { id: "today",  label: "Today",       icon: Calendar },
  { id: "week",   label: "Last 7 Days", icon: CalendarDays },
  { id: "month",  label: "Last 30 Days",icon: BarChart3 },
  { id: "3months",label: "3 Months",    icon: TrendingUp },
];

function TransactionsPanel() {
  const dispatch  = useDispatch();
  const { transactionStats, isLoading } = useSelector((s) => s.adminOrder);
  const [period, setPeriod] = useState("week");

  useEffect(() => { dispatch(fetchTransactionStats(period)); }, [period, dispatch]);

  const stats = transactionStats;

  const chartData = useMemo(() => {
    if (!stats?.timeline) return [];
    return stats.timeline.map((d) => ({
      ...d,
      label: (() => {
        const dt = new Date(d.date + "T00:00:00");
        return period === "today"
          ? d.date
          : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      })(),
    }));
  }, [stats, period]);

  const statusEntries = stats
    ? Object.entries(stats.statusBreakdown || {}).sort((a, b) => b[1] - a[1])
    : [];

  const STATUS_COLORS_MAP = {
    pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
    shipped: "#06b6d4", delivered: "#108644", rejected: "#ef4444",
  };

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-forest/70 uppercase tracking-wide mb-3">Select Period</p>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  period === p.id
                    ? "bg-forest text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading stats…
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: `₹${(stats?.summary?.totalRevenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-forest", bg: "bg-leaf/40" },
              { label: "Total Orders",  value: stats?.summary?.totalOrders || 0,                                     icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Paid Orders",   value: stats?.summary?.paidOrders || 0,                                      icon: CheckCircle2, color: "text-violet-600", bg: "bg-violet-50" },
              { label: "Avg. Order",    value: `₹${(stats?.summary?.avgOrderValue || 0).toLocaleString("en-IN")}`, icon: TrendingUp,   color: "text-amber-600", bg: "bg-amber-50" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-semibold text-forest mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Revenue Timeline
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<TxTooltip />} />
                <Bar dataKey="revenue" name="revenue" fill="#108644" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-semibold text-forest mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Order Volume
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<TxTooltip />} />
                <Bar dataKey="orders" name="orders" fill="#c8963e" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown */}
          {statusEntries.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="font-semibold text-forest mb-4">Order Status Breakdown</p>
              <div className="space-y-3">
                {statusEntries.map(([status, count]) => {
                  const pct = stats?.summary?.totalOrders > 0
                    ? Math.round((count / stats.summary.totalOrders) * 100)
                    : 0;
                  const color = STATUS_COLORS_MAP[status] || "#6b7280";
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="capitalize text-gray-700">{status}</span>
                        <span style={{ color }}>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ──────── Main AdminOrdersView ──────── */
function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId,   setSelectedOrderId]   = useState(null);
  const [search,            setSearch]            = useState("");
  const [statusFilter,      setStatusFilter]      = useState("all");
  const [activeTab,         setActiveTab]         = useState("orders"); // "orders" | "transactions"

  const { orderList, orderDetails, isLoading } = useSelector((s) => s.adminOrder);
  const { brandName } = useSiteSettings();
  const dispatch = useDispatch();

  useEffect(() => { dispatch(getAllOrdersForAdmin()); }, [dispatch]);
  useEffect(() => { if (orderDetails && selectedOrderId) setOpenDetailsDialog(true); }, [orderDetails, selectedOrderId]);

  const stats = useMemo(() => {
    const list    = orderList || [];
    const revenue = list.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pending = list.filter((o) => o.orderStatus === "pending").length;
    const ship    = list.filter((o) => ["inShipping","shipped","processing","onTheWay"].includes(o.orderStatus)).length;
    return [
      { label: "Total Orders", value: list.length,                                  icon: ShoppingBag,  bg: "bg-blue-50",   color: "text-blue-600"   },
      { label: "Pending",      value: pending,                                       icon: Clock,        bg: "bg-amber-50",  color: "text-amber-600"  },
      { label: "In Progress",  value: ship,                                          icon: Truck,        bg: "bg-violet-50", color: "text-violet-600" },
      { label: "Revenue",      value: `₹${revenue.toLocaleString("en-IN")}`,        icon: IndianRupee,  bg: "bg-forest-50",color: "text-forest-600"},
    ];
  }, [orderList]);

  const filteredOrders = useMemo(() => {
    let list = [...(orderList || [])];
    if (statusFilter !== "all") list = list.filter((o) => o.orderStatus === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
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
        title="Orders"
        subtitle="Manage orders, update status, and track deliveries"
      />
      <AdminStatCards stats={stats} />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        {[
          { id: "orders",       label: "📦 All Orders",       icon: ShoppingBag },
          { id: "transactions", label: "📊 Transactions",     icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-forest text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "transactions" ? (
        <TransactionsPanel />
      ) : (
        <>
          {/* Search + Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID, customer, phone, product..."
                  className="pl-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ id: "all", label: "All Orders" }, ...ORDER_STATUSES].map((s) => (
                <button key={s.id} type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    statusFilter === s.id
                      ? "bg-forest text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading orders…
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-bold text-forest text-lg">No orders found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || statusFilter !== "all" ? "Try changing your filters" : "Orders will appear here when customers checkout"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const itemCount = order.cartItems?.reduce((n, i) => n + (i.quantity || 0), 0) || 0;
                const firstItem = order.cartItems?.[0];
                return (
                  <div key={order._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-forest/20 transition-all p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                      {/* Thumbnails + info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <OrderItemThumbnails items={order.cartItems} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-bold text-forest text-sm">{shortOrderId(order._id)}</span>
                            <StatusPill status={order.orderStatus} />
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getPaymentStatusStyle(order.paymentStatus)}`}>
                              {order.paymentStatus || "pending"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {formatOrderDate(order.orderDate)} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm font-semibold text-forest truncate">
                            {order.customerInfo?.userName || "Customer"}
                            {order.customerInfo?.email && (
                              <span className="text-muted-foreground font-normal"> · {order.customerInfo.email}</span>
                            )}
                          </p>
                          {firstItem && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {firstItem.title}{order.cartItems.length > 1 && ` +${order.cartItems.length - 1} more`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Amount + actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xl font-bold text-forest">₹{(order.totalAmount || 0).toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{order.paymentMethod || "online"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => printInvoice(order, brandName || "Wellmaats")}
                            title="Download Invoice"
                            className="flex items-center gap-1 border border-forest/30 text-forest text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-forest/5 transition-colors"
                          >
                            🧾
                          </button>
                          <button onClick={() => handleViewDetails(order._id)}
                            className="flex items-center gap-1.5 bg-forest text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-forest/90 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
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
