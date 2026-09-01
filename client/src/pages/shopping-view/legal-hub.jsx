import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Shield, FileText, Truck, RotateCcw, AlertCircle, Lock, Clock, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LegalHubPage({ defaultTab = "privacy" }) {
  const { brand, contact, deliveryPartners } = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Determine initial tab from route path or query param
  const getInitialTab = () => {
    const urlTab = searchParams.get("tab");
    if (urlTab) return urlTab;
    if (location.pathname.includes("terms")) return "terms";
    if (location.pathname.includes("shipping")) return "shipping";
    if (location.pathname.includes("refund")) return "refund";
    if (location.pathname.includes("disclaimer")) return "disclaimer";
    return defaultTab || "privacy";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const nextTab = getInitialTab();
    setActiveTab(nextTab);
  }, [location.pathname, searchParams]);

  function handleTabChange(value) {
    setActiveTab(value);
    setSearchParams({ tab: value }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-[#f9faf9] min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            <Shield className="w-3.5 h-3.5" /> Policies &amp; Legal Center
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-forest">
            Trust &amp; <span className="text-gradient-gold">Compliance</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Read about our transparent policies on privacy, terms, shipping, and returns.
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-center overflow-x-auto pb-2">
            <TabsList className="bg-white p-1.5 rounded-2xl border border-forest/15 shadow-sm h-auto flex flex-nowrap sm:flex-wrap gap-1">
              <TabsTrigger
                value="privacy"
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-forest data-[state=active]:text-white flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <Lock className="w-4 h-4" /> Privacy Policy
              </TabsTrigger>
              <TabsTrigger
                value="terms"
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-forest data-[state=active]:text-white flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <FileText className="w-4 h-4" /> Terms &amp; Conditions
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-forest data-[state=active]:text-white flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <Truck className="w-4 h-4" /> Shipping Policy
              </TabsTrigger>
              <TabsTrigger
                value="refund"
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-forest data-[state=active]:text-white flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" /> Return &amp; Refund
              </TabsTrigger>
              <TabsTrigger
                value="disclaimer"
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-forest data-[state=active]:text-white flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <AlertCircle className="w-4 h-4" /> Disclaimer
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: PRIVACY POLICY */}
          <TabsContent value="privacy" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">Privacy Policy</h2>
                <p className="text-xs text-muted-foreground mt-1">Last Updated: August 2026 | {brand.name || "Wellmaats"}</p>
              </div>

              <div className="prose text-sm text-muted-foreground space-y-5 leading-relaxed">
                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">1. Information Collection</h3>
                  <p>
                    We collect essential information to process your orders, including your name, shipping address, email address, and phone number. We strictly do not store raw credit/debit card numbers or netbanking passwords on our servers.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">2. How We Use Your Data</h3>
                  <p>Your data is used exclusively for:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fulfilling and delivering your Ayurvedic product shipments.</li>
                    <li>Sending tracking updates and delivery SMS/Email alerts.</li>
                    <li>Customer support assistance for dosage and formulation inquiries.</li>
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">3. 256-Bit SSL Security</h3>
                  <p>
                    All online transactions and customer communications are encrypted using industry-standard 256-bit SSL encryption. We do not sell or rent your personal information to any third parties.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">4. Grievance Officer</h3>
                  <div className="bg-[#fafcfa] p-4 rounded-xl border border-forest/10 text-xs text-forest space-y-1">
                    <p><strong>Email:</strong> {contact.email || "support@wellmaats.com"}</p>
                    <p><strong>Phone:</strong> {contact.phone || "+91 98765 43210"}</p>
                    <p><strong>Office:</strong> {contact.office || "Sector 62, Noida, UP 201301"}</p>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TERMS & CONDITIONS */}
          <TabsContent value="terms" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">Terms &amp; Conditions</h2>
                <p className="text-xs text-muted-foreground mt-1">User Agreement &amp; Sales Terms | {brand.name || "Wellmaats"}</p>
              </div>

              <div className="prose text-sm text-muted-foreground space-y-5 leading-relaxed">
                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">1. Acceptance of Terms</h3>
                  <p>
                    By browsing or placing an order on {brand.name}, you agree to comply with and be bound by these terms, our privacy policy, and applicable laws in India.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">2. Product Descriptions &amp; Pricing</h3>
                  <p>
                    Prices listed on the website are in Indian Rupees (INR) and include GST. While we strive for absolute accuracy, we reserve the right to correct pricing or typographical errors before order dispatch.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">3. Order Fulfillment</h3>
                  <p>
                    Orders are processed upon verification. In the rare event an item is out of stock, our team will notify you immediately for a replacement or complete refund.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">4. Jurisdiction</h3>
                  <p>
                    Any legal proceedings or disputes related to orders placed on this platform shall be subject to the exclusive jurisdiction of the competent courts in Noida, Uttar Pradesh.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: SHIPPING POLICY */}
          <TabsContent value="shipping" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">Shipping &amp; Delivery Policy</h2>
                <p className="text-xs text-muted-foreground mt-1">Pan-India Express Dispatch from Haridwar Hub</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#fafcfa] border border-forest/10 text-center">
                  <Clock className="w-5 h-5 text-forest mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-forest">24hr Dispatch</p>
                  <p className="text-[11px] text-muted-foreground">Orders shipped on priority</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafcfa] border border-forest/10 text-center">
                  <Truck className="w-5 h-5 text-gold mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-forest">Free Shipping</p>
                  <p className="text-[11px] text-muted-foreground">On all orders above ₹499</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafcfa] border border-forest/10 text-center">
                  <CheckCircle2 className="w-5 h-5 text-forest mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-forest">Live Tracking</p>
                  <p className="text-[11px] text-muted-foreground">SMS &amp; Email updates</p>
                </div>
              </div>

              <div className="prose text-sm text-muted-foreground space-y-5 leading-relaxed">
                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">1. Delivery Timelines</h3>
                  <p>
                    - <strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata):</strong> 2–3 Business Days.<br />
                    - <strong>Rest of India (Tier 2 &amp; Tier 3 Cities):</strong> 3–5 Business Days.<br />
                    - <strong>Remote / North-East:</strong> 4–7 Business Days.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">2. Courier Partners</h3>
                  <p>
                    We ship via trusted logistics partners: {deliveryPartners.join(", ")}.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: RETURN & REFUND */}
          <TabsContent value="refund" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">Return &amp; Refund Policy</h2>
                <p className="text-xs text-muted-foreground mt-1">7-Day Easy Replacement &amp; Money-Back Guarantee</p>
              </div>

              <div className="prose text-sm text-muted-foreground space-y-5 leading-relaxed">
                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">1. 7-Day Return Eligibility</h3>
                  <p>
                    If your item is damaged in transit, defective, or incorrect, you are eligible for an instant free replacement or 100% refund within 7 days of delivery.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">2. How to Claim</h3>
                  <p>
                    Send photos of the damaged outer box and product to <strong>{contact.email || "support@wellmaats.com"}</strong> or WhatsApp our support number with your Order ID.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">3. Refund Timeline</h3>
                  <p>
                    Refunds for prepaid orders are credited back to your original payment method in 3–5 business days. For COD orders, refund is transferred directly to your UPI/Bank Account within 24–48 hours.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: MEDICAL DISCLAIMER */}
          <TabsContent value="disclaimer" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">Medical &amp; Product Disclaimer</h2>
                <p className="text-xs text-muted-foreground mt-1">Ayurvedic Dietary Supplements Guidelines</p>
              </div>

              <div className="prose text-sm text-muted-foreground space-y-5 leading-relaxed">
                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">1. Dietary Supplement Notice</h3>
                  <p>
                    The Ayurvedic drops, tonics, and herbal extracts provided by {brand.name} are traditional Ayurvedic dietary supplements manufactured under Ayush guidelines. They are formulated to promote holistic balance and vitality and are not intended to diagnose, cure, mitigate, or treat any chronic medical condition.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-forest uppercase tracking-wide">2. Physician Consultation</h3>
                  <p>
                    Always consult your licensed physician or Ayurvedic practitioner prior to starting any herbal regimen, particularly if you are pregnant, nursing, taking prescription allopathic medications, or suffering from a severe pre-existing condition.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
