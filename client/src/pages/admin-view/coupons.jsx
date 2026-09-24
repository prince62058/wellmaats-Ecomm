import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCoupons,
  addNewCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from "@/store/admin/coupon-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  TicketPercent,
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  Power,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const initialFormState = {
  code: "",
  title: "",
  description: "",
  discountType: "percentage",
  discountAmount: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
  userUsageLimit: "1",
  isActive: true,
  showInCheckout: true,
};

export default function AdminCoupons() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { couponList, isLoading } = useSelector((state) => state.adminCoupons);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setOpenDialog(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code || "",
      title: coupon.title || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountAmount: String(coupon.discountAmount ?? ""),
      minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : "",
      maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 10) : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 10) : "",
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
      userUsageLimit: coupon.userUsageLimit != null ? String(coupon.userUsageLimit) : "1",
      isActive: coupon.isActive !== false,
      showInCheckout: coupon.showInCheckout !== false,
    });
    setOpenDialog(true);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: `Copied "${code}" to clipboard` });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerateCode = () => {
    const prefixes = ["WELL", "AYUR", "SAVE", "FEST", "HEALTH"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const code = `${prefix}${num}`;
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast({ title: "Please enter a coupon code", variant: "destructive" });
      return;
    }
    if (!formData.discountAmount || Number(formData.discountAmount) <= 0) {
      toast({ title: "Please enter a valid discount amount", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await dispatch(updateCoupon({ id: editingId, formData })).unwrap();
        toast({ title: res?.message || "Coupon updated successfully" });
      } else {
        const res = await dispatch(addNewCoupon(formData)).unwrap();
        toast({ title: res?.message || "Coupon created successfully" });
      }
      setOpenDialog(false);
      setEditingId(null);
      setFormData(initialFormState);
    } catch (err) {
      toast({
        title: err?.message || "Failed to save coupon",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await dispatch(toggleCouponStatus(id)).unwrap();
      toast({ title: res?.message || "Status updated" });
    } catch (err) {
      toast({ title: "Failed to toggle status", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await dispatch(deleteCoupon(id)).unwrap();
      toast({ title: "Coupon deleted successfully" });
    } catch (err) {
      toast({ title: "Failed to delete coupon", variant: "destructive" });
    }
  };

  // Filter coupons
  const filteredCoupons = couponList.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coupon.title && coupon.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === "all" || coupon.discountType === filterType;

    return matchesSearch && matchesType;
  });

  // Calculate stats
  const totalCoupons = couponList.length;
  const activeCoupons = couponList.filter((c) => c.isActive).length;
  const totalUses = couponList.reduce((acc, c) => acc + (c.usageCount || 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-forest to-emerald-900 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm text-gold">
            <Sparkles className="w-3.5 h-3.5" /> Dynamic Offers & Discounts
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Coupons & Promo Codes
          </h1>
          <p className="text-white/70 text-xs md:text-sm max-w-xl">
            Create percentage or flat discount coupons, configure minimum spend requirements, set expiry dates, and let customers apply them at checkout.
          </p>
        </div>

        <div className="relative z-10">
          <Button
            onClick={handleOpenAdd}
            className="bg-gold hover:bg-gold/90 text-forest font-bold shadow-md rounded-2xl h-11 px-5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
            <TicketPercent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Coupons
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalCoupons}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Active Offers
            </div>
            <div className="text-2xl font-bold text-emerald-600">{activeCoupons}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Redemptions
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalUses}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50/70 border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-44 rounded-xl text-xs bg-gray-50 border-gray-200">
              <SelectValue placeholder="Discount Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="flat">Flat (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Coupons List */}
      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading coupons...</div>
      ) : filteredCoupons.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-8">
          <TicketPercent className="w-12 h-12 text-forest/20 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 text-lg">No Coupons Found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {searchQuery ? "Try refining your search terms." : "Get started by creating your first promotional coupon."}
          </p>
          <Button onClick={handleOpenAdd} className="bg-forest hover:bg-forest/90 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-1.5" /> Create Coupon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => {
            const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
            return (
              <div
                key={coupon._id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  !coupon.isActive || isExpired
                    ? "opacity-75 border-gray-200 bg-gray-50/50"
                    : "border-forest/15 hover:border-forest/30"
                }`}
              >
                {/* Header portion */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base md:text-lg tracking-wider text-forest bg-forest/5 px-3 py-1 rounded-xl border border-forest/15">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="text-gray-400 hover:text-forest p-1 rounded-md transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold ${
                        isExpired
                          ? "bg-red-50 text-red-600 border-red-200"
                          : coupon.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {isExpired ? "Expired" : coupon.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {coupon.title || (coupon.discountType === "percentage" ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} Flat OFF`)}
                    </h3>
                    {coupon.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {coupon.description}
                      </p>
                    )}
                  </div>

                  {/* Highlights Grid */}
                  <div className="bg-gray-50/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Discount</span>
                      <span className="font-bold text-emerald-700">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountAmount}% OFF`
                          : `₹${coupon.discountAmount} FLAT`}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Min Order</span>
                      <span className="font-semibold text-gray-800">
                        {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : "None"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Max Cap</span>
                      <span className="font-semibold text-gray-800">
                        {coupon.discountType === "percentage" && coupon.maxDiscountAmount > 0
                          ? `₹${coupon.maxDiscountAmount}`
                          : "No Limit"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Uses</span>
                      <span className="font-semibold text-gray-800">
                        {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "times"}
                      </span>
                    </div>
                  </div>

                  {/* Expiry line */}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {coupon.endDate
                        ? `Valid until ${new Date(coupon.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                        : "No expiration date"}
                    </span>
                  </div>
                </div>

                {/* Footer action bar */}
                <div className="bg-gray-50/80 border-t border-gray-100 px-5 py-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggle(coupon._id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                      coupon.isActive
                        ? "text-emerald-700 hover:bg-emerald-100/50"
                        : "text-gray-500 hover:bg-gray-200/50"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {coupon.isActive ? "Enabled" : "Disabled"}
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEdit(coupon)}
                      className="w-8 h-8 rounded-lg text-gray-600 hover:text-forest hover:bg-forest/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(coupon._id)}
                      className="w-8 h-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-forest">
              {editingId ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the promo code, discount calculations, order limits, and expiry dates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Code & Generator */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-gray-700">Coupon Code *</Label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] font-semibold text-forest hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-gold" /> Auto-generate
                </button>
              </div>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WELCOME10, FESTIVE25"
                className="font-mono uppercase font-bold tracking-wider rounded-xl"
                required
              />
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Welcome 10% Special"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Get 10% off on all Ayurvedic wellness products"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Type & Discount Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">
                  {formData.discountType === "percentage" ? "Percentage Off (%) *" : "Flat Off (₹) *"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  placeholder={formData.discountType === "percentage" ? "10" : "100"}
                  className="rounded-xl text-xs font-bold"
                  required
                />
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Min Cart Subtotal (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="0 for no minimum"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">
                  Max Discount Cap (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  disabled={formData.discountType === "flat"}
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  placeholder="0 for unlimited"
                  className="rounded-xl text-xs"
                />
                <span className="text-[10px] text-muted-foreground">Only for percentage</span>
              </div>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">End / Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Global Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Blank for unlimited"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Per User Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.userUsageLimit}
                  onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                  placeholder="1 (Default)"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                Active (Enabled for use)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.showInCheckout}
                  onChange={(e) => setFormData({ ...formData, showInCheckout: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                Show on Cart / Checkout (1-click customer apply)
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-forest hover:bg-forest/90 text-white rounded-xl text-xs font-semibold"
              >
                {submitting ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
