import { useSiteSettings } from "@/hooks/use-site-settings";
import { Leaf, ShieldCheck, Heart, Award, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
  const { brand, contact } = useSiteSettings();

  return (
    <div className="bg-[#f9faf9] min-h-screen">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-forest via-[#084728] to-forest text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 text-gold text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-white/10">
            <Leaf className="w-3.5 h-3.5" /> Ancient Wisdom, Modern Science
          </span>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Nurturing Life with the Purity of <span className="text-gradient-gold">Pure Ayurveda</span>
          </h1>
          <p className="text-white/80 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Welcome to {brand.name || "Wellmaats"}. We craft 100% natural, highly bio-available Ayurvedic drops made with ethically harvested herbs from the Himalayan foothills and Haridwar.
          </p>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="py-16 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-2">Our Foundation</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forest">Why We Stand Apart</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-forest/10 shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-6">
              <Leaf className="w-7 h-7 text-forest" />
            </div>
            <h3 className="font-display text-xl font-bold text-forest mb-3">100% Herb Extract</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No synthetic binders, heavy metals, artificial colors, or harsh chemicals. Every drop contains concentrated, pure herbal extracts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-forest/10 shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-forest" />
            </div>
            <h3 className="font-display text-xl font-bold text-forest mb-3">GMP &amp; ISO Certified</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Produced in state-of-the-art Haridwar manufacturing units adhering to strict Ayush &amp; GMP protocols with rigorous batch testing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-forest/10 shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-forest" />
            </div>
            <h3 className="font-display text-xl font-bold text-forest mb-3">Fast Sublingual Absorption</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our unique drop formulation ensures rapid sublingual and cellular absorption, giving you faster and more sustained wellness benefits.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Heritage Section */}
      <section className="py-16 bg-white border-y border-forest/5">
        <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Our Heritage</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-forest leading-tight">
              Rooted in Haridwar, Trusted Across India
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded with the vision to make authentic Ayurvedic healing convenient for modern lives, {brand.name} blends time-tested Ayurvedic texts with modern standardized botanical extraction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From Tulsi, Giloy, Ashwagandha to rare Himalayan Kutki and Shatavari, our herbs are ethically sourced directly from certified organic farmers and tribal wildcraft harvesters.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm font-semibold text-forest">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                <span>Over 35+ active medicinal herbs processed daily</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-forest">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                <span>Delivered to 28+ states and 19,000+ pin codes in India</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-forest">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                <span>Zero compromises on safety, potency, and purity</span>
              </div>
            </div>
          </div>

          <div className="bg-[#fafcfa] p-8 md:p-10 rounded-3xl border border-forest/15 shadow-sm space-y-6">
            <h3 className="font-display text-2xl font-bold text-forest">Our Core Mission</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To empower 10 million Indian households to adopt preventive, holistic Ayurvedic wellness into their daily lifestyle without cumbersome preparation.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-forest/10">
              <div>
                <p className="font-display text-3xl font-bold text-forest">100%</p>
                <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Herbal &amp; Natural</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-forest">4.8 ★</p>
                <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Customer Rating</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-forest">20k+</p>
                <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-forest">100%</p>
                <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Made In India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 text-center container mx-auto px-4 max-w-4xl">
        <h2 className="font-display text-3xl font-bold text-forest mb-4">Start Your Wellness Journey Today</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Explore our complete range of immunity, digestive, sleep, skin, and vitality drops.
        </p>
        <Link to="/shop/listing">
          <Button className="btn-gold rounded-full px-8 h-12 text-sm font-bold shadow-lg">
            Explore All Products <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
