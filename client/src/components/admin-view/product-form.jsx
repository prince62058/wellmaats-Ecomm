import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
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
import { Plus, Check, X } from "lucide-react";
import DynamicIcon from "@/components/common/dynamic-icon";

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
          <Textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Brief product description for listing & modal"
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
          <Textarea rows={2} value={formData.ingredients} onChange={(e) => setField("ingredients", e.target.value)} placeholder="Tulsi, Ashwagandha, Giloy, Amla..." />
        </div>
        <div className="space-y-2">
          <Label>Benefits</Label>
          <Textarea rows={2} value={formData.benefits} onChange={(e) => setField("benefits", e.target.value)} placeholder="Boosts immunity, improves energy..." />
        </div>
        <div className="space-y-2">
          <Label>How to Use</Label>
          <Textarea rows={2} value={formData.howToUse} onChange={(e) => setField("howToUse", e.target.value)} placeholder="Take 10-15 drops in warm water..." />
        </div>
        <div className="space-y-2">
          <Label>Dosage</Label>
          <Input value={formData.dosage} onChange={(e) => setField("dosage", e.target.value)} placeholder="Twice daily, morning & evening" />
        </div>
      </section>

      <Button type="submit" className="w-full bg-forest hover:bg-forest/90 py-6 text-base" disabled={!isValid || saving}>
        {saving ? "Saving..." : isEdit ? "Save Product Changes" : "Add Product to Store"}
      </Button>
    </form>
  );
}

export default AdminProductForm;
