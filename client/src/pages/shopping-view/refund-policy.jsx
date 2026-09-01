import { useSiteSettings } from "@/hooks/use-site-settings";
import { RotateCcw, ShieldCheck, Mail, Phone, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function RefundPolicyPage() {
  const { brand, contact } = useSiteSettings();

  return (
    <div className="bg-[#f9faf9] min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-8">
          <div className="border-b border-forest/10 pb-6 text-center">
            <span className="inline-flex items-center gap-2 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              <RotateCcw className="w-3.5 h-3.5" /> Customer Protection
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-forest">
              Return &amp; Refund Policy
            </h1>
            <p className="text-muted-foreground text-xs mt-2">7-Day Easy Returns &amp; Instant Replacement Guarantee</p>
          </div>

          <div className="prose prose-forest text-sm text-muted-foreground space-y-6 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">1. 7-Day Return Eligibility</h2>
              <p>
                We want you to have 100% confidence in our Ayurvedic formulas. You are eligible for a replacement or full refund if:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The product delivered is damaged, leaked, or has a broken safety seal.</li>
                <li>The item delivered is incorrect or differs from what you ordered.</li>
                <li>The product has passed its expiry date upon delivery.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">2. How to Request a Return or Replacement</h2>
              <p>
                1. Take a clear photo/video of the outer packaging and damaged bottle.
              </p>
              <p>
                2. Email our support team at <strong>{contact.email || "support@wellmaats.com"}</strong> or WhatsApp us with your Order ID.
              </p>
              <p>
                3. Our support executive will verify and initiate a free pickup or dispatch a brand-new replacement bottle within 24 hours.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">3. Refund Processing Time</h2>
              <p>
                - <strong>Online Payments (UPI, Cards, Netbanking):</strong> Refund is credited back to your original payment method within 3–5 business days.
              </p>
              <p>
                - <strong>Cash on Delivery (COD) Orders:</strong> Refund is transferred directly to your Bank Account or UPI ID within 24–48 hours of pickup.
              </p>
            </section>
          </div>

          <div className="p-6 bg-[#fafcfa] rounded-2xl border border-forest/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-forest text-sm">Need help with a return or refund?</p>
              <p className="text-xs text-muted-foreground mt-0.5">We are here to help you Mon–Sat (9 AM – 7 PM)</p>
            </div>
            <Link to="/contact-us">
              <Button className="btn-gold rounded-full px-6 text-xs font-bold">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
