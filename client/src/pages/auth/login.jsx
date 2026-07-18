import { useToast } from "@/components/ui/use-toast";
import { loginUser, verifyOTPLogin } from "@/store/auth-slice";
import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Phone, Mail, Eye, EyeOff, Lock, ArrowRight,
  UserPlus, RefreshCw, CheckCircle2, Loader2,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

/* ── 6-box OTP input ── */
function OtpInput({ value, onChange, onComplete }) {
  const refs = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");

  function handleKey(i, e) {
    if (e.key === "Backspace") {
      const next = [...digits]; next[i] = "";
      onChange(next.join("").trim());
      if (i > 0) refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  }
  function handleInput(i, e) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const next = [...digits]; next[i] = char;
    const joined = next.join("").replace(/ /g, "");
    onChange(joined);
    if (i < 5) refs.current[i + 1]?.focus();
    if (joined.length === 6) onComplete?.(joined);
  }
  function handlePaste(e) {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p) { onChange(p); if (p.length === 6) onComplete?.(p); }
    e.preventDefault();
  }
  return (
    <div className="flex gap-1.5 sm:gap-2 justify-center w-full max-w-[22rem] mx-auto" onPaste={handlePaste}>
      {[0,1,2,3,4,5].map((i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`w-9 h-11 sm:w-11 sm:h-14 flex-1 max-w-11 text-center text-lg sm:text-xl font-bold rounded-xl border-2 transition focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20
            ${digits[i]?.trim() ? "border-forest bg-leaf/30 text-forest" : "border-gray-200 bg-white"}`}
        />
      ))}
    </div>
  );
}

function Countdown({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((p) => { if (p <= 1) { clearInterval(t); onDone(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="font-mono tabular-nums text-forest">{String(Math.floor(left/60)).padStart(2,"0")}:{String(left%60).padStart(2,"0")}</span>;
}

/* ═══════════════════════════ Main ═══════════════════════════ */
export default function AuthLogin() {
  const [mode, setMode]       = useState("phone"); // "phone" | "email"
  const [step, setStep]       = useState("input"); // "input" | "otp"  (phone only)
  const [identifier, setId]   = useState("");
  const [password, setPass]   = useState("");
  const [showPass, setShowP]  = useState(false);
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [canResend, setResend]= useState(false);
  const [devOtp, setDevOtp]   = useState("");
  const [notFound, setNotFound] = useState(false);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { toast } = useToast();

  function switchMode(m) {
    setMode(m); setStep("input"); setId(""); setPass(""); setOtp(""); setDevOtp(""); setNotFound(false);
  }

  /* ── Phone: send OTP ── */
  async function handleSendOTP(e) {
    e?.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/send-otp", { identifier: identifier.trim() });
      if (res.data?.success) {
        setStep("otp"); setOtp(""); setResend(false);
        if (res.data.devOtp) setDevOtp(res.data.devOtp);
        setNotFound(res.data.accountExists === false);
        toast({ title: res.data.message });
      } else toast({ title: res.data?.message || "Failed to send OTP", variant: "destructive" });
    } catch { toast({ title: "Network error. Try again.", variant: "destructive" }); }
    setLoading(false);
  }

  /* ── Phone: verify OTP ── */
  async function doVerify(code) {
    const c = (code || otp).replace(/\s/g, "");
    if (c.length < 6) return;
    setLoading(true);
    const result = await dispatch(verifyOTPLogin({ identifier: identifier.trim(), otp: c }));
    setLoading(false);
    if (result?.payload?.success) {
      toast({ title: "Welcome! Logged in 🎉" });
      const role = result.payload.user?.role;
      navigate(role === "admin" ? "/admin/dashboard" : "/shop/home");
    } else { toast({ title: result?.payload?.message || "Incorrect OTP", variant: "destructive" }); setOtp(""); }
  }

  /* ── Email: password login ── */
  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setLoading(true);
    const result = await dispatch(loginUser({ email: identifier.trim(), password }));
    setLoading(false);
    if (result?.payload?.success) {
      toast({ title: "Welcome back! 🎉" });
      const role = result.payload.user?.role;
      navigate(role === "admin" ? "/admin/dashboard" : "/shop/home");
    } else {
      const msg = result?.payload?.message || "Login failed";
      if (msg.toLowerCase().includes("no account")) setNotFound(true);
      else toast({ title: msg, variant: "destructive" });
    }
  }

  const inputBase = "w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/25 focus:border-forest transition placeholder-gray-400";

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-500 text-sm mt-1">
          {mode === "phone" ? "Login with OTP — no password needed" : "Login with your email & password"}
        </p>
      </div>

      {/* Mode toggle */}
      {step === "input" && (
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-5 gap-1">
          {[
            { key: "phone", icon: <Phone className="w-4 h-4" />, label: "Phone Number" },
            { key: "email", icon: <Mail  className="w-4 h-4" />, label: "Email" },
          ].map((t) => (
            <button key={t.key} type="button" onClick={() => switchMode(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${mode === t.key ? "bg-white text-forest shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      )}

      {/* ════ PHONE MODE ════ */}
      {mode === "phone" && step === "input" && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="tel" value={identifier} onChange={(e) => setId(e.target.value)}
              placeholder="Enter your phone number" required autoComplete="tel"
              className={inputBase} />
          </div>
          <button type="submit" disabled={loading || !identifier.trim()}
            className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending OTP…</> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {mode === "phone" && step === "otp" && (
        <div className="space-y-5">
          {/* who we sent to */}
          <div className="flex items-center justify-between bg-leaf/50 border border-forest/15 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-4 h-4 text-forest shrink-0" />
              <span className="text-sm font-medium text-forest truncate">{identifier}</span>
            </div>
            <button type="button" onClick={() => { setStep("input"); setOtp(""); setDevOtp(""); }}
              className="text-xs text-gray-400 hover:text-forest ml-3 underline underline-offset-2">Change</button>
          </div>

          {devOtp && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <span className="text-amber-600 text-xs font-medium">🔐 Demo OTP:</span>
              <span className="font-mono font-bold text-amber-700 text-lg tracking-widest">{devOtp}</span>
            </div>
          )}

          {notFound && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔍</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">No account found</p>
                  <p className="text-amber-700 text-xs mt-0.5">No account with <strong>"{identifier}"</strong></p>
                </div>
              </div>
              <button type="button"
                onClick={() => navigate(`/auth/register?phone=${encodeURIComponent(identifier)}`)}
                className="w-full flex items-center justify-center gap-2 bg-forest text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-forest/90 transition">
                <UserPlus className="w-4 h-4" />Create Account<ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-center text-sm text-gray-500">Enter 6-digit OTP</p>
            <OtpInput value={otp} onChange={setOtp} onComplete={doVerify} />
          </div>

          <button type="button" disabled={loading || otp.replace(/\s/g,"").length < 6} onClick={() => doVerify(otp)}
            className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</> : <><CheckCircle2 className="w-4 h-4" />Verify &amp; Login</>}
          </button>

          <div className="text-center text-sm text-gray-500">
            {canResend
              ? <button type="button" onClick={handleSendOTP} className="flex items-center gap-1.5 text-forest font-semibold hover:underline mx-auto"><RefreshCw className="w-3.5 h-3.5" />Resend OTP</button>
              : <span>Resend OTP in <Countdown seconds={60} onDone={() => setResend(true)} /></span>}
          </div>
        </div>
      )}

      {/* ════ EMAIL MODE ════ */}
      {mode === "email" && (
        <form onSubmit={handleEmailLogin} className="space-y-3.5">
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={identifier}
              onChange={(e) => { setId(e.target.value); setNotFound(false); }}
              placeholder="Enter your email address" required autoComplete="email"
              className={`${inputBase} ${notFound ? "border-red-300 bg-red-50/30" : ""}`} />
          </div>

          {notFound && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔍</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">No account found</p>
                  <p className="text-amber-700 text-xs mt-0.5">No account with <strong>"{identifier}"</strong></p>
                </div>
              </div>
              <button type="button"
                onClick={() => navigate(`/auth/register?email=${encodeURIComponent(identifier)}`)}
                className="w-full flex items-center justify-center gap-2 bg-forest text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-forest/90 transition">
                <UserPlus className="w-4 h-4" />Create Account<ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!notFound && (
            <>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Enter your password" required autoComplete="current-password"
                  className={`${inputBase} pr-12`} />
                <button type="button" onClick={() => setShowP((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link to="/auth/forgot" className="text-[#C8A54A] text-xs font-medium hover:underline">Forgot Password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-60">
                {loading ? "Logging in…" : <>Login <span className="text-lg">›</span></>}
              </button>
            </>
          )}
        </form>
      )}

      {/* Social + Sign Up — only on input step */}
      {step === "input" && (
        <>
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" /><span className="text-gray-400 text-xs font-medium">OR</span><hr className="flex-1 border-gray-200" />
          </div>
          <div className="flex items-center justify-center gap-5">
            {[
              { title: "Google",   svg: <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
              { title: "Facebook", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
              { title: "Apple",    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
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
