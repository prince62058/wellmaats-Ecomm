import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Truck, Leaf, Sparkles, Heart, Zap, Shield, Moon, Flower2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HERBS = [
  { icon: Leaf,     name: "Ashwagandha",  benefit: "Stress & Anxiety",  color: "from-emerald-600 to-green-800" },
  { icon: Sparkles, name: "Shatavari",    benefit: "Women's Wellness",  color: "from-pink-500 to-rose-700" },
  { icon: Heart,    name: "Arjuna",       benefit: "Heart Health",       color: "from-red-500 to-rose-800" },
  { icon: Zap,      name: "Shilajit",     benefit: "Energy & Stamina",  color: "from-amber-500 to-yellow-700" },
  { icon: Shield,   name: "Neem",         benefit: "Immunity Boost",    color: "from-lime-600 to-green-700" },
  { icon: Moon,     name: "Brahmi",       benefit: "Mind & Memory",     color: "from-violet-600 to-purple-800" },
  { icon: Flower2,  name: "Tulsi",        benefit: "Respiratory Care",  color: "from-teal-500 to-cyan-700" },
  { icon: Sparkles, name: "Kutki",        benefit: "Liver Detox",       color: "from-orange-500 to-amber-700" },
];

const STEPS = [
  {
    icon: Leaf,
    title: "Browse & Choose",
    desc: "Explore 12+ Ayurvedic drops by wellness need — immunity, gut, stress & more.",
    tag: "Step 01",
  },
  {
    icon: ShoppingBag,
    title: "Add to Cart",
    desc: "Pick your drops, secure checkout with Razorpay — UPI, cards & wallets.",
    tag: "Step 02",
  },
  {
    icon: Truck,
    title: "Wellness Delivered",
    desc: "Pan-India express delivery. Start your daily Ayurvedic routine at home.",
    tag: "Step 03",
  },
];

function HowItWorks() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const update = () => {
      const rect = container.getBoundingClientRect();
      const scrollRange = container.offsetHeight - window.innerHeight;
      const progress =
        scrollRange <= 0 ? 0 : Math.min(Math.max(-rect.top / scrollRange, 0), 1);
      const step = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setActiveStep(step);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const ActiveIcon = STEPS[activeStep].icon;

  return (
    <section ref={containerRef} className="relative h-[280vh] bg-gradient-to-b from-white to-leaf">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-gold text-xs font-bold uppercase tracking-[0.35em] mb-4">
              How it works
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-forest leading-tight mb-6">
              From browse to wellness
              <span className="text-gradient-gold"> in minutes</span>
            </h2>

            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={`rounded-2xl border p-5 transition-all duration-500 ${
                    activeStep === i
                      ? "border-forest/30 bg-white shadow-lg scale-[1.02]"
                      : "border-forest/10 bg-white/60 opacity-60"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">
                    {step.tag}
                  </p>
                  <h3 className="font-display text-xl font-bold text-forest">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                </div>
              ))}
            </div>

            <Link to="/shop/listing" className="inline-block mt-8">
              <Button className="btn-gold rounded-full px-8 h-12">Start Shopping</Button>
            </Link>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-72 h-[420px] rounded-[2rem] bg-gradient-to-br from-forest to-[#0a1f17] shadow-2xl p-8 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,165,74,0.2),transparent_60%)]" />
              <div className="relative">
                <p className="text-white/60 text-xs uppercase tracking-widest">Mother Tatwa</p>
                <p className="text-white font-display text-2xl font-bold mt-1">Wellness App</p>
              </div>
              <div
                key={activeStep}
                className="relative flex flex-col items-center text-center animate-fade-up"
              >
                <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                  <ActiveIcon className="w-10 h-10 text-gold" />
                </div>
                <p className="text-gold text-xs font-bold uppercase tracking-widest mb-2">
                  {STEPS[activeStep].tag}
                </p>
                <p className="text-white font-display text-xl font-bold">
                  {STEPS[activeStep].title}
                </p>
              </div>
              <div className="relative flex gap-2 justify-center">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      activeStep === i ? "w-8 bg-gold" : "w-2 bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Ingredients strip — visible as scroll reaches bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold text-xs font-bold uppercase tracking-[0.35em] mb-2">Nature's Pharmacy</p>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-forest">
              35+ Potent Ayurvedic Herbs
            </h3>
            <p className="text-sm text-forest/60 mt-2 max-w-md mx-auto">
              Every drop of Mother Tatwa is crafted from time-tested Ayurvedic herbs, scientifically validated for modern wellness.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {HERBS.map((herb) => {
              const Icon = herb.icon;
              return (
                <div key={herb.name}
                  className="group flex flex-col items-center text-center gap-2 cursor-default">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${herb.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-bold text-forest leading-tight">{herb.name}</p>
                  <p className="text-[10px] text-forest/55 leading-tight">{herb.benefit}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            {["🌿 100% Natural", "🔬 Lab Tested", "✅ GMP Certified", "🚫 No Side Effects", "🇮🇳 Made in India"].map((tag) => (
              <span key={tag} className="text-xs font-semibold text-forest/70 bg-white/70 backdrop-blur-sm border border-forest/15 px-4 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
