import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchSiteSettings,
  resetSiteSettings,
  updateSiteSettings,
} from "@/store/site-settings-slice";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function AdminSettings() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { data } = useSelector((state) => state.siteSettings);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    if (data) setForm(JSON.parse(JSON.stringify(data)));
  }, [data]);

  function update(path, value) {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function updateList(key, index, field, value) {
    setForm((prev) => {
      const list = [...prev[key]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [key]: list };
    });
  }

  function addListItem(key, template) {
    setForm((prev) => ({ ...prev, [key]: [...(prev[key] || []), template] }));
  }

  function removeListItem(key, index) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  }

  function updateCommaList(key, text) {
    update(key, text.split(",").map((s) => s.trim()).filter(Boolean));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    const {
      _id, key, createdAt, updatedAt, __v, ...payload
    } = form;
    const result = await dispatch(updateSiteSettings(payload));
    setSaving(false);
    if (result?.payload?.success) {
      toast({ title: "Site settings saved successfully" });
    } else {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  }

  async function handleReset() {
    const result = await dispatch(resetSiteSettings());
    if (result?.payload?.success) {
      toast({ title: "Settings reset to defaults" });
    }
  }

  if (!form) {
    return <p className="text-muted-foreground">Loading site settings...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-forest">Site Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage brand, contact, homepage content & footer — changes reflect on the live site instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>Reset Defaults</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-4 mt-6 max-w-2xl">
          <Field label="Company Name">
            <Input value={form.brand?.company || ""} onChange={(e) => update("brand.company", e.target.value)} />
          </Field>
          <Field label="Brand Name">
            <Input value={form.brand?.name || ""} onChange={(e) => update("brand.name", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <Input value={form.brand?.tagline || ""} onChange={(e) => update("brand.tagline", e.target.value)} />
          </Field>
          <Field label="Category Line">
            <Input value={form.brand?.category || ""} onChange={(e) => update("brand.category", e.target.value)} />
          </Field>
          <Field label="Newsletter Title">
            <Input value={form.newsletter?.title || ""} onChange={(e) => update("newsletter.title", e.target.value)} />
          </Field>
          <Field label="Newsletter Subtitle">
            <Input value={form.newsletter?.subtitle || ""} onChange={(e) => update("newsletter.subtitle", e.target.value)} />
          </Field>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-6 max-w-2xl">
          {["phone", "email", "whatsapp", "office", "manufacturing", "hours"].map((field) => (
            <Field key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
              <Input
                value={form.contact?.[field] || ""}
                onChange={(e) => update(`contact.${field}`, e.target.value)}
              />
            </Field>
          ))}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <Label>Social Links</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("social", { platform: "", url: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {(form.social || []).map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Platform" value={item.platform} onChange={(e) => updateList("social", i, "platform", e.target.value)} />
                <Input placeholder="URL" value={item.url} onChange={(e) => updateList("social", i, "url", e.target.value)} />
                <Button size="icon" variant="ghost" onClick={() => removeListItem("social", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6 mt-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Product Categories</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("productCategories", { id: "", label: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Button>
            </div>
            {(form.productCategories || []).map((cat, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input placeholder="id (e.g. liver-care)" value={cat.id} onChange={(e) => updateList("productCategories", i, "id", e.target.value)} />
                <Input placeholder="Label" value={cat.label} onChange={(e) => updateList("productCategories", i, "label", e.target.value)} />
                <Button size="icon" variant="ghost" onClick={() => removeListItem("productCategories", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Brands</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("brands", { id: "", label: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add Brand
              </Button>
            </div>
            {(form.brands || []).map((b, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input placeholder="id" value={b.id} onChange={(e) => updateList("brands", i, "id", e.target.value)} />
                <Input placeholder="Label" value={b.label} onChange={(e) => updateList("brands", i, "label", e.target.value)} />
                <Button size="icon" variant="ghost" onClick={() => removeListItem("brands", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-8 mt-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <Label>FAQ</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("faq", { q: "", a: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add FAQ
              </Button>
            </div>
            {(form.faq || []).map((item, i) => (
              <div key={i} className="border rounded-lg p-4 mb-3 space-y-2">
                <Input placeholder="Question" value={item.q} onChange={(e) => updateList("faq", i, "q", e.target.value)} />
                <Textarea placeholder="Answer" value={item.a} onChange={(e) => updateList("faq", i, "a", e.target.value)} />
                <Button size="sm" variant="ghost" onClick={() => removeListItem("faq", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <Label>Testimonials</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("testimonials", { name: "", city: "", rating: 5, text: "", verified: true })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {(form.testimonials || []).map((t, i) => (
              <div key={i} className="border rounded-lg p-4 mb-3 grid gap-2 md:grid-cols-2">
                <Input placeholder="Name" value={t.name} onChange={(e) => updateList("testimonials", i, "name", e.target.value)} />
                <Input placeholder="City" value={t.city} onChange={(e) => updateList("testimonials", i, "city", e.target.value)} />
                <Input type="number" placeholder="Rating" value={t.rating} onChange={(e) => updateList("testimonials", i, "rating", Number(e.target.value))} />
                <Textarea className="md:col-span-2" placeholder="Review text" value={t.text} onChange={(e) => updateList("testimonials", i, "text", e.target.value)} />
                <Button size="sm" variant="ghost" onClick={() => removeListItem("testimonials", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <Label>Why Choose Us</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("whyChooseUs", { icon: "Leaf", title: "", desc: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {(form.whyChooseUs || []).map((item, i) => (
              <div key={i} className="border rounded-lg p-4 mb-3 grid gap-2 md:grid-cols-3">
                <Input placeholder="Icon (Leaf, Truck...)" value={item.icon} onChange={(e) => updateList("whyChooseUs", i, "icon", e.target.value)} />
                <Input placeholder="Title" value={item.title} onChange={(e) => updateList("whyChooseUs", i, "title", e.target.value)} />
                <Input placeholder="Description" value={item.desc} onChange={(e) => updateList("whyChooseUs", i, "desc", e.target.value)} />
                <Button size="sm" variant="ghost" onClick={() => removeListItem("whyChooseUs", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <Label>Stats Banner</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("stats", { value: 0, suffix: "", label: "", decimals: 0 })}>
                <Plus className="w-4 h-4 mr-1" /> Add Stat
              </Button>
            </div>
            {(form.stats || []).map((s, i) => (
              <div key={i} className="flex flex-wrap gap-2 mb-2">
                <Input type="number" className="w-24" placeholder="Value" value={s.value} onChange={(e) => updateList("stats", i, "value", Number(e.target.value))} />
                <Input className="w-20" placeholder="Suffix" value={s.suffix} onChange={(e) => updateList("stats", i, "suffix", e.target.value)} />
                <Input className="flex-1" placeholder="Label" value={s.label} onChange={(e) => updateList("stats", i, "label", e.target.value)} />
                <Input type="number" className="w-24" placeholder="Decimals" value={s.decimals ?? 0} onChange={(e) => updateList("stats", i, "decimals", Number(e.target.value))} />
                <Button size="icon" variant="ghost" onClick={() => removeListItem("stats", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <Label>Doctors / Experts</Label>
              <Button size="sm" variant="outline" onClick={() => addListItem("doctors", { name: "", title: "", exp: "", specialty: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {(form.doctors || []).map((d, i) => (
              <div key={i} className="border rounded-lg p-4 mb-3 grid gap-2 md:grid-cols-2">
                <Input placeholder="Name" value={d.name} onChange={(e) => updateList("doctors", i, "name", e.target.value)} />
                <Input placeholder="Title" value={d.title} onChange={(e) => updateList("doctors", i, "title", e.target.value)} />
                <Input placeholder="Experience" value={d.exp} onChange={(e) => updateList("doctors", i, "exp", e.target.value)} />
                <Input placeholder="Specialty" value={d.specialty} onChange={(e) => updateList("doctors", i, "specialty", e.target.value)} />
                <Button size="sm" variant="ghost" onClick={() => removeListItem("doctors", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </section>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4 mt-6 max-w-3xl">
          <Field label="Trust Badges (comma separated)">
            <Textarea
              value={(form.trustBadges || []).join(", ")}
              onChange={(e) => updateCommaList("trustBadges", e.target.value)}
            />
          </Field>
          <Field label="Payment Methods (comma separated)">
            <Textarea
              value={(form.paymentMethods || []).join(", ")}
              onChange={(e) => updateCommaList("paymentMethods", e.target.value)}
            />
          </Field>
          <Field label="Delivery Partners (comma separated)">
            <Textarea
              value={(form.deliveryPartners || []).join(", ")}
              onChange={(e) => updateCommaList("deliveryPartners", e.target.value)}
            />
          </Field>
          <Field label="Footer Links (JSON)">
            <Textarea
              className="font-mono text-xs min-h-[200px]"
              value={JSON.stringify(form.footerLinks || {}, null, 2)}
              onChange={(e) => {
                try {
                  update("footerLinks", JSON.parse(e.target.value));
                } catch {
                  /* ignore invalid json while typing */
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Edit company, shop, support, legal, learn link arrays.</p>
          </Field>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminSettings;
