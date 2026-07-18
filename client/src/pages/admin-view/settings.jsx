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
import { Plus, Trash2, Upload, Loader2, Film, Image } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axiosInstance";

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ── Logo uploader ─────────────────────────────────────────────
function LogoUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("my_file", file);
      const res = await axiosInstance.post("/api/admin/products/upload-image", fd);
      if (res.data?.result?.url) onChange(res.data.result.url);
    } catch { alert("Upload failed. Try again."); }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div className="w-16 h-16 rounded-xl border border-forest/15 bg-leaf/30 flex items-center justify-center overflow-hidden shrink-0">
        {value
          ? <img src={value} alt="Logo" className="w-full h-full object-contain p-1" />
          : <span className="text-2xl">🌿</span>}
      </div>
      <div className="flex flex-col gap-2">
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Button type="button" size="sm" variant="outline" disabled={uploading}
          onClick={() => ref.current?.click()}>
          {uploading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Uploading…</> : <><Upload className="w-3.5 h-3.5 mr-1.5" />Upload Logo</>}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" className="text-red-500 text-xs"
            onClick={() => onChange("")}>Remove</Button>
        )}
        <p className="text-xs text-muted-foreground">PNG or SVG recommended · transparent bg</p>
      </div>
    </div>
  );
}

// ── Slide media uploader (image or video) ─────────────────
function SlideMediaUpload({ label, icon: Icon, accept, field, slideIdx, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("my_file", file);
      const res = await axiosInstance.post("/api/admin/products/upload-image", fd);
      if (res.data?.result?.url) onChange(res.data.result.url);
      else throw new Error("No URL returned");
    } catch {
      alert("Upload failed. Try again.");
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Icon className="w-3.5 h-3.5" />{label}</label>
      <div className="flex gap-2">
        <Input
          placeholder={`Paste URL or upload ↑`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs"
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1.5 bg-forest text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-forest/90 disabled:opacity-60 transition"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleFile} />
      </div>
      {/* Preview */}
      {value && field === "image" && (
        <img src={value} alt="" className="h-16 w-32 object-cover rounded-lg border border-forest/15 mt-1" onError={(e) => e.target.style.display = "none"} />
      )}
      {value && field === "video" && (
        <video src={value} className="h-16 w-32 rounded-lg border border-forest/15 mt-1 object-cover" muted playsInline />
      )}
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
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="heroslides">Hero Slides</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="promobanners">Promo Banners</TabsTrigger>
          <TabsTrigger value="megamenu">Mega Menu</TabsTrigger>
          <TabsTrigger value="herbs">Herbs</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* ══ HEADER TAB ══ */}
        <TabsContent value="header" className="space-y-6 mt-6">
          {/* Announcement Bar */}
          <div className="border rounded-xl p-5 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-forest">📢 Announcement Bar</h3>
                <p className="text-xs text-muted-foreground">Top banner — shows cycling messages to all visitors.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={form.announcementBar?.enabled !== false}
                  onChange={(e) => setForm((p) => ({ ...p, announcementBar: { ...(p.announcementBar||{}), enabled: e.target.checked } }))}
                  className="w-4 h-4 accent-forest"
                />
                <span className="text-sm font-medium">Enabled</span>
              </label>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Messages</Label>
                <Button size="sm" variant="outline" onClick={() =>
                  setForm((p) => ({ ...p, announcementBar: { ...(p.announcementBar||{}), messages: [...(p.announcementBar?.messages||[]), ""] } }))
                }><Plus className="w-3 h-3 mr-1" />Add</Button>
              </div>
              {(form.announcementBar?.messages || []).map((msg, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="🚚 Free Shipping above ₹499" value={msg}
                    onChange={(e) => setForm((p) => { const m=[...(p.announcementBar?.messages||[])]; m[i]=e.target.value; return {...p, announcementBar:{...(p.announcementBar||{}), messages:m}}; })} />
                  <Button size="icon" variant="ghost" onClick={() =>
                    setForm((p) => { const m=(p.announcementBar?.messages||[]).filter((_,j)=>j!==i); return {...p, announcementBar:{...(p.announcementBar||{}), messages:m}}; })
                  }><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Trust Strip */}
          <div className="border rounded-xl p-5 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-forest">📌 Marquee Trust Strip</h3>
                <p className="text-xs text-muted-foreground">Dark-green scrolling band below the hero (e.g. "🌿 100% Ayurvedic").</p>
              </div>
              <Button size="sm" variant="outline" onClick={() =>
                setForm((p) => ({ ...p, marqueeMessages: [...(p.marqueeMessages||[]), ""] }))
              }><Plus className="w-3 h-3 mr-1" />Add</Button>
            </div>
            {(form.marqueeMessages || []).map((msg, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="🌿 100% Ayurvedic" value={msg}
                  onChange={(e) => setForm((p) => { const m=[...(p.marqueeMessages||[])]; m[i]=e.target.value; return {...p, marqueeMessages:m}; })} />
                <Button size="icon" variant="ghost" onClick={() =>
                  setForm((p) => ({ ...p, marqueeMessages: (p.marqueeMessages||[]).filter((_,j)=>j!==i) }))
                }><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            ))}
          </div>

          {/* Header Nav Links */}
          <div className="border rounded-xl p-5 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-forest">🔗 Header Nav Links</h3>
                <p className="text-xs text-muted-foreground">Links shown in the 2nd nav row on desktop (Best Sellers, Offer Zone, Blogs…).</p>
              </div>
              <Button size="sm" variant="outline" onClick={() =>
                setForm((p) => ({ ...p, headerNavLinks: [...(p.headerNavLinks||[]), { label:"", href:"", icon:"" }] }))
              }><Plus className="w-3 h-3 mr-1" />Add Link</Button>
            </div>
            {(form.headerNavLinks || []).map((link, i) => (
              <div key={i} className="flex gap-2 flex-wrap">
                <Input className="w-10" placeholder="🔥" value={link.icon||""}
                  onChange={(e) => setForm((p) => { const a=[...p.headerNavLinks]; a[i]={...a[i],icon:e.target.value}; return {...p,headerNavLinks:a}; })} />
                <Input className="w-36" placeholder="Label" value={link.label}
                  onChange={(e) => setForm((p) => { const a=[...p.headerNavLinks]; a[i]={...a[i],label:e.target.value}; return {...p,headerNavLinks:a}; })} />
                <Input className="flex-1" placeholder="/shop/best-sellers" value={link.href}
                  onChange={(e) => setForm((p) => { const a=[...p.headerNavLinks]; a[i]={...a[i],href:e.target.value}; return {...p,headerNavLinks:a}; })} />
                <Button size="icon" variant="ghost" onClick={() =>
                  setForm((p) => ({ ...p, headerNavLinks: p.headerNavLinks.filter((_,j)=>j!==i) }))
                }><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ══ HERO SLIDES TAB ══ */}
        <TabsContent value="heroslides" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-forest">🖼️ Hero Carousel Slides</h3>
              <p className="text-xs text-muted-foreground">Full-width image carousel shown at the top of the home page. Add up to 6 slides.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() =>
              setForm((p) => ({ ...p, heroSlides: [...(p.heroSlides||[]), { image:"", video:"", badge:"", title:"", subtitle:"", cta:"Shop Now", link:"/shop/listing", accent:"#C8A54A" }] }))
            }><Plus className="w-4 h-4 mr-1" />Add Slide</Button>
          </div>
          {(form.heroSlides || []).map((s, i) => {
            function upd(field, val) {
              setForm((p) => { const a = JSON.parse(JSON.stringify(p.heroSlides)); a[i][field] = val; return { ...p, heroSlides: a }; });
            }
            return (
            <div key={i} className="border rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-forest">Slide {i + 1}</span>
                <Button size="icon" variant="ghost" onClick={() =>
                  setForm((p) => ({ ...p, heroSlides: p.heroSlides.filter((_,j)=>j!==i) }))
                }><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>

              {/* ── Media: image + video upload ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SlideMediaUpload label="Background Image" icon={Image} accept="image/*" field="image"
                  value={s.image} onChange={(v) => upd("image", v)} />
                <SlideMediaUpload label="Background Video (overrides image)" icon={Film} accept="video/*" field="video"
                  value={s.video} onChange={(v) => upd("video", v)} />
              </div>

              {/* ── Text ── */}
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Badge (e.g. 🏆 Best Seller)" value={s.badge||""} onChange={(e) => upd("badge", e.target.value)} />
                <Input placeholder="CTA button text (e.g. Shop Now)"  value={s.cta||""}   onChange={(e) => upd("cta",   e.target.value)} />
              </div>
              <Input placeholder="Title (e.g. Immunity & Wellness Drops)" value={s.title||""}    onChange={(e) => upd("title",    e.target.value)} />
              <Input placeholder="Subtitle — short tagline"               value={s.subtitle||""} onChange={(e) => upd("subtitle", e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Link (/shop/listing?category=...)" value={s.link||""} onChange={(e) => upd("link", e.target.value)} />
                <div className="flex items-center gap-2">
                  <input type="color" value={s.accent||"#C8A54A"} onChange={(e) => upd("accent", e.target.value)}
                    className="h-9 w-12 rounded border border-gray-200 cursor-pointer p-0.5 shrink-0" title="Badge & button accent color" />
                  <span className="text-xs text-gray-500">Accent color (badge + CTA)</span>
                </div>
              </div>
            </div>
          );})}
          {(!form.heroSlides || form.heroSlides.length === 0) && (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-forest/10 rounded-xl">
              No slides yet. Click "Add Slide" to create your first hero slide.
            </div>
          )}
        </TabsContent>

        {/* ══ HERBS TAB ══ */}
        <TabsContent value="herbs" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-forest">🌿 Ayurvedic Herbs Strip</h3>
              <p className="text-xs text-muted-foreground">Shown on home page after "How it Works". Add emoji, name and benefit for each herb.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() =>
              addListItem("herbs", { emoji: "🌿", name: "", benefit: "" })
            }><Plus className="w-4 h-4 mr-1" />Add Herb</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(form.herbs || []).map((h, i) => (
              <div key={i} className="border rounded-xl p-3 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{h.emoji || "🌿"}</span>
                  <Button size="icon" variant="ghost" onClick={() => removeListItem("herbs", i)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
                <Input placeholder="Emoji (🌿)" value={h.emoji || ""} onChange={(e) => updateList("herbs", i, "emoji", e.target.value)} className="text-center text-lg" />
                <Input placeholder="Herb name (e.g. Ashwagandha)" value={h.name || ""} onChange={(e) => updateList("herbs", i, "name", e.target.value)} />
                <Input placeholder="Benefit (e.g. Stress & Anxiety)" value={h.benefit || ""} onChange={(e) => updateList("herbs", i, "benefit", e.target.value)} />
              </div>
            ))}
          </div>
          {(!form.herbs || form.herbs.length === 0) && (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-forest/10 rounded-xl">
              No herbs yet. Click "Add Herb" to add your first ingredient.
            </div>
          )}
        </TabsContent>

        <TabsContent value="brand" className="space-y-4 mt-6 max-w-2xl">
          {/* Logo upload */}
          <Field label="Brand Logo">
            <LogoUpload
              value={form.brand?.logo || ""}
              onChange={(url) => update("brand.logo", url)}
            />
          </Field>
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

        {/* ── Quick Filters + Categories + Brands ── */}
        <TabsContent value="categories" className="space-y-6 mt-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label>Quick Filter Tabs</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Shown as filter tabs in "Today's Wellness Deals" section on home page.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => addListItem("quickFilters", { label: "", category: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add Filter
              </Button>
            </div>
            {(form.quickFilters || []).map((f, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input placeholder="Label (e.g. Immunity)" value={f.label} onChange={(e) => updateList("quickFilters", i, "label", e.target.value)} />
                <Input placeholder="category id (e.g. immunity-drops)" value={f.category} onChange={(e) => updateList("quickFilters", i, "category", e.target.value)} />
                <Button size="icon" variant="ghost" onClick={() => removeListItem("quickFilters", i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
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

        {/* ── Promo Banners ── */}
        <TabsContent value="promobanners" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-forest">Promotional Banners</h3>
              <p className="text-xs text-muted-foreground">Full-width banners shown between sections on home page. First 3 are shown.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() =>
              setForm((prev) => ({
                ...prev,
                promoBanners: [...(prev.promoBanners || []), {
                  badge: "", title: "", subtitle: "", cta: "Shop Now",
                  link: "/shop/listing", bgGradient: "linear-gradient(135deg, #1a3a2a, #40916c)",
                  productImage: "",
                }],
              }))
            }>
              <Plus className="w-4 h-4 mr-1" /> Add Banner
            </Button>
          </div>
          {(form.promoBanners || []).map((b, bi) => (
            <div key={bi} className="border rounded-xl p-4 space-y-2 bg-gray-50">
              <div className="flex gap-2 flex-wrap">
                <Input className="w-32" placeholder="Badge text" value={b.badge||""} onChange={(e) => setForm((p) => { const arr=[...p.promoBanners]; arr[bi]={...arr[bi],badge:e.target.value}; return {...p,promoBanners:arr}; })} />
                <Input className="flex-1 min-w-40" placeholder="Title" value={b.title||""} onChange={(e) => setForm((p) => { const arr=[...p.promoBanners]; arr[bi]={...arr[bi],title:e.target.value}; return {...p,promoBanners:arr}; })} />
                <Button size="icon" variant="ghost" onClick={() => setForm((p) => ({ ...p, promoBanners: p.promoBanners.filter((_,i)=>i!==bi) }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
              <Input placeholder="Subtitle" value={b.subtitle||""} onChange={(e) => setForm((p) => { const arr=[...p.promoBanners]; arr[bi]={...arr[bi],subtitle:e.target.value}; return {...p,promoBanners:arr}; })} />
              <div className="flex gap-2 flex-wrap">
                <Input className="w-28" placeholder="CTA text" value={b.cta||""} onChange={(e) => setForm((p) => { const arr=[...p.promoBanners]; arr[bi]={...arr[bi],cta:e.target.value}; return {...p,promoBanners:arr}; })} />
                <Input className="flex-1" placeholder="/shop/listing?category=..." value={b.link||""} onChange={(e) => setForm((p) => { const arr=[...p.promoBanners]; arr[bi]={...arr[bi],link:e.target.value}; return {...p,promoBanners:arr}; })} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Input className="flex-1 min-w-48" placeholder="CSS gradient (e.g. linear-gradient(...))" value={b.bgGradient||""} onChange={(e) => setForm((p) => { const arr=[...p.promoBanners]; arr[bi]={...arr[bi],bgGradient:e.target.value}; return {...p,promoBanners:arr}; })} />
                <Input className="flex-1" placeholder="Product image path (e.g. /products/immunity.jpg)" value={b.productImage||""} onChange={(e) => setForm((p) => { const arr=[...p.promoBanners]; arr[bi]={...arr[bi],productImage:e.target.value}; return {...p,promoBanners:arr}; })} />
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="megamenu" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-forest">Mega Menu Categories</h3>
              <p className="text-xs text-muted-foreground">Each category shows on hover with column-based subcategories.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() =>
              setForm((prev) => ({
                ...prev,
                megaMenu: [...(prev.megaMenu || []), {
                  id: "", label: "", icon: "Leaf", href: "",
                  columns: [{ heading: "Products", items: [{ name: "", href: "" }] }],
                }],
              }))
            }>
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </div>
          {(form.megaMenu || []).map((cat, ci) => (
            <div key={ci} className="border rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex gap-2 flex-wrap">
                <Input className="w-36" placeholder="ID (e.g. liver-care)" value={cat.id}
                  onChange={(e) => setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],id:e.target.value}; return {...p,megaMenu:m}; })} />
                <Input className="flex-1 min-w-32" placeholder="Label" value={cat.label}
                  onChange={(e) => setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],label:e.target.value}; return {...p,megaMenu:m}; })} />
                <Input className="w-28" placeholder="Icon name" value={cat.icon||""}
                  onChange={(e) => setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],icon:e.target.value}; return {...p,megaMenu:m}; })} />
                <Input className="flex-1 min-w-40" placeholder="Link href" value={cat.href||""}
                  onChange={(e) => setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],href:e.target.value}; return {...p,megaMenu:m}; })} />
                <Button size="icon" variant="ghost" onClick={() =>
                  setForm((p) => ({ ...p, megaMenu: p.megaMenu.filter((_,i)=>i!==ci) }))
                }><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
              {/* Columns */}
              <div className="space-y-2 pl-3 border-l-2 border-forest/15">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Columns</p>
                  <Button size="sm" variant="ghost" onClick={() =>
                    setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],columns:[...(m[ci].columns||[]),{heading:"",items:[{name:"",href:""}]}]}; return {...p,megaMenu:m}; })
                  }><Plus className="w-3 h-3 mr-1" />Add Column</Button>
                </div>
                {(cat.columns||[]).map((col, coli) => (
                  <div key={coli} className="border rounded-lg p-3 bg-white space-y-2">
                    <div className="flex gap-2">
                      <Input className="flex-1" placeholder="Column heading" value={col.heading}
                        onChange={(e) => setForm((p) => {
                          const m=JSON.parse(JSON.stringify(p.megaMenu));
                          m[ci].columns[coli].heading=e.target.value; return {...p,megaMenu:m};
                        })} />
                      <Button size="icon" variant="ghost" onClick={() =>
                        setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns.splice(coli,1); return {...p,megaMenu:m}; })
                      }><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    </div>
                    {(col.items||[]).map((item, ii) => (
                      <div key={ii} className="flex gap-2 pl-2">
                        <Input className="flex-1" placeholder="Name" value={item.name}
                          onChange={(e) => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items[ii].name=e.target.value; return {...p,megaMenu:m}; })} />
                        <Input className="flex-1" placeholder="/shop/listing?category=..." value={item.href}
                          onChange={(e) => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items[ii].href=e.target.value; return {...p,megaMenu:m}; })} />
                        <Button size="icon" variant="ghost" onClick={() =>
                          setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items.splice(ii,1); return {...p,megaMenu:m}; })
                        }><Trash2 className="w-3 h-3 text-red-300" /></Button>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() =>
                      setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items.push({name:"",href:""}); return {...p,megaMenu:m}; })
                    }><Plus className="w-3 h-3 mr-1" />Add Item</Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="homepage" className="space-y-8 mt-6">
          {/* How it Works */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label>🪜 How it Works Steps</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Steps shown in the "How it Works" section on home page.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => addListItem("howItWorks", { emoji: "✨", tag: `Step 0${(form.howItWorks||[]).length+1}`, title: "", desc: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add Step
              </Button>
            </div>
            {(form.howItWorks || []).map((step, i) => (
              <div key={i} className="border rounded-lg p-4 mb-3 space-y-2 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Input className="w-20 text-center text-xl" placeholder="Emoji" value={step.emoji||""} onChange={(e) => updateList("howItWorks", i, "emoji", e.target.value)} />
                  <Input className="w-28" placeholder="Tag (Step 01)" value={step.tag||""} onChange={(e) => updateList("howItWorks", i, "tag", e.target.value)} />
                  <Input className="flex-1" placeholder="Title" value={step.title||""} onChange={(e) => updateList("howItWorks", i, "title", e.target.value)} />
                  <Button size="icon" variant="ghost" onClick={() => removeListItem("howItWorks", i)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
                <Input placeholder="Description" value={step.desc||""} onChange={(e) => updateList("howItWorks", i, "desc", e.target.value)} />
              </div>
            ))}
          </section>

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
