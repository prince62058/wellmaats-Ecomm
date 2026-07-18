import { useSiteSettings } from "@/hooks/use-site-settings";

const EMOJI_BG = [
  "from-emerald-600 to-green-800",
  "from-pink-500 to-rose-700",
  "from-red-500 to-rose-800",
  "from-amber-500 to-yellow-700",
  "from-lime-600 to-green-700",
  "from-violet-600 to-purple-800",
  "from-teal-500 to-cyan-700",
  "from-orange-500 to-amber-700",
  "from-blue-500 to-indigo-700",
  "from-fuchsia-500 to-purple-700",
];

export default function IngredientsStrip() {
  const { herbs } = useSiteSettings();
  if (!herbs?.length) return null;

  return (
    <section className="py-14 bg-leaf border-y border-forest/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em] mb-2">Nature's Pharmacy</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">
            35+ Potent Ayurvedic Herbs
          </h2>
          <p className="text-sm text-forest/60 mt-2 max-w-md mx-auto">
            Every drop crafted from time-tested Ayurvedic herbs, scientifically validated for modern wellness.
          </p>
        </div>

        {/* Herb cards */}
        <div className="flex flex-wrap justify-center gap-5">
          {herbs.map((herb, i) => (
            <div key={i} className="group flex flex-col items-center text-center gap-2 w-20 cursor-default">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${EMOJI_BG[i % EMOJI_BG.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 text-2xl`}
              >
                {herb.emoji || "🌿"}
              </div>
              <p className="text-xs font-bold text-forest leading-tight">{herb.name}</p>
              {herb.benefit && <p className="text-[10px] text-forest/55 leading-tight">{herb.benefit}</p>}
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">
          {["🌿 100% Natural", "🔬 Lab Tested", "✅ GMP Certified", "🚫 No Side Effects", "🇮🇳 Made in India"].map((tag) => (
            <span key={tag} className="text-xs font-semibold text-forest/70 bg-white/80 border border-forest/15 px-4 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
