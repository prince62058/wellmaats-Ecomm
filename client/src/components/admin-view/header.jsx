import { Menu, ExternalLink, LogOut, Bell } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { Link, useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/products":  "Products",
  "/admin/orders":    "Orders",
  "/admin/settings":  "Site Settings",
  "/admin/features":  "Features",
  "/admin/blogs":     "Blogs",
};

function AdminHeader({ setOpen }) {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const title     = PAGE_TITLES[location.pathname] || "Admin";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 h-14 bg-white border-b border-gray-100 px-4 md:px-6 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}
          className="lg:hidden w-9 h-9 rounded-xl hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
        <div>
          <h2 className="font-display font-bold text-forest text-base leading-tight">{title}</h2>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Link to="/shop/home" target="_blank">
          <Button variant="outline" size="sm"
            className="hidden sm:flex gap-1.5 rounded-xl border-forest/15 text-forest hover:bg-leaf text-xs font-semibold">
            <ExternalLink className="w-3.5 h-3.5" /> View Store
          </Button>
        </Link>
        <Button onClick={() => dispatch(logoutUser())} variant="outline" size="sm"
          className="gap-1.5 rounded-xl border-red-100 text-red-500 hover:bg-red-50 text-xs font-semibold">
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
