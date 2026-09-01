import { Card, CardContent } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useNavigate } from "react-router-dom";
import DynamicIcon from "@/components/common/dynamic-icon";
import ScrollReveal from "./ScrollReveal";

function CategoriesGrid() {
  const navigate = useNavigate();
  const { productCategories } = useSiteSettings();

  function handleCategoryClick(categoryId) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId] }));
    navigate(`/shop/listing?category=${categoryId}`);
  }

  return (
    <section className="py-14 md:py-16 bg-gradient-to-b from-white via-leaf/20 to-white relative z-10">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-10 md:mb-12">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-2">
            Our Range
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forest mb-3">
            Shop by Wellness
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Discover Ayurvedic drops tailored for every health need
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {productCategories.map((cat, i) => {
            return (
              <ScrollReveal key={cat.id || i} delay={i * 40}>
                <Card
                  onClick={() => handleCategoryClick(cat.id)}
                  className="group cursor-pointer bg-white hover:bg-gradient-to-b hover:from-white hover:to-leaf/40 hover:shadow-xl hover:shadow-forest/5 hover:border-forest/30 hover:-translate-y-1.5 transition-all duration-300 border border-gray-100/90 rounded-2xl h-full overflow-hidden"
                >
                  <CardContent className="flex flex-col items-center justify-center p-5 sm:p-6 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-leaf group-hover:bg-forest/10 border border-forest/10 flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm overflow-hidden">
                      <DynamicIcon
                        icon={cat.icon}
                        categoryId={cat.id}
                        className="w-7 h-7 sm:w-8 sm:h-8 text-forest group-hover:text-forest transition-colors object-contain"
                      />
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-forest group-hover:text-forest-700 transition-colors leading-tight line-clamp-2">
                      {cat.label}
                    </span>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoriesGrid;
