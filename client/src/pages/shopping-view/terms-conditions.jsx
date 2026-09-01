import { useSiteSettings } from "@/hooks/use-site-settings";
import { FileText } from "lucide-react";

export default function TermsConditionsPage() {
  const { brand, contact } = useSiteSettings();

  return (
    <div className="bg-[#f9faf9] min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-8">
          <div className="border-b border-forest/10 pb-6 text-center">
            <span className="inline-flex items-center gap-2 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              <FileText className="w-3.5 h-3.5" /> Legal &amp; User Agreement
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-forest">
              Terms &amp; Conditions
            </h1>
            <p className="text-muted-foreground text-xs mt-2">Effective Date: August 2026 | {brand.name || "Wellmaats"}</p>
          </div>

          <div className="prose prose-forest text-sm text-muted-foreground space-y-6 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">1. Agreement to Terms</h2>
              <p>
                By accessing or purchasing from {brand.name} (&quot;the Website&quot;), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">2. Product Information &amp; Medical Disclaimer</h2>
              <p>
                All products sold by {brand.name} are Ayurvedic dietary supplements and wellness drops formulated under standard Ayurvedic Pharmacopoeia guidelines. They are not intended to diagnose, treat, cure, or prevent any chronic disease. Always consult a qualified healthcare physician before starting any new herbal regimen if you are pregnant, nursing, or have a pre-existing medical condition.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">3. Pricing &amp; Order Acceptance</h2>
              <p>
                All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST taxes. We reserve the right to modify prices or cancel orders in case of technical pricing errors or stock unavailability.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">4. Shipping &amp; Deliveries</h2>
              <p>
                Orders are processed and dispatched within 24–48 hours across India. Delivery timelines vary between 2–5 business days depending on destination pin codes and courier partner operations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">5. Governing Law &amp; Jurisdiction</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
