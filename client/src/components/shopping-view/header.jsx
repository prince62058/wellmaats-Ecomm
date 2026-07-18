import {
  Leaf,
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import MegaMenu from "./mega-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import { useSiteSettings } from "@/hooks/use-site-settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import HeaderSearch from "./header-search";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";

function MenuItems({ onNavigate, light, mobile = false }) {
  const navigate = useNavigate();
  const { productCategories } = useSiteSettings();
  const [wellnessOpen, setWellnessOpen] = useState(false);

  const linkClass = mobile
    ? "w-full text-left px-4 py-3.5 rounded-xl text-base font-medium text-forest hover:bg-leaf active:bg-leaf transition-colors"
    : light
      ? "text-sm font-medium cursor-pointer text-white/90 hover:text-white transition-colors"
      : "text-sm font-medium cursor-pointer text-forest/80 hover:text-forest transition-colors";

  function goCategory(categoryId) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId] }));
    navigate(`/shop/listing?category=${categoryId}`);
    onNavigate?.();
  }

  function handleNavigate(menuItem) {
    sessionStorage.removeItem("filters");
    sessionStorage.setItem("filters", JSON.stringify(null));
    navigate(menuItem.path);
    onNavigate?.();
  }

  if (mobile) {
    return (
      <nav className="flex flex-col w-full gap-1">
        {shoppingViewHeaderMenuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigate(item)}
            className={linkClass}
          >
            {item.label}
          </button>
        ))}

        <div className="w-full">
          <button
            type="button"
            onClick={() => setWellnessOpen((v) => !v)}
            className={`${linkClass} flex items-center justify-between`}
          >
            <span>Wellness</span>
            <ChevronDown
              className={`w-4 h-4 text-forest/50 transition-transform ${wellnessOpen ? "rotate-180" : ""}`}
            />
          </button>
          {wellnessOpen && (
            <div className="mt-1 ml-2 pl-2 border-l-2 border-forest/10 space-y-0.5 max-h-56 overflow-y-auto">
              {productCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => goCategory(cat.id)}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-forest/80 hover:bg-leaf hover:text-forest transition-colors"
                >
                  <Leaf className="w-3.5 h-3.5 text-gold shrink-0" />
                  {cat.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("filters");
                  navigate("/shop/listing");
                  onNavigate?.();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-forest hover:bg-leaf transition-colors"
              >
                View all products
                <ArrowRight className="w-3.5 h-3.5 text-gold ml-auto" />
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
      {shoppingViewHeaderMenuItems.map((item) => (
        <button key={item.id} type="button" onClick={() => handleNavigate(item)} className={linkClass}>
          {item.label}
        </button>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={`${linkClass} flex items-center gap-1`}>
            Wellness <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-[min(92vw,520px)] p-0 rounded-2xl border-forest/10 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-forest to-forest/90 px-5 py-4">
            <DropdownMenuLabel className="text-white font-display text-base p-0">
              Shop by Wellness Need
            </DropdownMenuLabel>
            <p className="text-white/70 text-xs mt-1">Ayurvedic drops for every health goal</p>
          </div>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-1 p-3 max-h-80 overflow-y-auto bg-white">
            {productCategories.map((cat) => (
              <DropdownMenuItem
                key={cat.id}
                onClick={() => goCategory(cat.id)}
                className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-leaf focus:text-forest"
              >
                <Leaf className="w-3.5 h-3.5 text-gold mr-2 shrink-0" />
                <span className="text-sm font-medium">{cat.label}</span>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator className="m-0" />
          <DropdownMenuItem
            onClick={() => {
              sessionStorage.removeItem("filters");
              navigate("/shop/listing");
              onNavigate?.();
            }}
            className="px-5 py-3 font-semibold text-forest focus:bg-leaf cursor-pointer"
          >
            View all products
            <ArrowRight className="w-4 h-4 ml-auto text-gold" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

function HeaderRightContent({ light, openCartSheet, setOpenCartSheet }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, user?.id]);

  const btnClass = light
    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
    : "border-forest/15 text-forest hover:bg-leaf";

  const cartCount = cartItems?.items?.length || 0;

  return (
    <div className="flex items-center gap-2">
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className={`relative rounded-full ${btnClass}`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items?.length > 0 ? cartItems.items : []}
        />
      </Sheet>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className={`cursor-pointer ring-2 ${light ? "ring-white/30" : "ring-forest/10"}`}>
            <AvatarFallback className="bg-forest text-white font-bold text-sm">
              {user?.userName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-52">
          <DropdownMenuLabel className="text-sm">{user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" /> Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(logoutUser())}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileNavSheet({ open, onOpenChange, brand, onOpenCart }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartCount = cartItems?.items?.reduce((n, i) => n + (i.quantity || 0), 0) || 0;

  function closeAnd(fn) {
    onOpenChange(false);
    fn?.();
  }

  const actionClass =
    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-forest hover:bg-white active:bg-white transition-colors";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full max-w-[min(100vw,380px)] p-0 gap-0 border-l border-forest/10"
      >
        <div className="shrink-0 px-5 pt-12 pb-4 border-b border-forest/10 bg-white">
          <div className="flex items-center gap-2.5 mb-4 pr-8">
            <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center shrink-0">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-forest truncate">{brand.name}</p>
              <p className="text-[10px] text-gold truncate">{brand.tagline}</p>
            </div>
          </div>
          <HeaderSearch className="w-full" onResultClick={() => onOpenChange(false)} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <MenuItems mobile onNavigate={() => onOpenChange(false)} />
        </div>

        <div className="shrink-0 border-t border-forest/10 bg-leaf/50 px-3 py-4 space-y-1">
          <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {user?.userName ? `Hi, ${user.userName}` : "Account"}
          </p>
          <button
            type="button"
            className={actionClass}
            onClick={() => closeAnd(onOpenCart)}
          >
            <ShoppingCart className="w-5 h-5 text-forest shrink-0" />
            <span className="flex-1 text-left">My Cart</span>
            {cartCount > 0 && (
              <span className="text-xs font-bold bg-gold text-white px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={() => closeAnd(() => navigate("/shop/account"))}
          >
            <UserCog className="w-5 h-5 text-forest shrink-0" />
            My Account
          </button>
          <button
            type="button"
            className={`${actionClass} text-red-600 hover:bg-red-50`}
            onClick={() => closeAnd(() => dispatch(logoutUser()))}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ShoppingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { brand } = useSiteSettings();
  const isHome = location.pathname === "/shop/home";
  const light = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > 48);
  }, [location.pathname]);

  function handleOpenCartFromMenu() {
    setOpenCartSheet(true);
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        light
          ? "border-b border-white/10 bg-gradient-to-b from-black/50 to-transparent"
          : "border-b border-forest/10 bg-white/95 backdrop-blur-xl shadow-sm"
      }`}
    >
      <div className="container mx-auto flex h-14 md:h-16 items-center gap-3 px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2.5 shrink-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${light ? "bg-white/15 backdrop-blur" : "bg-forest"}`}>
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight min-w-0">
            <span className={`font-display font-bold text-sm sm:text-base md:text-lg truncate block ${light ? "text-white" : "text-forest"}`}>
              {brand.name}
            </span>
            <span className={`block text-[9px] sm:text-[10px] -mt-0.5 truncate ${light ? "text-gold/90" : "text-gold"}`}>
              {brand.tagline}
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-auto">
          <HeaderSearch className="w-full" variant={light ? "dark" : "light"} />
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <MegaMenu light={light} onNavigate={() => {}} />
          <MenuItems light={light} />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          <HeaderRightContent
            light={light}
            openCartSheet={openCartSheet}
            setOpenCartSheet={setOpenCartSheet}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className={`lg:hidden rounded-full ${light ? "border-white/30 bg-white/10 text-white" : "border-forest/15"}`}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!mobileOpen && (
        <div className="md:hidden px-4 pb-3">
          <HeaderSearch className="w-full" variant={light ? "dark" : "light"} />
        </div>
      )}

      <MobileNavSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        brand={brand}
        onOpenCart={handleOpenCartFromMenu}
      />
    </header>
  );
}

export default ShoppingHeader;
