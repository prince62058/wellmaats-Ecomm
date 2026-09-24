import { useState, useEffect } from "react";
import { X, Truck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { useSelector } from "react-redux";
import { useSiteSettings } from "@/hooks/use-site-settings";

function AnnouncementBar() {
  const { announcementBar } = useSiteSettings();
  const siteSettingsData = useSelector((state) => state.siteSettings?.data);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const threshold = siteSettingsData?.shippingSettings?.freeDeliveryThreshold || 2499;
  const deliveryNotice = siteSettingsData?.shippingSettings?.deliveryNotice || `🚚 Free Shipping on all orders above ₹${threshold.toLocaleString("en-IN")}`;

  const defaultMessages = [
    { text: deliveryNotice },
    { text: "↩️ 14-Day Easy Returns — No Questions Asked" },
    { text: "✅ 100% Authentic Ayurvedic Formulations" },
    { text: "⭐ 4.8 Rating from 50,000+ Happy Customers" },
  ];

  const msgs = announcementBar?.messages?.length
    ? announcementBar.messages.map((text) => ({ text }))
    : defaultMessages;

  const enabled = announcementBar?.enabled !== false;

  useEffect(() => {
    if (!enabled || msgs.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % msgs.length), 3500);
    return () => clearInterval(t);
  }, [msgs.length, enabled]);

  if (!enabled || dismissed) return null;

  const msg = msgs[current];

  return (
    <div className="relative bg-[#108644] text-white text-center text-xs font-semibold py-2 px-10 sm:px-14 overflow-hidden select-none shadow-sm">
      <span className="animate-fade-in inline-block max-w-[calc(100%-3rem)] px-1 align-middle line-clamp-2 sm:truncate sm:line-clamp-none font-bold text-white">{msg.text}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-opacity"
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
              className={`rounded-full transition-all ${i === current ? "bg-amber-300 w-3 h-1.5" : "bg-white/40 w-1.5 h-1.5"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnnouncementBar;
