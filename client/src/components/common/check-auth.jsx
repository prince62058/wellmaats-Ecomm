import { Navigate, useLocation } from "react-router-dom";

// Public shop paths — accessible without login
const PUBLIC_SHOP = ["/shop/home", "/shop/listing", "/shop/product", "/shop/search",
                     "/shop/best-sellers", "/shop/offer-zone", "/blogs"];

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  const path = location.pathname;

  // Root → redirect appropriately
  if (path === "/") {
    if (!isAuthenticated) return <Navigate to="/shop/home" />;
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/shop/home" />;
  }

  // Auth pages → redirect if already logged in
  if (isAuthenticated && (path.includes("/login") || path.includes("/register"))) {
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/shop/home" />;
  }

  // Admin pages → must be logged in as admin
  if (path.includes("/admin")) {
    if (!isAuthenticated) return <Navigate to="/auth/login" />;
    if (user?.role !== "admin") return <Navigate to="/unauth-page" />;
  }

  // Shop pages — allow browsing without login
  // Only protected shop paths: /shop/account, /shop/checkout, /shop/wishlist, /shop/payment-success
  const protectedShop = ["/shop/account", "/shop/checkout", "/shop/wishlist", "/shop/payment-success"];
  if (!isAuthenticated && protectedShop.some((p) => path.startsWith(p))) {
    return <Navigate to="/auth/login" />;
  }

  // Admin visiting shop — send to admin dashboard
  if (isAuthenticated && user?.role === "admin" && path.includes("/shop")) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
