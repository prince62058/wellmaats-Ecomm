import { useSiteSettings } from "@/hooks/use-site-settings";
import { Shield, Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { brand, contact } = useSiteSettings();

  return (
    <div className="bg-[#f9faf9] min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-forest/15 shadow-sm space-y-8">
          <div className="border-b border-forest/10 pb-6 text-center">
            <span className="inline-flex items-center gap-2 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              <Shield className="w-3.5 h-3.5" /> Legal &amp; Compliance
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-forest">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-xs mt-2">Last Updated: August 2026 | {brand.name || "Wellmaats"}</p>
          </div>

          <div className="prose prose-forest text-sm text-muted-foreground space-y-6 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">1. Introduction</h2>
              <p>
                At {brand.name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your personal information and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website or make a purchase.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Personal Details:</strong> Name, shipping address, billing address, phone number, and email address.</li>
                <li><strong>Payment Information:</strong> Processed securely via authorized payment gateways (e.g. Razorpay). We do not store your raw credit card or debit card numbers on our servers.</li>
                <li><strong>Device &amp; Usage Data:</strong> IP address, browser type, device information, and browsing activity to improve your shopping experience.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">3. How We Use Your Information</h2>
              <p>We use your personal data to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process and deliver your Ayurvedic product orders promptly.</li>
                <li>Send order confirmations, tracking details, and shipment status alerts.</li>
                <li>Provide customer care and respond to your wellness queries.</li>
                <li>Comply with statutory and legal requirements in India.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">4. Data Security &amp; Encryption</h2>
              <p>
                We implement 256-bit SSL encryption, restricted server access, and industry-standard security protocols to protect your personal data from unauthorized access or disclosure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest uppercase tracking-wide">5. Contact Grievance Officer</h2>
              <p>
                For any privacy concerns or data requests, please contact our Grievance Officer at:
              </p>
              <div className="bg-[#fafcfa] p-4 rounded-xl border border-forest/10 text-xs text-forest font-mono space-y-1">
                <p>Email: {contact.email || "support@wellmaats.com"}</p>
                <p>Helpline: {contact.phone || "+91 98765 43210"}</p>
                <p>Address: {contact.office || "Sector 62, Noida, UP 201301"}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
