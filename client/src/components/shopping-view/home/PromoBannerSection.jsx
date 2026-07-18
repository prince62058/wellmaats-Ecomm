import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";

function PromoBannerSection({ bannerIndex }) {
  const { promoBanners } = useSiteSettings();
  const [current, setCurrent] = useState(0);
  const allBanners = promoBanners || [];

  // If bannerIndex given, show only that one banner
  const banners = bannerIndex !== undefined
    ? (allBanners[bannerIndex] ? [allBanners[bannerIndex]] : [])
    : allBanners;

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  const b = banners[current];

  return (
    <section className="py-6 px-4">
      <div className="container mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden min-h-[180px] md:min-h-[220px] flex items-center"
          style={{ background: b.bgGradient || "linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #40916c 100%)" }}
        >
          {/* Background image if provided */}
          {b.image && (
            <img
              src={b.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}

          {/* Product image right side */}
          {b.productImage && (
            <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-2/5 hidden sm:flex items-end justify-center overflow-hidden">
              <img
                src={b.productImage}
                alt={b.title}
                className="h-full object-contain drop-shadow-2xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 px-6 md:px-10 py-8 max-w-lg">
            {b.badge && (
              <span className="inline-block bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                {b.badge}
              </span>
            )}
            <h3 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-2">
              {b.title}
            </h3>
            {b.subtitle && (
              <p className="text-white/75 text-sm md:text-base mb-5">{b.subtitle}</p>
            )}
            {b.link && (
              <Link to={b.link}>
                <Button className="bg-gold hover:bg-gold/90 text-white rounded-full px-6 font-semibold shadow-lg">
                  {b.cta || "Shop Now"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all ${i === current ? "bg-gold w-5 h-2" : "bg-white/40 w-2 h-2"}`}
                />
              ))}
            </div>
          )}

          {/* Prev/Next */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrent((c) => (c + 1) % banners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default PromoBannerSection;
