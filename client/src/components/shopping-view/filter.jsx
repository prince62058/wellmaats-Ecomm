import { useSiteSettings } from "@/hooks/use-site-settings";
import { Check, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import DynamicIcon from "@/components/common/dynamic-icon";

function ProductFilter({ filters, handleFilter, onClose }) {
  const { productCategories } = useSiteSettings();
  const [expandedCats, setExpandedCats] = useState({});

  const activeCount = filters
    ? Object.values(filters).reduce((n, arr) => n + (arr?.length || 0), 0)
    : 0;

  function toggleExpand(catId, e) {
    e?.stopPropagation();
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

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

        <div className="grid grid-cols-1 gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 -mr-1">
          {productCategories.map((option) => {
            const isCatActive = filters?.category?.includes(option.id);
            const hasSubs = (option.subCategories || []).length > 0;
            const isExpanded = expandedCats[option.id] ?? isCatActive;

            return (
              <div key={option.id} className="space-y-1">
                <div
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all ${
                    isCatActive
                      ? "bg-forest text-white border-forest shadow-sm"
                      : "bg-white text-forest border-forest/10 hover:border-forest/30 hover:bg-leaf/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleFilter("category", option.id)}
                    className="flex items-center gap-2.5 flex-1 text-left min-w-0"
                  >
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isCatActive ? "bg-white/20 border-white/40" : "border-forest/20 bg-leaf/50"
                      }`}
                    >
                      {isCatActive && <Check className="w-3 h-3" />}
                    </span>
                    <DynamicIcon
                      icon={option.icon}
                      categoryId={option.id}
                      className={`w-4 h-4 shrink-0 object-contain ${isCatActive ? "text-white" : "text-forest/70"}`}
                    />
                    <span className="text-sm font-medium leading-tight truncate">{option.label}</span>
                  </button>

                  {hasSubs && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(option.id, e)}
                      className={`p-1 rounded-lg transition-colors ${
                        isCatActive ? "hover:bg-white/20 text-white" : "hover:bg-forest/10 text-forest/60"
                      }`}
                      aria-label="Toggle subcategories"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories list */}
                {hasSubs && isExpanded && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-forest/15 ml-3">
                    {option.subCategories.map((sub) => {
                      const isSubActive = filters?.subCategory?.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleFilter("subCategory", sub.id)}
                          className={`flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isSubActive
                              ? "bg-forest/15 text-forest font-bold border border-forest/30"
                              : "text-forest/75 hover:text-forest hover:bg-forest/5"
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isSubActive ? "bg-forest text-white border-forest" : "border-forest/20 bg-white"
                            }`}
                          >
                            {isSubActive && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
