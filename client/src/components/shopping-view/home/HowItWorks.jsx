import { ShoppingBag, Truck, Leaf, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Leaf,
    tag: "Step 01",
    title: "Browse & Choose",
    desc: "Explore 12+ Ayurvedic drops by wellness need — immunity, gut, stress & more.",
    color: "from-emerald-500 to-green-700",
  },
  {
    icon: ShoppingBag,
    tag: "Step 02",
    title: "Add to Cart",
    desc: "Pick your drops, secure checkout with Razorpay — UPI, cards & wallets.",
    color: "from-amber-400 to-yellow-600",
  },
  {
    icon: Truck,
    tag: "Step 03",
    title: "Wellness Delivered",
    desc: "Pan-India express delivery. Start your daily Ayurvedic routine at home.",
    color: "from-forest to-[#0a3020]",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-leaf">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em] mb-2">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forest">
            From browse to wellness<span className="text-gradient-gold"> in minutes</span>
          </h2>
        </div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-px border-t-2 border-dashed border-forest/20 z-0" />
                )}
                {/* Icon circle */}
                <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-9 h-9 text-white" />
                  <span className="absolute -top-2 -right-2 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {i + 1}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">{step.tag}</p>
                <h3 className="font-display text-lg font-bold text-forest mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.desc}</p>

                {/* Mobile arrow */}
                {i < STEPS.length - 1 && (
                  <ArrowRight className="md:hidden w-5 h-5 text-forest/30 mt-4 rotate-90" />
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
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
