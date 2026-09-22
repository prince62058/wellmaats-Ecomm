import { useToast } from "@/components/ui/use-toast";
import { registerUser, googleLoginUser } from "@/store/auth-slice";
import { useState, useEffect, useRef } from "react";
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
  const googleBtnRef = useRef(null);

  // Load Google Identity Services
  useEffect(() => {
    const GOOGLE_CLIENT_ID =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "443465664046-u5mck44g396j6861ghdgh7nr244a37vv.apps.googleusercontent.com";
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          const result = await dispatch(googleLoginUser(credential));
          if (result?.payload?.success) {
            toast({ title: "Signed in with Google! 🎉" });
            if (result.payload.user?.role === "admin") window.location.assign("/admin/dashboard");
            else navigate("/shop/home", { replace: true });
          } else {
            toast({ title: result?.payload?.message || "Google sign-in failed", variant: "destructive" });
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard", shape: "pill", theme: "outline",
        size: "large", text: "signup_with", width: 240,
      });
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

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
        <div className="mb-4 flex items-center gap-2.5 bg-forest-50 border border-forest-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-forest-500 shrink-0" />
          <p className="text-forest-700 text-xs">
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

      <div className="flex justify-center my-1">
        <div ref={googleBtnRef} className="min-h-[44px]" />
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-forest font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
}

export default AuthRegister;
