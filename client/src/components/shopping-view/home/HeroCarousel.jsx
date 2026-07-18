import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";

const DEFAULTS = [
  {
    image: "/products/immunity.jpg",
    badge: "Best Seller",
    title: "Immunity & Wellness Drops",
    subtitle: "35+ Ayurvedic herbs in one powerful drop. Boost your immunity naturally.",
    cta: "Shop Now",
    link: "/shop/listing?category=immunity-drops",
    accent: "#40916c",
    gradient: "from-forest/90 via-forest/60 to-transparent",
  },
  {
    image: "/products/stress.jpg",
    badge: "New Formula",
    title: "Stress Relief & Deep Sleep",
    subtitle: "Ashwagandha + Brahmi formula for calm mind, better focus, and restful sleep.",
    cta: "Explore Now",
    link: "/shop/listing?category=stress-relief",
    accent: "#2d4a8b",
    gradient: "from-[#1a2a4a]/90 via-[#1a2a4a]/60 to-transparent",
  },
  {
    image: "/products/women.jpg",
    badge: "Women's Special",
    title: "Women's Wellness Range",
    subtitle: "Shatavari & hormonal balance drops crafted for Indian women's health.",
    cta: "Discover",
    link: "/shop/listing?category=womens-wellness",
    accent: "#8b3a8b",
    gradient: "from-[#4a1942]/90 via-[#4a1942]/60 to-transparent",
  },
  {
    image: "/products/liver.jpg",
    badge: "Detox Special",
    title: "Liver Detox & Cleanse",
    subtitle: "Kutki & Kalmegh formula for complete liver health and natural detoxification.",
    cta: "Buy Now",
    link: "/shop/listing?category=liver-care",
    accent: "#5a3a10",
    gradient: "from-[#3a2010]/90 via-[#3a2010]/60 to-transparent",
  },
];

function HeroCarousel() {
  const { heroSlides } = useSiteSettings();
  const slides = (heroSlides?.length ? heroSlides : DEFAULTS);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  function startTimer() {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      if (!paused) setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
  }

  useEffect(() => {
    startTimer();
    return () => clearInterval(timer.current);
  }, [slides.length, paused]);

  function go(dir) {
    setCurrent((c) => (c + dir + slides.length) % slides.length);
    startTimer();
  }

  const s = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "min(75vh, 620px)", minHeight: 320 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || "from-forest/90 via-forest/60 to-transparent"}`} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-xl">
            {s.badge && (
              <span className="inline-block bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 animate-fade-in">
                {s.badge}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-3 animate-fade-in">
              {s.title}
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-6 max-w-sm animate-fade-in">
              {s.subtitle}
            </p>
            <div className="flex items-center gap-3">
              <Link to={s.link || "/shop/listing"}>
                <Button className="bg-gold hover:bg-gold/90 text-white rounded-full px-7 py-5 font-bold text-sm shadow-xl">
                  {s.cta || "Shop Now"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/shop/listing">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-6 py-5 text-sm font-semibold bg-transparent">
                  View All
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setCurrent(i); startTimer(); }}
            className={`rounded-full transition-all ${i === current ? "bg-gold w-6 h-2" : "bg-white/50 w-2 h-2 hover:bg-white"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
