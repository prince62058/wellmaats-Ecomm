import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function FAQSection() {
  const [open, setOpen] = useState(0);
  const { faq } = useSiteSettings();

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-forest mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <div key={i} className="border border-forest/10 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-forest hover:bg-leaf transition-colors"
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                {item.q}
                <ChevronDown className={`w-5 h-5 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-muted-foreground text-sm">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const { newsletter } = useSiteSettings();

  function handleSubmit(e) {
    e.preventDefault();
    toast({ title: "Welcome! ₹100 OFF coupon sent to your email." });
    setEmail("");
  }

  return (
    <section className="py-16 bg-forest">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <h2 className="font-display text-3xl font-bold text-white mb-2">
          {newsletter.title}
        </h2>
        <p className="text-white/70 mb-6">{newsletter.subtitle}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1 min-w-0"
            required
          />
          <Button type="submit" className="btn-gold shrink-0 w-full sm:w-auto">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}
