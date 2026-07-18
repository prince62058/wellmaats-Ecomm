import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Tag, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/shopping-view/home/ScrollReveal";
import { useSiteSettings } from "@/hooks/use-site-settings";

function OfferZone() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { productList } = useSelector((s) => s.shopProducts);
  const { user } = useSelector((s) => s.auth);
  const { quickFilters } = useSiteSettings();
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
  }, [dispatch]);

  const dealsAll = (productList || []).filter((p) => p.salePrice > 0 && p.salePrice < p.price);
  const deals = activeFilter === "all" ? dealsAll : dealsAll.filter((p) => p.category === activeFilter);

  function handleGetProductDetails(id) { dispatch(fetchProductDetails(id)); }
  function handleAddtoCart(productId) {
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then((d) => {
      if (d?.payload?.success) { dispatch(fetchCartItems(user?.id)); toast({ title: "Added to cart!" }); }
    });
  }

  const tabs = [{ label: "All Deals", category: "all" }, ...(quickFilters || [])];

  return (
    <div className="min-h-screen bg-white">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-forest to-emerald-600 text-white py-10 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-6 h-6 text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Exclusive Savings</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Offer Zone</h1>
          <p className="text-white/75 text-sm">Genuine discounts on authentic Ayurvedic products — limited time only.</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/15 rounded-full px-4 py-1.5 font-semibold">🔥 Upto 40% Off</span>
            <span className="bg-white/15 rounded-full px-4 py-1.5 font-semibold">🚚 Free Shipping Available</span>
            <span className="bg-white/15 rounded-full px-4 py-1.5 font-semibold">✅ {dealsAll.length} Active Deals</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">
          {tabs.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveFilter(t.category)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                activeFilter === t.category
                  ? "bg-forest text-white border-forest"
                  : "bg-white text-forest/70 border-forest/20 hover:border-forest"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {deals.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              <SlidersHorizontal className="w-4 h-4 inline mr-1" />
              {deals.length} deals found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {deals.map((product, i) => (
                <ScrollReveal key={product._id} delay={i * 40}>
                  <ShoppingProductTile product={product} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
                </ScrollReveal>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <Tag className="w-12 h-12 text-forest/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No deals in this category right now.</p>
            <Button variant="outline" onClick={() => setActiveFilter("all")} className="mt-4">View All Deals</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfferZone;
