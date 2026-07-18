import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Mail } from "lucide-react";

function AuthRegister() {
  const [formData, setFormData] = useState({ userName: "", email: "", password: "" });
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
    setLoading(true);
    const result = await dispatch(registerUser(formData));
    setLoading(false);
    if (result?.payload?.success) {
      toast({ title: result?.payload?.message });
      navigate("/auth/login");
    } else {
      toast({ title: result?.payload?.message || "Registration failed", variant: "destructive" });
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">Join the Ayurvedic wellness journey</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <User className="w-4 h-4" />
          </span>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition placeholder-gray-400"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Mail className="w-4 h-4" />
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition placeholder-gray-400"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock className="w-4 h-4" />
          </span>
          <input
            type={showPass ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create Password"
            required
            minLength={6}
            className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition placeholder-gray-400"
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

        {/* Terms */}
        <p className="text-xs text-gray-400 px-1">
          By signing up, you agree to our{" "}
          <a href="#" className="text-forest hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-forest hover:underline">Privacy Policy</a>.
        </p>

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg mt-2 disabled:opacity-60"
        >
          {loading ? "Creating Account..." : (
            <>Sign Up <span className="text-lg leading-none">›</span></>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <hr className="flex-1 border-gray-200" />
        <span className="text-gray-400 text-xs font-medium">OR</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Social Signup */}
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-forest/40 hover:bg-forest/5 transition-all shadow-sm"
          title="Google"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
        <button
          type="button"
          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-forest/40 hover:bg-forest/5 transition-all shadow-sm"
          title="Facebook"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
        <button
          type="button"
          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-forest/40 hover:bg-forest/5 transition-all shadow-sm"
          title="Apple"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </button>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-500 mt-7">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-forest font-semibold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default AuthRegister;
