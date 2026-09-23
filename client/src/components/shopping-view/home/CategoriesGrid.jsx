import { Card, CardContent } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useNavigate } from "react-router-dom";
import DynamicIcon from "@/components/common/dynamic-icon";
import ScrollReveal from "./ScrollReveal";
import { ArrowRight, ArrowUpRight } from "lucide-react";

// Two tasteful, brand-consistent accent treatments that alternate across the
// grid so it feels curated rather than flat/mono.
const ACCENTS = [
  {
    iconWrap: "bg-gradient-to-br from-forest-50 to-leaf",
    ring: "ring-forest-100 group-hover:ring-forest-200",
    icon: "text-forest-700",
    glow: "group-hover:bg-forest-500/10",
  },
  {
    iconWrap: "bg-gradient-to-br from-amber-50 to-gold/10",
    ring: "ring-gold/20 group-hover:ring-gold/40",
    icon: "text-forest-800",
    glow: "group-hover:bg-gold/15",
  },
];

function CategoriesGrid() {
  const navigate = useNavigate();
  const { productCategories } = useSiteSettings();

  function handleCategoryClick(categoryId) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId] }));
    navigate(`/shop/listing?category=${categoryId}`);
  }

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-white via-leaf/20 to-white relative z-10 overflow-hidden">
      {/* soft decorative backdrop */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-forest-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal className="text-center mb-11 md:mb-14">
          <p className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-[0.3em] mb-3">
            <span className="h-px w-6 bg-gold/60" />
            Our Range
            <span className="h-px w-6 bg-gold/60" />
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-forest-900 mb-3">
            Shop by Wellness
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Discover Ayurvedic drops tailored for every health need
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {productCategories.map((cat, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <ScrollReveal key={cat.id || i} delay={i * 45}>
                <Card
                  onClick={() => handleCategoryClick(cat.id)}
                  className="group relative cursor-pointer bg-white/90 backdrop-blur-sm border border-forest-100/70 hover:border-gold/40 rounded-[1.5rem] sm:rounded-[1.75rem] h-full overflow-hidden shadow-[0_1px_3px_rgba(16,134,68,0.06)] hover:shadow-2xl hover:shadow-forest-900/10 hover:-translate-y-2 transition-all duration-500 ease-out"
                >
                  {/* corner glow on hover */}
                  <div
                    className={`pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${accent.glow}`}
                  />

                  <CardContent className="relative flex flex-col items-center justify-center p-5 sm:p-7 text-center">
                    <div
                      className={`relative w-14 h-14 sm:w-[4.25rem] sm:h-[4.25rem] rounded-full ${accent.iconWrap} ring-1 ${accent.ring} flex items-center justify-center mb-3.5 sm:mb-4 group-hover:scale-110 transition-all duration-500 ease-out shadow-sm overflow-hidden`}
                    >
                      <DynamicIcon
                        icon={cat.icon}
                        categoryId={cat.id}
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${accent.icon} transition-transform duration-500 group-hover:scale-110 object-contain`}
                      />
                    </div>

                    <span className="font-semibold text-xs sm:text-sm text-forest-900 group-hover:text-forest-700 tracking-wide leading-tight line-clamp-2 transition-colors">
                      {cat.label}
                    </span>

                    <span className="mt-1.5 sm:mt-2 h-4 flex items-center gap-1 text-[10px] font-semibold text-gold uppercase tracking-wider opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Explore
                      <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                    </span>
                  </CardContent>

                  {/* animated bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest via-gold to-forest scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-500 ease-out" />
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="flex justify-center mt-10 md:mt-12" delay={productCategories.length * 45 + 100}>
          <button
            onClick={() => navigate("/shop/listing")}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-forest-800 border border-forest-200 hover:border-gold/50 bg-white hover:bg-leaf/40 rounded-full px-6 py-2.5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            View All Categories
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default CategoriesGrid;
