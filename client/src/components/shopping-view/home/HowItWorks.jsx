import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";

const STEP_COLORS = [
  "from-emerald-500 to-green-700",
  "from-amber-400 to-yellow-600",
  "from-forest to-[#0a3020]",
  "from-blue-500 to-indigo-700",
  "from-rose-500 to-pink-700",
];

export default function HowItWorks() {
  const { howItWorks } = useSiteSettings();
  if (!howItWorks?.length) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-leaf">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em] mb-2">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forest">
            From browse to wellness<span className="text-gradient-gold"> in minutes</span>
          </h2>
        </div>

        <div className={`grid grid-cols-1 gap-6 max-w-5xl mx-auto ${
          howItWorks.length <= 2
            ? "md:grid-cols-2"
            : howItWorks.length === 3
              ? "md:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
        }`}>
          {howItWorks.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center group">
              {i < howItWorks.length - 1 && howItWorks.length <= 3 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-px border-t-2 border-dashed border-forest/20 z-0" />
              )}
              <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${STEP_COLORS[i % STEP_COLORS.length]} flex items-center justify-center shadow-xl mb-5 group-hover:scale-105 transition-transform duration-300 text-3xl`}>
                {step.emoji || "🌿"}
                <span className="absolute -top-2 -right-2 bg-gold text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">{step.tag || `Step 0${i + 1}`}</p>
              <h3 className="font-display text-lg font-bold text-forest mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.desc}</p>
              {i < howItWorks.length - 1 && (
                <ArrowRight className="md:hidden w-5 h-5 text-forest/30 mt-4 rotate-90" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/shop/listing">
            <Button className="btn-gold rounded-full px-8 h-12 text-sm font-bold shadow-lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
