import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ProductImageUpload from "./image-upload";
import { getDiscountPercent, toDatetimeLocalValue } from "@/lib/product-offers";
import { useState, useRef } from "react";
import { Plus, Check, X, Building2, Scale, Package, ShieldCheck, Sparkles } from "lucide-react";
import DynamicIcon from "@/components/common/dynamic-icon";
import RichTextEditor from "@/components/common/RichTextEditor";

/* ── Inline "Add New" select ───────────────────────────────────── */
function QuickAddSelect({ value, onValueChange, options = [], placeholder, onAddNew, addLabel }) {
  const [adding, setAdding]   = useState(false);
  const [newVal, setNewVal]   = useState("");
  const inputRef              = useRef();

  function startAdd(e) {
    e.preventDefault();
    setAdding(true);
    setNewVal("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function confirm(e) {
    e?.preventDefault();
    const trimmed = newVal.trim();
    if (!trimmed) { setAdding(false); return; }
    onAddNew(trimmed);
    setAdding(false);
    setNewVal("");
  }

  function cancel() { setAdding(false); setNewVal(""); }

  // Ensure current value is in options so SelectValue never renders blank
  const safeOptions = [...options];
  if (value && !safeOptions.some((o) => o.id === value)) {
    safeOptions.unshift({ id: value, label: value.replace(/-/g, " ") });
  }

  return (
    <div className="space-y-2">
      {adding ? (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirm(); } if (e.key === "Escape") cancel(); }}
            placeholder={`Enter ${addLabel} name…`}
            className="flex-1 h-9 rounded-xl border-forest/30 focus:border-forest"
          />
          <button type="button" onClick={confirm}
            className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center hover:bg-forest/90 shrink-0 shadow-sm">
            <Check className="w-4 h-4" />
          </button>
          <button type="button" onClick={cancel}
            className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Select value={value || ""} onValueChange={(v) => { if (v === "__add_new__") return; onValueChange(v); }}>
          <SelectTrigger className="rounded-xl border-gray-200 bg-white">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {safeOptions.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                <div className="flex items-center gap-2">
                  <DynamicIcon icon={o.icon} categoryId={o.id} className="w-3.5 h-3.5 text-forest shrink-0" />
                  <span>{o.label}</span>
                </div>
              </SelectItem>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button type="button" onClick={startAdd}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-forest font-semibold hover:bg-leaf/50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add New {addLabel}
              </button>
            </div>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function AdminProductForm({
  formData,
  setFormData,
  onSubmit,
  isEdit,
  mainCategories = [],
  productCategories = [],
  brands = [],
  isValid,
  saving,
  onAddMainCategory,
  onAddCategory,
  onAddSubCategory,
  onAddBrand,
}) {
  const [localExtraSubs, setLocalExtraSubs] = useState({});

  function setField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Filter Subcategories by Main Category if selected
  const availableSubCategories = formData.mainCategory
    ? productCategories.filter((c) => c.mainCategory === formData.mainCategory || !c.mainCategory)
    : productCategories;

  const selectedSubCat = productCategories.find((c) => c.id === formData.category);
  const baseChildSubs = selectedSubCat?.subCategories || [];
  const extraChildSubs = localExtraSubs[formData.category] || [];
  const availableChildCategories = [
    ...baseChildSubs,
    ...extraChildSubs.filter((e) => !baseChildSubs.some((b) => b.id === e.id)),
  ];

  function handleQuickAddChildCategory(name) {
    if (!formData.category) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newChild = { id, label: name };
    setLocalExtraSubs((prev) => ({
      ...prev,
      [formData.category]: [...(prev[formData.category] || []), newChild],
    }));
    setFormData((prev) => ({ ...prev, subCategory: id, childCategory: id }));
    onAddSubCategory?.(formData.category, newChild);
  }

  const discount = getDiscountPercent(formData);
  const mainCatLabel = mainCategories.find((m) => m.id === formData.mainCategory)?.label || "";
  const categoryLabel = selectedSubCat?.label || formData.category?.replace(/-/g, " ") || "—";
  const childCategoryLabel = availableChildCategories.find((s) => s.id === (formData.childCategory || formData.subCategory))?.label
    || formData.childCategory?.replace(/-/g, " ")
    || formData.subCategory?.replace(/-/g, " ")
    || "";

  const salePriceNum = Number(formData.salePrice);
  const mrpNum = Number(formData.price);
  const savings = salePriceNum > 0 && mrpNum > salePriceNum ? mrpNum - salePriceNum : 0;

  const currentImages = Array.isArray(formData.images)
    ? formData.images
    : formData.image
    ? [formData.image]
    : [];

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-8">
      {/* Product Media */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-forest uppercase tracking-wide border-b pb-2">
          Product Media (Images &amp; Video)
        </h3>
        <ProductImageUpload
          images={currentImages}
          setImages={(newImages) => {
            setFormData((prev) => ({
              ...prev,
              images: newImages,
              image: prev.image && newImages.includes(prev.image) ? prev.image : (newImages[0] || ""),
            }));
          }}
          primaryImage={formData.image || currentImages[0] || ""}
          setPrimaryImage={(newPrimary) => {
            setFormData((prev) => ({
              ...prev,
              image: newPrimary,
            }));
          }}
          video={formData.video || ""}
          setVideo={(newVideo) => {
            setFormData((prev) => ({
              ...prev,
              video: newVideo,
            }));
          }}
        />
      </section>

      {/* Basic Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-forest uppercase tracking-wide border-b pb-2">
          Basic Information
        </h3>
        <div className="space-y-2">
          <Label>Product Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Kumkumadi Ayurvedic Face Serum"
          />
        </div>
        <div className="space-y-2">
          <Label>Short Description *</Label>
          <p className="text-xs text-muted-foreground">Supports <strong>bold</strong>, <em>italic</em>, bullet lists, highlight, and tables</p>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => setField("description", html)}
            placeholder="Brief product description for listing & modal"
            minHeight={100}
          />
        </div>

        {/* 3-Level Category Hierarchy */}
        <div className="p-4 rounded-2xl bg-[#f8faf8] border border-forest/15 space-y-4">
          <p className="text-xs font-bold text-forest uppercase tracking-wider">
            Category Hierarchy (3 Levels)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Level 1: Main Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1. Main Category</Label>
              <QuickAddSelect
                value={formData.mainCategory || ""}
                onValueChange={(v) => {
                  setFormData((prev) => ({
                    ...prev,
                    mainCategory: v,
                  }));
                }}
                options={mainCategories}
                placeholder="Select Main Category"
                addLabel="Main Category"
                onAddNew={(name) => {
                  const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                  onAddMainCategory?.({ id, label: name, subCategories: [] });
                  setFormData((prev) => ({ ...prev, mainCategory: id }));
                }}
              />
            </div>

            {/* Level 2: Sub Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">2. Sub Category *</Label>
              <QuickAddSelect
                value={formData.category || ""}
                onValueChange={(v) => {
                  const found = productCategories.find((c) => c.id === v);
                  setFormData((prev) => ({
                    ...prev,
                    category: v,
                    mainCategory: prev.mainCategory || found?.mainCategory || "",
                    subCategory: "",
                    childCategory: "",
                  }));
                }}
                options={availableSubCategories}
                placeholder="Select Sub Category"
                addLabel="Sub Category"
                onAddNew={(name) => {
                  const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                  onAddCategory?.({ id, label: name, mainCategory: formData.mainCategory || "", subCategories: [] });
                  setFormData((prev) => ({ ...prev, category: id, subCategory: "", childCategory: "" }));
                }}
              />
            </div>

            {/* Level 3: Child Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">3. Child Category</Label>
              <QuickAddSelect
                value={formData.childCategory || formData.subCategory || ""}
                onValueChange={(v) => {
                  setFormData((prev) => ({ ...prev, subCategory: v, childCategory: v }));
                }}
                options={availableChildCategories}
                placeholder={formData.category ? (availableChildCategories.length ? "Select Child Category" : "No child categories yet") : "Select Sub Category first"}
                addLabel="Child Category"
                onAddNew={handleQuickAddChildCategory}
              />
            </div>
          </div>

          {/* Live Hierarchy Path Indicator */}
          <div className="text-xs text-muted-foreground bg-white p-2.5 rounded-xl border border-forest/10 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-forest/70">Hierarchy:</span>
            {mainCatLabel && (
              <>
                <strong className="text-forest">{mainCatLabel}</strong>
                <span>›</span>
              </>
            )}
            <strong className="text-forest">{categoryLabel}</strong>
            {childCategoryLabel && (
              <>
                <span>›</span>
                <strong className="text-forest bg-forest/10 px-2 py-0.5 rounded border border-forest/20">{childCategoryLabel}</strong>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Brand *</Label>
          <QuickAddSelect
            value={formData.brand}
            onValueChange={(v) => setField("brand", v)}
            options={brands}
            placeholder="Select brand"
            addLabel="Brand"
            onAddNew={(name) => {
              const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
              onAddBrand?.({ id, label: name });
              setField("brand", id);
            }}
          />
        </div>
      </section>

      {/* Product Type, Size & Measurable Weight */}
      <section className="space-y-4 p-5 rounded-2xl bg-[#f9fafb] border border-forest/15">
        <div className="flex items-center gap-2 border-b border-forest/10 pb-2">
          <Scale className="w-4 h-4 text-forest" />
          <h3 className="text-sm font-semibold text-forest uppercase tracking-wide">
            Product Type, Size &amp; Weight (Measurables)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Type (Dosage Form) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Product Type (Form) *</Label>
            <Select
              value={formData.productType || "Capsule"}
              onValueChange={(v) => setField("productType", v)}
            >
              <SelectTrigger className="rounded-xl border-gray-200 bg-white">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {["Capsule", "Tablet", "Syrup", "Powder", "Oil", "Ointment", "Drops", "Churna", "Cream", "Gel", "Decoction", "Other"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">e.g. Capsule, Syrup, Tablet, Oil</p>
          </div>

          {/* 2. Size / Packaging */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Packaging Size</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={formData.sizeValue || ""}
                onChange={(e) => setField("sizeValue", e.target.value)}
                placeholder="e.g. 60, 200"
                className="w-1/2 rounded-xl bg-white"
              />
              <Select
                value={formData.sizeUnit || "Capsules"}
                onValueChange={(v) => setField("sizeUnit", v)}
              >
                <SelectTrigger className="w-1/2 rounded-xl border-gray-200 bg-white">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {["Capsules", "Tablets", "ml", "gm", "kg", "Pieces", "Pack"].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">Shown to buyers: {formData.sizeValue || "60"} {formData.sizeUnit || "Capsules"}</p>
          </div>

          {/* 3. Delivery / Gross Weight */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Gross Delivery Weight *</span>
              <span className="text-[10px] text-forest font-bold">For Delivery Fee</span>
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.grossWeightInGrams || ""}
                onChange={(e) => {
                  setField("grossWeightInGrams", e.target.value);
                  setField("netWeight", e.target.value);
                }}
                placeholder="250"
                className="rounded-xl bg-white flex-1"
              />
              <span className="text-xs font-semibold text-muted-foreground px-2 py-2 bg-white rounded-xl border border-gray-200">
                Grams (g)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {Number(formData.grossWeightInGrams || 0) >= 1000
                ? `${(Number(formData.grossWeightInGrams) / 1000).toFixed(2)} kg package weight`
                : `${formData.grossWeightInGrams || 250}g package weight`}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing & Stock */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-forest uppercase tracking-wide border-b pb-2">
          Pricing, Offers & Inventory
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>MRP (₹) *</Label>
            <Input type="number" min="0" value={formData.price} onChange={(e) => setField("price", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sale Price (₹)</Label>
            <Input type="number" min="0" value={formData.salePrice} onChange={(e) => setField("salePrice", e.target.value)} placeholder="0 = no discount" />
          </div>
          <div className="space-y-2">
            <Label>Stock Quantity *</Label>
            <Input type="number" min="0" value={formData.totalStock} onChange={(e) => setField("totalStock", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Average Rating</Label>
            <Input type="number" min="0" max="5" step="0.1" value={formData.averageReview} onChange={(e) => setField("averageReview", e.target.value)} />
          </div>
        </div>

        {/* GST & Tax Compliance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#f8faf8] border border-forest/15">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-forest flex items-center justify-between">
              <span>GST Rate (%) *</span>
              <span className="text-[10px] text-muted-foreground">Price is Tax-Inclusive</span>
            </Label>
            <Select
              value={String(formData.gstRate != null ? formData.gstRate : "5")}
              onValueChange={(v) => setField("gstRate", Number(v))}
            >
              <SelectTrigger className="bg-white rounded-xl">
                <SelectValue placeholder="GST Rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% (Nil / Exempt)</SelectItem>
                <SelectItem value="5">5% (Standard Ayurvedic)</SelectItem>
                <SelectItem value="12">12% (Formulations)</SelectItem>
                <SelectItem value="18">18% (Cosmetics / Supplements)</SelectItem>
                <SelectItem value="28">28% (Luxury)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Standard 5% for Ayurvedic products.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-forest flex items-center justify-between">
              <span>HSN Code (Tax Category)</span>
              <span className="text-[10px] text-muted-foreground bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full font-normal">
                📄 Invoice only (hidden from website)
              </span>
            </Label>
            <Input
              value={formData.hsnCode || "3004"}
              onChange={(e) => setField("hsnCode", e.target.value)}
              placeholder="e.g. 3004"
              className="bg-white rounded-xl font-mono text-xs font-bold"
            />
            <p className="text-[11px] text-muted-foreground">HSN 3004: Medicaments / Ayurvedic extracts. Used exclusively on customer tax invoices.</p>
          </div>
        </div>

        {/* Live Tax Breakdown Card for this product */}
        {(() => {
          const sellingPrice = salePriceNum > 0 ? salePriceNum : mrpNum;
          if (sellingPrice <= 0) return null;
          const rate = Number(formData.gstRate != null ? formData.gstRate : 5) || 0;
          const taxable = rate > 0 ? Number((sellingPrice / (1 + rate / 100)).toFixed(2)) : sellingPrice;
          const gstAmt = Number((sellingPrice - taxable).toFixed(2));
          const cgst = Number((gstAmt / 2).toFixed(2));
          const sgst = Number((gstAmt - cgst).toFixed(2));

          return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">
                  Customer Pays: ₹{sellingPrice} (Inclusive of {rate}% GST)
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Delivery charged extra
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-muted-foreground block text-[10px]">Taxable Base</span>
                  <strong className="text-forest">₹{taxable}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-muted-foreground block text-[10px]">CGST ({rate / 2}%)</span>
                  <strong className="text-forest">₹{cgst}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-muted-foreground block text-[10px]">SGST ({rate / 2}%)</span>
                  <strong className="text-forest">₹{sgst}</strong>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Live discount preview */}
        {discount > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm">
            <p className="font-semibold text-orange-800">Customer will see:</p>
            <p className="text-orange-700 mt-1">
              <span className="line-through text-muted-foreground">₹{formData.price}</span>
              {" → "}
              <strong>₹{formData.salePrice}</strong>
              {" · "}
              <span className="font-bold text-red-600">{discount}% OFF</span>
              {savings > 0 && ` · Save ₹${savings}`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Featured on Homepage</Label>
            <Select value={String(formData.isFeatured)} onValueChange={(v) => setField("isFeatured", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>⚡ Flash Sale</Label>
            <Select value={String(formData.isFlashSale)} onValueChange={(v) => setField("isFlashSale", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes — Flash Sale badge</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.isFlashSale === "true" || formData.isFlashSale === true ? (
          <div className="space-y-4 p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div className="space-y-2">
              <Label>Flash Sale Label</Label>
              <Input
                value={formData.offerLabel || "Flash Sale"}
                onChange={(e) => setField("offerLabel", e.target.value)}
                placeholder="Flash Sale"
              />
            </div>
            <div className="space-y-2">
              <Label>Sale Ends At (optional countdown)</Label>
              <Input
                type="datetime-local"
                value={toDatetimeLocalValue(formData.flashSaleEndsAt)}
                onChange={(e) => setField("flashSaleEndsAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
              />
              <p className="text-xs text-muted-foreground">Leave empty for ongoing flash sale</p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Ayurvedic Details */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-forest uppercase tracking-wide border-b pb-2">
          Ayurvedic Details (shown in product modal)
        </h3>
        <div className="space-y-2">
          <Label>Ingredients</Label>
          <RichTextEditor
            value={formData.ingredients}
            onChange={(html) => setField("ingredients", html)}
            placeholder="Tulsi, Ashwagandha, Giloy, Amla..."
            minHeight={80}
          />
        </div>
        <div className="space-y-2">
          <Label>Benefits</Label>
          <RichTextEditor
            value={formData.benefits}
            onChange={(html) => setField("benefits", html)}
            placeholder="• Boosts immunity&#10;• Improves energy...&#10;(use bullet toolbar above)"
            minHeight={80}
          />
        </div>
        <div className="space-y-2">
          <Label>How to Use</Label>
          <RichTextEditor
            value={formData.howToUse}
            onChange={(html) => setField("howToUse", html)}
            placeholder="Take 10-15 drops in warm water..."
            minHeight={80}
          />
        </div>
        <div className="space-y-2">
          <Label>Dosage</Label>
          <Input value={formData.dosage} onChange={(e) => setField("dosage", e.target.value)} placeholder="Twice daily, morning & evening" />
        </div>
      </section>

      {/* Manufacturing & Seller Compliance (Manufactured By / Sold By) */}
      <section className="space-y-4 p-5 rounded-2xl bg-[#f8faf8] border border-forest/15">
        <div className="flex items-center justify-between border-b border-forest/10 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-forest" />
            <h3 className="text-sm font-semibold text-forest uppercase tracking-wide">
              Manufactured By &amp; Sold By (Product Origin &amp; Compliance)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                soldBy: prev.soldBy || "Wellmaats Healthcare / Mother Tatwa",
                countryOfOrigin: prev.countryOfOrigin || "India",
                sellerAddress: prev.sellerAddress || "Plot No. 12, Industrial Area, New Delhi - 110020",
                customerCareContact: prev.customerCareContact || "care@wellmaats.in | +91 98765 43210",
              }));
            }}
            className="text-xs text-forest hover:text-forest/80 font-semibold flex items-center gap-1 bg-white border border-forest/20 px-2.5 py-1 rounded-lg shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" /> Autofill Brand Info
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Manufactured By (Company Name)</Label>
            <Input
              value={formData.manufacturedBy || ""}
              onChange={(e) => setField("manufacturedBy", e.target.value)}
              placeholder="e.g. Sanjeevani Ayurvedic Pharmacy Pvt. Ltd."
              className="bg-white rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Manufacturing License / Ayush / FSSAI</Label>
            <Input
              value={formData.mfgLicenseNumber || ""}
              onChange={(e) => setField("mfgLicenseNumber", e.target.value)}
              placeholder="e.g. AYU-1284 / FSSAI 10020011000123"
              className="bg-white rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs font-semibold">Manufacturer Plant Address</Label>
            <Input
              value={formData.manufacturerAddress || ""}
              onChange={(e) => setField("manufacturerAddress", e.target.value)}
              placeholder="e.g. Industrial Area, Phase II, Haridwar, Uttarakhand - 249401"
              className="bg-white rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Marketed / Sold By</Label>
            <Input
              value={formData.soldBy || ""}
              onChange={(e) => setField("soldBy", e.target.value)}
              placeholder="e.g. Wellmaats Healthcare"
              className="bg-white rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Country of Origin</Label>
            <Input
              value={formData.countryOfOrigin || "India"}
              onChange={(e) => setField("countryOfOrigin", e.target.value)}
              placeholder="India"
              className="bg-white rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Seller / Marketed Office Address</Label>
            <Input
              value={formData.sellerAddress || ""}
              onChange={(e) => setField("sellerAddress", e.target.value)}
              placeholder="Registered Office Address"
              className="bg-white rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Customer Care (Email / Phone)</Label>
            <Input
              value={formData.customerCareContact || ""}
              onChange={(e) => setField("customerCareContact", e.target.value)}
              placeholder="care@wellmaats.in | +91 98765 43210"
              className="bg-white rounded-xl"
            />
          </div>
        </div>
      </section>

      <Button type="submit" className="w-full bg-forest hover:bg-forest/90 py-6 text-base" disabled={!isValid || saving}>
        {saving ? "Saving..." : isEdit ? "Save Product Changes" : "Add Product to Store"}
      </Button>
    </form>
  );
}

export default AdminProductForm;
