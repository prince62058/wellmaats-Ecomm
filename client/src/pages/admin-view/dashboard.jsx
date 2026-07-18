import { AdminPageHeader, AdminStatCards, Package, ShoppingBag, Star, AlertTriangle } from "@/components/admin-view/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import {
  LayoutDashboard,
  Settings,
  ExternalLink,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { brand } = useSiteSettings();
  const { productList } = useSelector((state) => state.adminProducts);
  const { orderList } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  const stats = useMemo(() => {
    const products = productList || [];
    const orders = orderList || [];
    const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const lowStock = products.filter((p) => p.totalStock > 0 && p.totalStock <= 10).length;
    const pending = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length;

    return [
      { label: "Total Products", value: products.length, icon: Package, bg: "bg-leaf", color: "text-forest" },
      { label: "Total Orders", value: orders.length, icon: ShoppingBag, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, icon: IndianRupee, bg: "bg-emerald-50", color: "text-emerald-600" },
      { label: "Low Stock Items", value: lowStock, icon: AlertTriangle, bg: "bg-orange-50", color: "text-orange-600" },
    ];
  }, [productList, orderList]);

  const quickLinks = [
    { label: "Manage Products", desc: "Add, edit images, pricing & Ayurvedic details", path: "/admin/products", icon: Package },
    { label: "View Orders", desc: `${orderList?.length || 0} orders · update status`, path: "/admin/orders", icon: ShoppingBag },
    { label: "Site Settings", desc: "Brand, contact, FAQ, testimonials & footer", path: "/admin/settings", icon: Settings },
    { label: "View Storefront", desc: "See live site as customers see it", path: "/shop/home", icon: ExternalLink, external: true },
  ];

  const recentProducts = (productList || []).slice(0, 5);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle={`Welcome back — ${brand.name || "Mother Tatwa"} admin panel`}
      />

      <AdminStatCards stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold text-forest mb-3 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path} target={link.external ? "_blank" : undefined}>
                <Card className="hover:shadow-md hover:border-forest/30 transition-all cursor-pointer h-full border-forest/10">
                  <CardContent className="p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-leaf flex items-center justify-center shrink-0">
                      <link.icon className="w-5 h-5 text-forest" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-forest">{link.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div>
          <h2 className="font-semibold text-forest mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Catalog Overview
          </h2>
          <Card className="border-forest/10">
            <CardContent className="p-0 divide-y">
              {recentProducts.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">No products yet. Add your first product.</p>
              ) : (
                recentProducts.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 p-3 hover:bg-leaf/30">
                    <img
                      src={p.image || "/products/signature.jpg"}
                      alt={p.title}
                      className="w-10 h-10 rounded-lg object-cover bg-leaf"
                      onError={(e) => { e.target.src = "/products/signature.jpg"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-forest truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">Stock: {p.totalStock} · ₹{p.salePrice || p.price}</p>
                    </div>
                    {p.isFeatured && <Star className="w-4 h-4 fill-gold text-gold shrink-0" />}
                  </div>
                ))
              )}
              <div className="p-3">
                <Link to="/admin/products">
                  <Button variant="outline" size="sm" className="w-full border-forest/20 text-forest">
                    View All Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
