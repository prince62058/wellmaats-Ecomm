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
  Home,
  ShoppingBag,
  Search,
  X,
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
      light: "text-amber-300 hover:text-white hover:bg-white/15 font-bold",
      solid: "text-amber-300 hover:text-white hover:bg-white/15 font-bold",
      chip: "bg-amber-400/25 text-amber-200",
    };
  }
  if (key.includes("offer")) {
    return {
      light: "text-amber-200 hover:text-white hover:bg-white/15 font-bold",
      solid: "text-amber-200 hover:text-white hover:bg-white/15 font-bold",
      chip: "bg-amber-400/25 text-amber-200",
    };
  }
  if (key.includes("blog")) {
    return {
      light: "text-emerald-100 hover:text-white hover:bg-white/15 font-semibold",
      solid: "text-emerald-100 hover:text-white hover:bg-white/15 font-semibold",
      chip: "bg-white/20 text-emerald-100",
    };
  }
  if (key.includes("track") || key.includes("account")) {
    return {
      light: "text-sky-200 hover:text-white hover:bg-white/15 font-semibold",
      solid: "text-sky-200 hover:text-white hover:bg-white/15 font-semibold",
      chip: "bg-sky-400/25 text-sky-200",
    };
  }
  if (key.includes("gift")) {
    return {
      light: "text-rose-200 hover:text-white hover:bg-white/15 font-semibold",
      solid: "text-rose-200 hover:text-white hover:bg-white/15 font-semibold",
      chip: "bg-rose-400/25 text-rose-200",
    };
  }
  return {
    light: "text-white hover:text-white hover:bg-white/15 font-semibold",
    solid: "text-white hover:text-white hover:bg-white/15 font-semibold",
    chip: "bg-white/20 text-white",
  };
}

function MenuItems({ onNavigate, light, mobile = false }) {
  const navigate = useNavigate();
  const { mainCategories, productCategories } = useSiteSettings();
  const [wellnessOpen, setWellnessOpen] = useState(false);

  const linkClass = mobile
    ? "w-full text-left px-4 py-3.5 rounded-xl text-base font-medium text-forest hover:bg-leaf active:bg-leaf transition-colors"
    : "text-sm font-semibold cursor-pointer text-white hover:text-amber-200 transition-colors";

  function goMainCategory(mainCatId) {
    sessionStorage.setItem("filters", JSON.stringify({ mainCategory: [mainCatId] }));
    navigate(`/shop/listing?mainCategory=${mainCatId}`);
    onNavigate?.();
  }

  function goCategory(categoryId, mainCatId) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId] }));
    navigate(`/shop/listing?category=${categoryId}${mainCatId ? `&mainCategory=${mainCatId}` : ""}`);
    onNavigate?.();
  }

  function goSubCategory(categoryId, subCategoryId) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId], subCategory: [subCategoryId] }));
    navigate(`/shop/listing?category=${categoryId}&subCategory=${subCategoryId}`);
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
            <span>Wellness Categories</span>
            <ChevronDown
              className={`w-4 h-4 text-forest/50 transition-transform ${wellnessOpen ? "rotate-180" : ""}`}
            />
          </button>
          {wellnessOpen && (
            <div className="mt-1 ml-2 pl-2 border-l-2 border-forest/10 space-y-3 max-h-80 overflow-y-auto">
              {(mainCategories || []).map((mainCat) => {
                const subCats = productCategories.filter((c) => c.mainCategory === mainCat.id || (!c.mainCategory && mainCat.id === "health-wellness"));
                return (
                  <div key={mainCat.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => goMainCategory(mainCat.id)}
                      className="text-xs font-bold text-forest uppercase tracking-wider block px-2 py-1 bg-forest/5 rounded-md w-full text-left"
                    >
                      {mainCat.label}
                    </button>
                    <div className="pl-2 space-y-1">
                      {subCats.map((cat) => (
                        <div key={cat.id} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => goCategory(cat.id, mainCat.id)}
                            className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-forest hover:bg-leaf"
                          >
                            <span className="flex items-center gap-1.5">
                              <Leaf className="w-3 h-3 text-gold shrink-0" />
                              {cat.label}
                            </span>
                          </button>
                          {(cat.subCategories || []).length > 0 && (
                            <div className="pl-5 space-y-0.5">
                              {cat.subCategories.map((sub) => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => goSubCategory(cat.id, sub.id)}
                                  className="w-full text-left text-[11px] text-forest/70 hover:text-forest px-2 py-1 rounded flex items-center gap-1.5"
                                >
                                  <span className="w-1 h-1 rounded-full bg-forest/40" />
                                  {sub.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("filters");
                  navigate("/shop/listing");
                  onNavigate?.();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-gold hover:bg-leaf transition-colors mt-2"
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
        <DropdownMenuContent align="center" className="w-[min(96vw,780px)] p-0 rounded-2xl border-forest/10 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-forest to-forest/90 px-6 py-4">
            <DropdownMenuLabel className="text-white font-display text-base p-0">
              Explore 3-Level Ayurvedic Catalog
            </DropdownMenuLabel>
            <p className="text-white/70 text-xs mt-1">Main Categories › Sub Categories › Targeted Formulations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 max-h-[460px] overflow-y-auto bg-[#fafcfa]">
            {(mainCategories || []).map((mainCat) => {
              const subCats = productCategories.filter((c) => c.mainCategory === mainCat.id || (!c.mainCategory && mainCat.id === "health-wellness"));
              return (
                <div key={mainCat.id} className="bg-white p-3.5 rounded-xl border border-forest/10 space-y-3 shadow-xs">
                  <button
                    type="button"
                    onClick={() => goMainCategory(mainCat.id)}
                    className="w-full text-left font-bold text-xs uppercase tracking-wider text-forest pb-1.5 border-b border-forest/10 flex items-center justify-between hover:text-gold transition-colors"
                  >
                    <span>{mainCat.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <div className="space-y-2">
                    {subCats.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => goCategory(cat.id, mainCat.id)}
                          className="w-full text-left font-semibold text-xs text-forest/90 hover:text-gold flex items-center gap-1.5"
                        >
                          <Leaf className="w-3 h-3 text-gold shrink-0" />
                          <span>{cat.label}</span>
                        </button>
                        {(cat.subCategories || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 pl-4">
                            {cat.subCategories.map((sub) => (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => goSubCategory(cat.id, sub.id)}
                                className="text-[10px] bg-[#f4f7f4] hover:bg-forest hover:text-white text-forest/75 px-2 py-0.5 rounded-full transition-all"
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
            View All Products & Categories
            <ArrowRight className="w-4 h-4 ml-auto text-forest" />
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
    <div className="flex items-center gap-1 sm:gap-2">
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className={`relative rounded-full h-8 w-8 sm:h-9 sm:w-9 ${btnClass}`}
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-colors ${
          light ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "border-forest/15 text-forest hover:bg-leaf"
        }`}
      >
        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Link>

      {user ? (
        /* ── Logged-in avatar dropdown ── */
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className={`w-8 h-8 sm:w-9 sm:h-9 cursor-pointer ring-2 ${light ? "ring-white/30" : "ring-forest/10"}`}>
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.userName} className="object-cover" />}
              <AvatarFallback className="bg-forest text-white font-bold text-xs sm:text-sm">
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
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            onClick={openLoginModal}
            variant="outline"
            size="sm"
            className={`rounded-full text-xs font-bold px-2 sm:px-4 h-8 ${btnClass}`}
          >
            <LogIn className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Login</span>
          </Button>
          <Button
            onClick={() => navigate("/auth/register")}
            size="sm"
            className="hidden min-[400px]:inline-flex rounded-full text-xs font-bold px-2.5 sm:px-4 h-8 bg-gold hover:bg-gold/90 text-white shadow-sm"
          >
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Sign Up</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function getMobileNavBadge(href = "", label = "") {
  const key = `${href} ${label}`.toLowerCase();
  if (key.includes("best-seller") || key.includes("best seller")) {
    return {
      chip: "bg-amber-100 text-amber-800 border border-amber-200",
      badge: "Popular",
      badgeClass: "bg-amber-500/15 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto",
    };
  }
  if (key.includes("offer")) {
    return {
      chip: "bg-orange-100 text-orange-800 border border-orange-200",
      badge: "Hot Deals",
      badgeClass: "bg-orange-500/15 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto",
    };
  }
  if (key.includes("blog")) {
    return {
      chip: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      badge: null,
      badgeClass: "",
    };
  }
  if (key.includes("track") || key.includes("account")) {
    return {
      chip: "bg-sky-100 text-sky-800 border border-sky-200",
      badge: null,
      badgeClass: "",
    };
  }
  if (key.includes("gift")) {
    return {
      chip: "bg-rose-100 text-rose-800 border border-rose-200",
      badge: null,
      badgeClass: "",
    };
  }
  return {
    chip: "bg-emerald-50 text-forest border border-forest/15",
    badge: null,
    badgeClass: "",
  };
}

function MobileNavSheet({ open, onOpenChange, brand, onOpenCart }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { headerNavLinks, mainCategories = [], productCategories = [] } = useSiteSettings();
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

  function goCategory(categoryId, mainCatId) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId] }));
    navigate(`/shop/listing?category=${categoryId}${mainCatId ? `&mainCategory=${mainCatId}` : ""}`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex flex-col w-[85vw] max-w-[340px] sm:max-w-sm p-0 gap-0 border-r border-forest/10 bg-white h-full shadow-2xl"
      >
        {/* ── Top Header: Brand Logo & Search ── */}
        <div className="shrink-0 px-4 pt-5 pb-3.5 border-b border-forest/10 bg-white space-y-3">
          <div className="flex items-center justify-between pr-8">
            <Link
              to="/shop/home"
              onClick={() => onOpenChange(false)}
              className="flex items-center shrink-0"
            >
              <img
                src={
                  brand.logo?.startsWith("/wellmaats-logo")
                    ? "/wellmaats-logo.png?v=6"
                    : brand.logo || "/wellmaats-logo.png?v=6"
                }
                alt={brand.company || brand.name || "Wellmaats"}
                className="h-10 w-auto max-w-[180px] object-contain object-left"
              />
            </Link>
          </div>
          <HeaderSearch className="w-full" onResultClick={() => onOpenChange(false)} />
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-4">
          {/* Quick Access / Explore */}
          {navLinks.length > 0 && (
            <div>
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-forest/50">
                Explore & Highlights
              </p>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const badgeInfo = getMobileNavBadge(link.href, link.label);
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => closeAnd(() => navigate(link.href))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-forest/5 active:bg-forest/10 transition-colors group text-left"
                    >
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm shrink-0 shadow-2xs ${badgeInfo.chip}`}>
                        {link.icon}
                      </span>
                      <span className="flex-1 font-semibold text-forest group-hover:text-emerald-800">
                        {link.label}
                      </span>
                      {badgeInfo.badge && (
                        <span className={badgeInfo.badgeClass}>
                          {badgeInfo.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories Accordion */}
          <div>
            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-forest/50">
              Catalog
            </p>
            <div className="rounded-xl border border-forest/10 bg-leaf/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setCategoryOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-3 text-sm font-semibold text-forest hover:bg-forest/5 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-forest/10 text-xs text-forest">
                    ▦
                  </span>
                  Shop By Category
                </span>
                <ChevronDown className={`w-4 h-4 text-forest/60 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`} />
              </button>

              {categoryOpen && (
                <div className="px-2 pb-2.5 space-y-1 border-t border-forest/10 bg-white/70 max-h-60 overflow-y-auto">
                  {(productCategories || []).slice(0, 10).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => goCategory(cat.id, cat.mainCategory)}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-forest hover:bg-forest/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Leaf className="w-3.5 h-3.5 text-gold shrink-0" />
                        {cat.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-forest/30" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => closeAnd(() => navigate("/shop/listing"))}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold text-forest hover:bg-forest/10 transition-colors border-t border-forest/10 mt-1"
                  >
                    <span>View all products</span>
                    <ArrowRight className="w-3.5 h-3.5 text-forest" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Direct Store Pages */}
          <div>
            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-forest/50">
              Quick Navigation
            </p>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => closeAnd(() => navigate("/shop/home"))}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-forest hover:bg-forest/5 transition-colors text-left"
              >
                <Home className="w-4 h-4 text-forest/70 shrink-0" />
                Home
              </button>
              <button
                type="button"
                onClick={() => closeAnd(() => {
                  sessionStorage.removeItem("filters");
                  navigate("/shop/listing");
                })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-forest hover:bg-forest/5 transition-colors text-left"
              >
                <ShoppingBag className="w-4 h-4 text-forest/70 shrink-0" />
                Shop All Drops
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer / Account ── */}
        <div className="shrink-0 border-t border-forest/10 bg-[#fbfdfb] px-3.5 py-3 space-y-2.5">
          {/* Cart & Wishlist row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => closeAnd(onOpenCart)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-xs font-bold text-forest hover:bg-forest/5 transition-colors shadow-2xs"
            >
              <ShoppingCart className="w-4 h-4 text-forest" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-gold text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => closeAnd(() => navigate("/shop/wishlist"))}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-xs font-bold text-forest hover:bg-forest/5 transition-colors shadow-2xs"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Wishlist</span>
            </button>
          </div>

          {/* User Auth state */}
          {user ? (
            <div className="pt-1 border-t border-forest/10 space-y-1">
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-7 w-7 ring-1 ring-forest/20">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.userName} className="object-cover" />}
                    <AvatarFallback className="bg-forest text-white font-bold text-xs">
                      {user?.userName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-forest truncate">
                    {user?.userName}
                  </span>
                </div>
                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => closeAnd(() => navigate("/admin/dashboard"))}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md hover:bg-emerald-200/80 transition-colors"
                  >
                    Admin Panel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => closeAnd(() => navigate("/shop/account"))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-forest/80 hover:text-forest hover:bg-forest/5 transition-colors"
                >
                  <UserCog className="w-3.5 h-3.5" />
                  Account
                </button>
                <button
                  type="button"
                  onClick={() => closeAnd(() => dispatch(logoutUser()))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => { onOpenChange(false); openLoginModal(); }}
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-forest/20 bg-white text-xs font-bold text-forest hover:bg-forest/5 transition-colors shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </button>
              <button
                type="button"
                onClick={() => closeAnd(() => navigate("/auth/register"))}
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-gold hover:bg-gold/90 text-xs font-bold text-white transition-colors shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ShoppingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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
      className="w-full bg-white text-foreground border-b border-gray-100 shadow-sm transition-all duration-300"
    >
      {/* ── Row 1: Logo | Search | Cart+User (WHITE BACKGROUND) ── */}
      <div className="container mx-auto flex h-14 sm:h-16 md:h-[4.75rem] items-center gap-1.5 sm:gap-2 md:gap-4 px-2.5 sm:px-4 md:px-6">
        {/* Mobile hamburger left */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden rounded-full shrink-0 h-8 w-8 sm:h-9 sm:w-9 border-forest/15 text-forest hover:bg-leaf"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Logo fills bar height; PNG is tightly cropped */}
        <Link
          to="/shop/home"
          className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
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
              className="h-8 sm:h-12 md:h-16 w-auto max-w-[105px] sm:max-w-[200px] md:max-w-[320px] object-contain object-left"
            />
          ) : (
            <img
              src="/wellmaats-logo.png?v=6"
              alt="Wellmaats"
              className="h-8 sm:h-12 md:h-16 w-auto max-w-[105px] sm:max-w-[200px] md:max-w-[320px] object-contain object-left"
            />
          )}
        </Link>

        {/* Search — visible on tablet & desktop */}
        <div className="hidden min-[480px]:block flex-1 max-w-2xl mx-1 sm:mx-2 md:mx-4 min-w-0">
          <HeaderSearch className="w-full" variant="light" />
        </div>

        {/* Right: Search toggle (< 480px) + Cart + Wishlist + User */}
        <div className="flex items-center shrink-0 ml-auto gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowMobileSearch((prev) => !prev)}
            className="min-[480px]:hidden rounded-full shrink-0 h-8 w-8 border-forest/15 text-forest hover:bg-leaf"
            aria-label="Toggle search"
          >
            {showMobileSearch ? <X className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
          </Button>

          <HeaderRightContent
            light={false}
            openCartSheet={openCartSheet}
            setOpenCartSheet={setOpenCartSheet}
          />
        </div>
      </div>

      {/* Mobile Search dropdown row (< 480px) */}
      {showMobileSearch && (
        <div className="min-[480px]:hidden px-3 py-2 bg-leaf/50 border-t border-forest/10 animate-fade-in">
          <HeaderSearch className="w-full" variant="light" onResultClick={() => setShowMobileSearch(false)} />
        </div>
      )}

      {/* ── Row 2: Nav — desktop full bar + mobile scroll chips (GREEN #108644) ── */}
      <div
        className="bg-[#108644] text-white py-0.5 shadow-sm"
      >
        <div className="container mx-auto px-2.5 sm:px-4 md:px-6">
          {/* Mobile / tablet: horizontal chips */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 h-10 sm:h-11 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
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
              <MegaMenu light={true} onNavigate={() => {}} />
            </div>
            <div className="w-px h-5 mx-1.5 shrink-0 bg-white/25" />
            {navLinks.map((link) => {
              const accent = navLinkAccent(link.href, link.label);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${accent.light}`}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[12px] bg-white/15">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
            <div className="flex-1 min-w-2" />
            <div className="hidden xl:flex shrink-0">
              <MenuItems light={true} />
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
