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

/* ── Inline "Add New" select ───────────────────────────────────── */
function QuickAddSelect({ value, onValueChange, options, placeholder, onAddNew, addLabel }) {
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
            className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center hover:bg-forest/90 shrink-0">
            <Check className="w-4 h-4" />
          </button>
          <button type="button" onClick={cancel}
            className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Select value={value} onValueChange={(v) => { if (v === "__add_new__") return; onValueChange(v); }}>
          <SelectTrigger className="rounded-xl border-gray-200">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
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
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  imageLoadingState,
  setImageLoadingState,
  productCategories,
  brands,
  isValid,
  saving,
  onAddCategory,
  onAddBrand,
}) {
  function setField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const discount = getDiscountPercent(formData);
  const categoryLabel = productCategories.find((c) => c.id === formData.category)?.label || "—";
  const salePriceNum = Number(formData.salePrice);
  const mrpNum = Number(formData.price);
  const savings = salePriceNum > 0 && mrpNum > salePriceNum ? mrpNum - salePriceNum : 0;

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-8">
      {/* Image */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-forest uppercase tracking-wide border-b pb-2">
          Product Image
        </h3>
        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isEditMode={false}
          previewUrl={uploadedImageUrl || formData.image}
        />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Or paste image URL / local path (e.g. /products/signature.jpg)
          </Label>
          <Input
            value={uploadedImageUrl || formData.image || ""}
            onChange={(e) => {
              setUploadedImageUrl(e.target.value);
              setField("image", e.target.value);
            }}
            placeholder="/products/signature.jpg"
          />
        </div>
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
            placeholder="e.g. Immunity Booster Drops"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <QuickAddSelect
              value={formData.category}
              onValueChange={(v) => setField("category", v)}
              options={productCategories}
              placeholder="Select category"
              addLabel="Category"
              onAddNew={(name) => {
                const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                onAddCategory?.({ id, label: name });
                setField("category", id);
              }}
            />
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
        </div>
        {formData.category && (
          <p className="text-xs text-muted-foreground bg-leaf px-3 py-2 rounded-lg">
            Customer will see category: <strong className="text-forest">{categoryLabel}</strong>
          </p>
        )}
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
