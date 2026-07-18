import ProductFilter from "@/components/shopping-view/filter";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDown, Loader2, SlidersHorizontal, Leaf, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      queryParams.push(`${key}=${encodeURIComponent(value.join(","))}`);
    }
  }
  return queryParams.join("&");
}

function parseFiltersFromParams(searchParams) {
  const filters = {};
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const offers = searchParams.get("offers");
  if (category) filters.category = category.split(",").filter(Boolean);
  if (brand) filters.brand = brand.split(",").filter(Boolean);
  if (offers) filters.offers = offers.split(",").filter(Boolean);
  return filters;
}

function sanitizeFilters(raw, { productCategories, brands }) {
  if (!raw || typeof raw !== "object") return {};
  const validCat = new Set((productCategories || []).map((c) => c.id));
  const validBrand = new Set((brands || []).map((b) => b.id));
  const validOffers = new Set(["flashSale", "onSale"]);
  const out = { ...raw };
  if (out.category) out.category = out.category.filter((id) => validCat.has(id));
  if (out.brand) out.brand = out.brand.filter((id) => validBrand.has(id));
  if (out.offers) out.offers = out.offers.filter((id) => validOffers.has(id));
  if (!out.category?.length) delete out.category;
  if (!out.brand?.length) delete out.brand;
  if (!out.offers?.length) delete out.offers;
  return out;
}

function ShoppingListing() {
  const { brand, categoryOptionsMap, productCategories, brands } = useSiteSettings();
  const dispatch = useDispatch();
  const { productList, isLoading } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();

  function handleFilter(sectionId, optionId) {
    const cpy = { ...filters };
    if (!cpy[sectionId]) cpy[sectionId] = [];
    const idx = cpy[sectionId].indexOf(optionId);
    if (idx === -1) cpy[sectionId].push(optionId);
    else cpy[sectionId].splice(idx, 1);
    if (!cpy[sectionId].length) delete cpy[sectionId];
    setFilters(cpy);
    sessionStorage.setItem("filters", JSON.stringify(cpy));
  }

  function clearAllFilters() {
    setFilters({});
    sessionStorage.setItem("filters", JSON.stringify({}));
    setSearchParams({}, { replace: true });
  }

  function handleAddtoCart(productId, totalStock) {
    const items = cartItems?.items || [];
    const existing = items.find((i) => i.productId === productId);
    if (existing && existing.quantity + 1 > totalStock) {
      toast({ title: `Only ${existing.quantity} can be added`, variant: "destructive" });
      return;
    }
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Added to cart ✓" });
      }
    });
  }

  useEffect(() => {
    const urlFilters = sanitizeFilters(parseFiltersFromParams(searchParams), {
      productCategories,
      brands,
    });
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
      sessionStorage.setItem("filters", JSON.stringify(urlFilters));
    } else {
      const stored = sessionStorage.getItem("filters");
      const parsed = stored && stored !== "null" ? JSON.parse(stored) : {};
      const cleaned = sanitizeFilters(parsed, { productCategories, brands });
      const hasStored = cleaned && typeof cleaned === "object" && Object.keys(cleaned).length > 0;
      if (!searchParams.toString() && hasStored) {
        setFilters(cleaned);
      } else if (!searchParams.toString()) {
        setFilters({});
      } else {
        setFilters({});
        sessionStorage.setItem("filters", JSON.stringify({}));
      }
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, productCategories, brands]);

  useEffect(() => {
    if (!ready) return;
    const qs = createSearchParamsHelper(filters);
    const current = searchParams.toString();
    if (qs === current) return;
    if (qs) setSearchParams(new URLSearchParams(qs), { replace: true });
    else setSearchParams({}, { replace: true });
  }, [filters, ready, searchParams, setSearchParams]);

  useEffect(() => {
    if (!ready) return;
    dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParams: sort }));
  }, [dispatch, sort, filters, ready]);

  const count = productList?.length || 0;
  const activeCategories = filters?.category || [];
  const pageTitle =
    activeCategories.length === 1
      ? categoryOptionsMap[activeCategories[0]] || "Shop All Drops"
      : "Shop All Drops";

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf via-white to-leaf/20">
      <div className="bg-forest text-white">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="flex items-center gap-2 text-gold/80 text-xs uppercase tracking-[0.3em] mb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>{brand.company}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{pageTitle}</h1>
          <p className="text-white/70 text-sm mt-2">
            {isLoading ? "Loading..." : `${count} Ayurvedic wellness product${count !== 1 ? "s" : ""}`} · {brand.tagline}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[calc(var(--header-h,120px)+12px)]">
              <ProductFilter filters={filters} handleFilter={handleFilter} />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden rounded-full border-forest/20 text-forest gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full max-w-sm p-0">
                    <div className="p-4 pt-12">
                      <ProductFilter
                        filters={filters}
                        handleFilter={handleFilter}
                        onClose={() => setFilterOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-forest">{count}</span> product{count !== 1 ? "s" : ""}
                </p>

                {activeCategories.map((catId) => (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => handleFilter("category", catId)}
                    className="inline-flex items-center gap-1 text-xs bg-forest text-white px-3 py-1 rounded-full"
                  >
                    {categoryOptionsMap[catId]}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-forest/20 text-forest gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                  <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                    {sortOptions.map((item) => (
                      <DropdownMenuRadioItem key={item.id} value={item.id}>
                        {item.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-forest animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">Loading products...</p>
              </div>
            ) : count > 0 ? (
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {productList.map((product) => (
                  <ShoppingProductTile
                    key={product._id}
                    product={product}
                    handleGetProductDetails={(id) => dispatch(fetchProductDetails(id))}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-forest/10">
                <Leaf className="w-12 h-12 text-forest/20 mx-auto mb-4" />
                <p className="font-display text-xl font-bold text-forest mb-2">No products found</p>
                <p className="text-muted-foreground text-sm mb-4">Try clearing your filters</p>
                <Button onClick={clearAllFilters} variant="outline" className="rounded-full border-forest/20 text-forest">
                  Clear filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ShoppingListing;
