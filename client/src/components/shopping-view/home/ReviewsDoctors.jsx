import { Card, CardContent } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Star, BadgeCheck } from "lucide-react";

export function Testimonials() {
  const { testimonials = [] } = useSiteSettings();
  const list = Array.isArray(testimonials) ? testimonials.filter((t) => t && t.text) : [];
  if (!list.length) return null;

  return (
    <section className="py-16 bg-leaf">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-forest mb-10">
          Customer Reviews
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((t, idx) => {
            const count = Math.max(1, Math.min(5, Number(t.rating) || 5));
            return (
              <Card key={idx} className="glass border-0">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: count }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-forest">{t.name || "Customer"}</p>
                      <p className="text-xs text-muted-foreground">{t.city || "India"}</p>
                    </div>
                    {t.verified && (
                      <span className="flex items-center gap-1 text-xs text-forest bg-forest/10 px-2 py-1 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function DoctorsSection() {
  const { brand = {}, doctors = [] } = useSiteSettings();
  const list = Array.isArray(doctors) ? doctors.filter((d) => d && d.name) : [];
  if (!list.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-forest mb-3">
          Recommended by Experts
        </h2>
        <p className="text-center text-muted-foreground mb-10">Ayurvedic physicians who trust {brand.name || "Wellmaats"}</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {list.map((doc, idx) => (
            <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-forest to-forest/70 flex items-center justify-center text-white text-2xl font-display font-bold mb-4">
                  {(doc.name || "D").split(" ")[1]?.[0] || doc.name?.[0] || "D"}
                </div>
                <h3 className="font-semibold text-forest">{doc.name}</h3>
                <p className="text-gold text-sm">{doc.title || "Ayurvedic Doctor"}</p>
                <p className="text-xs text-muted-foreground mt-1">{doc.exp || "10+ years"} experience</p>
                <p className="text-sm mt-2">{doc.specialty || "Ayurveda Specialist"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
