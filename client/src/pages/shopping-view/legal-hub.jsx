import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Shield, FileText, Truck, RotateCcw, AlertCircle, Lock, Clock, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function PolicySectionList({ sections = [] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="text-sm text-muted-foreground space-y-6 leading-relaxed max-w-none">
      {sections.map((sec, idx) => (
        <section key={idx} className="space-y-2">
          {sec.heading && (
            <h3 className="text-sm font-bold text-forest uppercase tracking-wide">
              {sec.heading}
            </h3>
          )}
          {sec.content && (
            <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm">
              {sec.content}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export default function LegalHubPage({ defaultTab = "privacy" }) {
  const { brand, contact, deliveryPartners, policies } = useSiteSettings();
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

  const pData = policies || {};
  const privacy = pData.privacy || {};
  const terms = pData.terms || {};
  const shipping = pData.shipping || {};
  const refund = pData.refund || {};
  const disclaimer = pData.disclaimer || {};

  return (
    <div className="bg-[#f9faf9] min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            <Shield className="w-3.5 h-3.5" /> {pData.hubBadge || "Policies & Legal Center"}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-forest">
            {pData.hubTitle || "Trust & Compliance"}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {pData.hubSubtitle || "Read about our transparent policies on privacy, terms, shipping, and returns."}
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
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">
                  {privacy.title || "Privacy Policy"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {privacy.lastUpdated || `Last Updated: August 2026 | ${brand.name || "Wellmaats"}`}
                </p>
              </div>

              <PolicySectionList sections={privacy.sections} />

              <div className="mt-8 pt-6 border-t border-forest/10">
                <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-2">
                  Official Grievance &amp; Contact Desk
                </h4>
                <div className="bg-[#fafcfa] p-4 rounded-xl border border-forest/10 text-xs text-forest space-y-1">
                  <p><strong>Email:</strong> {contact.email || "support@wellmaats.com"}</p>
                  <p><strong>Phone:</strong> {contact.phone || "+91 98765 43210"}</p>
                  <p><strong>Office:</strong> {contact.office || "Sector 62, Noida, UP 201301"}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TERMS & CONDITIONS */}
          <TabsContent value="terms" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">
                  {terms.title || "Terms & Conditions"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {terms.lastUpdated || `User Agreement & Sales Terms | ${brand.name || "Wellmaats"}`}
                </p>
              </div>

              <PolicySectionList sections={terms.sections} />
            </div>
          </TabsContent>

          {/* TAB 3: SHIPPING POLICY */}
          <TabsContent value="shipping" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">
                  {shipping.title || "Shipping & Delivery Policy"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {shipping.lastUpdated || "Pan-India Express Dispatch from Haridwar Hub"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#fafcfa] border border-forest/10 text-center">
                  <Clock className="w-5 h-5 text-forest mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-forest">
                    {shipping.dispatchText || "24hr Dispatch"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {shipping.dispatchSubtext || "Orders shipped on priority"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafcfa] border border-forest/10 text-center">
                  <Truck className="w-5 h-5 text-gold mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-forest">
                    {shipping.freeShippingText || "Free Shipping"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {shipping.freeShippingSubtext || "On all orders above ₹499"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafcfa] border border-forest/10 text-center">
                  <CheckCircle2 className="w-5 h-5 text-forest mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-forest">
                    {shipping.trackingText || "Live Tracking"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {shipping.trackingSubtext || "SMS & Email updates"}
                  </p>
                </div>
              </div>

              <PolicySectionList sections={shipping.sections} />

              {deliveryPartners && deliveryPartners.length > 0 && (
                <div className="p-4 rounded-xl bg-[#fafcfa] border border-forest/10">
                  <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2">
                    Verified Courier &amp; Logistics Partners
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {deliveryPartners.map((partner) => (
                      <span
                        key={partner}
                        className="text-xs bg-white px-3 py-1 rounded-md border border-forest/10 text-forest font-medium shadow-xs"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 4: RETURN & REFUND */}
          <TabsContent value="refund" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">
                  {refund.title || "Return & Refund Policy"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {refund.lastUpdated || "7-Day Easy Replacement & Money-Back Guarantee"}
                </p>
              </div>

              <PolicySectionList sections={refund.sections} />

              <div className="mt-8 pt-6 border-t border-forest/10">
                <div className="bg-leaf/20 p-4 rounded-xl border border-forest/15 text-xs text-forest space-y-1">
                  <p className="font-bold text-sm">Need help with a return or replacement?</p>
                  <p className="text-muted-foreground">
                    Contact our support team directly at <strong>{contact.email || "support@wellmaats.com"}</strong> or WhatsApp <strong>{contact.phone || "+91 98765 43210"}</strong> with your Order ID.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: MEDICAL DISCLAIMER */}
          <TabsContent value="disclaimer" className="focus-visible:outline-none">
            <div className="bg-white p-6 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">
                  {disclaimer.title || "Medical & Product Disclaimer"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {disclaimer.lastUpdated || "Ayurvedic Dietary Supplements Guidelines"}
                </p>
              </div>

              <PolicySectionList sections={disclaimer.sections} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
