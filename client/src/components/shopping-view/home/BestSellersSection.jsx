import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ScrollReveal from "./ScrollReveal";

function BestSellersSection({ products = [], handleGetProductDetails, handleAddtoCart }) {
  const scrollRef = useRef(null);
  const bestSellers = products.filter((p) => p.isFeatured || p.averageReview >= 4).slice(0, 8);
  if (!bestSellers.length) return null;

  function scroll(dir) {
    if (scrollRef.current) scrollRef.current.scrollLeft += dir * 300;
  }

  return (
    <section className="py-10 bg-gradient-to-b from-leaf/30 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.35em] mb-1">Top Rated</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">Best Sellers</h2>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => scroll(-1)} className="rounded-full border border-forest/20 p-2 hover:bg-leaf transition-colors">
              <ChevronLeft className="w-4 h-4 text-forest" />
            </button>
            <button type="button" onClick={() => scroll(1)} className="rounded-full border border-forest/20 p-2 hover:bg-leaf transition-colors">
              <ChevronRight className="w-4 h-4 text-forest" />
            </button>
            <Link to="/shop/listing" className="hidden md:flex items-center gap-1 text-sm font-semibold text-forest hover:text-gold ml-2 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        >
          {bestSellers.map((product, i) => (
            <div key={product._id} className="shrink-0 w-[200px] sm:w-[220px]">
              <ScrollReveal delay={i * 50}>
                <ShoppingProductTile
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                />
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BestSellersSection;
