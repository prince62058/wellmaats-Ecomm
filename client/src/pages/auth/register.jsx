import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Mail, Phone, CheckCircle2 } from "lucide-react";

function AuthRegister() {
  const [searchParams] = useSearchParams();

  // Pre-fill from login redirect (phone or email passed via query param)
  const prePhone = searchParams.get("phone") || "";
  const preEmail = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    userName: "",
    email: preEmail,
    password: "",
    phone: prePhone,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleChange(e) {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return;
    }
    setLoading(true);
    // Capture referral code from localStorage (set by /ref/:code landing page)
    const pendingReferral = localStorage.getItem("pendingReferral") || "";
    const result = await dispatch(registerUser({ ...formData, referralCode: pendingReferral }));
    if (result?.payload?.success) localStorage.removeItem("pendingReferral");
    setLoading(false);
    if (result?.payload?.success) {
      toast({ title: "Account created! Welcome 🎉 Please login." });
      // redirect back to login pre-filling what user typed
      const param = formData.phone ? `?phone=${encodeURIComponent(formData.phone)}` : formData.email ? `?email=${encodeURIComponent(formData.email)}` : "";
      // Small delay so toast shows, then navigate
      setTimeout(() => navigate(`/auth/login${param}`), 500);
    } else {
      toast({ title: result?.payload?.message || "Registration failed", variant: "destructive" });
    }
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition placeholder-gray-400";

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">Join the Ayurvedic wellness journey</p>
      </div>

      {/* Pre-filled notice */}
      {(prePhone || preEmail) && (
        <div className="mb-4 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-emerald-700 text-xs">
            {prePhone
              ? <>Phone <strong>{prePhone}</strong> pre-filled — add your details to continue.</>
              : <>Email <strong>{preEmail}</strong> pre-filled — add your details to continue.</>}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></span>
          <input type="text" name="userName" value={formData.userName} onChange={handleChange}
            placeholder="Full Name" required autoComplete="name" className={inputClass} />
        </div>

        {/* Phone — show prominently if pre-filled from phone login attempt */}
        <div className="space-y-1">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Phone className="w-4 h-4" /></span>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="Phone Number (for mobile login)"
              autoComplete="tel"
              className={`${inputClass} ${prePhone ? "border-forest/40 bg-leaf/30 font-medium" : ""}`} />
          </div>
          {prePhone && (
            <p className="text-[11px] text-forest/70 pl-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-forest" /> You can login with this number after registration
            </p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-4 h-4" /></span>
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder="Email Address" required autoComplete="email"
            className={`${inputClass} ${preEmail ? "border-forest/40 bg-leaf/30 font-medium" : ""}`} />
        </div>

        {/* Password */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-4 h-4" /></span>
          <input
            type={showPass ? "text" : "password"}
            name="password" value={formData.password} onChange={handleChange}
            placeholder="Create Password (min 6 characters)"
            required minLength={6} autoComplete="new-password"
            className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition placeholder-gray-400"
          />
          <button type="button" onClick={() => setShowPass((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 px-1">
          By signing up, you agree to our{" "}
          <a href="#" className="text-forest hover:underline">Terms</a> &amp;{" "}
          <a href="#" className="text-forest hover:underline">Privacy Policy</a>.
        </p>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg mt-2 disabled:opacity-60">
          {loading ? "Creating Account..." : <> Create Account <span className="text-lg leading-none">›</span> </>}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-gray-200" />
        <span className="text-gray-400 text-xs font-medium">OR</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <div className="flex items-center justify-center gap-5">
        {[
          { title: "Google", svg: <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
          { title: "Facebook", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
          { title: "Apple", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
        ].map(({ title, svg }) => (
          <button key={title} type="button" title={title}
            className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-forest/40 hover:bg-forest/5 transition-all shadow-sm">
            {svg}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-forest font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
}

export default AuthRegister;
