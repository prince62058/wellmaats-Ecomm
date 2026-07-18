import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/hooks/use-site-settings";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { updateProfile } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import {
  User, Mail, Phone, Lock, Package, Heart, MapPin,
  Edit3, Save, X, Camera, Calendar, ShieldCheck, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ── Avatar helpers ── */
const AVATAR_COLORS = [
  ["#1a5c38","#f5f0e8"], ["#7c3aed","#faf5ff"], ["#b45309","#fffbeb"],
  ["#0e7490","#ecfeff"], ["#be123c","#fff1f2"], ["#166534","#f0fdf4"],
];
function getAvatarColor(name = "") {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Stat card ── */
function StatCard({ icon, value, label, to }) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-1 py-4 px-3 rounded-2xl bg-white border border-forest/10 shadow-sm hover:shadow-md hover:border-forest/20 transition-all text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-bold text-forest leading-none">{value}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

/* ── Profile Edit Form ── */
function ProfileTab({ user }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [form, setForm] = useState({
    userName: user?.userName || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition placeholder-gray-400";

  async function handleSave(e) {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { userName: form.userName, phone: form.phone };
    if (form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }
    const result = await dispatch(updateProfile(payload));
    setSaving(false);
    if (result?.payload?.success) {
      toast({ title: "Profile updated successfully! ✅" });
      setForm((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } else {
      toast({ title: result?.payload?.message || "Update failed", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-xl mx-auto">
      {/* Basic Info */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-forest flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${inputClass} pl-10`} value={form.userName}
                onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))}
                placeholder="Your full name" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${inputClass} pl-10 bg-gray-100 text-gray-400 cursor-not-allowed`}
                value={user?.email || ""} disabled placeholder="Email (cannot be changed)" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 pl-1">Email cannot be changed for security reasons.</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Phone Number <span className="text-gold font-normal normal-case">(for mobile login)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" className={`${inputClass} pl-10`} value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 pl-1">Once set, you can login directly with this number.</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-forest flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
          <span className="text-xs font-normal text-gray-400 ml-1">(leave blank to keep current)</span>
        </h3>
        <div className="space-y-3">
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPass ? "text" : "password"} className={`${inputClass} pl-10`}
              value={form.currentPassword} onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Current password" autoComplete="current-password" />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPass ? "text" : "password"} className={`${inputClass} pl-10`}
              value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="New password (min 6 chars)" autoComplete="new-password" />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPass ? "text" : "password"} className={`${inputClass} pl-10`}
              value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Confirm new password" autoComplete="new-password" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500">
            <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)}
              className="w-3.5 h-3.5 accent-forest" />
            Show passwords
          </label>
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-60">
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

/* ── Main Account Page ── */
function ShoppingAccount() {
  const { brand } = useSiteSettings();
  const { user } = useSelector((state) => state.auth);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist || { products: [] });
  const [tab, setTab] = useState("profile");

  const [bgColor, textColor] = getAvatarColor(user?.userName);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf/60 via-white to-leaf/20">

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-forest via-forest/95 to-[#0d3d22] text-white relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-6 right-24 w-24 h-24 rounded-full bg-gold/10" />
        <div className="absolute -bottom-8 left-8 w-32 h-32 rounded-full bg-white/4" />

        <div className="container mx-auto px-4 py-8 md:py-10 relative">
          <p className="text-gold/80 text-xs font-semibold tracking-[0.3em] uppercase mb-4">My Account</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold shadow-lg border-4 border-white/20"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  : initials(user?.userName || "U")}
              </div>
              <button onClick={() => setTab("profile")}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold flex items-center justify-center shadow-md hover:bg-gold/90 transition"
                title="Edit profile">
                <Edit3 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight truncate">
                {user?.userName || "Wellness Member"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                {user?.email && (
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Calendar className="w-3 h-3" /> Member since {memberSince}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-3 h-3" /> Verified Account
                </span>
              </div>
            </div>

            {/* Quick action */}
            <button onClick={() => setTab("profile")}
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shrink-0">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <button onClick={() => setTab("orders")} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 text-center transition">
              <div className="text-xl font-bold">—</div>
              <div className="text-xs text-white/70 mt-0.5 flex items-center justify-center gap-1">
                <Package className="w-3 h-3" /> Orders
              </div>
            </button>
            <button onClick={() => setTab("wishlist")} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 text-center transition">
              <div className="text-xl font-bold">{wishlistProducts?.length || 0}</div>
              <div className="text-xs text-white/70 mt-0.5 flex items-center justify-center gap-1">
                <Heart className="w-3 h-3" /> Wishlist
              </div>
            </button>
            <button onClick={() => setTab("addresses")} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 text-center transition">
              <div className="text-xl font-bold">—</div>
              <div className="text-xs text-white/70 mt-0.5 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" /> Addresses
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto bg-white border border-forest/10 shadow-sm rounded-2xl p-1 gap-1 mb-6 flex-wrap">
            {[
              { value: "profile",   label: "My Profile",  icon: <User className="w-3.5 h-3.5" /> },
              { value: "orders",    label: "Orders",       icon: <Package className="w-3.5 h-3.5" /> },
              { value: "addresses", label: "Addresses",    icon: <MapPin className="w-3.5 h-3.5" /> },
              { value: "wishlist",  label: "Wishlist",     icon: <Heart className="w-3.5 h-3.5" /> },
            ].map((t) => (
              <TabsTrigger key={t.value} value={t.value}
                className="flex items-center gap-1.5 text-sm rounded-xl data-[state=active]:bg-forest data-[state=active]:text-white data-[state=active]:shadow px-4 py-2 flex-1 min-w-[100px] justify-center font-medium text-gray-600 transition">
                {t.icon} {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">Personal Details</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Update your name, phone & password</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-leaf flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-forest" />
                </div>
              </div>
              <ProfileTab user={user} />
            </div>
          </TabsContent>

          {/* Orders tab */}
          <TabsContent value="orders">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">Order History</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Track, return or buy again</p>
                </div>
                <Package className="w-5 h-5 text-forest/40" />
              </div>
              <ShoppingOrders />
            </div>
          </TabsContent>

          {/* Addresses tab */}
          <TabsContent value="addresses">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">Saved Addresses</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Manage your delivery locations</p>
                </div>
                <MapPin className="w-5 h-5 text-forest/40" />
              </div>
              <Address />
            </div>
          </TabsContent>

          {/* Wishlist tab */}
          <TabsContent value="wishlist">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">My Wishlist</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{wishlistProducts?.length || 0} saved products</p>
                </div>
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              {wishlistProducts?.length > 0 ? (
                <Link to="/shop/wishlist"
                  className="inline-flex items-center gap-2 bg-forest text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-forest/90 transition">
                  View Full Wishlist <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="text-center py-10">
                  <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No saved products yet</p>
                  <p className="text-gray-400 text-sm mt-1">Tap the ❤️ on any product to save it here</p>
                  <Link to="/shop/listing"
                    className="inline-flex items-center gap-1.5 mt-4 text-forest font-semibold text-sm hover:underline">
                    Browse Products <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Brand footer strip */}
        <div className="mt-4 text-center text-xs text-gray-400">
          {brand.name} · {brand.tagline} · 100% Ayurvedic &amp; Lab Tested
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
