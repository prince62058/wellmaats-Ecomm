import { useState, useEffect } from "react";
import { X, Truck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

const DEFAULT_MSGS = [
  { icon: Truck, text: "🚚 Free Shipping on orders above ₹499" },
  { icon: RotateCcw, text: "↩️ 14-Day Easy Returns — No Questions Asked" },
  { icon: ShieldCheck, text: "✅ 100% Authentic Ayurvedic Products" },
  { icon: Star, text: "⭐ 4.8 Rating from 50,000+ Happy Customers" },
];

function AnnouncementBar() {
  const { announcementBar } = useSiteSettings();
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const msgs = announcementBar?.messages?.length
    ? announcementBar.messages.map((text) => ({ text }))
    : DEFAULT_MSGS;

  const enabled = announcementBar?.enabled !== false;

  useEffect(() => {
    if (!enabled || msgs.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % msgs.length), 3500);
    return () => clearInterval(t);
  }, [msgs.length, enabled]);

  if (!enabled || dismissed) return null;

  const msg = msgs[current];

  return (
    <div className="relative bg-forest text-white text-center text-xs font-semibold py-2 px-10 sm:px-14 overflow-hidden select-none">
      <span className="animate-fade-in inline-block max-w-[calc(100%-3rem)] px-1 align-middle line-clamp-2 sm:truncate sm:line-clamp-none">{msg.text}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {/* Progress dots */}
      {msgs.length > 1 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-1">
          {msgs.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "bg-gold w-3 h-1.5" : "bg-white/30 w-1.5 h-1.5"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnnouncementBar;
