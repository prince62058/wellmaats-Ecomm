import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";

// ── Default slides — show beautifully with no images ──────
const DEFAULTS = [
  {
    badge:    "🏆 Best Seller",
    title:    "Immunity & Wellness Drops",
    subtitle: "35+ Ayurvedic herbs in one powerful drop. Boost your immunity naturally.",
    cta:      "Shop Now",
    link:     "/shop/listing",
    bg:       "from-[#0d3d22] via-[#1a5c38] to-[#2d7a4f]",
    accent:   "#C8A54A",
    tag1:     "35+ Herbs",
    tag2:     "Lab Tested",
    tag3:     "GMP Certified",
    image:    "",
  },
  {
    badge:    "✨ New Formula",
    title:    "Stress Relief & Deep Sleep",
    subtitle: "Ashwagandha + Brahmi formula for calm mind and restful sleep.",
    cta:      "Explore Now",
    link:     "/shop/listing",
    bg:       "from-[#1a1a4a] via-[#2d2d7a] to-[#3d3d9a]",
    accent:   "#f0c040",
    tag1:     "Ashwagandha",
    tag2:     "Brahmi",
    tag3:     "Deep Sleep",
    image:    "",
  },
  {
    badge:    "🌸 Women's Special",
    title:    "Women's Wellness Range",
    subtitle: "Shatavari drops crafted for hormonal balance and women's vitality.",
    cta:      "Discover",
    link:     "/shop/listing",
    bg:       "from-[#4a0d3a] via-[#6b1f5a] to-[#8b3a7a]",
    accent:   "#f9c6e0",
    tag1:     "Shatavari",
    tag2:     "PCOS Care",
    tag3:     "Hormone Balance",
    image:    "",
  },
  {
    badge:    "🌿 Detox Special",
    title:    "Liver Detox & Cleanse",
    subtitle: "Kutki & Kalmegh formula for complete liver health and detox.",
    cta:      "Buy Now",
    link:     "/shop/listing",
    bg:       "from-[#3a1a04] via-[#6b3810] to-[#8b5a20]",
    accent:   "#f4c87a",
    tag1:     "Kutki",
    tag2:     "Kalmegh",
    tag3:     "Liver Health",
    image:    "",
  },
];

// Merge DB slide with defaults (DB fields override, but fallback to DEFAULTS)
function mergeSlide(dbSlide, i) {
  const def = DEFAULTS[i % DEFAULTS.length];
  return {
    ...def,
    ...dbSlide,
    // if DB doesn't have bg, keep default gradient
    bg:     dbSlide.gradient ? "" : def.bg,
    _dbGradient: dbSlide.gradient || "",
  };
}

export default function HeroCarousel() {
  const { heroSlides } = useSiteSettings();
  const raw    = heroSlides?.length ? heroSlides : DEFAULTS;
  const slides = raw.map((s, i) => (heroSlides?.length ? mergeSlide(s, i) : s));

  const [cur,    setCur]    = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 5500);
  }, [slides.length]);

  useEffect(() => { if (!paused) startTimer(); else clearInterval(timer.current); return () => clearInterval(timer.current); }, [paused, startTimer]);

  function go(dir) { setCur((c) => (c + dir + slides.length) % slides.length); startTimer(); }

  const s = slides[cur];

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ minHeight: 340, height: "min(72vh, 600px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background slide panels ── */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === cur ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {/* Gradient BG — always shows */}
          <div
            className={`absolute inset-0 ${slide.bg ? `bg-gradient-to-br ${slide.bg}` : ""}`}
            style={slide._dbGradient ? { background: `linear-gradient(135deg, ${slide._dbGradient})` } : {}}
          />

          {/* Product image — right side, if provided */}
          {slide.image && (
            <div className="absolute inset-y-0 right-0 w-1/2 md:w-[45%]">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center opacity-40 md:opacity-60"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              {/* subtle fade so image blends into gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-current via-transparent to-transparent opacity-80" />
            </div>
          )}

          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-white/4 pointer-events-none" />
          <div className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full bg-white/6 pointer-events-none" />
        </div>
      ))}

      {/* ── Content ── */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="max-w-lg md:max-w-xl">

            {/* Badge */}
            {s.badge && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-5 shadow-md"
                style={{ backgroundColor: s.accent + "22", color: s.accent || "#C8A54A", border: `1px solid ${s.accent || "#C8A54A"}55` }}
              >
                {s.badge}
              </span>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
              {s.title}
            </h1>

            {/* Subtitle */}
            <p className="text-white/75 text-sm md:text-base mb-6 max-w-sm leading-relaxed">
              {s.subtitle}
            </p>

            {/* Herb/feature tags */}
            {(s.tag1 || s.tag2 || s.tag3) && (
              <div className="flex flex-wrap gap-2 mb-7">
                {[s.tag1, s.tag2, s.tag3].filter(Boolean).map((tag, ti) => (
                  <span key={ti} className="text-[11px] font-semibold text-white/80 bg-white/10 border border-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={s.link || "/shop/listing"}>
                <button
                  className="flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                  style={{ backgroundColor: s.accent || "#C8A54A", color: "#fff" }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {s.cta || "Shop Now"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/shop/listing">
                <button className="text-white/85 hover:text-white border border-white/30 hover:border-white/60 bg-white/8 hover:bg-white/15 backdrop-blur-sm font-semibold text-sm px-6 py-3.5 rounded-full transition-all">
                  View All Products
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav arrows ── */}
      <button onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm transition">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm transition">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── Dots ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setCur(i); startTimer(); }}
            className={`rounded-full transition-all ${i === cur ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"}`} />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-5 right-5 z-30 text-white/50 text-xs font-mono">
        {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </div>
  );
}
