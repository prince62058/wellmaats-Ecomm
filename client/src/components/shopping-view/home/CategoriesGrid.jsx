import { Card, CardContent } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useNavigate } from "react-router-dom";
import {
  Shield, Heart, Wind, Brain, Bone, Sparkles,
  Activity, Scale, Droplets, Baby, Flame, Stethoscope,
} from "lucide-react";

const categoryIcons = {
  "immunity-drops": Shield,
  "digestive-care": Flame,
  "liver-care": Droplets,
  "lung-care": Wind,
  "heart-wellness": Heart,
  "stress-relief": Brain,
  "joint-pain-relief": Bone,
  "womens-wellness": Sparkles,
  "mens-wellness": Activity,
  "diabetes-support": Stethoscope,
  "weight-management": Scale,
  "skin-hair-care": Sparkles,
  "kids-wellness": Baby,
};

import ScrollReveal from "./ScrollReveal";

function CategoriesGrid() {
  const navigate = useNavigate();
  const { productCategories } = useSiteSettings();

  function handleCategoryClick(categoryId) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId] }));
    navigate(`/shop/listing?category=${categoryId}`);
  }

  return (
    <section className="py-14 md:py-16 bg-white relative z-10">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-10">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-2">Our Range</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forest mb-3">
            Shop by Wellness
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover Ayurvedic drops tailored for every health need
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productCategories.map((cat, i) => {
            const Icon = categoryIcons[cat.id] || Shield;
            return (
              <ScrollReveal key={cat.id} delay={i * 50}>
                <Card
                  onClick={() => handleCategoryClick(cat.id)}
                  className="cursor-pointer hover:shadow-xl hover:border-forest/30 hover:-translate-y-1 transition-all duration-300 border-2 border-transparent h-full"
                >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-leaf flex items-center justify-center mb-3">
                    <Icon className="w-7 h-7 text-forest" />
                  </div>
                  <span className="font-semibold text-sm text-forest">{cat.label}</span>
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
