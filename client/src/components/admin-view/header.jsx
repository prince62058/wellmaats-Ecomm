import { AlignJustify, LogOut, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { Link, useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/settings": "Site Settings",
};

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "Admin";

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-forest/10 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Button onClick={() => setOpen(true)} variant="outline" size="icon" className="lg:hidden border-forest/15">
          <AlignJustify className="w-5 h-5" />
        </Button>
        <p className="font-display font-semibold text-forest hidden sm:block">{pageTitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/shop/home" target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5 border-forest/15 text-forest hidden sm:flex">
            <ExternalLink className="w-3.5 h-3.5" /> View Store
          </Button>
        </Link>
        <Button onClick={() => dispatch(logoutUser())} variant="outline" size="sm" className="gap-1.5 border-forest/15 text-forest">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
