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
    bg: "linear-gradient(135deg,#0a542b 0%,#108644 60%,#1aad58 100%)",
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
  const hasMedia = Boolean(s?.image || s?.video);
  // Show text overlay only if explicitly enabled (or default true) AND text exists, or if no media exists
  const showText = s?.showTextOverlay !== false && (Boolean(s?.title?.trim() || s?.badge?.trim()) || !hasMedia);

  return (
    <div
      className="relative w-full overflow-hidden select-none aspect-[16/8] sm:aspect-[16/7] md:aspect-[2.2/1] lg:aspect-[2.4/1] min-h-[250px] sm:min-h-[340px] md:min-h-[400px] max-h-[620px] bg-forest"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slide layers ── */}
      {slides.map((slide, i) => {
        const active = i === cur;
        const slideBg = slide.bg && !slide.image && !slide.video
          ? { background: slide.bg }
          : {};
        const slideShowText = slide.showTextOverlay !== false && (Boolean(slide.title?.trim() || slide.badge?.trim()) || (!slide.image && !slide.video));
        const fitClass = slide.fit === "contain" ? "object-contain" : "object-cover";

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
                className={`absolute inset-0 w-full h-full ${fitClass} object-center`}
              />
            )}

            {/* Image background */}
            {slide.image && !slide.video && (
              <img
                src={slide.image}
                alt={slide.title || "Banner"}
                className={`absolute inset-0 w-full h-full ${fitClass} object-center`}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}

            {/* Dark overlay for text readability — only when overlay text is enabled */}
            {(slide.image || slide.video) && slideShowText && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />
            )}

            {/* Subtle gradient even on solid bg slides */}
            {!slide.image && !slide.video && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
            )}

            {/* Clickable full banner link if overlay text is disabled */}
            {!slideShowText && (
              <Link
                to={slide.link || "/shop/listing"}
                className="absolute inset-0 z-20 cursor-pointer block"
                aria-label={slide.title || "Banner slide"}
              />
            )}
          </div>
        );
      })}

      {/* ── Text content (rendered only if text overlay is enabled) ── */}
      {showText && (
        <div className="relative z-20 h-full flex items-center pointer-events-none">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            <div className="max-w-lg md:max-w-2xl pointer-events-auto">
              {s?.badge && (
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full mb-3 sm:mb-5 shadow-sm backdrop-blur-xs"
                  style={{ backgroundColor: (s.accent || "#C8A54A") + "25", color: s.accent || "#C8A54A", border: `1px solid ${s.accent || "#C8A54A"}55` }}
                >
                  {s.badge}
                </span>
              )}

              {s?.title && (
                <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2.5 sm:mb-4 drop-shadow-md">
                  {s.title}
                </h1>
              )}

              {s?.subtitle && (
                <p className="text-white/85 text-xs sm:text-sm md:text-base mb-4 sm:mb-7 max-w-md leading-relaxed drop-shadow-sm line-clamp-2 sm:line-clamp-none">
                  {s.subtitle}
                </p>
              )}

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap pb-10 sm:pb-0">
                <Link to={s?.link || "/shop/listing"}>
                  <button
                    className="flex items-center gap-2 font-bold text-xs sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    style={{ backgroundColor: s?.accent || "#C8A54A", color: "#fff" }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {s?.cta || "Shop Now"}
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </Link>
                <Link to="/shop/listing">
                  <button className="text-white/85 hover:text-white border border-white/40 hover:border-white/70 bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold text-xs sm:text-sm px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-full transition-all">
                    View All
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Arrows ── */}
      {slides.length > 1 && <>
        <button onClick={() => go(-1)} className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => go(1)} className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </>}

      {/* ── Dots ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setCur(i); startTimer(); }}
            className={`rounded-full transition-all ${i === cur ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/45 hover:bg-white/70"}`} />
        ))}
      </div>

      {/* slide counter */}
      <div className="absolute bottom-4 right-5 z-30 text-white/40 text-xs font-mono hidden sm:block">
        {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </div>
  );
}
