import { useState } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Briefcase, MapPin, Sparkles, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function CareersPage() {
  const { brand, contact } = useSiteSettings();
  const { toast } = useToast();
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", portfolio: "" });

  const openings = [
    { title: "Ayurvedic Formulation Scientist", dept: "R&D & Quality", location: "Haridwar, Uttarakhand", type: "Full Time", exp: "3–6 Years" },
    { title: "Growth & Performance Marketer", dept: "Marketing", location: "Noida / Hybrid", type: "Full Time", exp: "2–4 Years" },
    { title: "Content & Health Copywriter", dept: "Creative & Brand", location: "Remote / Noida", type: "Full Time", exp: "1–3 Years" },
    { title: "Customer Delight & Wellness Consultant", dept: "Support", location: "Noida, UP", type: "Full Time", exp: "1–2 Years" },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setApplied(true);
    toast({ title: "Application Submitted! 🎉", description: "Our Talent Acquisition team will review your profile and reach out." });
  }

  return (
    <div className="bg-[#f9faf9] min-h-screen py-14">
      {/* Header */}
      <section className="container mx-auto px-4 max-w-5xl text-center mb-14">
        <span className="inline-flex items-center gap-2 bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
          <Briefcase className="w-3.5 h-3.5" /> Join Our Team
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-forest mb-4">
          Build the Future of <span className="text-gradient-gold">Modern Ayurveda</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
          We are on a mission to bring authentic Ayurvedic wellness to millions of households across India. Work with a passionate, mission-driven team.
        </p>
      </section>

      {/* Openings Grid */}
      <section className="container mx-auto px-4 max-w-5xl space-y-8">
        <h2 className="font-display text-2xl font-bold text-forest">Open Roles ({openings.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openings.map((job, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-forest/10 shadow-xs hover:border-forest/30 transition-all space-y-4">
              <div>
                <span className="text-[11px] font-bold text-gold uppercase tracking-wider">{job.dept}</span>
                <h3 className="font-display text-lg font-bold text-forest mt-0.5">{job.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="bg-[#f4f7f4] px-2.5 py-1 rounded-md flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-forest" /> {job.location}
                </span>
                <span className="bg-[#f4f7f4] px-2.5 py-1 rounded-md">{job.type}</span>
                <span className="bg-[#f4f7f4] px-2.5 py-1 rounded-md">{job.exp}</span>
              </div>
              <Button
                onClick={() => setForm((p) => ({ ...p, role: job.title }))}
                variant="outline"
                className="w-full text-xs font-bold text-forest border-forest/20 hover:bg-leaf"
              >
                Apply for this Role <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-forest/15 shadow-sm mt-12">
          <h3 className="font-display text-2xl font-bold text-forest mb-2">Quick Application</h3>
          <p className="text-muted-foreground text-sm mb-6">Apply for one of the roles above or submit a general application.</p>

          {applied ? (
            <div className="p-8 text-center bg-leaf rounded-2xl border border-forest/20 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-forest mx-auto" />
              <h4 className="font-display text-lg font-bold text-forest">Application Received!</h4>
              <p className="text-xs text-muted-foreground">We will review your application and contact you at {form.email || "your email"}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase">Full Name *</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase">Email *</label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. ananya@example.com"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase">Applying for Role *</label>
                  <Input
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Select or type role title"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase">LinkedIn / Resume Link *</label>
                  <Input
                    required
                    value={form.portfolio}
                    onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                    placeholder="https://linkedin.com/in/... or Google Drive link"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button type="submit" className="btn-gold w-full h-12 rounded-xl text-sm font-bold shadow-md">
                Submit Application <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
