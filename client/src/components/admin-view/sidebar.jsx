import { BadgeCheck, ChartNoAxesCombined, LayoutDashboard, Leaf, Settings, ShoppingBasket } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
  {
    id: "settings",
    label: "Site Settings",
    path: "/admin/settings",
    icon: <Settings />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mt-8 flex-col flex gap-1.5">
      {adminSidebarMenuItems.map((menuItem) => {
        const active = location.pathname === menuItem.path;
        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              setOpen ? setOpen(false) : null;
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-forest text-white shadow-sm"
                : "text-muted-foreground hover:bg-leaf hover:text-forest"
            }`}
          >
            {menuItem.icon}
            <span>{menuItem.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();
  const { brand } = useSiteSettings();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                <Leaf size={28} className="text-forest" />
                <div>
                  <h1 className="text-xl font-display font-bold text-forest">{brand.name}</h1>
                  <p className="text-xs text-muted-foreground">Admin by {brand.company}</p>
                </div>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r border-forest/10 bg-white p-6 lg:flex shrink-0">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          <Leaf size={28} className="text-forest" />
          <div>
            <h1 className="text-xl font-display font-bold text-forest">{brand.name}</h1>
            <p className="text-xs text-muted-foreground">Admin by {brand.company}</p>
          </div>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
