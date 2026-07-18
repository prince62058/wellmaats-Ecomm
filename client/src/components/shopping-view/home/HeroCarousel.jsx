import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";

const DEFAULTS = [
  {
    badge: "🏆 Best Seller",
    title: "Immunity & Wellness Drops",
    subtitle: "35+ Ayurvedic herbs in one powerful drop. Boost your immunity naturally.",
    cta: "Shop Now",
    link: "/shop/listing",
    bg: "linear-gradient(135deg,#0d3d22 0%,#1a5c38 60%,#2d7a4f 100%)",
    accent: "#C8A54A",
    image: "",
    video: "",
  },
  {
    badge: "✨ New Formula",
    title: "Stress Relief & Deep Sleep",
    subtitle: "Ashwagandha + Brahmi formula for calm mind and restful sleep.",
    cta: "Explore Now",
    link: "/shop/listing",
    bg: "linear-gradient(135deg,#1a1a4a 0%,#2d2d7a 60%,#3d3d9a 100%)",
    accent: "#f0c040",
    image: "",
    video: "",
  },
  {
    badge: "🌸 Women's Special",
    title: "Women's Wellness Range",
    subtitle: "Shatavari drops for hormonal balance and vitality.",
    cta: "Discover",
    link: "/shop/listing",
    bg: "linear-gradient(135deg,#4a0d3a 0%,#6b1f5a 60%,#8b3a7a 100%)",
    accent: "#f9c6e0",
    image: "",
    video: "",
  },
  {
    badge: "🌿 Detox Special",
    title: "Liver Detox & Cleanse",
    subtitle: "Kutki & Kalmegh formula for complete liver health.",
    cta: "Buy Now",
    link: "/shop/listing",
    bg: "linear-gradient(135deg,#3a1a04 0%,#6b3810 60%,#8b5a20 100%)",
    accent: "#f4c87a",
    image: "",
    video: "",
  },
];

export default function HeroCarousel() {
  const { heroSlides } = useSiteSettings();
  const slides = heroSlides?.length ? heroSlides : DEFAULTS;

  const [cur, setCur]     = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 5500);
  }, [slides.length]);

  useEffect(() => {
    if (!paused) startTimer();
    else clearInterval(timer.current);
    return () => clearInterval(timer.current);
  }, [paused, startTimer]);

  function go(dir) { setCur((c) => (c + dir + slides.length) % slides.length); startTimer(); }

  const s = slides[cur];

  // Determine background style for current slide
  const hasBg = s.bg && !s.image && !s.video;
  const bgStyle = hasBg
    ? { background: s.bg }
    : {};

  return (
    <div
      className="relative w-full overflow-hidden select-none min-h-[240px] sm:min-h-[340px]"
      style={{ height: "min(62vh, 620px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slide layers ── */}
      {slides.map((slide, i) => {
        const active = i === cur;
        const slideBg = slide.bg && !slide.image && !slide.video
          ? { background: slide.bg }
          : {};
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${active ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {/* Solid BG (shown always as base) */}
            <div className="absolute inset-0" style={slideBg} />

            {/* Video background */}
            {slide.video && (
              <video
                key={slide.video}
                src={slide.video}
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            )}

            {/* Image background */}
            {slide.image && !slide.video && (
              <img
                src={slide.image}
                alt={slide.title || ""}
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}

            {/* Dark overlay for text readability — only when image/video is present */}
            {(slide.image || slide.video) && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />
            )}

            {/* Subtle gradient even on solid bg slides */}
            {!slide.image && !slide.video && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
            )}

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white/4 pointer-events-none" />
          </div>
        );
      })}

      {/* ── Text content ── */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="max-w-lg md:max-w-2xl">
            {s.badge && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-5 shadow"
                style={{ backgroundColor: (s.accent || "#C8A54A") + "25", color: s.accent || "#C8A54A", border: `1px solid ${s.accent || "#C8A54A"}55` }}
              >
                {s.badge}
              </span>
            )}

            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 sm:mb-4 drop-shadow-lg">
              {s.title}
            </h1>

            <p className="text-white/80 text-sm md:text-base mb-5 sm:mb-7 max-w-md leading-relaxed drop-shadow line-clamp-3 sm:line-clamp-none">
              {s.subtitle}
            </p>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap pb-8 sm:pb-0">
              <Link to={s.link || "/shop/listing"}>
                <button
                  className="flex items-center gap-2 font-bold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                  style={{ backgroundColor: s.accent || "#C8A54A", color: "#fff" }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {s.cta || "Shop Now"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/shop/listing">
                <button className="text-white/85 hover:text-white border border-white/40 hover:border-white/70 bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full transition-all">
                  View All
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Arrows ── */}
      {slides.length > 1 && <>
        <button onClick={() => go(-1)} className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/55 text-white rounded-full p-2.5 backdrop-blur-sm transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => go(1)} className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/55 text-white rounded-full p-2.5 backdrop-blur-sm transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </>}

      {/* ── Dots ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setCur(i); startTimer(); }}
            className={`rounded-full transition-all ${i === cur ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/45 hover:bg-white/70"}`} />
        ))}
      </div>

      {/* slide counter */}
      <div className="absolute bottom-5 right-5 z-30 text-white/40 text-xs font-mono hidden sm:block">
        {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </div>
  );
}
