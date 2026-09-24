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
import {
  Plus, Trash2, Upload, Loader2, Film, Image,
  Leaf, ShieldCheck, FlaskConical, Ban, Heart, Flag,
  Truck, Star, Clock, Zap, Award, CheckCircle,
  ChevronDown, ChevronRight, GripVertical, Sparkles,
  ExternalLink, RotateCcw, FileText, Lock, Shield, AlertCircle,
  Building2, Scale, Receipt, Percent,
} from "lucide-react";
import IconPicker from "@/components/common/icon-picker";
import DynamicIcon, { DYNAMIC_ICONS_MAP } from "@/components/common/dynamic-icon";

const ICON_MAP = DYNAMIC_ICONS_MAP;
const ICON_OPTIONS = Object.keys(ICON_MAP);
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axiosInstance";
import { DEFAULT_POLICIES, FOOTER_LINKS } from "@/config/brand";

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ── Small icon/image uploader (used in Mega Menu, Why Choose Us) ──
function IconUpload({ value, iconOptions, onChange }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef();
  const isImg = value && (value.startsWith("http") || value.startsWith("/"));

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
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Icon</label>
      <div className="flex items-center gap-2">
        {/* Preview */}
        <div className="w-9 h-9 rounded-xl bg-leaf border border-forest/15 flex items-center justify-center shrink-0 overflow-hidden">
          {isImg
            ? <img src={value} alt="" className="w-full h-full object-contain p-1" />
            : (() => { const I = ICON_MAP[value] || Leaf; return <I className="w-4 h-4 text-forest" />; })()}
        </div>
        {/* Dropdown for built-in icons */}
        <select value={isImg ? "__custom__" : (value || "Leaf")}
          onChange={(e) => { if (e.target.value !== "__custom__") onChange(e.target.value); }}
          className="flex-1 h-9 rounded-xl border border-gray-200 bg-white text-xs px-2 focus:outline-none focus:ring-2 focus:ring-forest/20">
          {(iconOptions || ICON_OPTIONS).map((n) => <option key={n} value={n}>{n}</option>)}
          {isImg && <option value="__custom__">📎 Custom (uploaded)</option>}
        </select>
        {/* Upload button */}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="h-9 px-3 rounded-xl border border-forest/20 bg-leaf text-forest text-xs font-semibold hover:bg-forest hover:text-white transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "" : "Upload"}
        </button>
        {isImg && (
          <button type="button" onClick={() => onChange("Leaf")}
            className="h-9 w-9 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
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
        <p className="text-xs text-muted-foreground">
          <strong>Recommended:</strong> 300 × 80 px · Transparent PNG or SVG (&lt; 200 KB)
        </p>
      </div>
    </div>
  );
}

// ── Slide media uploader (image or video) ─────────────────
function SlideMediaUpload({ label, icon: Icon, accept, field, slideIdx, value, onChange, hint }) {
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
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-forest" />
          {label}
        </label>
        {hint && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
            {hint}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={`Paste URL or upload ↑`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs rounded-xl"
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1.5 bg-forest text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-forest/90 disabled:opacity-60 transition"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleFile} />
      </div>
      {/* Preview */}
      {value && field === "image" && (
        <div className="flex items-center gap-2 mt-1">
          <img src={value} alt="" className="h-16 w-32 object-cover rounded-xl border border-forest/15 shadow-2xs" onError={(e) => e.target.style.display = "none"} />
          <button type="button" onClick={() => onChange("")} className="text-[11px] text-red-500 hover:underline">Remove</button>
        </div>
      )}
      {value && field === "video" && (
        <div className="flex items-center gap-2 mt-1">
          <video src={value} className="h-16 w-32 rounded-xl border border-forest/15 object-cover shadow-2xs" muted playsInline />
          <button type="button" onClick={() => onChange("")} className="text-[11px] text-red-500 hover:underline">Remove</button>
        </div>
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
  const [activePolicyKey, setActivePolicyKey] = useState("privacy");

  useEffect(() => {
    dispatch(fetchSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      const cloned = JSON.parse(JSON.stringify(data));
      if (!cloned.policies) cloned.policies = DEFAULT_POLICIES;
      setForm(cloned);
    }
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
      const list = [...(prev?.[key] || [])];
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
      }
      return { ...prev, [key]: list };
    });
  }

  function addListItem(key, template, atTop = true) {
    setForm((prev) => {
      const currentList = prev?.[key] || [];
      const updated = atTop ? [template, ...currentList] : [...currentList, template];
      return { ...prev, [key]: updated };
    });
    const niceName = key.replace(/([A-Z])/g, " $1").toLowerCase();
    toast({ title: `Added new item to ${niceName} (at top) ✨` });
  }

  function removeListItem(key, index) {
    setForm((prev) => {
      const currentList = prev?.[key] || [];
      return {
        ...prev,
        [key]: currentList.filter((_, i) => i !== index),
      };
    });
    toast({ title: "Item removed" });
  }

  function updateCommaList(key, text) {
    update(key, text.split(",").map((s) => s.trim()).filter(Boolean));
  }

  function updatePolicy(policyKey, field, value) {
    setForm((prev) => {
      const policies = { ...(prev?.policies || DEFAULT_POLICIES) };
      if (!field) {
        policies[policyKey] = value;
        return { ...prev, policies };
      }
      const current = { ...(policies[policyKey] || DEFAULT_POLICIES[policyKey] || {}) };
      current[field] = value;
      policies[policyKey] = current;
      return { ...prev, policies };
    });
  }

  function updatePolicySection(policyKey, secIndex, field, value) {
    setForm((prev) => {
      const policies = { ...(prev?.policies || DEFAULT_POLICIES) };
      const current = { ...(policies[policyKey] || DEFAULT_POLICIES[policyKey] || {}) };
      const sections = [...(current.sections || [])];
      if (sections[secIndex]) {
        sections[secIndex] = { ...sections[secIndex], [field]: value };
      }
      current.sections = sections;
      policies[policyKey] = current;
      return { ...prev, policies };
    });
  }

  function addPolicySection(policyKey) {
    setForm((prev) => {
      const policies = { ...(prev?.policies || DEFAULT_POLICIES) };
      const current = { ...(policies[policyKey] || DEFAULT_POLICIES[policyKey] || {}) };
      const sections = [...(current.sections || [])];
      sections.push({ heading: `${sections.length + 1}. New Clause`, content: "" });
      current.sections = sections;
      policies[policyKey] = current;
      return { ...prev, policies };
    });
    toast({ title: "New clause added to policy" });
  }

  function removePolicySection(policyKey, secIndex) {
    setForm((prev) => {
      const policies = { ...(prev?.policies || DEFAULT_POLICIES) };
      const current = { ...(policies[policyKey] || DEFAULT_POLICIES[policyKey] || {}) };
      const sections = (current.sections || []).filter((_, idx) => idx !== secIndex);
      current.sections = sections;
      policies[policyKey] = current;
      return { ...prev, policies };
    });
    toast({ title: "Section clause removed" });
  }

  function resetSinglePolicy(policyKey) {
    if (!DEFAULT_POLICIES[policyKey]) return;
    setForm((prev) => {
      const policies = { ...(prev?.policies || DEFAULT_POLICIES) };
      policies[policyKey] = JSON.parse(JSON.stringify(DEFAULT_POLICIES[policyKey]));
      return { ...prev, policies };
    });
    toast({ title: `Reset ${policyKey} policy to default template. Click Save All Changes.` });
  }

  function restoreAllLegalFooterLinks() {
    setForm((prev) => {
      const fl = { ...(prev?.footerLinks || {}) };
      fl.legal = [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms-conditions" },
        { label: "Shipping Policy", href: "/shipping-policy" },
        { label: "Return & Refund Policy", href: "/refund-policy" },
        { label: "Disclaimer", href: "/disclaimer" },
      ];
      return { ...prev, footerLinks: fl };
    });
    toast({ title: "Filled all 5 legal policies in Footer! Click Save to apply." });
  }

  function restoreAllSupportFooterLinks() {
    setForm((prev) => {
      const fl = { ...(prev?.footerLinks || {}) };
      fl.support = [
        { label: "Contact Us", href: "/contact-us" },
        { label: "FAQ", href: "/faq" },
        { label: "Track Order", href: "/shop/account" },
      ];
      return { ...prev, footerLinks: fl };
    });
    toast({ title: "Updated support links in Footer! Click Save to apply." });
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
        <div className="w-full overflow-x-auto pb-1.5 scrollbar-none">
          <TabsList className="inline-flex flex-nowrap items-center gap-1.5 p-1.5 bg-[#f0f4f1] rounded-2xl border border-forest/10 h-auto">
            <TabsTrigger value="brand" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Brand</TabsTrigger>
            <TabsTrigger value="buttoncolors" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">🎨 Colors</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Contact</TabsTrigger>
            <TabsTrigger value="header" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Header</TabsTrigger>
            <TabsTrigger value="heroslides" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Hero Slides</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Categories</TabsTrigger>
            <TabsTrigger value="promobanners" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Promo Banners</TabsTrigger>
            <TabsTrigger value="megamenu" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Mega Menu</TabsTrigger>
            <TabsTrigger value="herbs" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Herbs</TabsTrigger>
            <TabsTrigger value="homepage" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Homepage</TabsTrigger>
            <TabsTrigger value="footer" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">Footer</TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">🚚 Shipping &amp; Delivery</TabsTrigger>
            <TabsTrigger value="policies" className="text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-forest data-[state=active]:shadow-xs">📜 Policies</TabsTrigger>
          </TabsList>
        </div>

        {/* ══ BUTTON COLORS TAB ══ */}
        <TabsContent value="buttoncolors" className="space-y-6 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-bold text-forest text-lg flex items-center gap-2">
                🎨 Dynamic Button & Theme Colors
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Customize all button colors across the entire website in real time. Changes reflect on all pages instantly upon saving.
              </p>
            </div>

            {/* Live Interactive Preview */}
            <div className="bg-leaf/40 rounded-2xl p-5 border border-forest/15 space-y-3">
              <span className="text-xs font-bold text-forest uppercase tracking-wider">
                👁️ Live Interactive Button Preview
              </span>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  style={{
                    backgroundColor: form.themeColors?.primaryBtnBg || "#065f3d",
                    color: form.themeColors?.primaryBtnText || "#ffffff",
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-transform active:scale-95"
                >
                  Primary CTA Button
                </button>

                <button
                  type="button"
                  style={{
                    backgroundColor: form.themeColors?.secondaryBtnBg || "#ffffff",
                    color: form.themeColors?.secondaryBtnText || "#065f3d",
                    borderColor: form.themeColors?.secondaryBtnBorder || "#065f3d",
                    borderWidth: "1px",
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  🛒 Add to Cart (Secondary)
                </button>

                <button
                  type="button"
                  style={{
                    backgroundColor: form.themeColors?.buyNowBtnBg || "#c8963e",
                    color: form.themeColors?.buyNowBtnText || "#ffffff",
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  ⚡ Buy Now Button
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* 1. Primary Buttons */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4">
                <h4 className="font-bold text-sm text-forest border-b pb-2 flex items-center gap-1.5">
                  1. Primary CTA Buttons
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.primaryBtnBg || "#065f3d"}
                        onChange={(e) => update("themeColors.primaryBtnBg", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.primaryBtnBg || "#065f3d"}
                        onChange={(e) => update("themeColors.primaryBtnBg", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.primaryBtnText || "#ffffff"}
                        onChange={(e) => update("themeColors.primaryBtnText", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.primaryBtnText || "#ffffff"}
                        onChange={(e) => update("themeColors.primaryBtnText", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Hover Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.primaryBtnHover || "#04432b"}
                        onChange={(e) => update("themeColors.primaryBtnHover", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.primaryBtnHover || "#04432b"}
                        onChange={(e) => update("themeColors.primaryBtnHover", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Secondary / Add to Cart Buttons */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4">
                <h4 className="font-bold text-sm text-forest border-b pb-2 flex items-center gap-1.5">
                  2. Add to Cart (Secondary)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.secondaryBtnBg || "#ffffff"}
                        onChange={(e) => update("themeColors.secondaryBtnBg", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.secondaryBtnBg || "#ffffff"}
                        onChange={(e) => update("themeColors.secondaryBtnBg", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.secondaryBtnText || "#065f3d"}
                        onChange={(e) => update("themeColors.secondaryBtnText", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.secondaryBtnText || "#065f3d"}
                        onChange={(e) => update("themeColors.secondaryBtnText", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Border Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.secondaryBtnBorder || "#065f3d"}
                        onChange={(e) => update("themeColors.secondaryBtnBorder", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.secondaryBtnBorder || "#065f3d"}
                        onChange={(e) => update("themeColors.secondaryBtnBorder", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Buy Now Buttons */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4">
                <h4 className="font-bold text-sm text-forest border-b pb-2 flex items-center gap-1.5">
                  3. Buy Now (Action)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.buyNowBtnBg || "#c8963e"}
                        onChange={(e) => update("themeColors.buyNowBtnBg", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.buyNowBtnBg || "#c8963e"}
                        onChange={(e) => update("themeColors.buyNowBtnBg", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.themeColors?.buyNowBtnText || "#ffffff"}
                        onChange={(e) => update("themeColors.buyNowBtnText", e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5" />
                      <Input value={form.themeColors?.buyNowBtnText || "#ffffff"}
                        onChange={(e) => update("themeColors.buyNowBtnText", e.target.value)} className="text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="border-t pt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground mr-2">⚡ Quick Color Presets:</span>
              <button
                type="button"
                onClick={() => setForm((p) => ({
                  ...p,
                  themeColors: {
                    primaryBtnBg: "#065f3d", primaryBtnText: "#ffffff", primaryBtnHover: "#04432b",
                    secondaryBtnBg: "#ffffff", secondaryBtnText: "#065f3d", secondaryBtnBorder: "#065f3d",
                    buyNowBtnBg: "#c8963e", buyNowBtnText: "#ffffff"
                  }
                }))}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              >
                🌿 Emerald & Gold (Default)
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({
                  ...p,
                  themeColors: {
                    primaryBtnBg: "#108644", primaryBtnText: "#ffffff", primaryBtnHover: "#0b6633",
                    secondaryBtnBg: "#ffffff", secondaryBtnText: "#108644", secondaryBtnBorder: "#108644",
                    buyNowBtnBg: "#f59e0b", buyNowBtnText: "#ffffff"
                  }
                }))}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
              >
                🌱 Classic Green & Amber
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({
                  ...p,
                  themeColors: {
                    primaryBtnBg: "#1e3a8a", primaryBtnText: "#ffffff", primaryBtnHover: "#1e40af",
                    secondaryBtnBg: "#ffffff", secondaryBtnText: "#1e3a8a", secondaryBtnBorder: "#1e3a8a",
                    buyNowBtnBg: "#d97706", buyNowBtnText: "#ffffff"
                  }
                }))}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                🔷 Royal Blue & Gold
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({
                  ...p,
                  themeColors: {
                    primaryBtnBg: "#831843", primaryBtnText: "#ffffff", primaryBtnHover: "#9d174d",
                    secondaryBtnBg: "#ffffff", secondaryBtnText: "#831843", secondaryBtnBorder: "#831843",
                    buyNowBtnBg: "#eab308", buyNowBtnText: "#ffffff"
                  }
                }))}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-100 text-rose-800 hover:bg-rose-200"
              >
                🌺 Deep Rose & Gold
              </button>
            </div>
          </div>
        </TabsContent>

        {/* ══ HEADER TAB ══ */}
        <TabsContent value="header" className="space-y-5 mt-6">

          {/* Announcement Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-amber-50 border-b border-amber-100">
              <div>
                <h3 className="font-bold text-forest text-sm">📢 Announcement Bar</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Top banner that cycles messages for all visitors.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${form.announcementBar?.enabled !== false ? "bg-forest" : "bg-gray-200"}`}
                  onClick={() => setForm((p) => ({ ...p, announcementBar: { ...(p.announcementBar||{}), enabled: !(p.announcementBar?.enabled !== false) } }))}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.announcementBar?.enabled !== false ? "left-5" : "left-0.5"}`} />
                </div>
                <span className="text-xs font-semibold">{form.announcementBar?.enabled !== false ? "Enabled" : "Disabled"}</span>
              </label>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Messages (cycling)</p>
                <button type="button" className="text-xs font-semibold text-forest hover:text-forest/70 flex items-center gap-1"
                  onClick={() => setForm((p) => ({ ...p, announcementBar: { ...(p.announcementBar||{}), messages: [...(p.announcementBar?.messages||[]), ""] } }))}>
                  <Plus className="w-3.5 h-3.5" /> Add Message
                </button>
              </div>
              {(form.announcementBar?.messages || []).length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">No messages yet — add one above</p>
              )}
              {(form.announcementBar?.messages || []).map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0 font-bold">{i+1}.</span>
                  <Input value={msg} placeholder="🚚 Free Shipping above ₹499 | 🌿 100% Ayurvedic"
                    className="flex-1 h-9 rounded-xl border-gray-200 text-sm"
                    onChange={(e) => setForm((p) => { const m=[...(p.announcementBar?.messages||[])]; m[i]=e.target.value; return {...p, announcementBar:{...(p.announcementBar||{}), messages:m}}; })} />
                  <button type="button" onClick={() => setForm((p) => { const m=(p.announcementBar?.messages||[]).filter((_,j)=>j!==i); return {...p, announcementBar:{...(p.announcementBar||{}), messages:m}}; })}
                    className="w-8 h-8 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Trust Strip */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-[#108644]/5 border-b border-[#108644]/10">
              <div>
                <h3 className="font-bold text-forest text-sm">📌 Marquee Trust Strip</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Dark-green scrolling band below the hero — short trust phrases.</p>
              </div>
              <button type="button" className="text-xs font-semibold text-forest hover:text-forest/70 flex items-center gap-1"
                onClick={() => setForm((p) => ({ ...p, marqueeMessages: [...(p.marqueeMessages||[]), ""] }))}>
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="p-5 space-y-2">
              {(form.marqueeMessages || []).length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">No items yet — add one above</p>
              )}
              {(form.marqueeMessages || []).map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0 font-bold">{i+1}.</span>
                  <Input value={msg} placeholder="🌿 100% Ayurvedic"
                    className="flex-1 h-9 rounded-xl border-gray-200 text-sm"
                    onChange={(e) => setForm((p) => { const m=[...(p.marqueeMessages||[])]; m[i]=e.target.value; return {...p, marqueeMessages:m}; })} />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, marqueeMessages: (p.marqueeMessages||[]).filter((_,j)=>j!==i) }))}
                    className="w-8 h-8 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Header Nav Links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-blue-50 border-b border-blue-100">
              <div>
                <h3 className="font-bold text-forest text-sm">🔗 Header Nav Links</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Quick links shown in the top nav bar (Best Sellers, Offer Zone…).</p>
              </div>
              <button type="button" className="text-xs font-semibold text-forest hover:text-forest/70 flex items-center gap-1"
                onClick={() => setForm((p) => ({ ...p, headerNavLinks: [...(p.headerNavLinks||[]), { label:"", href:"", icon:"" }] }))}>
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>
            <div className="p-5 space-y-3">
              {(form.headerNavLinks || []).length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">No nav links — add one above</p>
              )}
              {(form.headerNavLinks || []).map((link, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[40px_1fr_2fr_36px] gap-2 items-end">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Icon</label>
                    <Input value={link.icon||""} placeholder="🔥" className="h-9 rounded-xl border-gray-200 text-center text-base"
                      onChange={(e) => setForm((p) => { const a=[...p.headerNavLinks]; a[i]={...a[i],icon:e.target.value}; return {...p,headerNavLinks:a}; })} />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Label *</label>
                    <Input value={link.label} placeholder="Best Sellers" className="h-9 rounded-xl border-gray-200 text-sm"
                      onChange={(e) => setForm((p) => { const a=[...p.headerNavLinks]; a[i]={...a[i],label:e.target.value}; return {...p,headerNavLinks:a}; })} />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">URL / Link</label>
                    <Input value={link.href} placeholder="/shop/best-sellers" className="h-9 rounded-xl border-gray-200 text-sm"
                      onChange={(e) => setForm((p) => { const a=[...p.headerNavLinks]; a[i]={...a[i],href:e.target.value}; return {...p,headerNavLinks:a}; })} />
                  </div>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, headerNavLinks: p.headerNavLinks.filter((_,j)=>j!==i) }))}
                    className="w-9 h-9 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center self-end">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ══ HERO SLIDES TAB ══ */}
        <TabsContent value="heroslides" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-forest text-base">🖼️ Hero Carousel Slides</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Full-width image carousel at the top of home page. Up to 6 slides.</p>
            </div>
            <Button size="sm" className="bg-forest hover:bg-forest/90 gap-1.5 rounded-xl" onClick={() =>
              setForm((p) => ({ ...p, heroSlides: [...(p.heroSlides||[]), { image:"", video:"", badge:"", title:"", subtitle:"", cta:"Shop Now", link:"/shop/listing", accent:"#C8A54A" }] }))
            }><Plus className="w-4 h-4" /> Add Slide</Button>
          </div>

          {/* ── Recommended Sizes Guidelines Banner ── */}
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 p-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-2.5 text-xs flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="font-bold text-forest text-sm">Recommended Media Sizes &amp; Guidelines for Best Look</p>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    High Quality &amp; Fast Loading
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-emerald-950">
                  <div className="bg-white/90 rounded-xl p-3 border border-emerald-100/90 space-y-1.5 shadow-2xs">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <Image className="w-4 h-4 text-forest" /> 🖼️ Banner Image Size:
                    </p>
                    <ul className="text-[11px] text-gray-700 space-y-1 list-disc list-inside">
                      <li><strong>Resolution:</strong> 1920 × 800 px (or 1920 × 700 px, Aspect Ratio ~16:9 / 21:9)</li>
                      <li><strong>Formats:</strong> WebP, JPG, PNG (Under <strong>500 KB – 1 MB</strong>)</li>
                      <li><strong>Design Tip:</strong> Keep main visual/product on the <em>right side</em>; headline text appears on the <em>left side</em>.</li>
                    </ul>
                  </div>
                  <div className="bg-white/90 rounded-xl p-3 border border-emerald-100/90 space-y-1.5 shadow-2xs">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <Film className="w-4 h-4 text-forest" /> 🎬 Background Video Size:
                    </p>
                    <ul className="text-[11px] text-gray-700 space-y-1 list-disc list-inside">
                      <li><strong>Resolution:</strong> 1920 × 1080 px (1080p FHD) or 1280 × 720 px (720p HD)</li>
                      <li><strong>Formats:</strong> MP4 (H.264) or WebM (Under <strong>10 MB</strong> max, ideally <strong>3–5 MB</strong>)</li>
                      <li><strong>Length:</strong> 8–15 seconds short loop, without loud audio (plays muted in background).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(!form.heroSlides || form.heroSlides.length === 0) && (
            <div className="border-2 border-dashed border-forest/15 rounded-2xl py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-leaf flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-forest/50" />
              </div>
              <p className="font-bold text-forest text-sm">No slides yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Add Slide" to create your first hero carousel slide</p>
            </div>
          )}

          <div className="space-y-4">
            {(form.heroSlides || []).map((s, i) => {
              function upd(field, val) {
                setForm((p) => { const a = JSON.parse(JSON.stringify(p.heroSlides)); a[i][field] = val; return { ...p, heroSlides: a }; });
              }
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Slide header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-forest text-white text-xs font-bold flex items-center justify-center">{i+1}</div>
                      <span className="font-bold text-forest text-sm">Slide {i+1}</span>
                      {s.title && <span className="text-xs text-muted-foreground">— {s.title.slice(0,30)}{s.title.length>30?"…":""}</span>}
                    </div>
                    <button type="button" onClick={() => setForm((p) => ({ ...p, heroSlides: p.heroSlides.filter((_,j)=>j!==i) }))}
                      className="w-8 h-8 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Media */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <SlideMediaUpload
                        label="Background Image"
                        hint="Best: 1920×800 px (< 1MB)"
                        icon={Image}
                        accept="image/*"
                        field="image"
                        value={s.image}
                        onChange={(v) => upd("image", v)}
                      />
                      <SlideMediaUpload
                        label="Background Video (overrides image)"
                        hint="Best: 1080p MP4 (< 10MB, 16:9)"
                        icon={Film}
                        accept="video/*"
                        field="video"
                        value={s.video}
                        onChange={(v) => upd("video", v)}
                      />
                    </div>

                    {/* Media Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <div>
                          <p className="text-xs font-bold text-forest">Show Text &amp; Buttons</p>
                          <p className="text-[10px] text-muted-foreground">Turn OFF if graphic image already has text designed in it</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={s.showTextOverlay !== false}
                            onChange={(e) => upd("showTextOverlay", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Banner Fit Mode</label>
                        <select
                          value={s.fit || "cover"}
                          onChange={(e) => upd("fit", e.target.value)}
                          className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 cursor-pointer"
                        >
                          <option value="cover">Cover (Default 1920×800 Full Width)</option>
                          <option value="contain">Contain (Fit Entire Image - No Crop)</option>
                        </select>
                      </div>
                    </div>

                    {/* Text fields — shown if showTextOverlay is true */}
                    {s.showTextOverlay !== false && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Badge Text</label>
                            <Input value={s.badge||""} placeholder="🏆 Best Seller" className="h-9 rounded-xl border-gray-200 text-sm"
                              onChange={(e) => upd("badge", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">CTA Button Text</label>
                            <Input value={s.cta||""} placeholder="Shop Now" className="h-9 rounded-xl border-gray-200 text-sm"
                              onChange={(e) => upd("cta", e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Headline / Title</label>
                          <Input value={s.title||""} placeholder="e.g. Immunity & Wellness Drops" className="h-9 rounded-xl border-gray-200 text-sm"
                            onChange={(e) => upd("title", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Subtitle / Tagline</label>
                          <Input value={s.subtitle||""} placeholder="Short supporting line" className="h-9 rounded-xl border-gray-200 text-sm"
                            onChange={(e) => upd("subtitle", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Button Link (URL)</label>
                            <Input value={s.link||""} placeholder="/shop/listing?category=..." className="h-9 rounded-xl border-gray-200 text-sm"
                              onChange={(e) => upd("link", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Accent Color (badge & CTA)</label>
                            <div className="flex items-center gap-2 h-9 px-3 border border-gray-200 rounded-xl bg-gray-50">
                              <input type="color" value={s.accent||"#C8A54A"} onChange={(e) => upd("accent", e.target.value)}
                                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0" />
                              <span className="text-xs text-muted-foreground font-mono">{s.accent||"#C8A54A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If text overlay is OFF, only show Click Link */}
                    {s.showTextOverlay === false && (
                      <div className="space-y-1 pt-2 border-t border-gray-100">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Click Link (URL when banner is clicked)</label>
                        <Input value={s.link||""} placeholder="/shop/listing" className="h-9 rounded-xl border-gray-200 text-sm"
                          onChange={(e) => upd("link", e.target.value)} />
                        <p className="text-[10px] text-muted-foreground">Clicking anywhere on this banner will take the user to this link.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
          <Field label="Site URL">
            <Input
              value={form.brand?.siteUrl || ""}
              onChange={(e) => update("brand.siteUrl", e.target.value)}
              placeholder="https://yourdomain.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for referral links. Set your production domain (e.g. <code>https://mothertatwa.com</code>).
            </p>
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

          {/* Quick Filter Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-emerald-50/70 border-b border-emerald-100">
              <div>
                <p className="font-bold text-forest text-sm">Quick Filter Tabs</p>
                <p className="text-xs text-muted-foreground mt-0.5">Filter buttons shown in "Today's Wellness Deals" section on home page.</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold bg-forest text-white hover:bg-forest/90 px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                onClick={() => addListItem("quickFilters", { label: "", category: "" })}
              >
                <Plus className="w-4 h-4" /> Add Filter
              </button>
            </div>
            <div className="p-5 space-y-2">
              {!(form.quickFilters||[]).length && <p className="text-xs text-muted-foreground italic py-1">No filters yet</p>}
              {/* Column headers */}
              {(form.quickFilters||[]).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_36px] gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-1">Tab Label</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-1">Category ID / Slug</span>
                  <span />
                </div>
              )}
              {(form.quickFilters || []).map((f, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_36px] gap-2 items-center">
                  <Input value={f.label} placeholder="e.g. Immunity" className="h-9 rounded-xl border-gray-200 text-sm"
                    onChange={(e) => updateList("quickFilters", i, "label", e.target.value)} />
                  <Input value={f.category} placeholder="e.g. immunity-drops" className="h-9 rounded-xl border-gray-200 text-sm font-mono text-xs"
                    onChange={(e) => updateList("quickFilters", i, "category", e.target.value)} />
                  <button type="button" onClick={() => removeListItem("quickFilters", i)}
                    className="w-9 h-9 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Product Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-blue-50/80 border-b border-blue-100">
              <div>
                <p className="font-bold text-forest text-sm">Product Categories &amp; Child Categories (Subcategories)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Manage parent categories and their nested subcategories for store browsing and filters.</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold bg-forest text-white hover:bg-forest/90 px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                onClick={() => addListItem("productCategories", { id: "", label: "", icon: "Shield", subCategories: [] })}
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
            <div className="p-5 space-y-4">
              {!(form.productCategories||[]).length && <p className="text-xs text-muted-foreground italic py-1">No categories yet</p>}
              {(form.productCategories || []).map((cat, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 bg-[#f9faf9] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_36px] gap-2.5 items-end">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-1 block mb-1">Parent Slug</span>
                      <Input value={cat.id} placeholder="e.g. liver-care" className="h-9 rounded-xl border-gray-200 text-sm font-mono text-xs bg-white"
                        onChange={(e) => updateList("productCategories", i, "id", e.target.value)} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-1 block mb-1">Display Label</span>
                      <Input value={cat.label} placeholder="e.g. Liver Care" className="h-9 rounded-xl border-gray-200 text-sm bg-white"
                        onChange={(e) => updateList("productCategories", i, "label", e.target.value)} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-1 block mb-1">Dynamic Icon</span>
                      <IconPicker
                        value={cat.icon || ""}
                        categoryId={cat.id}
                        onChange={(newIcon) => {
                          setForm((p) => {
                            const cats = [...(p.productCategories || [])];
                            cats[i] = { ...cats[i], icon: newIcon };
                            const m = (p.megaMenu || []).map((mm) =>
                              mm.id === cat.id ? { ...mm, icon: newIcon } : mm
                            );
                            return { ...p, productCategories: cats, megaMenu: m };
                          });
                        }}
                      />
                    </div>
                    <div>
                      <button type="button" onClick={() => removeListItem("productCategories", i)}
                        className="w-9 h-9 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Nested Subcategories */}
                  <div className="pl-4 border-l-2 border-forest/30 space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest uppercase tracking-wide flex items-center gap-1.5">
                        <span>↳ Child Categories / Subcategories ({((cat.subCategories || []).length)})</span>
                      </span>
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-forest bg-forest/10 hover:bg-forest/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95"
                        onClick={() => {
                          const currentCats = [...(form.productCategories || [])];
                          const subList = currentCats[i].subCategories || [];
                          currentCats[i] = {
                            ...currentCats[i],
                            subCategories: [{ id: "", label: "" }, ...subList],
                          };
                          setForm((p) => ({ ...p, productCategories: currentCats }));
                          toast({ title: `Added new subcategory row at top ✨` });
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Child Category
                      </button>
                    </div>

                    {(cat.subCategories || []).map((sub, subIdx) => (
                      <div key={subIdx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_32px] gap-2 items-center">
                        <Input
                          value={sub.id}
                          placeholder="sub-slug (e.g. fatty-liver)"
                          className="h-8 rounded-lg border-gray-200 text-xs font-mono bg-white"
                          onChange={(e) => {
                            const currentCats = [...(form.productCategories || [])];
                            const subList = [...(currentCats[i].subCategories || [])];
                            subList[subIdx] = { ...subList[subIdx], id: e.target.value };
                            currentCats[i] = { ...currentCats[i], subCategories: subList };
                            setForm((p) => ({ ...p, productCategories: currentCats }));
                          }}
                        />
                        <Input
                          value={sub.label}
                          placeholder="Subcategory Label (e.g. Fatty Liver Support)"
                          className="h-8 rounded-lg border-gray-200 text-xs bg-white"
                          onChange={(e) => {
                            const currentCats = [...(form.productCategories || [])];
                            const subList = [...(currentCats[i].subCategories || [])];
                            subList[subIdx] = { ...subList[subIdx], label: e.target.value };
                            currentCats[i] = { ...currentCats[i], subCategories: subList };
                            setForm((p) => ({ ...p, productCategories: currentCats }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const currentCats = [...(form.productCategories || [])];
                            const subList = (currentCats[i].subCategories || []).filter((_, idx) => idx !== subIdx);
                            currentCats[i] = { ...currentCats[i], subCategories: subList };
                            setForm((p) => ({ ...p, productCategories: currentCats }));
                          }}
                          className="w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-amber-50 border-b border-amber-100">
              <div>
                <p className="font-bold text-forest text-sm">Brands</p>
                <p className="text-xs text-muted-foreground mt-0.5">Available brands for product assignment.</p>
              </div>
              <button type="button" className="text-xs font-semibold text-forest hover:text-forest/70 flex items-center gap-1"
                onClick={() => addListItem("brands", { id: "", label: "" })}>
                <Plus className="w-3.5 h-3.5" /> Add Brand
              </button>
            </div>
            <div className="p-5 space-y-2">
              {!(form.brands||[]).length && <p className="text-xs text-muted-foreground italic py-1">No brands yet</p>}
              {(form.brands||[]).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_36px] gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-1">ID / Slug</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-1">Display Name</span>
                  <span />
                </div>
              )}
              {(form.brands || []).map((b, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_36px] gap-2 items-center">
                  <Input value={b.id} placeholder="e.g. mother-tatwa" className="h-9 rounded-xl border-gray-200 text-sm font-mono text-xs"
                    onChange={(e) => updateList("brands", i, "id", e.target.value)} />
                  <Input value={b.label} placeholder="e.g. Mother Tatwa" className="h-9 rounded-xl border-gray-200 text-sm"
                    onChange={(e) => updateList("brands", i, "label", e.target.value)} />
                  <button type="button" onClick={() => removeListItem("brands", i)}
                    className="w-9 h-9 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Promo Banners ── */}
        <TabsContent value="promobanners" className="space-y-5 mt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-forest text-base">Promotional Banners</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full-width promo cards shown on the home page. First 3 are displayed.
              </p>
            </div>
            <Button size="sm" className="bg-forest hover:bg-forest/90 gap-1.5 rounded-xl" onClick={() =>
              setForm((prev) => ({
                ...prev,
                promoBanners: [...(prev.promoBanners || []), {
                  badge: "New", title: "Banner Title", subtitle: "Add a short description here",
                  cta: "Shop Now", link: "/shop/listing",
                  bgGradient: "linear-gradient(135deg, #0a542b 0%, #1aad58 100%)",
                  productImage: "/products/signature.jpg",
                }],
              }))
            }>
              <Plus className="w-4 h-4" /> Add Banner
            </Button>
          </div>

          {/* Guidelines */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 flex items-start gap-2.5 text-xs text-emerald-950">
            <Sparkles className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Recommended Promo Banner Sizes:</p>
              <p className="text-[11px] text-gray-700 mt-0.5">
                • <strong>Product Cutout Image:</strong> 400 × 400 px transparent PNG / WebP (shown on right side of card)<br />
                • <strong>Full Custom Banner:</strong> 1200 × 400 px or 600 × 600 px (under 300 KB)
              </p>
            </div>
          </div>

          {(form.promoBanners || []).length === 0 && (
            <div className="border-2 border-dashed border-forest/20 rounded-2xl py-12 text-center text-muted-foreground">
              <p className="text-sm font-medium">No banners yet</p>
              <p className="text-xs mt-1">Click "Add Banner" to create your first promo banner</p>
            </div>
          )}

          {(form.promoBanners || []).map((b, bi) => {
            function setBannerField(field, val) {
              setForm((p) => {
                const arr = [...(p.promoBanners || [])];
                arr[bi] = { ...arr[bi], [field]: val };
                return { ...p, promoBanners: arr };
              });
            }

            // Extract colors from gradient for pickers
            const colorMatch = (b.bgGradient || "").match(/#[0-9a-fA-F]{6}/g) || [];
            const col1 = colorMatch[0] || "#0a542b";
            const col2 = colorMatch[1] || "#1aad58";

            function applyColors(c1, c2) {
              setBannerField("bgGradient", `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
            }

            return (
              <div key={bi} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* ── Live mini preview ── */}
                <div
                  className="relative h-24 flex items-center px-6 gap-4 overflow-hidden"
                  style={{ background: b.bgGradient || "linear-gradient(135deg,#0a542b,#1aad58)" }}
                >
                  <div className="flex-1 min-w-0">
                    {b.badge && (
                      <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                        {b.badge}
                      </span>
                    )}
                    <p className="text-white font-bold text-sm leading-tight truncate">{b.title || "Banner Title"}</p>
                    <p className="text-white/70 text-[11px] truncate mt-0.5">{b.subtitle || "Subtitle…"}</p>
                    {b.cta && (
                      <span className="mt-2 inline-block bg-white text-[10px] font-bold px-3 py-1 rounded-full text-forest">
                        {b.cta}
                      </span>
                    )}
                  </div>
                  {b.productImage && (
                    <img src={b.productImage} alt="" className="h-20 w-20 object-contain drop-shadow-lg shrink-0" />
                  )}
                  {/* Banner # badge */}
                  <div className="absolute top-2 right-2 bg-black/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Banner {bi + 1}
                  </div>
                </div>

                {/* ── Fields ── */}
                <div className="p-5 space-y-4">
                  {/* Row 1: Badge + Title + Delete */}
                  <div className="flex gap-3 items-start">
                    <div className="space-y-1 w-28 shrink-0">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Badge Label</label>
                      <Input value={b.badge || ""} onChange={(e) => setBannerField("badge", e.target.value)}
                        placeholder="e.g. New Launch" className="rounded-xl border-gray-200 h-9 text-sm" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Banner Title *</label>
                      <Input value={b.title || ""} onChange={(e) => setBannerField("title", e.target.value)}
                        placeholder="e.g. Women's Wellness Range" className="rounded-xl border-gray-200 h-9 text-sm" />
                    </div>
                    <button type="button" onClick={() => setForm((p) => ({ ...p, promoBanners: p.promoBanners.filter((_,i) => i !== bi) }))}
                      className="mt-5 w-9 h-9 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Row 2: Subtitle */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subtitle / Description</label>
                    <Input value={b.subtitle || ""} onChange={(e) => setBannerField("subtitle", e.target.value)}
                      placeholder="e.g. Crafted with Shatavari & Ashwagandha for hormonal balance"
                      className="rounded-xl border-gray-200 h-9 text-sm" />
                  </div>

                  {/* Row 3: CTA Button + Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Button Text</label>
                      <Input value={b.cta || ""} onChange={(e) => setBannerField("cta", e.target.value)}
                        placeholder="Shop Now" className="rounded-xl border-gray-200 h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Button Link (URL)</label>
                      <Input value={b.link || ""} onChange={(e) => setBannerField("link", e.target.value)}
                        placeholder="/shop/listing?category=..." className="rounded-xl border-gray-200 h-9 text-sm" />
                    </div>
                  </div>

                  {/* Row 4: Colors + Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Color pickers */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Background Colors</label>
                      <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-muted-foreground font-medium">From</label>
                          <input type="color" value={col1}
                            onChange={(e) => applyColors(e.target.value, col2)}
                            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                        </div>
                        <div className="flex-1 h-5 rounded-lg" style={{ background: b.bgGradient }} />
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-muted-foreground font-medium">To</label>
                          <input type="color" value={col2}
                            onChange={(e) => applyColors(col1, e.target.value)}
                            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Pick start & end colors — gradient auto-updates</p>
                    </div>

                    {/* Product Image */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product Image Path</label>
                      <Input value={b.productImage || ""} onChange={(e) => setBannerField("productImage", e.target.value)}
                        placeholder="/products/immunity.jpg" className="rounded-xl border-gray-200 h-9 text-sm" />
                      <p className="text-[10px] text-muted-foreground">Local path or full URL. Shows on right side of banner.</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(form.promoBanners || []).length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              💡 Only the first 3 banners are shown on the homepage. Click "Save All Changes" to apply.
            </p>
          )}
        </TabsContent>

        <TabsContent value="megamenu" className="space-y-5 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-forest text-base">Mega Menu Categories</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Each category shows in the navigation dropdown with grouped sub-links.</p>
            </div>
            <Button size="sm" className="bg-forest hover:bg-forest/90 gap-1.5 rounded-xl" onClick={() =>
              setForm((prev) => ({
                ...prev,
                megaMenu: [...(prev.megaMenu || []), {
                  id: "", label: "New Category", icon: "Leaf", href: "",
                  columns: [{ heading: "Products", items: [{ name: "", href: "" }] }],
                }],
              }))
            }>
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>

          {!(form.megaMenu || []).length && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl py-10 text-center text-muted-foreground text-sm">
              No mega menu categories yet
            </div>
          )}

          <div className="space-y-4">
            {(form.megaMenu || []).map((cat, ci) => {
              const CatIcon = ICON_MAP[cat.icon] || Leaf;
              return (
                <div key={ci} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* ── Category Header ── */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center shrink-0 overflow-hidden">
                      <DynamicIcon icon={cat.icon} categoryId={cat.id} className="w-4.5 h-4.5 text-forest" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">ID / Slug</label>
                        <Input value={cat.id} placeholder="e.g. liver-care" className="h-8 rounded-lg border-gray-200 text-xs"
                          onChange={(e) => setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],id:e.target.value}; return {...p,megaMenu:m}; })} />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Display Label</label>
                        <Input value={cat.label} placeholder="Liver Care" className="h-8 rounded-lg border-gray-200 text-xs"
                          onChange={(e) => setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],label:e.target.value}; return {...p,megaMenu:m}; })} />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Dynamic Icon</label>
                        <IconPicker
                          value={cat.icon || "Leaf"}
                          categoryId={cat.id}
                          onChange={(v) => {
                            setForm((p) => {
                              const m = [...(p.megaMenu || [])];
                              m[ci] = { ...m[ci], icon: v };
                              const cats = (p.productCategories || []).map((pc) =>
                                pc.id === cat.id ? { ...pc, icon: v } : pc
                              );
                              return { ...p, megaMenu: m, productCategories: cats };
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Main Link</label>
                        <Input value={cat.href || ""} placeholder="/shop/listing?category=..." className="h-8 rounded-lg border-gray-200 text-xs"
                          onChange={(e) => setForm((p) => { const m=[...p.megaMenu]; m[ci]={...m[ci],href:e.target.value}; return {...p,megaMenu:m}; })} />
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => setForm((p) => ({ ...p, megaMenu: p.megaMenu.filter((_,i) => i !== ci) }))}
                      className="w-8 h-8 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* ── Columns ── */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-forest uppercase tracking-wide">Dropdown Columns</p>
                      <button type="button" className="text-xs font-semibold text-forest hover:text-forest/70 flex items-center gap-1 transition-colors"
                        onClick={() => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns=[...(m[ci].columns||[]),{heading:"",items:[{name:"",href:""}]}]; return {...p,megaMenu:m}; })}>
                        <Plus className="w-3.5 h-3.5" /> Add Column
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(cat.columns || []).map((col, coli) => (
                        <div key={coli} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                          {/* Column heading */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 space-y-0.5">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Column Heading</label>
                              <Input value={col.heading} placeholder="e.g. Products"
                                className="h-8 rounded-lg border-gray-200 text-xs bg-white"
                                onChange={(e) => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].heading=e.target.value; return {...p,megaMenu:m}; })} />
                            </div>
                            <button type="button"
                              onClick={() => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns.splice(coli,1); return {...p,megaMenu:m}; })}
                              className="w-7 h-7 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 flex items-center justify-center mt-4 shrink-0">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Items */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Links</label>
                            {(col.items || []).map((item, ii) => (
                              <div key={ii} className="flex gap-1.5 items-center">
                                <Input value={item.name} placeholder="Link name"
                                  className="flex-1 h-7 rounded-lg border-gray-200 text-xs bg-white"
                                  onChange={(e) => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items[ii].name=e.target.value; return {...p,megaMenu:m}; })} />
                                <Input value={item.href} placeholder="/shop/..."
                                  className="flex-1 h-7 rounded-lg border-gray-200 text-xs bg-white"
                                  onChange={(e) => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items[ii].href=e.target.value; return {...p,megaMenu:m}; })} />
                                <button type="button"
                                  onClick={() => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items.splice(ii,1); return {...p,megaMenu:m}; })}
                                  className="w-6 h-7 rounded flex items-center justify-center text-red-300 hover:text-red-500 shrink-0">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button type="button" className="text-[11px] font-semibold text-forest hover:text-forest/70 flex items-center gap-1 mt-1 transition-colors"
                              onClick={() => setForm((p) => { const m=JSON.parse(JSON.stringify(p.megaMenu)); m[ci].columns[coli].items.push({name:"",href:""}); return {...p,megaMenu:m}; })}>
                              <Plus className="w-3 h-3" /> Add Link
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-forest text-sm">Why Choose Us</p>
                <p className="text-xs text-muted-foreground mt-0.5">Trust badges shown on the home page</p>
              </div>
              <Button size="sm" className="bg-forest hover:bg-forest/90 gap-1.5 rounded-xl"
                onClick={() => addListItem("whyChooseUs", { icon: "Leaf", title: "", desc: "" })}>
                <Plus className="w-4 h-4" /> Add Point
              </Button>
            </div>
            <div className="space-y-3">
              {(form.whyChooseUs || []).map((item, i) => {
                const IconComp = ICON_MAP[item.icon] || Leaf;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon preview */}
                      <div className="w-11 h-11 rounded-xl bg-leaf flex items-center justify-center shrink-0 border border-forest/10 overflow-hidden">
                        <DynamicIcon icon={item.icon} className="w-5 h-5 text-forest" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        {/* Icon selector + upload */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Dynamic Icon</label>
                          <IconPicker
                            value={item.icon || "Leaf"}
                            onChange={(v) => updateList("whyChooseUs", i, "icon", v)}
                          />
                        </div>
                        {/* Title */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Title *</label>
                          <Input value={item.title} placeholder="e.g. 100% Ayurvedic"
                            onChange={(e) => updateList("whyChooseUs", i, "title", e.target.value)}
                            className="h-9 rounded-xl border-gray-200 text-sm" />
                        </div>
                        {/* Description */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
                          <Input value={item.desc} placeholder="Short supporting text"
                            onChange={(e) => updateList("whyChooseUs", i, "desc", e.target.value)}
                            className="h-9 rounded-xl border-gray-200 text-sm" />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeListItem("whyChooseUs", i)}
                        className="w-8 h-8 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors shrink-0 mt-5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {!(form.whyChooseUs || []).length && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl py-8 text-center text-muted-foreground text-sm">
                  No trust points yet — click "Add Point" to add one
                </div>
              )}
            </div>
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

        <TabsContent value="footer" className="space-y-6 mt-6 max-w-4xl">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-forest text-base flex items-center gap-2">
              🛡️ Badges &amp; Partners
            </h3>
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
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-forest text-base">
                  🔗 Footer Navigation Columns
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage the links displayed in the website footer.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={restoreAllLegalFooterLinks}
                  className="text-xs text-forest border-forest/20 hover:bg-forest/5"
                >
                  ✨ Populate All 5 Legal Policies
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={restoreAllSupportFooterLinks}
                  className="text-xs text-forest border-forest/20 hover:bg-forest/5"
                >
                  ✨ Standard Support Links
                </Button>
              </div>
            </div>

            {["legal", "support", "company", "shop", "learn"].map((colKey) => {
              const colLinks = form.footerLinks?.[colKey] || [];
              const colTitle = colKey.charAt(0).toUpperCase() + colKey.slice(1);
              return (
                <div key={colKey} className="border border-forest/10 rounded-xl p-4 bg-[#fafcfa] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-forest uppercase tracking-wide">
                      {colTitle} Column ({colLinks.length} links)
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-xs text-forest hover:bg-forest/10"
                      onClick={() => {
                        setForm((prev) => {
                          const fl = { ...(prev?.footerLinks || {}) };
                          const curr = [...(fl[colKey] || [])];
                          curr.push({ label: "New Link", href: "/" });
                          fl[colKey] = curr;
                          return { ...prev, footerLinks: fl };
                        });
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {colLinks.map((lnk, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-forest/10">
                        <Input
                          placeholder="Label (e.g. Privacy Policy)"
                          className="h-8 text-xs flex-1"
                          value={lnk.label || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => {
                              const fl = { ...(prev?.footerLinks || {}) };
                              const curr = [...(fl[colKey] || [])];
                              if (curr[idx]) curr[idx] = { ...curr[idx], label: val };
                              fl[colKey] = curr;
                              return { ...prev, footerLinks: fl };
                            });
                          }}
                        />
                        <Input
                          placeholder="Path (e.g. /privacy-policy)"
                          className="h-8 text-xs flex-1 font-mono"
                          value={lnk.href || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => {
                              const fl = { ...(prev?.footerLinks || {}) };
                              const curr = [...(fl[colKey] || [])];
                              if (curr[idx]) curr[idx] = { ...curr[idx], href: val };
                              fl[colKey] = curr;
                              return { ...prev, footerLinks: fl };
                            });
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setForm((prev) => {
                              const fl = { ...(prev?.footerLinks || {}) };
                              const curr = (fl[colKey] || []).filter((_, i) => i !== idx);
                              fl[colKey] = curr;
                              return { ...prev, footerLinks: fl };
                            });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <Field label="Advanced: Raw JSON Editor">
              <Textarea
                className="font-mono text-xs min-h-[120px]"
                value={JSON.stringify(form.footerLinks || {}, null, 2)}
                onChange={(e) => {
                  try {
                    update("footerLinks", JSON.parse(e.target.value));
                  } catch {
                    /* ignore invalid json while typing */
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Directly modify the JSON representation if needed.</p>
            </Field>
          </div>
        </TabsContent>

        {/* ══ POLICIES & LEGAL TAB ══ */}
        <TabsContent value="policies" className="space-y-6 mt-6 max-w-4xl">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <h3 className="font-bold text-forest text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-forest" /> Legal Policies &amp; Compliance Hub
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize content, clauses, and guarantees across all 5 legal policies. Changes take effect on the live website immediately upon saving.
                </p>
              </div>
              <a
                href={activePolicyKey === "terms" ? "/terms-conditions" :
                      activePolicyKey === "shipping" ? "/shipping-policy" :
                      activePolicyKey === "refund" ? "/refund-policy" :
                      activePolicyKey === "disclaimer" ? "/disclaimer" : "/privacy-policy"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-forest/10 text-forest px-3 py-1.5 rounded-xl hover:bg-forest/15 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Live Page
              </a>
            </div>

            {/* Segmented policy selector */}
            <div className="p-1.5 bg-[#f3f5f3] rounded-2xl border border-gray-200/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
                {[
                  { key: "privacy", label: "Privacy Policy", icon: Lock },
                  { key: "terms", label: "Terms & Cond.", icon: FileText },
                  { key: "shipping", label: "Shipping", icon: Truck },
                  { key: "refund", label: "Return & Refund", icon: RotateCcw },
                  { key: "disclaimer", label: "Disclaimer", icon: AlertCircle },
                  { key: "hub", label: "Top Banner", icon: Sparkles },
                ].map((p) => {
                  const Icon = p.icon;
                  const isActive = activePolicyKey === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setActivePolicyKey(p.key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? "bg-white text-forest shadow-sm border border-forest/20 font-bold"
                          : "text-gray-600 hover:text-forest hover:bg-white/50"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-forest" : "text-gray-400"}`} />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Top Hub Banner Selected */}
            {activePolicyKey === "hub" ? (
              <div className="space-y-6 pt-2">
                <div className="bg-[#fafcfa] p-5 rounded-2xl border border-forest/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-forest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold" /> Trust &amp; Compliance Header Banner
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        This title and subtitle appear above the tabs on the /privacy-policy and legal pages.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Badge Tagline</Label>
                      <Input
                        className="text-xs mt-1.5 bg-white"
                        placeholder="Policies & Legal Center"
                        value={form.policies?.hubBadge || ""}
                        onChange={(e) => updatePolicy("hubBadge", "", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Main Banner Title</Label>
                      <Input
                        className="text-xs mt-1.5 bg-white font-semibold text-forest"
                        placeholder="Trust & Compliance"
                        value={form.policies?.hubTitle || ""}
                        onChange={(e) => updatePolicy("hubTitle", "", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Subtitle Description</Label>
                      <Input
                        className="text-xs mt-1.5 bg-white"
                        placeholder="Read about our transparent policies..."
                        value={form.policies?.hubSubtitle || ""}
                        onChange={(e) => updatePolicy("hubSubtitle", "", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Live Banner Preview Box */}
                  <div className="mt-4 pt-4 border-t border-forest/10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-forest/70 mb-2">Live Banner Preview</p>
                    <div className="bg-white p-6 rounded-xl border border-forest/10 text-center space-y-2 shadow-xs">
                      <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> {form.policies?.hubBadge || "Policies & Legal Center"}
                      </span>
                      <h2 className="text-2xl font-bold text-forest">
                        {form.policies?.hubTitle || "Trust & Compliance"}
                      </h2>
                      <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                        {form.policies?.hubSubtitle || "Read about our transparent policies on privacy, terms, shipping, and returns."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Policy Editor */
              (() => {
                const currentPolicy = (form.policies && form.policies[activePolicyKey]) || DEFAULT_POLICIES[activePolicyKey] || {};
                const sections = currentPolicy.sections || [];
                const policyNameMap = {
                  privacy: "Privacy Policy",
                  terms: "Terms & Conditions",
                  shipping: "Shipping & Delivery Policy",
                  refund: "Return & Refund Policy",
                  disclaimer: "Medical & Product Disclaimer",
                };
                const routeMap = {
                  privacy: "/privacy-policy",
                  terms: "/terms-conditions",
                  shipping: "/shipping-policy",
                  refund: "/refund-policy",
                  disclaimer: "/disclaimer",
                };

                return (
                  <div className="space-y-6 pt-2">
                    {/* Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8faf8] p-4 rounded-xl border border-forest/15">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                          {activePolicyKey === "privacy" && <Lock className="w-4 h-4" />}
                          {activePolicyKey === "terms" && <FileText className="w-4 h-4" />}
                          {activePolicyKey === "shipping" && <Truck className="w-4 h-4" />}
                          {activePolicyKey === "refund" && <RotateCcw className="w-4 h-4" />}
                          {activePolicyKey === "disclaimer" && <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-forest text-sm">
                            {currentPolicy.title || policyNameMap[activePolicyKey]}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            Route: <code className="text-forest font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-forest/10">{routeMap[activePolicyKey]}</code>
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50 h-8"
                        onClick={() => resetSinglePolicy(activePolicyKey)}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Template
                      </Button>
                    </div>

                    {/* Policy Page Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs">
                      <div>
                        <Label className="text-xs font-semibold text-gray-700">Policy Page Heading</Label>
                        <Input
                          value={currentPolicy.title || ""}
                          onChange={(e) => updatePolicy(activePolicyKey, "title", e.target.value)}
                          placeholder="Policy Title"
                          className="mt-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700">Subtitle / Last Updated Tagline</Label>
                        <Input
                          value={currentPolicy.lastUpdated || ""}
                          onChange={(e) => updatePolicy(activePolicyKey, "lastUpdated", e.target.value)}
                          placeholder="e.g. Last Updated: August 2026 | Wellmaats"
                          className="mt-1.5 text-sm"
                        />
                      </div>
                    </div>

                    {/* Shipping Top Highlight Badges */}
                    {activePolicyKey === "shipping" && (
                      <div className="border border-forest/15 rounded-xl p-5 bg-[#fafcfa] space-y-3 shadow-xs">
                        <h5 className="font-bold text-xs text-forest uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-gold" /> Shipping Top Highlight Badges
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-forest/10 space-y-2">
                            <Label className="text-[11px] font-bold text-forest uppercase">Badge 1 (24hr Dispatch)</Label>
                            <Input
                              value={currentPolicy.dispatchText || ""}
                              onChange={(e) => updatePolicy("shipping", "dispatchText", e.target.value)}
                              placeholder="24hr Dispatch"
                              className="text-xs h-8"
                            />
                            <Input
                              value={currentPolicy.dispatchSubtext || ""}
                              onChange={(e) => updatePolicy("shipping", "dispatchSubtext", e.target.value)}
                              placeholder="Orders shipped on priority"
                              className="text-xs h-8 text-muted-foreground"
                            />
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-forest/10 space-y-2">
                            <Label className="text-[11px] font-bold text-forest uppercase">Badge 2 (Free Shipping)</Label>
                            <Input
                              value={currentPolicy.freeShippingText || ""}
                              onChange={(e) => updatePolicy("shipping", "freeShippingText", e.target.value)}
                              placeholder="Free Shipping"
                              className="text-xs h-8"
                            />
                            <Input
                              value={currentPolicy.freeShippingSubtext || ""}
                              onChange={(e) => updatePolicy("shipping", "freeShippingSubtext", e.target.value)}
                              placeholder="On all orders above ₹499"
                              className="text-xs h-8 text-muted-foreground"
                            />
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-forest/10 space-y-2">
                            <Label className="text-[11px] font-bold text-forest uppercase">Badge 3 (Live Tracking)</Label>
                            <Input
                              value={currentPolicy.trackingText || ""}
                              onChange={(e) => updatePolicy("shipping", "trackingText", e.target.value)}
                              placeholder="Live Tracking"
                              className="text-xs h-8"
                            />
                            <Input
                              value={currentPolicy.trackingSubtext || ""}
                              onChange={(e) => updatePolicy("shipping", "trackingSubtext", e.target.value)}
                              placeholder="SMS & Email updates"
                              className="text-xs h-8 text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clauses list */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-forest uppercase tracking-wider">
                            Policy Clauses &amp; Sections
                          </h5>
                          <span className="text-xs font-semibold bg-forest/10 text-forest px-2 py-0.5 rounded-full">
                            {sections.length} clauses
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs text-forest border-forest/20 hover:bg-forest/5 h-8"
                          onClick={() => addPolicySection(activePolicyKey)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add New Clause
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {sections.map((sec, secIdx) => (
                          <div
                            key={secIdx}
                            className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-forest/25 shadow-xs transition-colors space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                              <span className="text-xs font-bold bg-forest/10 text-forest px-2.5 py-1 rounded-md">
                                Clause #{secIdx + 1}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
                                onClick={() => removePolicySection(activePolicyKey, secIdx)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Clause
                              </Button>
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-gray-700">Clause Heading</Label>
                              <Input
                                value={sec.heading || ""}
                                onChange={(e) =>
                                  updatePolicySection(activePolicyKey, secIdx, "heading", e.target.value)
                                }
                                placeholder="e.g. 1. Information Collection"
                                className="text-xs mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-gray-700">Clause Content &amp; Points</Label>
                              <Textarea
                                value={sec.content || ""}
                                onChange={(e) =>
                                  updatePolicySection(activePolicyKey, secIdx, "content", e.target.value)
                                }
                                placeholder="Write clause details, policies, bullet points, or instructions..."
                                rows={3}
                                className="text-xs leading-relaxed mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full text-xs font-semibold text-forest border-dashed border-forest/30 hover:bg-forest/5 py-3 rounded-xl"
                          onClick={() => addPolicySection(activePolicyKey)}
                        >
                          <Plus className="w-4 h-4 mr-1.5" /> Add Another Clause
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </TabsContent>

        {/* ══ DYNAMIC SHIPPING & DELIVERY RULES TAB ══ */}
        <TabsContent value="shipping" className="space-y-6 mt-6">
          {/* Card 1: Delivery Charges & Free Delivery Rules */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-forest text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-forest" />
                  Dynamic Delivery Charges &amp; Free Shipping Rules
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure minimum cart threshold for free shipping, base fees, and weight-based delivery rates. Changes take effect in the customer cart &amp; checkout instantly.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-leaf/40 px-3.5 py-1.5 rounded-full border border-forest/15 text-xs font-semibold text-forest">
                <span>Free Delivery at:</span>
                <strong className="text-sm">₹{form?.shippingSettings?.freeDeliveryThreshold ?? 2499}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Minimum Order Value for Free Delivery */}
              <div className="space-y-2 p-4 rounded-xl bg-[#f8faf8] border border-forest/10">
                <Label className="text-xs font-semibold text-forest flex items-center justify-between">
                  <span>Free Delivery Threshold (₹) *</span>
                  <span className="text-[10px] bg-forest text-white px-2 py-0.5 rounded-full">Primary</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <Input
                    type="number"
                    min="0"
                    value={form?.shippingSettings?.freeDeliveryThreshold ?? 2499}
                    onChange={(e) => update("shippingSettings.freeDeliveryThreshold", Number(e.target.value))}
                    className="pl-7 bg-white rounded-xl text-base font-bold text-forest"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Orders equal or above this amount automatically unlock <strong>FREE Delivery</strong>.
                </p>
              </div>

              {/* Base Delivery Fee */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Base Delivery Charge (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <Input
                    type="number"
                    min="0"
                    value={form?.shippingSettings?.baseShippingCharge ?? 70}
                    onChange={(e) => update("shippingSettings.baseShippingCharge", Number(e.target.value))}
                    className="pl-7 bg-white rounded-xl text-base font-bold"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Charged on orders below the threshold (up to base weight limit).
                </p>
              </div>

              {/* Base Weight Limit */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Base Weight Covered *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={form?.shippingSettings?.baseWeightLimitGrams ?? 500}
                    onChange={(e) => update("shippingSettings.baseWeightLimitGrams", Number(e.target.value))}
                    className="bg-white rounded-xl text-base font-bold flex-1"
                  />
                  <span className="text-xs font-bold text-gray-500 bg-white px-3 py-2.5 rounded-xl border border-gray-200">
                    Grams
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Standard package weight covered under the base delivery charge (e.g. 500g).
                </p>
              </div>

              {/* Additional Charge per kg */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Additional Fee per kg (+₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">+₹</span>
                  <Input
                    type="number"
                    min="0"
                    value={form?.shippingSettings?.additionalChargePerKg ?? 40}
                    onChange={(e) => update("shippingSettings.additionalChargePerKg", Number(e.target.value))}
                    className="pl-8 bg-white rounded-xl text-base font-bold"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Added for each additional 1000g exceeding the base weight limit.
                </p>
              </div>

              {/* Flat Fallback Delivery Fee */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Fallback Flat Fee (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <Input
                    type="number"
                    min="0"
                    value={form?.shippingSettings?.flatFallbackDeliveryCharge ?? 70}
                    onChange={(e) => update("shippingSettings.flatFallbackDeliveryCharge", Number(e.target.value))}
                    className="pl-7 bg-white rounded-xl text-base font-bold"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Used if product weight is not specified.
                </p>
              </div>

              {/* Delivery Announcement Notice */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Delivery Promo Banner Text</Label>
                <Input
                  value={form?.shippingSettings?.deliveryNotice ?? "Free delivery on all orders above ₹2,499!"}
                  onChange={(e) => update("shippingSettings.deliveryNotice", e.target.value)}
                  className="bg-white rounded-xl text-xs"
                  placeholder="e.g. Free delivery on orders above ₹2,499!"
                />
                <p className="text-[11px] text-muted-foreground">
                  Shown in the top announcement bar, cart drawer, and checkout banner.
                </p>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="rounded-xl border border-forest/20 bg-leaf/25 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-forest">Live Delivery Fee Preview</p>
                  <p className="text-xs text-muted-foreground">
                    Cart value ₹1,800 (below ₹{form?.shippingSettings?.freeDeliveryThreshold ?? 2499}) weighing 1.2 kg package:
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground line-through mr-1">FREE</span>
                  <span className="text-base font-bold text-forest">
                    ₹{(form?.shippingSettings?.baseShippingCharge ?? 70) + (form?.shippingSettings?.additionalChargePerKg ?? 40)}
                  </span>
                  <p className="text-[10px] text-gray-500">Base ₹{form?.shippingSettings?.baseShippingCharge ?? 70} + Extra wt ₹{form?.shippingSettings?.additionalChargePerKg ?? 40}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Default Brand Manufacturing & Selling Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-bold text-forest text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-forest" />
                Default Brand Manufacturing &amp; Seller Compliance Info
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                These details will be used as default fallback across all products in the "Manufactured By &amp; Sold By" section if not customized per product.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Default Manufactured By (Company)</Label>
                <Input
                  value={form?.defaultManufacturingDetails?.manufacturedBy || ""}
                  onChange={(e) => update("defaultManufacturingDetails.manufacturedBy", e.target.value)}
                  placeholder="e.g. Sanjeevani Ayurvedic Pharmacy Pvt. Ltd."
                  className="bg-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Default Ayush / FSSAI / Mfg License</Label>
                <Input
                  value={form?.defaultManufacturingDetails?.mfgLicenseNumber || ""}
                  onChange={(e) => update("defaultManufacturingDetails.mfgLicenseNumber", e.target.value)}
                  placeholder="e.g. AYU-1284 / FSSAI 10020011000123"
                  className="bg-white rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-semibold">Default Manufacturing Plant Address</Label>
                <Input
                  value={form?.defaultManufacturingDetails?.manufacturerAddress || ""}
                  onChange={(e) => update("defaultManufacturingDetails.manufacturerAddress", e.target.value)}
                  placeholder="e.g. Industrial Area, Phase II, Haridwar, Uttarakhand - 249401"
                  className="bg-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Default Marketed / Sold By</Label>
                <Input
                  value={form?.defaultManufacturingDetails?.soldBy || "Wellmaats Healthcare"}
                  onChange={(e) => update("defaultManufacturingDetails.soldBy", e.target.value)}
                  placeholder="Wellmaats Healthcare"
                  className="bg-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Country of Origin</Label>
                <Input
                  value={form?.defaultManufacturingDetails?.countryOfOrigin || "India"}
                  onChange={(e) => update("defaultManufacturingDetails.countryOfOrigin", e.target.value)}
                  placeholder="India"
                  className="bg-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Seller Office Address</Label>
                <Input
                  value={form?.defaultManufacturingDetails?.sellerAddress || ""}
                  onChange={(e) => update("defaultManufacturingDetails.sellerAddress", e.target.value)}
                  placeholder="Registered corporate address"
                  className="bg-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Customer Care (Email &amp; Toll-Free/Phone)</Label>
                <Input
                  value={form?.defaultManufacturingDetails?.customerCareContact || ""}
                  onChange={(e) => update("defaultManufacturingDetails.customerCareContact", e.target.value)}
                  placeholder="care@wellmaats.in | +91 98765 43210"
                  className="bg-white rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Dynamic GST & Tax Invoicing Rules */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-forest text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-forest" />
                  Dynamic Tax &amp; GST Invoicing Rules
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Product catalog prices are <strong>inclusive of GST</strong> (e.g. ₹800 or ₹1,000 includes GST). Delivery charges are added separately unless order qualifies for free delivery.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold text-emerald-800">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                <span>Default GST: <strong>{form?.taxSettings?.defaultGstRate ?? 5}%</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Default GST Rate */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Default Catalog GST Rate (%) *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="28"
                    step="0.5"
                    value={form?.taxSettings?.defaultGstRate ?? 5}
                    onChange={(e) => update("taxSettings.defaultGstRate", Number(e.target.value))}
                    className="bg-white rounded-xl text-base font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Standard 5% for Ayurvedic medicines/herbs.</p>
              </div>

              {/* Company GSTIN */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Company GSTIN Number</Label>
                <Input
                  value={form?.taxSettings?.gstNumber || ""}
                  onChange={(e) => update("taxSettings.gstNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  className="bg-white rounded-xl uppercase font-mono text-xs font-bold"
                />
                <p className="text-[11px] text-muted-foreground">Printed on official customer GST invoices.</p>
              </div>

              {/* Company PAN */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Company PAN Number</Label>
                <Input
                  value={form?.taxSettings?.panNumber || ""}
                  onChange={(e) => update("taxSettings.panNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="bg-white rounded-xl uppercase font-mono text-xs font-bold"
                />
                <p className="text-[11px] text-muted-foreground">Shown in tax declaration section.</p>
              </div>

              {/* Tax Invoice Prefix */}
              <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700">Invoice Number Prefix</Label>
                <Input
                  value={form?.taxSettings?.taxInvoicePrefix || "INV-WM"}
                  onChange={(e) => update("taxSettings.taxInvoicePrefix", e.target.value.toUpperCase())}
                  placeholder="INV-WM"
                  className="bg-white rounded-xl uppercase font-mono text-xs font-bold"
                />
                <p className="text-[11px] text-muted-foreground">e.g. INV-WM/2026/001</p>
              </div>
            </div>

            {/* Live Reverse GST Math Breakdown Banner */}
            {(() => {
              const rate = Number(form?.taxSettings?.defaultGstRate ?? 5) || 5;
              const sampleSalePrice = 800;
              const taxable = Number((sampleSalePrice / (1 + rate / 100)).toFixed(2));
              const gst = Number((sampleSalePrice - taxable).toFixed(2));
              const cgst = Number((gst / 2).toFixed(2));
              const sgst = Number((gst - cgst).toFixed(2));
              const sampleDelivery = Number(form?.shippingSettings?.baseShippingCharge ?? 70);

              return (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                        ₹
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                          Live Tax-Inclusive Pricing Breakdown Example (MRP ₹1,200 → Sale ₹{sampleSalePrice})
                        </h4>
                        <p className="text-[11px] text-emerald-800">
                          Customer pays exactly <strong>₹{sampleSalePrice}</strong> for the product (GST already included), plus delivery fee if applicable:
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      Standard Indian GST Reverse Math
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-muted-foreground block">Customer Selling Price</span>
                      <strong className="text-sm text-gray-900">₹{sampleSalePrice}.00</strong>
                      <span className="text-[9px] text-emerald-700 block">Incl. of GST</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-muted-foreground block">Taxable Base Amount</span>
                      <strong className="text-sm text-gray-900">₹{taxable}</strong>
                      <span className="text-[9px] text-gray-500 block">Excl. Tax</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-muted-foreground block">CGST ({rate / 2}%)</span>
                      <strong className="text-sm text-gray-900">₹{cgst}</strong>
                      <span className="text-[9px] text-gray-500 block">Central Tax</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-muted-foreground block">SGST ({rate / 2}%)</span>
                      <strong className="text-sm text-gray-900">₹{sgst}</strong>
                      <span className="text-[9px] text-gray-500 block">State Tax</span>
                    </div>
                    <div className="bg-emerald-700 text-white p-2.5 rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-200 block">With Delivery (+₹{sampleDelivery})</span>
                      <strong className="text-sm">₹{sampleSalePrice + sampleDelivery}.00</strong>
                      <span className="text-[9px] text-emerald-100 block">Final Total</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminSettings;
