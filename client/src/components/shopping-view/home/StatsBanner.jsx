import ScrollReveal from "./ScrollReveal";
import { useCountUp, useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useSiteSettings } from "@/hooks/use-site-settings";

function StatItem({ value, suffix, label, decimals = 0 }) {
  const { ref, visible } = useScrollReveal(0.2);
  const count = useCountUp(value, visible, 1400, decimals);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-forest">
        {decimals ? count.toFixed(decimals) : count}
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function StatsBanner() {
  const { stats } = useSiteSettings();

  return (
    <section className="py-16 md:py-20 bg-white border-y border-forest/10">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-12">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em] mb-3">Trusted Nationwide</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forest">
            Pure. Reliable. Here for You.
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              decimals={stat.decimals ?? 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsBanner;
