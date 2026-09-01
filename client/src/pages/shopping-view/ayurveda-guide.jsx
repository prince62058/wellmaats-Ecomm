import { useState } from "react";
import { Leaf, Sparkles, Flame, Wind, Droplets, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AyurvedaGuidePage() {
  const [activeDosha, setActiveDosha] = useState("vata");

  const doshas = {
    vata: {
      name: "Vata (Air & Space)",
      tagline: "Energy of Movement & Creativity",
      icon: Wind,
      color: "bg-blue-50 border-blue-200 text-blue-800",
      elements: "Space + Air",
      qualities: "Dry, Light, Cool, Mobile",
      signsImbalance: ["Restlessness & Anxiety", "Dry skin & hair", "Irregular digestion & gas", "Poor sleep"],
      lifestyleTips: [
        "Drink warm water and consume cooked, nourishing meals.",
        "Practice grounding routines and calming breathing (Anulom Vilom).",
        "Use Ashwagandha & Brahmi for nervous system relaxation.",
      ],
      recommendedDrops: "Stress Relief & Deep Sleep Drops",
      categoryLink: "/shop/listing?category=stress-relief",
    },
    pitta: {
      name: "Pitta (Fire & Water)",
      tagline: "Energy of Digestion & Metabolism",
      icon: Flame,
      color: "bg-amber-50 border-amber-200 text-amber-900",
      elements: "Fire + Water",
      qualities: "Hot, Sharp, Light, Acidic",
      signsImbalance: ["Acidity & Heartburn", "Skin breakouts & inflammation", "Irritability & Stress", "Liver heat"],
      lifestyleTips: [
        "Avoid overly spicy, oily, and fried foods.",
        "Stay hydrated with cooling herbal infusions like Amla & Vetiver.",
        "Take Kutki & Bhumi Amla for natural liver and gut cooling.",
      ],
      recommendedDrops: "Liver Detox & Digestive Care Drops",
      categoryLink: "/shop/listing?category=liver-care",
    },
    kapha: {
      name: "Kapha (Earth & Water)",
      tagline: "Energy of Structure & Stability",
      icon: Droplets,
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
      elements: "Earth + Water",
      qualities: "Heavy, Slow, Cool, Oily",
      signsImbalance: ["Sluggish metabolism & weight gain", "Respiratory congestion & sinus", "Lethargy & low energy", "Fluid retention"],
      lifestyleTips: [
        "Engage in vigorous daily exercise and morning sunlight exposure.",
        "Eat light, warm, and spiced meals with ginger and black pepper.",
        "Use Tulsi, Giloy, and Trikatu for metabolism and lung strength.",
      ],
      recommendedDrops: "Immunity Boosters & Respiratory Drops",
      categoryLink: "/shop/listing?category=immunity-drops",
    },
  };

  const cur = doshas[activeDosha];
  const Icon = cur.icon;

  return (
    <div className="bg-[#f9faf9] min-h-screen py-14">
      {/* Hero */}
      <section className="container mx-auto px-4 max-w-4xl text-center mb-14">
        <span className="inline-flex items-center gap-2 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
          <Leaf className="w-3.5 h-3.5" /> Ancient Ayurvedic Science
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-forest mb-4">
          The Complete <span className="text-gradient-gold">Ayurveda Guide</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
          Understand your body&apos;s unique constitution (Prakriti), the three Doshas (Vata, Pitta, Kapha), and how herbal drops restore natural equilibrium.
        </p>
      </section>

      {/* Interactive Dosha Selector */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-center gap-3 mb-8">
          {Object.keys(doshas).map((key) => {
            const d = doshas[key];
            const isSelected = activeDosha === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDosha(key)}
                className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-forest text-white shadow-md scale-105"
                    : "bg-white text-forest/70 border border-forest/10 hover:border-forest/30"
                }`}
              >
                <span className="capitalize">{key}</span>
              </button>
            );
          })}
        </div>

        {/* Active Dosha Details Card */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest/10 pb-6">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-widest">{cur.elements}</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-forest mt-1">{cur.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">{cur.tagline}</p>
            </div>
            <div className="px-4 py-2 bg-[#f4f7f4] rounded-xl text-xs font-semibold text-forest self-start">
              Qualities: {cur.qualities}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Signs of Imbalance */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-forest">Common Signs of Imbalance:</h3>
              <ul className="space-y-2">
                {cur.signsImbalance.map((sign, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ayurvedic Lifestyle Tips */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-forest">Balancing Daily Habits:</h3>
              <ul className="space-y-2">
                {cur.lifestyleTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended formulation CTA */}
          <div className="p-6 rounded-2xl bg-[#fafcfa] border border-forest/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gold uppercase tracking-wider">Recommended Formulation</p>
              <p className="font-display text-lg font-bold text-forest mt-0.5">{cur.recommendedDrops}</p>
            </div>
            <Link to={cur.categoryLink}>
              <Button className="btn-gold rounded-full px-6 text-xs font-bold">
                View Balancing Drops <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
