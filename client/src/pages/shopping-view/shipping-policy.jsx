import { useSiteSettings } from "@/hooks/use-site-settings";
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";

export default function ShippingPolicyPage() {
  const { brand, contact, deliveryPartners } = useSiteSettings();

  return (
    <div className="bg-[#f9faf9] min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-8">
          <div className="border-b border-forest/10 pb-6 text-center">
            <span className="inline-flex items-center gap-2 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              <Truck className="w-3.5 h-3.5" /> Pan-India Express Delivery
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-forest">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-muted-foreground text-xs mt-2">Fast, Safe &amp; Direct from Haridwar Manufacturing Hub</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#fafcfa] p-5 rounded-2xl border border-forest/10 text-center">
              <Clock className="w-6 h-6 text-forest mx-auto mb-2" />
              <h3 className="font-bold text-sm text-forest">24hr Dispatch</h3>
              <p className="text-xs text-muted-foreground mt-1">Orders dispatched within 24 hours of placement</p>
            </div>
            <div className="bg-[#fafcfa] p-5 rounded-2xl border border-forest/10 text-center">
              <Truck className="w-6 h-6 text-gold mx-auto mb-2" />
              <h3 className="font-bold text-sm text-forest">Free Shipping</h3>
              <p className="text-xs text-muted-foreground mt-1">On all orders above ₹499 across India</p>
            </div>
            <div className="bg-[#fafcfa] p-5 rounded-2xl border border-forest/10 text-center">
              <ShieldCheck className="w-6 h-6 text-forest mx-auto mb-2" />
              <h3 className="font-bold text-sm text-forest">Tamper-Proof Box</h3>
              <p className="text-xs text-muted-foreground mt-1">Double bubble wrap &amp; sealed bottles</p>
            </div>
          </div>

          <div className="prose prose-forest text-sm text-muted-foreground space-y-6 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">1. Delivery Timelines</h2>
              <p>
                - <strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2–3 Business Days.
              </p>
              <p>
                - <strong>Tier 2 &amp; Tier 3 Cities:</strong> 3–5 Business Days.
              </p>
              <p>
                - <strong>North East &amp; Remote Locations:</strong> 4–7 Business Days.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">2. Order Tracking</h2>
              <p>
                As soon as your package is dispatched, we send you an SMS and Email with your unique Tracking ID and Live Tracking URL. You can also track your shipment anytime in your <strong><a href="/shop/account" className="text-forest underline">Account Order History</a></strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">3. Courier Partners</h2>
              <p>
                We partner with India&apos;s leading logistics providers: {deliveryPartners.join(", ")}.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
