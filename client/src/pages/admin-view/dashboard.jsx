import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Package, ShoppingBag, IndianRupee, AlertTriangle,
  TrendingUp, TrendingDown, ArrowRight, Star,
  Users, Clock, CheckCircle2, XCircle, Truck, LayoutDashboard,
  Settings, ExternalLink,
} from "lucide-react";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── palette ─── */
const FOREST = "#1a4731";
const GOLD   = "#c8963e";
const PIE_COLORS = ["#1a4731","#c8963e","#3b82f6","#f59e0b","#ef4444","#8b5cf6"];

/* ─── helpers ─── */
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const statusColor = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing:"bg-purple-100 text-purple-700",
  shipped:   "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
};
const statusIcon = {
  pending:    <Clock    className="w-3 h-3" />,
  confirmed:  <CheckCircle2 className="w-3 h-3" />,
  processing: <Package  className="w-3 h-3" />,
  shipped:    <Truck    className="w-3 h-3" />,
  delivered:  <CheckCircle2 className="w-3 h-3" />,
  rejected:   <XCircle  className="w-3 h-3" />,
};

/* ─── Custom tooltip ─── */
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-forest/15 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-forest mb-1">{label}</p>
      <p className="text-emerald-600">Revenue: ₹{payload[0]?.value?.toLocaleString("en-IN")}</p>
      {payload[1] && <p className="text-blue-600">Orders: {payload[1]?.value}</p>}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-forest/15 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-forest">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} orders</p>
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, icon: Icon, sub, trend, bg, iconColor }) {
  const up = trend > 0;
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-forest mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
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

  /* ── computed stats ── */
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const lowStock     = products.filter((p) => p.totalStock > 0 && p.totalStock <= 10).length;
  const outOfStock   = products.filter((p) => p.totalStock === 0).length;
  const pendingOrders= orders.filter((o) => ["pending","confirmed"].includes(o.orderStatus)).length;
  const avgOrder     = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  /* ── monthly revenue chart data (last 6 months) ── */
  const revenueData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mo = d.getMonth(); const yr = d.getFullYear();
      const monthOrders = orders.filter((o) => {
        const od = new Date(o.orderDate || o.createdAt);
        return od.getMonth() === mo && od.getFullYear() === yr;
      });
      return {
        month: months[mo],
        revenue: monthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        orders: monthOrders.length,
      };
    });
  }, [orders]);

  /* ── order status pie ── */
  const statusData = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const s = o.orderStatus || "pending";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  /* ── category bar chart ── */
  const categoryData = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.category || "other"] = (map[p.category || "other"] || 0) + 1; });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.replace(/-/g, " "), count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  }, [products]);

  /* ── recent orders ── */
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
    .slice(0, 6);

  /* ── top products by stock value ── */
  const topProducts = [...products]
    .sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
    .slice(0, 5);

  const quickLinks = [
    { label: "Products",    desc: `${products.length} items`, path: "/admin/products", icon: Package,      color: "bg-leaf text-forest" },
    { label: "Orders",      desc: `${pendingOrders} pending`, path: "/admin/orders",   icon: ShoppingBag,  color: "bg-blue-50 text-blue-600" },
    { label: "Settings",    desc: "Brand & content",          path: "/admin/settings", icon: Settings,     color: "bg-purple-50 text-purple-600" },
    { label: "View Store",  desc: "Live storefront",          path: "/shop/home",      icon: ExternalLink, color: "bg-amber-50 text-amber-600", external: true },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, <span className="font-semibold text-forest">{brand.company || brand.name}</span>
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-leaf/50 px-3 py-1.5 rounded-full">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"   value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={IndianRupee} bg="bg-emerald-50" iconColor="text-emerald-600"
          sub={`Avg ₹${avgOrder.toLocaleString("en-IN")} / order`} />
        <StatCard label="Total Orders"    value={orders.length}
          icon={ShoppingBag} bg="bg-blue-50" iconColor="text-blue-600"
          sub={`${pendingOrders} pending`} />
        <StatCard label="Products"        value={products.length}
          icon={Package} bg="bg-leaf" iconColor="text-forest"
          sub={`${outOfStock} out of stock`} />
        <StatCard label="Low Stock Alert" value={lowStock}
          icon={AlertTriangle} bg="bg-orange-50" iconColor="text-orange-500"
          sub="≤10 units remaining" />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <Card className="lg:col-span-2 border-forest/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Revenue — Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={FOREST} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={FOREST} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GOLD}   stopOpacity={0.15} />
                    <stop offset="95%" stopColor={GOLD}   stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke={FOREST} fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="orders"  stroke={GOLD}   fill="url(#ordGrad)" strokeWidth={2} name="Orders"  />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order status pie */}
        <Card className="border-forest/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" /> Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No orders yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Category bar chart */}
        <Card className="border-forest/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
              <Package className="w-4 h-4 text-forest" /> Products by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No products</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={FOREST} radius={[4,4,0,0]} name="Products" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="lg:col-span-2 border-forest/10 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Recent Orders
            </CardTitle>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs text-forest gap-1 h-7">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No orders yet</p>
            ) : (
              <div className="divide-y">
                {recentOrders.map((o) => (
                  <div key={o._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-leaf/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-forest" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-forest truncate">
                        #{o._id?.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(o.orderDate || o.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <Badge className={`text-[10px] gap-1 px-2 py-0.5 ${statusColor[o.orderStatus] || statusColor.pending}`}>
                      {statusIcon[o.orderStatus]} {o.orderStatus}
                    </Badge>
                    <span className="text-xs font-bold text-forest ml-2 shrink-0">
                      ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {quickLinks.map((l) => (
            <Link key={l.path} to={l.path} target={l.external ? "_blank" : undefined}>
              <Card className="border-forest/10 hover:shadow-md hover:border-forest/25 transition-all cursor-pointer h-full">
                <CardContent className="p-3.5">
                  <div className={`w-9 h-9 rounded-xl ${l.color} flex items-center justify-center mb-2`}>
                    <l.icon className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-xs font-bold text-forest">{l.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{l.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Top products */}
        <Card className="lg:col-span-2 border-forest/10 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" /> Top Products
            </CardTitle>
            <Link to="/admin/products">
              <Button variant="ghost" size="sm" className="text-xs text-forest gap-1 h-7">
                Manage <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No products yet</p>
            ) : (
              <div className="divide-y">
                {topProducts.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-leaf/20 transition-colors">
                    <span className={`w-5 text-xs font-bold shrink-0 ${i === 0 ? "text-gold" : "text-muted-foreground"}`}>
                      #{i+1}
                    </span>
                    <img src={p.image || "/products/signature.jpg"} alt={p.title}
                      className="w-9 h-9 rounded-lg object-cover bg-leaf shrink-0"
                      onError={(e) => { e.target.src = "/products/signature.jpg"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-forest truncate">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground">Stock: {p.totalStock} units</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-forest">₹{(p.salePrice || p.price || 0).toLocaleString("en-IN")}</p>
                      {p.salePrice > 0 && p.price > p.salePrice && (
                        <p className="text-[10px] text-muted-foreground line-through">₹{p.price}</p>
                      )}
                    </div>
                    {p.isFeatured && <Star className="w-3.5 h-3.5 fill-gold text-gold shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Low stock alert banner ── */}
      {(lowStock > 0 || outOfStock > 0) && (
        <Card className="border-orange-200 bg-orange-50 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-800">Stock Alert</p>
                <p className="text-xs text-orange-600">
                  {lowStock} product{lowStock !== 1 ? "s" : ""} running low
                  {outOfStock > 0 && ` · ${outOfStock} out of stock`}
                </p>
              </div>
            </div>
            <Link to="/admin/products">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 text-xs">
                Update Stock <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
