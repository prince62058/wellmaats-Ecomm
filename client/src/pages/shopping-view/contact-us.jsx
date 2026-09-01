import { useState } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function ContactUsPage() {
  const { brand, contact } = useSiteSettings();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Message Sent Successfully! ✨",
        description: "Our Ayurvedic Wellness Support team will get back to you within 24 hours.",
      });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 800);
  }

  const waNumber = (contact?.phone || "+91 98765 43210").replace(/[^0-9]/g, "");

  return (
    <div className="bg-[#f9faf9] min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-forest via-[#084728] to-forest text-white py-14 md:py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 text-gold text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 border border-white/10">
            <MessageSquare className="w-3.5 h-3.5" /> 24/7 Wellness Support
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            We&apos;re Here to <span className="text-gradient-gold">Help You</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Have questions about our Ayurvedic drops, dosage recommendations, or existing orders? Reach out to us anytime.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-14 md:py-18 container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards (1 Col) */}
          <div className="space-y-4">
            {/* Phone card */}
            <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Call Us</p>
                <p className="text-forest font-bold text-base mt-0.5">{contact.phone || "+91 98765 43210"}</p>
                <p className="text-xs text-muted-foreground mt-1">Mon–Sat, 9:00 AM – 7:00 PM</p>
              </div>
            </div>

            {/* Email card */}
            <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email Support</p>
                <p className="text-forest font-bold text-base mt-0.5 break-all">{contact.email || "support@wellmaats.com"}</p>
                <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
              </div>
            </div>

            {/* Corporate Office */}
            <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Corporate Office</p>
                <p className="text-forest text-sm font-semibold mt-1 leading-relaxed">{contact.office || "Wellmaats Corporate Office, Sector 62, Noida, UP 201301"}</p>
              </div>
            </div>

            {/* Manufacturing Unit */}
            <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Manufacturing Facility</p>
                <p className="text-forest text-sm font-semibold mt-1 leading-relaxed">{contact.manufacturing || "Wellmaats Ayurvedic Unit, Haridwar, Uttarakhand"}</p>
              </div>
            </div>

            {/* WhatsApp button */}
            <a
              href={`https://wa.me/${waNumber}?text=Hi%20Wellmaats,%20I%20have%20a%20query%20about%20your%20products.`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm transition-all text-sm"
            >
              <MessageCircle className="w-5 h-5" /> Chat with us on WhatsApp
            </a>
          </div>

          {/* Interactive Query Form (2 Cols) */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl border border-forest/15 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-forest mb-2">Send Us a Message</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Fill out the form below and an Ayurvedic product expert will respond shortly.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-leaf rounded-2xl border border-forest/20 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-forest mx-auto" />
                <h3 className="font-display text-xl font-bold text-forest">Thank you for getting in touch!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We have received your message and will reach out to you via email or phone within 24 hours.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-2">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-forest uppercase">Your Name *</label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-forest uppercase">Email Address *</label>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-forest uppercase">Phone Number</label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-forest uppercase">Subject *</label>
                    <Input
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Dosage question, Order inquiry"
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase">Your Message *</label>
                  <Textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    className="rounded-xl border-gray-200 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full h-12 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? "Sending Message..." : <><Send className="w-4 h-4" /> Send Message</>}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
