import {
  LayoutDashboard, Leaf, Settings, ShoppingBasket,
  ClipboardList, ChevronRight,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const NAV = [
  { id: "dashboard", label: "Dashboard",     path: "/admin/dashboard", icon: LayoutDashboard },
  { id: "products",  label: "Products",      path: "/admin/products",  icon: ShoppingBasket  },
  { id: "orders",    label: "Orders",        path: "/admin/orders",    icon: ClipboardList   },
  { id: "settings",  label: "Site Settings", path: "/admin/settings",  icon: Settings        },
];

function Brand({ brand, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 mb-8 ${onClick ? "cursor-pointer" : ""}`}>
      <img
        src="/wellmaats-logo.png?v=5"
        alt={brand?.name || "Wellmaats"}
        className="h-12 w-auto max-w-[200px] object-contain object-left shrink-0"
      />
    </div>
  );
}

function MenuItems({ setOpen }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => { navigate(item.path); setOpen?.(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              active
                ? "bg-white/15 text-white shadow-sm border border-white/20"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <item.icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white"}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {active && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
          </button>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate   = useNavigate();
  const { brand }  = useSiteSettings();

  const sidebarClass = `
    bg-gradient-to-b from-[#1a4731] via-[#163d2a] to-[#0f2d1e]
    flex flex-col p-5 h-full
  `;

  return (
    <Fragment>
      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 border-0" style={{ background: "linear-gradient(180deg,#1a4731,#0f2d1e)" }}>
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Navigation</SheetTitle>
          </SheetHeader>
          <div className={sidebarClass}>
            <Brand brand={brand} onClick={() => { navigate("/admin/dashboard"); setOpen(false); }} />
            <MenuItems setOpen={setOpen} />
            <div className="mt-auto pt-4 border-t border-white/10">
              <p className="text-[10px] text-white/30 text-center">Mother Tatwa Admin</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col" style={{ background: "linear-gradient(180deg,#1a4731,#0f2d1e)" }}>
        <div className={sidebarClass}>
          <Brand brand={brand} onClick={() => navigate("/admin/dashboard")} />
          <MenuItems />
          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-[10px] text-white/30 text-center">© 2026 Wellmaats</p>
          </div>
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
