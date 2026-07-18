import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Phone, ArrowRight, UserPlus } from "lucide-react";

function AuthLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(null); // holds identifier if account not found
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isPhone = /^[0-9+]/.test(formData.email?.trim() || "");

  function handleChange(e) {
    setNotFound(null); // reset "not found" state on input change
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setNotFound(null);
    setLoading(true);
    const result = await dispatch(loginUser(formData));
    setLoading(false);

    if (result?.payload?.success) {
      toast({ title: "Logged in successfully! 🎉" });
    } else {
      const msg = result?.payload?.message || "Login failed";
      // Detect "not found" so we can show create-account CTA
      if (msg.toLowerCase().includes("no account") || msg.toLowerCase().includes("doesn't exist")) {
        setNotFound(formData.email.trim());
      } else {
        toast({ title: msg, variant: "destructive" });
      }
    }
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition placeholder-gray-400";

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-500 text-sm mt-1">Login with your email or phone number</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">

        {/* Email / Phone input */}
        <div className="space-y-1">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Phone className="w-4 h-4" />
            </span>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address or Phone number"
              required
              autoComplete="username"
              className={`${inputClass} ${notFound ? "border-red-300 bg-red-50/30" : ""}`}
            />
          </div>
          {formData.email && !notFound && (
            <p className="text-[11px] text-gray-400 pl-1">
              {isPhone ? "📱 Logging in with phone number" : "📧 Logging in with email"}
            </p>
          )}
        </div>

        {/* ── Account Not Found Banner ── */}
        {notFound && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🔍</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">No account found</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  We couldn't find an account with{" "}
                  <span className="font-semibold">"{notFound}"</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  const param = isPhone ? `phone=${encodeURIComponent(notFound)}` : `email=${encodeURIComponent(notFound)}`;
                  navigate(`/auth/register?${param}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-forest text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-forest/90 transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setNotFound(null)}
                className="flex-1 text-sm text-gray-500 py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Try different login
              </button>
            </div>
          </div>
        )}

        {/* Password */}
        {!notFound && (
          <>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                autoComplete="current-password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-forest"
                />
                Remember Me
              </label>
              <Link to="/auth/forgot" className="text-[#C8A54A] font-medium hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg mt-2 disabled:opacity-60"
            >
              {loading ? "Logging in..." : <> Login <span className="text-lg leading-none">›</span> </>}
            </button>
          </>
        )}
      </form>

      {!notFound && (
        <>
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
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-forest font-semibold hover:underline">Sign Up</Link>
          </p>
        </>
      )}
    </div>
  );
}

export default AuthLogin;
