import { useEffect, useRef, useState } from "react";

export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function useCountUp(end, active, duration = 1400, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = end * eased;
      setValue(decimals ? parseFloat(next.toFixed(decimals)) : Math.round(next));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [end, active, duration, decimals]);

  return value;
}
