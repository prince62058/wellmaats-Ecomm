import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ScrollReveal from "./ScrollReveal";
import { useSiteSettings } from "@/hooks/use-site-settings";

function SpotlightSection({ products = [], handleGetProductDetails, handleAddtoCart }) {
  const { quickFilters } = useSiteSettings();
  const [activeIdx, setActiveIdx] = useState(0);
  const tabsRef = useRef(null);

  const allTab = { label: "All Products", category: "all" };
  const tabs = [allTab, ...(quickFilters || [])];
  const active = tabs[activeIdx];

  const filtered =
    active.category === "all"
      ? products
      : products.filter((p) => p.category === active.category);

  const shown = filtered.slice(0, 8);

  function scrollTabs(dir) {
    if (tabsRef.current) tabsRef.current.scrollLeft += dir * 160;
  }

  return (
    <section className="py-10 bg-white border-b border-forest/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.35em] mb-1">Featured</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">Today's Wellness Deals</h2>
          </div>
          <Link to="/shop/listing" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-forest hover:text-gold transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="relative mb-6">
          <button
            type="button"
            onClick={() => scrollTabs(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1 border border-forest/10 hidden sm:flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-forest" />
          </button>
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-0 sm:px-6 pb-1 scroll-smooth"
          >
            {tabs.map((tab, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                  i === activeIdx
                    ? "bg-forest text-white border-forest shadow-sm"
                    : "bg-white text-forest/70 border-forest/20 hover:border-forest hover:text-forest"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollTabs(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1 border border-forest/10 hidden sm:flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-forest" />
          </button>
        </div>

        {/* Products grid */}
        {shown.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {shown.map((product, i) => (
              <ScrollReveal key={product._id} delay={i * 40}>
                <ShoppingProductTile
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No products in this category yet.
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop/listing">
            <Button variant="outline" className="border-forest text-forest rounded-full px-6">
              View All Products <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SpotlightSection;
