import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Package, ShoppingBag, IndianRupee, AlertTriangle,
  TrendingUp, ArrowRight, Star, Users, Clock,
  CheckCircle2, XCircle, Truck, Settings, ExternalLink,
  BarChart3, Activity,
} from "lucide-react";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Palette ─── */
const FOREST  = "#1a4731";
const GOLD    = "#c8963e";
const CAT_COLORS = ["#1a4731","#c8963e","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#10b981"];
const STOCK_COLORS = ["#22c55e","#f59e0b","#ef4444"];
const STATUS_COLORS = ["#3b82f6","#f59e0b","#8b5cf6","#06b6d4","#22c55e","#ef4444"];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_META = {
  pending:    { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="w-3 h-3" /> },
  confirmed:  { color: "bg-blue-100 text-blue-700 border-blue-200",       icon: <CheckCircle2 className="w-3 h-3" /> },
  processing: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Package className="w-3 h-3" /> },
  shipped:    { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Truck className="w-3 h-3" /> },
  delivered:  { color: "bg-green-100 text-green-700 border-green-200",    icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:   { color: "bg-red-100 text-red-700 border-red-200",          icon: <XCircle className="w-3 h-3" /> },
};

/* ─── Tooltips ─── */
function RevTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-gray-100 rounded-2xl shadow-xl px-4 py-3 text-sm">
      <p className="font-bold text-forest mb-2">{label}</p>
      <div className="space-y-1">
        <p className="text-emerald-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          ₹{(payload[0]?.value || 0).toLocaleString("en-IN")}
        </p>
        {payload[1] && (
          <p className="text-amber-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            {payload[1].value} orders
          </p>
        )}
      </div>
    </div>
  );
}

function PieTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-gray-100 rounded-xl shadow-xl px-3 py-2 text-sm">
      <p className="font-bold text-forest">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} {payload[0].payload.unit || ""}</p>
    </div>
  );
}

/* ─── Custom Pie label ─── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

/* ─── Gradient Stat Card ─── */
function StatCard({ label, value, icon: Icon, sub, gradient, iconBg }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      {/* decorative circle */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/75">{label}</p>
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        {sub && <p className="text-xs text-white/70 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Empty chart placeholder ─── */
function EmptyChart({ icon: Icon, message }) {
  return (
    <div className="h-full min-h-[180px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-300" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { brand } = useSiteSettings();
  const { productList } = useSelector((s) => s.adminProducts);
  const { orderList }   = useSelector((s) => s.adminOrder);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  const products = productList || [];
  const orders   = orderList   || [];

  /* ── Stats ── */
  const totalRevenue  = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => ["pending","confirmed"].includes(o.orderStatus)).length;
  const lowStock      = products.filter((p) => p.totalStock > 0 && p.totalStock <= 10).length;
  const outOfStock    = products.filter((p) => p.totalStock === 0).length;
  const avgOrder      = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const inStock       = products.filter((p) => p.totalStock > 10).length;

  /* ── Monthly revenue (last 6 months) ── */
  const revenueData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d  = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mo = d.getMonth(), yr = d.getFullYear();
      const mo_orders = orders.filter((o) => {
        const od = new Date(o.orderDate || o.createdAt);
        return od.getMonth() === mo && od.getFullYear() === yr;
      });
      return {
        month: months[mo],
        revenue: mo_orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        orders:  mo_orders.length,
      };
    });
  }, [orders]);

  /* ── Product category pie ── */
  const categoryPie = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const key = (p.category || "other").replace(/-/g, " ");
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, unit: "products" }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  /* ── Stock health pie ── */
  const stockPie = useMemo(() => [
    { name: "Healthy Stock", value: inStock,    unit: "products" },
    { name: "Low Stock",     value: lowStock,   unit: "products" },
    { name: "Out of Stock",  value: outOfStock, unit: "products" },
  ].filter((d) => d.value > 0), [inStock, lowStock, outOfStock]);

  /* ── Order status pie ── */
  const statusPie = useMemo(() => {
    const map = {};
    orders.forEach((o) => { const s = o.orderStatus || "pending"; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value, unit: "orders" }));
  }, [orders]);

  /* ── Recent orders ── */
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
    .slice(0, 5);

  /* ── Top products ── */
  const topProducts = [...products]
    .sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
    .slice(0, 5);

  const quickLinks = [
    { label: "Products",   desc: `${products.length} items`,   path: "/admin/products", icon: Package,     grad: "from-forest to-[#0d3320]" },
    { label: "Orders",     desc: `${pendingOrders} pending`,   path: "/admin/orders",   icon: ShoppingBag, grad: "from-blue-600 to-blue-800" },
    { label: "Settings",   desc: "Brand & content",             path: "/admin/settings", icon: Settings,    grad: "from-purple-600 to-purple-800" },
    { label: "View Store", desc: "Live storefront",             path: "/shop/home",      icon: ExternalLink,grad: "from-amber-500 to-amber-700", external: true },
  ];

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, <span className="font-semibold text-forest">{brand.company || brand.name}</span>
          </p>
        </div>
        <div className="hidden sm:block text-xs text-muted-foreground bg-leaf/60 px-4 py-2 rounded-full border border-forest/10">
          {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
        </div>
      </div>

      {/* ── Gradient Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          iconBg="bg-white/20" sub={`Avg ₹${avgOrder.toLocaleString("en-IN")} / order`} />
        <StatCard label="Total Orders"  value={orders.length}
          icon={ShoppingBag} gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          iconBg="bg-white/20" sub={`${pendingOrders} pending action`} />
        <StatCard label="Products"      value={products.length}
          icon={Package} gradient="bg-gradient-to-br from-forest to-[#0d3320]"
          iconBg="bg-white/20" sub={`${outOfStock} out of stock`} />
        <StatCard label="Low Stock"     value={lowStock}
          icon={AlertTriangle} gradient="bg-gradient-to-br from-orange-400 to-orange-600"
          iconBg="bg-white/20" sub="≤10 units remaining" />
      </div>

      {/* ── Revenue Chart + Order Status Pie ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 border-forest/8 shadow-sm rounded-2xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold text-forest flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              Revenue — Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#1a4731" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1a4731" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#c8963e" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#c8963e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip content={<RevTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke={FOREST} strokeWidth={2.5}
                  fill="url(#gRev)" dot={{ r: 4, fill: FOREST, strokeWidth: 2, stroke: "#fff" }} name="Revenue" />
                <Area type="monotone" dataKey="orders"  stroke={GOLD}   strokeWidth={2.5}
                  fill="url(#gOrd)" dot={{ r: 4, fill: GOLD,   strokeWidth: 2, stroke: "#fff" }} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Pie */}
        <Card className="border-forest/8 shadow-sm rounded-2xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold text-forest flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusPie.length === 0 ? (
              <EmptyChart icon={ShoppingBag} message="No orders yet" />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="42%" innerRadius={52} outerRadius={82}
                    paddingAngle={3} dataKey="value" labelLine={false} label={<PieLabel />}>
                    {statusPie.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Category Pie + Stock Health Pie ── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Product Category Pie */}
        <Card className="border-forest/8 shadow-sm rounded-2xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold text-forest flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-leaf flex items-center justify-center">
                <Package className="w-4 h-4 text-forest" />
              </div>
              Products by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPie.length === 0 ? (
              <EmptyChart icon={Package} message="No products yet" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryPie} cx="50%" cy="45%" outerRadius={90}
                    paddingAngle={2} dataKey="value" labelLine={false} label={<PieLabel />}>
                    {categoryPie.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 6 }} formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Stock Health Pie */}
        <Card className="border-forest/8 shadow-sm rounded-2xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold text-forest flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              Inventory Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockPie.length === 0 ? (
              <EmptyChart icon={Package} message="No products yet" />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={250}>
                  <PieChart>
                    <Pie data={stockPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={4} dataKey="value" labelLine={false} label={<PieLabel />}>
                      {stockPie.map((_, i) => <Cell key={i} fill={STOCK_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {stockPie.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STOCK_COLORS[i] }} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-forest truncate">{d.name}</p>
                        <p className="text-xl font-bold" style={{ color: STOCK_COLORS[i] }}>{d.value}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground border-t border-forest/10 pt-2">
                    Total: {products.length} products
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Orders + Top Products ── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent Orders */}
        <Card className="border-forest/8 shadow-sm rounded-2xl">
          <CardHeader className="pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-forest flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              Recent Orders
            </CardTitle>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs text-forest gap-1 h-7 rounded-full">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium">No orders yet</p>
              </div>
            ) : recentOrders.map((o, idx) => {
              const meta = STATUS_META[o.orderStatus] || STATUS_META.pending;
              return (
                <div key={o._id}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${idx < recentOrders.length-1 ? "border-b border-gray-50" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-forest" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-forest">#{o._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(o.orderDate || o.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <Badge className={`text-[10px] gap-1 px-2 py-0.5 border ${meta.color}`}>
                    {meta.icon} {o.orderStatus}
                  </Badge>
                  <span className="text-xs font-bold text-forest ml-1 shrink-0">
                    ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-forest/8 shadow-sm rounded-2xl">
          <CardHeader className="pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-forest flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              Top Products
            </CardTitle>
            <Link to="/admin/products">
              <Button variant="ghost" size="sm" className="text-xs text-forest gap-1 h-7 rounded-full">
                Manage <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium">No products yet</p>
              </div>
            ) : topProducts.map((p, i) => (
              <div key={p._id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${i < topProducts.length-1 ? "border-b border-gray-50" : ""}`}>
                <span className={`w-5 text-xs font-bold shrink-0 ${i === 0 ? "text-amber-500" : "text-gray-400"}`}>#{i+1}</span>
                <img src={p.image || "/products/signature.jpg"} alt={p.title}
                  className="w-9 h-9 rounded-xl object-cover bg-leaf shrink-0"
                  onError={(e) => { e.target.src = "/products/signature.jpg"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-forest truncate">{p.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${p.totalStock === 0 ? "bg-red-100 text-red-600" : p.totalStock <= 10 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                      {p.totalStock === 0 ? "Out of stock" : `${p.totalStock} units`}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-forest">₹{(p.salePrice || p.price || 0).toLocaleString("en-IN")}</p>
                  {p.salePrice > 0 && p.price > p.salePrice && (
                    <p className="text-[10px] text-muted-foreground line-through">₹{p.price}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map((l) => (
          <Link key={l.path} to={l.path} target={l.external ? "_blank" : undefined}>
            <div className={`bg-gradient-to-br ${l.grad} rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all`}>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <l.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold">{l.label}</p>
              <p className="text-[11px] text-white/70 mt-0.5">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Low Stock Alert ── */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <p className="text-sm font-bold">⚠️ Stock Alert</p>
              <p className="text-xs text-white/80">
                {lowStock} low stock · {outOfStock} out of stock — restock needed
              </p>
            </div>
          </div>
          <Link to="/admin/products">
            <Button size="sm" className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-xl gap-1.5">
              Update Stock <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
