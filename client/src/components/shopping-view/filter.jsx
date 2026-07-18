import { useSiteSettings } from "@/hooks/use-site-settings";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { Button } from "../ui/button";

function ProductFilter({ filters, handleFilter, onClose }) {
  const { productCategories } = useSiteSettings();
  const activeCount = filters
    ? Object.values(filters).reduce((n, arr) => n + (arr?.length || 0), 0)
    : 0;

  function clearAll() {
    Object.keys(filters || {}).forEach((key) => {
      (filters[key] || []).forEach((id) => handleFilter(key, id));
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-forest/10 shadow-md overflow-hidden">
      <div className="px-5 py-4 border-b border-forest/10 flex items-center justify-between bg-gradient-to-r from-forest/8 to-leaf">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-forest" />
          </div>
          <div>
            <h2 className="font-display font-bold text-forest leading-none">Filters</h2>
            {activeCount > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{activeCount} active</p>
            )}
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="lg:hidden text-forest/50 hover:text-forest">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-forest tracking-wide">Shop by Category</h3>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gold hover:text-gold/80 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 -mr-1">
          {productCategories.map((option) => {
            const isActive = filters?.category?.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleFilter("category", option.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                  isActive
                    ? "bg-forest text-white border-forest shadow-sm"
                    : "bg-white text-forest border-forest/10 hover:border-forest/30 hover:bg-leaf/60"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    isActive ? "bg-white/20 border-white/40" : "border-forest/20 bg-leaf/50"
                  }`}
                >
                  {isActive && <Check className="w-3 h-3" />}
                </span>
                <span className="text-sm font-medium leading-tight">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-forest/10">
          <h3 className="text-sm font-semibold text-forest tracking-wide mb-3">Special Offers</h3>
          <div className="grid gap-1.5">
            {[
              { id: "flashSale", label: "⚡ Flash Sale", desc: "Limited time deals" },
              { id: "onSale", label: "🏷️ On Discount", desc: "Products with % off" },
            ].map((offer) => {
              const isActive = filters?.offers?.includes(offer.id);
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => handleFilter("offers", offer.id)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                    isActive
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-white text-forest border-forest/10 hover:border-red-200 hover:bg-red-50/50"
                  }`}
                >
                  <span className="text-sm font-medium">{offer.label}</span>
                  <span className={`text-[10px] ml-auto ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                    {offer.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="w-full rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white mt-5"
          >
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProductFilter;
