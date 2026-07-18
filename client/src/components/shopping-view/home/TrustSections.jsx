import { Card, CardContent } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/use-site-settings";
import ScrollReveal from "./ScrollReveal";
import {
  Leaf, ShieldCheck, FlaskConical, Ban, Heart, Flag, Truck, Lock,
} from "lucide-react";

const iconMap = {
  Leaf, ShieldCheck, FlaskConical, Ban, Heart, Flag, Truck, Lock,
};

export function WhyChooseUs() {
  const { brand, whyChooseUs } = useSiteSettings();

  return (
    <section className="py-16 bg-leaf">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forest">
            Why Choose {brand.name}
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {whyChooseUs.map((item, i) => {
            const isImg = item.icon && (item.icon.startsWith("http") || item.icon.startsWith("/"));
            const Icon = iconMap[item.icon] || Leaf;
            return (
              <ScrollReveal key={item.title} delay={i * 70}>
                <Card className="glass border-0 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mx-auto rounded-full bg-forest/10 flex items-center justify-center mb-4">
                      {isImg
                        ? <img src={item.icon} alt={item.title} className="w-6 h-6 object-contain" />
                        : <Icon className="w-6 h-6 text-forest" />}
                    </div>
                    <h3 className="font-semibold text-forest mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
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

export function HealthBenefits() {
  const { healthBenefits } = useSiteSettings();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-forest mb-10">
          Health Benefits
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthBenefits.map((item, i) => (
            <div
              key={item.title}
              className="p-5 rounded-2xl bg-gradient-to-br from-leaf to-white border border-forest/10 hover:border-forest/30 hover:shadow-md transition-all"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <h3 className="font-semibold text-forest mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
