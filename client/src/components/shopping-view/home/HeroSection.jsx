import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Link } from "react-router-dom";
import { ChevronDown, Leaf } from "lucide-react";
import heroVideo from "@/assets/hero-hd.mp4";

const MORPH_WORDS = ["Anytime", "Everyday", "Naturally"];

function HeroSection() {
  const { brand } = useSiteSettings();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let rafId = 0;

    const seekTo = (nextProgress) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const target = nextProgress * Math.max(video.duration - 0.04, 0);
      if (Math.abs(target - lastTimeRef.current) < 0.04) return;
      lastTimeRef.current = target;
      try {
        if (typeof video.fastSeek === "function") video.fastSeek(target);
        else video.currentTime = target;
      } catch {
        video.currentTime = target;
      }
    };

    const update = () => {
      const rect = container.getBoundingClientRect();
      const scrollRange = container.offsetHeight - window.innerHeight;
      const nextProgress =
        scrollRange <= 0 ? 0 : Math.min(Math.max(-rect.top / scrollRange, 0), 1);
      setProgress(nextProgress);
      if (video.readyState >= 2) seekTo(nextProgress);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    const onReady = () => {
      setVideoReady(true);
      video.pause();
      update();
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const morphIndex = Math.min(
    MORPH_WORDS.length - 1,
    Math.floor(progress * MORPH_WORDS.length * 1.2)
  );
  const leftOpacity = Math.max(0, 1 - progress * 2);
  const headlineY = progress * -80;

  return (
    <section ref={containerRef} className="relative h-[120vh] sm:h-[160vh] lg:h-[200vh] -mt-14 md:-mt-16">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a1f17]">
        <video
          ref={videoRef}
          src={heroVideo}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className={`absolute left-1/2 top-1/2 min-h-full min-w-full w-auto h-auto object-cover object-center will-change-transform ${
            videoReady ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          style={{
            transform: "translate(-50%, -50%) translateZ(0) scale(1.03)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/15 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex items-center pt-14 md:pt-16">
          <div className="container mx-auto px-5 md:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[70vh]">
              {/* Left — brand + CTA */}
              <div
                className="order-2 lg:order-1 pointer-events-auto max-w-xl"
                style={{ opacity: leftOpacity, transform: `translateY(${progress * -30}px)` }}
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-5">
                  <Leaf className="w-3.5 h-3.5 text-gold" />
                  <span className="text-white/90 text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase">
                    {brand.company}
                  </span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 lg:hidden">
                  {brand.name}
                </h2>
                <p className="text-white/80 text-sm md:text-base mb-6 max-w-md leading-relaxed">
                  GMP certified · 100% herbal · Made in India
                  <span className="block mt-1 text-white/60 text-sm">{brand.tagline}</span>
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <Link to="/shop/listing" className="w-full sm:w-auto">
                    <Button size="lg" className="btn-gold rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg w-full sm:w-auto">
                      Shop All Drops
                    </Button>
                  </Link>
                  <Link to="/shop/listing?category=immunity-drops" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full px-6 sm:px-8 h-11 sm:h-12 border-white/40 text-white bg-white/5 hover:bg-white hover:text-forest backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base"
                    >
                      Immunity Bestsellers
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right — clean headline (no overlapping duplicates) */}
              <div
                className="order-1 lg:order-2 relative text-center lg:text-right pointer-events-none select-none"
                style={{ transform: `translateY(${headlineY}px)` }}
              >
                <p
                  className="hidden lg:block absolute -right-2 -top-6 font-display text-[7rem] font-bold text-white/[0.06] leading-none"
                  aria-hidden
                >
                  Pure
                </p>

                <p className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold text-white leading-[1.05] tracking-tight">
                  Pure
                </p>
                <p className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold text-gradient-gold leading-[1.05] tracking-tight mt-1">
                  Ayurvedic
                </p>
                <p className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white mt-2 md:mt-4">
                  Drops
                </p>

                <div className="mt-6 md:mt-8 h-10 md:h-12 overflow-hidden relative flex justify-center lg:justify-end">
                  {MORPH_WORDS.map((word, i) => (
                    <span
                      key={word}
                      className="absolute font-display text-lg md:text-2xl italic text-gold transition-all duration-500"
                      style={{
                        opacity: morphIndex === i ? 1 : 0,
                        transform: `translateY(${morphIndex === i ? 0 : i < morphIndex ? -20 : 20}px)`,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: Math.max(0, 1 - progress * 2.5) }}
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-white/70 font-medium">
            Scroll Down
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent animate-scroll-line" />
          <ChevronDown className="w-4 h-4 text-gold animate-bounce" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
          <div className="h-full bg-gold transition-[width] duration-75" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
