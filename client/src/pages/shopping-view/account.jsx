import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/hooks/use-site-settings";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { updateProfile } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axiosInstance";
import {
  User, Mail, Phone, Lock, Package, Heart, MapPin,
  Camera, Save, Calendar, ShieldCheck, ChevronRight,
  Eye, EyeOff, CheckCircle2, Loader2, Edit3, Gift, Wallet,
} from "lucide-react";
import ReferralPage from "./referral";
import { Link } from "react-router-dom";

/* ── Avatar color mapping ── */
const COLORS = [
  ["#1a5c38","#f5f0e8"],["#7c3aed","#faf5ff"],["#b45309","#fffbeb"],
  ["#0e7490","#ecfeff"],["#be123c","#fff1f2"],["#166534","#f0fdf4"],
];
function avatarColor(name = "") {
  return COLORS[(name.charCodeAt(0) || 0) % COLORS.length];
}
function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

/* ── Avatar Upload Component ── */
function AvatarUploader({ user, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { toast } = useToast();
  const [bg, fg] = avatarColor(user?.userName);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large (max 5 MB)", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await axiosInstance.post("/api/auth/upload-avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        onUploaded(res.data.url);
        toast({ title: "Profile photo updated! ✅" });
      } else {
        toast({ title: res.data?.message || "Upload failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed. Try again.", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="relative group shrink-0 cursor-pointer" onClick={() => !uploading && fileRef.current?.click()}>
      {/* Avatar circle */}
      <div
        className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold shadow-xl border-4 border-white/30 overflow-hidden select-none"
        style={{ backgroundColor: user?.avatar ? "#000" : bg, color: fg }}
      >
        {user?.avatar
          ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          : initials(user?.userName)}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading
          ? <Loader2 className="w-7 h-7 text-white animate-spin" />
          : <>
              <Camera className="w-6 h-6 text-white" />
              <span className="text-white text-[10px] font-semibold mt-1">Change Photo</span>
            </>}
      </div>

      {/* Gold edit badge */}
      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold border-2 border-white flex items-center justify-center shadow-md">
        <Camera className="w-3.5 h-3.5 text-white" />
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ── Editable field ── */
function EditableField({ label, icon: Icon, value, onChange, type = "text", disabled, hint, ...rest }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={type} value={value} onChange={onChange}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3.5 rounded-xl border text-sm transition
            ${disabled
              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/25 focus:border-forest hover:border-forest/40"}`}
          {...rest}
        />
      </div>
      {hint && <p className="text-[11px] text-gray-400 pl-1">{hint}</p>}
    </div>
  );
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
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast({ title: "New passwords don't match", variant: "destructive" }); return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload = { userName: form.userName.trim(), phone: form.phone.trim() };
    if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
    const result = await dispatch(updateProfile(payload));
    setSaving(false);
    if (result?.payload?.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "Profile saved successfully! ✅" });
      setForm((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } else {
      toast({ title: result?.payload?.message || "Update failed", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Personal Info card */}
      <div className="bg-gradient-to-br from-leaf/40 to-white rounded-2xl border border-forest/10 p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-forest" />
          </div>
          <h3 className="font-semibold text-forest">Personal Information</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <EditableField label="Full Name" icon={User} value={form.userName} onChange={set("userName")}
            placeholder="Your full name" required />
          <EditableField label="Email Address" icon={Mail} value={user?.email || ""}
            disabled hint="Email cannot be changed for security reasons." />
          <EditableField label="Phone Number" icon={Phone} value={form.phone} onChange={set("phone")}
            type="tel" placeholder="+91 98765 43210"
            hint="Add your phone to enable mobile login." />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Role</label>
            <div className="flex items-center gap-2 px-3.5 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600 capitalize">{user?.role || "User"}</span>
              <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password card */}
      <div className="bg-gradient-to-br from-amber-50/60 to-white rounded-2xl border border-amber-200/50 p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Change Password</h3>
          <span className="text-xs text-gray-400 ml-1">— leave blank to keep current</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <EditableField label="Current Password" icon={Lock} value={form.currentPassword}
            onChange={set("currentPassword")} type={showPass ? "text" : "password"}
            placeholder="Current password" autoComplete="current-password" />
          <EditableField label="New Password" icon={Lock} value={form.newPassword}
            onChange={set("newPassword")} type={showPass ? "text" : "password"}
            placeholder="Min 6 characters" autoComplete="new-password" />
          <EditableField label="Confirm New Password" icon={Lock} value={form.confirmPassword}
            onChange={set("confirmPassword")} type={showPass ? "text" : "password"}
            placeholder="Repeat new password" autoComplete="new-password" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 select-none w-fit">
          <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)}
            className="w-3.5 h-3.5 accent-forest rounded" />
          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          Show passwords
        </label>
      </div>

      {/* Save button */}
      <button type="submit" disabled={saving}
        className={`w-full flex items-center justify-center gap-2.5 font-semibold py-4 rounded-xl text-sm transition-all shadow-md
          ${saved ? "bg-emerald-500 hover:bg-emerald-500" : "bg-forest hover:bg-forest/90"} text-white disabled:opacity-60`}>
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : saved ? (
          <><CheckCircle2 className="w-4 h-4" /> Saved Successfully!</>
        ) : (
          <><Save className="w-4 h-4" /> Save All Changes</>
        )}
      </button>
    </form>
  );
}

/* ════════════════════════════════════════
   MAIN Account Page
════════════════════════════════════════ */
function ShoppingAccount() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { brand } = useSiteSettings();
  const { user } = useSelector((state) => state.auth);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist || { products: [] });
  const { info: referralInfo } = useSelector((state) => state.referral || {});
  const [tab, setTab] = useState("profile");

  const [bg, fg] = avatarColor(user?.userName);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  // After avatar upload, persist URL to profile
  async function handleAvatarUploaded(url) {
    await dispatch(updateProfile({ avatar: url }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf/50 via-white to-leaf/20">

      {/* ══ Hero Banner ══ */}
      <div className="bg-gradient-to-br from-forest via-[#1a5c38] to-[#0d3d22] text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-8 right-32 w-28 h-28 rounded-full bg-gold/8 pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-36 h-36 rounded-full bg-white/4 pointer-events-none" />

        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <p className="text-gold/80 text-xs font-semibold tracking-[0.35em] uppercase mb-5">My Account</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with upload */}
            <AvatarUploader user={user} onUploaded={handleAvatarUploaded} />

            {/* Name + info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                {user?.userName || "Wellness Member"}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2">
                {user?.email && (
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[200px]">{user.email}</span>
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Phone className="w-3.5 h-3.5 shrink-0" /> {user.phone}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                <span className="flex items-center gap-1.5 text-white/55 text-xs">
                  <Calendar className="w-3 h-3" /> Member since {memberSince}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-3 h-3" /> Verified Account
                </span>
              </div>

              {!user?.phone && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-gold/15 border border-gold/30 text-gold text-xs px-3 py-1.5 rounded-lg">
                  <Phone className="w-3 h-3" />
                  Add your phone number to enable mobile login
                </div>
              )}
            </div>

            {/* Edit Profile button */}
            <button onClick={() => setTab("profile")}
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shrink-0">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3 mt-7">
            {[
              { icon: <Package className="w-3.5 h-3.5" />, label: "Orders",    value: "—",  onClick: () => setTab("orders") },
              { icon: <Heart className="w-3.5 h-3.5" />,   label: "Wishlist",  value: wishlistProducts?.length ?? 0, onClick: () => setTab("wishlist") },
              { icon: <MapPin className="w-3.5 h-3.5" />,  label: "Addresses", value: "—",  onClick: () => setTab("addresses") },
              { icon: <Wallet className="w-3.5 h-3.5" />,  label: "Wallet",    value: `₹${referralInfo?.walletBalance ?? 0}`, onClick: () => setTab("referral") },
            ].map((s) => (
              <button key={s.label} onClick={s.onClick}
                className="bg-white/8 hover:bg-white/15 border border-white/10 rounded-2xl p-3 md:p-4 text-center transition group">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-white/65 mt-0.5 flex items-center justify-center gap-1 group-hover:text-white/90 transition">
                  {s.icon} {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Tabs ══ */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Tabs value={tab} onValueChange={setTab}>
          {/* Tab bar */}
          <TabsList className="flex h-auto bg-white border border-forest/10 shadow-sm rounded-2xl p-1.5 gap-1 mb-7 flex-wrap md:flex-nowrap">
            {[
              { value: "profile",   label: "My Profile",  icon: <User className="w-4 h-4" /> },
              { value: "orders",    label: "Orders",       icon: <Package className="w-4 h-4" /> },
              { value: "addresses", label: "Addresses",    icon: <MapPin className="w-4 h-4" /> },
              { value: "wishlist",  label: "Wishlist",     icon: <Heart className="w-4 h-4" /> },
              { value: "referral",  label: "Refer & Earn", icon: <Gift className="w-4 h-4" /> },
            ].map((t) => (
              <TabsTrigger key={t.value} value={t.value}
                className="flex items-center gap-2 text-sm rounded-xl
                  data-[state=active]:bg-forest data-[state=active]:text-white data-[state=active]:shadow-md
                  px-4 py-2.5 flex-1 justify-center font-medium text-gray-500 hover:text-forest transition">
                {t.icon} {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Profile tab ── */}
          <TabsContent value="profile">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">Edit Profile</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Update your photo, name, phone & password</p>
                </div>
              </div>

              {/* Avatar quick-change section */}
              <div className="flex items-center gap-5 p-4 bg-leaf/40 rounded-2xl border border-forest/10 mb-7">
                <AvatarUploader user={user} onUploaded={handleAvatarUploaded} />
                <div>
                  <p className="font-semibold text-forest text-sm">Profile Photo</p>
                  <p className="text-xs text-gray-500 mt-1">Click the photo to upload a new picture.<br />JPG, PNG or WEBP · max 5 MB</p>
                  {user?.avatar && (
                    <button type="button" onClick={() => dispatch(updateProfile({ avatar: "" }))}
                      className="mt-2 text-xs text-red-400 hover:text-red-600 hover:underline transition">
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <ProfileTab user={user} />
            </div>
          </TabsContent>

          {/* ── Orders tab ── */}
          <TabsContent value="orders">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">Order History</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Track, return or buy again</p>
                </div>
                <Package className="w-5 h-5 text-forest/30" />
              </div>
              <ShoppingOrders />
            </div>
          </TabsContent>

          {/* ── Addresses tab ── */}
          <TabsContent value="addresses">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">Saved Addresses</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Manage your delivery locations</p>
                </div>
                <MapPin className="w-5 h-5 text-forest/30" />
              </div>
              <Address />
            </div>
          </TabsContent>

          {/* ── Wishlist tab ── */}
          <TabsContent value="wishlist">
            <div className="bg-white rounded-2xl border border-forest/10 shadow-sm p-5 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-forest">My Wishlist</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {wishlistProducts?.length > 0 ? `${wishlistProducts.length} saved products` : "No items saved yet"}
                  </p>
                </div>
                <Heart className={`w-5 h-5 ${wishlistProducts?.length > 0 ? "text-rose-400" : "text-gray-300"}`} />
              </div>

              {wishlistProducts?.length > 0 ? (
                <Link to="/shop/wishlist"
                  className="inline-flex items-center gap-2 bg-forest text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-forest/90 transition shadow-md">
                  <Heart className="w-4 h-4" /> View Wishlist ({wishlistProducts.length})
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="text-center py-14">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-rose-200" />
                  </div>
                  <p className="text-gray-600 font-semibold">No saved products yet</p>
                  <p className="text-gray-400 text-sm mt-1">Tap the ❤️ on any product to save it here</p>
                  <Link to="/shop/listing"
                    className="inline-flex items-center gap-1.5 mt-5 bg-forest text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-forest/90 transition">
                    Browse Products <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
          {/* ── Referral tab ── */}
          <TabsContent value="referral">
            <ReferralPage />
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center text-xs text-gray-400">
          {brand.name} · {brand.tagline} · 100% Ayurvedic &amp; Lab Tested
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
