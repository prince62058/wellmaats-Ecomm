import {
  Leaf,
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
  ChevronDown,
  ArrowRight,
  Heart,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { useLoginModal } from "@/context/LoginModalContext";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import HeaderSearch from "./header-search";
import { useEffect, useRef, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";

function navLinkAccent(href = "", label = "") {
  const key = `${href} ${label}`.toLowerCase();
  if (key.includes("best-seller") || key.includes("best seller")) {
    return {
      light: "text-amber-200 hover:text-amber-100 hover:bg-amber-400/20",
      solid: "text-amber-700 hover:text-amber-800 hover:bg-amber-50",
      chip: "bg-amber-100",
    };
  }
  if (key.includes("offer")) {
    return {
      light: "text-orange-200 hover:text-orange-100 hover:bg-orange-400/20",
      solid: "text-orange-600 hover:text-orange-700 hover:bg-orange-50",
      chip: "bg-orange-100",
    };
  }
  if (key.includes("blog")) {
    return {
      light: "text-emerald-200 hover:text-emerald-100 hover:bg-emerald-400/20",
      solid: "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50",
      chip: "bg-emerald-100",
    };
  }
  if (key.includes("track") || key.includes("account")) {
    return {
      light: "text-sky-200 hover:text-sky-100 hover:bg-sky-400/20",
      solid: "text-sky-700 hover:text-sky-800 hover:bg-sky-50",
      chip: "bg-sky-100",
    };
  }
  if (key.includes("gift")) {
    return {
      light: "text-rose-200 hover:text-rose-100 hover:bg-rose-400/20",
      solid: "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
      chip: "bg-rose-100",
    };
  }
  return {
    light: "text-white/90 hover:text-white hover:bg-white/15",
    solid: "text-forest hover:text-forest hover:bg-leaf",
    chip: "bg-leaf",
  };
}

function MenuItems({ onNavigate, light, mobile = false }) {
  const navigate = useNavigate();
  const { productCategories } = useSiteSettings();
  const [wellnessOpen, setWellnessOpen] = useState(false);

  const linkClass = mobile
    ? "w-full text-left px-4 py-3.5 rounded-xl text-base font-medium text-forest hover:bg-leaf active:bg-leaf transition-colors"
    : light
      ? "text-sm font-semibold cursor-pointer text-white hover:text-gold transition-colors"
      : "text-sm font-semibold cursor-pointer text-forest hover:text-forest/80 transition-colors";

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
  const { openLoginModal } = useLoginModal();

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

      {/* Wishlist */}
      <Link
        to="/shop/wishlist"
        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
          light ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "border-forest/15 text-forest hover:bg-leaf"
        }`}
      >
        <Heart className="w-4 h-4" />
      </Link>

      {user ? (
        /* ── Logged-in avatar dropdown ── */
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className={`cursor-pointer ring-2 ${light ? "ring-white/30" : "ring-forest/10"}`}>
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.userName} className="object-cover" />}
              <AvatarFallback className="bg-forest text-white font-bold text-sm">
                {user?.userName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-52">
            <DropdownMenuLabel className="text-sm">{user?.userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role === "admin" && (
              <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate("/shop/account")}>
              <UserCog className="mr-2 h-4 w-4" /> Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatch(logoutUser())}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        /* ── Guest login / signup buttons ── */
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            onClick={openLoginModal}
            variant="outline"
            size="sm"
            className={`rounded-full text-xs font-bold px-2.5 sm:px-4 h-8 ${btnClass}`}
          >
            <LogIn className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Login</span>
          </Button>
          <Button
            onClick={() => navigate("/auth/register")}
            size="sm"
            className="rounded-full text-xs font-bold px-3 sm:px-4 h-8 bg-gold hover:bg-gold/90 text-white shadow-sm"
          >
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Sign Up</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function MobileNavSheet({ open, onOpenChange, brand, onOpenCart }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { headerNavLinks, megaMenu = [] } = useSiteSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openLoginModal } = useLoginModal();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const cartCount = cartItems?.items?.reduce((n, i) => n + (i.quantity || 0), 0) || 0;
  const navLinks = headerNavLinks || [];

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
            <img
              src={
                brand.logo?.startsWith("/wellmaats-logo")
                  ? "/wellmaats-logo.png?v=6"
                  : brand.logo || "/wellmaats-logo.png?v=6"
              }
              alt={brand.company || brand.name || "Wellmaats"}
              className="h-12 w-auto max-w-[220px] object-contain object-left"
            />
          </div>
          <HeaderSearch className="w-full" onResultClick={() => onOpenChange(false)} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navLinks.length > 0 && (
            <div>
              <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Explore
              </p>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const accent = navLinkAccent(link.href, link.label);
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => closeAnd(() => navigate(link.href))}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors ${accent.solid}`}
                    >
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm ${accent.chip}`}>
                        {link.icon}
                      </span>
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {megaMenu.length > 0 && (
            <div>
              <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <button
                type="button"
                onClick={() => setCategoryOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-forest bg-forest/5 hover:bg-leaf transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-forest/10 text-sm">▦</span>
                  Shop By Category
                </span>
                <ChevronDown className={`w-4 h-4 text-forest/50 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
              </button>
              {categoryOpen && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-forest/10 space-y-0.5 max-h-64 overflow-y-auto">
                  {megaMenu.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        closeAnd(() => navigate(cat.href || `/shop/listing?category=${cat.id}`))
                      }
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-forest/80 hover:bg-leaf hover:text-forest transition-colors"
                    >
                      <Leaf className="w-3.5 h-3.5 text-gold shrink-0" />
                      {cat.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => closeAnd(() => navigate("/shop/listing"))}
                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-forest hover:bg-leaf transition-colors"
                  >
                    View all products
                    <ArrowRight className="w-3.5 h-3.5 text-gold ml-auto" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menu
            </p>
            <MenuItems mobile onNavigate={() => onOpenChange(false)} />
          </div>
        </div>

        <div className="shrink-0 border-t border-forest/10 bg-leaf/50 px-3 py-4 space-y-1">
          <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {user?.userName ? `Hi, ${user.userName}` : "Account"}
          </p>
          <button type="button" className={actionClass} onClick={() => closeAnd(onOpenCart)}>
            <ShoppingCart className="w-5 h-5 text-forest shrink-0" />
            <span className="flex-1 text-left">My Cart</span>
            {cartCount > 0 && (
              <span className="text-xs font-bold bg-gold text-white px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button type="button" className={actionClass} onClick={() => closeAnd(() => navigate("/shop/wishlist"))}>
            <Heart className="w-5 h-5 text-forest shrink-0" />
            Wishlist
          </button>

          {user ? (
            <>
              <button type="button" className={actionClass} onClick={() => closeAnd(() => navigate("/shop/account"))}>
                <UserCog className="w-5 h-5 text-forest shrink-0" />
                My Account
              </button>
              <button type="button" className={`${actionClass} text-red-600 hover:bg-red-50`}
                onClick={() => closeAnd(() => dispatch(logoutUser()))}>
                <LogOut className="w-5 h-5 shrink-0" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button type="button" className={actionClass}
                onClick={() => { onOpenChange(false); openLoginModal(); }}>
                <LogIn className="w-5 h-5 text-forest shrink-0" />
                Login
              </button>
              <button type="button" className={actionClass}
                onClick={() => closeAnd(() => navigate("/auth/register"))}>
                <UserPlus className="w-5 h-5 text-forest shrink-0" />
                Sign Up
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ShoppingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();
  const { brand, headerNavLinks } = useSiteSettings();
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

  // Keep mega-menu aligned under the real sticky header (incl. announcement offset)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const sync = () => {
      const bottom = Math.round(el.getBoundingClientRect().bottom);
      document.documentElement.style.setProperty("--header-h", `${bottom}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [scrolled, light, location.pathname]);

  function handleOpenCartFromMenu() {
    setOpenCartSheet(true);
  }

  const navLinks = headerNavLinks || [];

  return (
    <header
      ref={headerRef}
      className={`w-full transition-all duration-300 ${
        light
          ? "bg-gradient-to-b from-black/55 to-black/5 border-b border-white/10"
          : "bg-white/97 backdrop-blur-xl border-b border-forest/10 shadow-sm"
      }`}
    >
      {/* ── Row 1: Logo | Search | Cart+User ── */}
      <div className="container mx-auto flex h-14 sm:h-16 md:h-[4.75rem] items-center gap-2 md:gap-4 px-3 md:px-6">
        {/* Mobile hamburger left */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className={`lg:hidden rounded-full shrink-0 h-9 w-9 ${light ? "border-white/30 bg-white/10 text-white" : "border-forest/15"}`}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo fills bar height; PNG is tightly cropped */}
        <Link
          to="/shop/home"
          className="flex items-center shrink-0"
          aria-label={brand.company || brand.name || "Wellmaats"}
        >
          {brand.logo ? (
            <img
              src={
                brand.logo.startsWith("/wellmaats-logo")
                  ? "/wellmaats-logo.png?v=6"
                  : brand.logo
              }
              alt={brand.company || brand.name || "Wellmaats"}
              className="h-10 sm:h-14 md:h-16 w-auto max-w-[120px] sm:max-w-[220px] md:max-w-[340px] object-contain object-left"
            />
          ) : (
            <img
              src="/wellmaats-logo.png?v=6"
              alt="Wellmaats"
              className="h-10 sm:h-14 md:h-16 w-auto max-w-[120px] sm:max-w-[220px] md:max-w-[340px] object-contain object-left"
            />
          )}
        </Link>

        {/* Search — hide on very small screens (available in menu) */}
        <div className="hidden min-[400px]:block flex-1 max-w-2xl mx-1 sm:mx-2 md:mx-4 min-w-0">
          <HeaderSearch className="w-full" variant={light ? "dark" : "light"} />
        </div>

        {/* Right: Cart + Wishlist + User */}
        <div className="flex items-center shrink-0 ml-auto">
          <HeaderRightContent
            light={light}
            openCartSheet={openCartSheet}
            setOpenCartSheet={setOpenCartSheet}
          />
        </div>
      </div>

      {/* ── Row 2: Nav — desktop full bar + mobile scroll chips ── */}
      <div
        className={`border-t ${
          light
            ? "border-white/10 bg-black/20 backdrop-blur-md"
            : "border-forest/8 bg-leaf/70"
        }`}
      >
        <div className="container mx-auto px-3 md:px-6">
          {/* Mobile / tablet: horizontal chips */}
          <div className="flex lg:hidden items-center gap-2 h-11 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                light
                  ? "bg-white/15 text-white ring-1 ring-white/25"
                  : "bg-forest text-white"
              }`}
            >
              ▦ Categories
            </button>
            {navLinks.map((link) => {
              const accent = navLinkAccent(link.href, link.label);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    light ? accent.light : accent.solid
                  }`}
                >
                  <span className="text-[11px]">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 h-11 overflow-x-auto scrollbar-hide">
            <div className="shrink-0">
              <MegaMenu light={light} onNavigate={() => {}} />
            </div>
            <div className={`w-px h-5 mx-1.5 shrink-0 ${light ? "bg-white/25" : "bg-forest/15"}`} />
            {navLinks.map((link) => {
              const accent = navLinkAccent(link.href, link.label);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    light ? accent.light : accent.solid
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] ${
                      light ? "bg-white/15" : accent.chip
                    }`}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
            <div className="flex-1 min-w-2" />
            <div className="hidden xl:flex shrink-0">
              <MenuItems light={light} />
            </div>
          </div>
        </div>
      </div>

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
