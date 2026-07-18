import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Award, ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/shopping-view/home/ScrollReveal";
import { useSiteSettings } from "@/hooks/use-site-settings";

function BestSellers() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { productList } = useSelector((s) => s.shopProducts);
  const { user } = useSelector((s) => s.auth);
  const { productCategories } = useSiteSettings();
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
  }, [dispatch]);

  const allBestSellers = (productList || []).filter((p) => p.isFeatured || p.averageReview >= 4);
  const filtered = activeCategory === "all" ? allBestSellers : allBestSellers.filter((p) => p.category === activeCategory);

  function handleGetProductDetails(id) { dispatch(fetchProductDetails(id)); }
  function handleAddtoCart(productId) {
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then((d) => {
      if (d?.payload?.success) { dispatch(fetchCartItems(user?.id)); toast({ title: "Added to cart!" }); }
    });
  }

  const catTabs = [{ id: "all", label: "All" }, ...(productCategories || [])];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d6a4f] to-forest text-white py-10 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Top Rated</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Best Sellers</h1>
          <p className="text-white/75 text-sm">Our most loved Ayurvedic products — chosen by 50,000+ customers.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Mobile category chips */}
        <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {catTabs.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-forest text-white"
                  : "bg-leaf text-forest border border-forest/15"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:block md:w-52 shrink-0">
          <div className="sticky top-[calc(var(--header-h,120px)+12px)] bg-white rounded-2xl border border-forest/10 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Browse by Category</p>
            <div className="space-y-0.5">
              {catTabs.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id
                      ? "bg-forest text-white font-semibold"
                      : "text-forest/70 hover:bg-leaf hover:text-forest"
                  }`}
                >
                  {cat.label}
                  {activeCategory === cat.id && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} products found</p>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((product, i) => (
                <ScrollReveal key={product._id} delay={i * 40}>
                  <ShoppingProductTile product={product} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">No products in this category.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BestSellers;
