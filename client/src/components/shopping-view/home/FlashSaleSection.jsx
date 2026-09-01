import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ScrollReveal from "@/components/shopping-view/home/ScrollReveal";
import { Button } from "@/components/ui/button";
import { isFlashSaleActive } from "@/lib/product-offers";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

function FlashSaleSection({ products, handleGetProductDetails, handleAddtoCart }) {
  const flashProducts = (products || []).filter(isFlashSaleActive);

  if (flashProducts.length === 0) return null;

  return (
    <section className="py-14 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_60%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Zap className="w-5 h-5 fill-white" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Limited Time</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              ⚡ Flash Sale
            </h2>
            <p className="text-white/80 text-sm mt-1">Grab Ayurvedic drops at special prices — hurry!</p>
          </div>
          <Link to="/shop/listing?offers=flashSale">
            <Button variant="secondary" className="bg-white text-red-600 hover:bg-white/90 font-semibold">
              View All Deals
            </Button>
          </Link>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {flashProducts.slice(0, 4).map((product, i) => (
            <ScrollReveal key={product._id} delay={i * 60}>
              <div className="rounded-2xl ring-2 ring-white/30 overflow-hidden">
                <ShoppingProductTile
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlashSaleSection;
