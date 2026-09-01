import { useState } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { HelpCircle, ChevronDown, Search, MessageSquare, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FAQPage() {
  const { faq, brand, contact } = useSiteSettings();
  const [openIndex, setOpenIndex] = useState(0);
  const [search, setSearch] = useState("");

  const defaultFaqs = [
    { q: `Are ${brand.name || "Wellmaats"} products 100% Ayurvedic & safe?`, a: "Yes. All our products are crafted using 100% pure herbal extracts, manufactured in GMP & Ayush certified facilities, and strictly lab-tested for heavy metals, pesticides, and microbial purity. They are non-habit forming and safe for daily use." },
    { q: "How should I take Ayurvedic drops for maximum benefits?", a: "Typically, 10–15 drops twice daily in half a glass of lukewarm water (or directly under the tongue for rapid sublingual absorption), preferably 30 minutes before meals or as directed on the specific product label." },
    { q: "How long before I see noticeable results?", a: "Natural Ayurvedic formulations work fundamentally with your body's physiology. Most people notice sustained energy, improved digestion, and wellness within 2–3 weeks of consistent daily usage." },
    { q: "Can I take these drops alongside allopathic/prescription medicines?", a: "Yes, in general Ayurvedic botanical extracts can be consumed. However, we always recommend keeping a 45–60 minute gap between Ayurvedic drops and prescription medicines, and consulting your healthcare doctor if you are pregnant or undergoing active treatment." },
    { q: "What are the shipping times and delivery charges?", a: "We provide Free Express Shipping across India on all orders above ₹499. Orders are dispatched within 24 hours from our Haridwar hub and typically arrive in 2–5 business days depending on your location." },
    { q: "Is Cash on Delivery (COD) available?", a: "Yes, COD is available across 19,000+ pin codes across India. You can also pay securely online using UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards, and Netbanking." },
    { q: "What is your return & refund policy?", a: "We offer a 7-Day Easy Return & Replacement Guarantee if your order arrives damaged, defective, or incorrect. Just reach out to our support team with a photo of the package." },
    { q: "Do these products contain any artificial colors, added sugar, or alcohol?", a: "No. Our drops contain zero added sugars, zero synthetic colors, zero harmful preservatives, and are 100% vegetarian." },
  ];

  const allFaqs = (faq && faq.length > 0) ? [...faq, ...defaultFaqs.slice(faq.length)] : defaultFaqs;

  const filtered = allFaqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f9faf9] min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-forest via-[#084728] to-forest text-white py-14 md:py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 text-gold text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 border border-white/10">
            <HelpCircle className="w-3.5 h-3.5" /> Help Center &amp; Knowledge Base
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto mb-6">
            Find quick answers about our herbal formulas, dosage recommendations, shipping, and order tracking.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions (e.g. dosage, shipping, COD)..."
              className="bg-white text-forest pl-11 h-12 rounded-2xl shadow-lg border-0 text-sm placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Accordion FAQ list */}
      <section className="py-14 md:py-18 container mx-auto px-4 max-w-3xl">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-forest/10 p-8">
            <p className="text-forest font-bold text-lg mb-2">No matching questions found</p>
            <p className="text-muted-foreground text-sm mb-4">Have a specific question not listed here?</p>
            <Link to="/contact-us">
              <Button className="btn-gold rounded-full px-6">Contact Our Support Team</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-forest/10 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-forest hover:bg-[#fafcfa] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-display">{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-forest/60 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-gold" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-muted-foreground text-sm leading-relaxed border-t border-forest/5 bg-[#fafcfa]/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still Need Help Box */}
        <div className="mt-12 p-8 bg-white rounded-3xl border border-forest/15 text-center shadow-sm space-y-4">
          <h3 className="font-display text-xl font-bold text-forest">Still have questions?</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Our wellness consultants and support team are available Mon–Sat (9 AM – 7 PM).
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/contact-us">
              <Button variant="outline" className="rounded-full px-6 gap-2">
                <MessageSquare className="w-4 h-4" /> Send Query
              </Button>
            </Link>
            <a href={`tel:${contact?.phone || "+919876543210"}`}>
              <Button className="btn-gold rounded-full px-6 gap-2">
                <Phone className="w-4 h-4" /> Call Helpline
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
