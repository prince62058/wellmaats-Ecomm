import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyOTPLogin } from "@/store/auth-slice";
import { useLoginModal } from "@/context/LoginModalContext";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axiosInstance";
import {
  Phone, Mail, Eye, EyeOff, Lock, ArrowRight,
  UserPlus, RefreshCw, CheckCircle2, Loader2, X,
} from "lucide-react";

/* ── 6-box OTP ── */
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
    <div className="flex gap-1.5 sm:gap-2 justify-center w-full max-w-[20rem] mx-auto" onPaste={handlePaste}>
      {[0,1,2,3,4,5].map((i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`w-8 h-11 sm:w-10 sm:h-12 flex-1 max-w-10 text-center text-lg sm:text-xl font-bold rounded-xl border-2 transition focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20
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
  return <span className="font-mono text-forest">{String(Math.floor(left/60)).padStart(2,"0")}:{String(left%60).padStart(2,"0")}</span>;
}

export default function LoginModal() {
  const { open, closeLoginModal } = useLoginModal();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [mode, setMode]       = useState("phone");
  const [step, setStep]       = useState("input");
  const [identifier, setId]   = useState("");
  const [password, setPass]   = useState("");
  const [showPass, setShowP]  = useState(false);
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [canResend, setResend]= useState(false);
  const [devOtp, setDevOtp]   = useState("");
  const [notFound, setNotFound] = useState(false);

  function reset() {
    setMode("phone"); setStep("input"); setId(""); setPass("");
    setOtp(""); setDevOtp(""); setNotFound(false); setLoading(false);
  }

  function handleClose() { reset(); closeLoginModal(); }

  function switchMode(m) {
    setMode(m); setStep("input"); setId(""); setPass(""); setOtp(""); setDevOtp(""); setNotFound(false);
  }

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
    } catch { toast({ title: "Network error", variant: "destructive" }); }
    setLoading(false);
  }

  async function doVerify(code) {
    const c = (code || otp).replace(/\s/g, "");
    if (c.length < 6) return;
    setLoading(true);
    const result = await dispatch(verifyOTPLogin({ identifier: identifier.trim(), otp: c }));
    setLoading(false);
    if (result?.payload?.success) {
      toast({ title: "Welcome! 🎉" });
      handleClose();
      if (result.payload.user?.role === "admin") window.location.assign("/admin/dashboard");
      else navigate("/shop/home", { replace: true });
    }
    else { toast({ title: result?.payload?.message || "Incorrect OTP", variant: "destructive" }); setOtp(""); }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setLoading(true);
    const result = await dispatch(loginUser({ email: identifier.trim(), password }));
    setLoading(false);
    if (result?.payload?.success) {
      toast({ title: "Welcome back! 🎉" });
      handleClose();
      if (result.payload.user?.role === "admin") window.location.assign("/admin/dashboard");
      else navigate("/shop/home", { replace: true });
    }
    else {
      const msg = result?.payload?.message || "Login failed";
      if (msg.toLowerCase().includes("no account")) setNotFound(true);
      else toast({ title: msg, variant: "destructive" });
    }
  }

  if (!open) return null;

  const inputBase = "w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/25 focus:border-forest transition placeholder-gray-400";

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={handleClose}>
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top brand strip */}
        <div className="bg-gradient-to-r from-forest to-[#0a3020] px-6 pt-6 pb-8 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Mother Tatwa · Drops</p>
          <h2 className="text-white font-display text-2xl font-bold">Welcome Back!</h2>
          <p className="text-white/70 text-sm mt-1">Login to continue</p>
        </div>

        {/* Swoosh divider */}
        <div className="h-4 bg-white" style={{ marginTop: "-16px", borderRadius: "16px 16px 0 0" }} />

        <div className="px-6 pb-7 space-y-4">
          {/* Mode toggle */}
          {step === "input" && (
            <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
              {[
                { key: "phone", icon: <Phone className="w-3.5 h-3.5" />, label: "Phone" },
                { key: "email", icon: <Mail  className="w-3.5 h-3.5" />, label: "Email" },
              ].map((t) => (
                <button key={t.key} type="button" onClick={() => switchMode(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all
                    ${mode === t.key ? "bg-white text-forest shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          )}

          {/* ── PHONE flow ── */}
          {mode === "phone" && step === "input" && (
            <form onSubmit={handleSendOTP} className="space-y-3">
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={identifier} onChange={(e) => setId(e.target.value)}
                  placeholder="Phone number" required autoComplete="tel" className={inputBase} />
              </div>
              <button type="submit" disabled={loading || !identifier.trim()}
                className="w-full flex items-center justify-center gap-2 bg-forest text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {mode === "phone" && step === "otp" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-leaf/40 border border-forest/15 rounded-xl px-4 py-2.5">
                <span className="text-sm font-medium text-forest truncate">{identifier}</span>
                <button type="button" onClick={() => { setStep("input"); setOtp(""); setDevOtp(""); }}
                  className="text-xs text-gray-400 hover:text-forest underline underline-offset-2 ml-2">Change</button>
              </div>
              {devOtp && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                  <span className="text-amber-600 text-xs font-medium">Demo OTP:</span>
                  <span className="font-mono font-bold text-amber-700 text-lg tracking-widest">{devOtp}</span>
                </div>
              )}
              {notFound && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-amber-800">No account found for "{identifier}"</p>
                  <button type="button"
                    onClick={() => { handleClose(); navigate(`/auth/register?phone=${encodeURIComponent(identifier)}`); }}
                    className="w-full flex items-center justify-center gap-2 bg-forest text-white text-xs font-bold py-2.5 rounded-xl hover:bg-forest/90 transition">
                    <UserPlus className="w-3.5 h-3.5" />Create Account<ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              <OtpInput value={otp} onChange={setOtp} onComplete={doVerify} />
              <button type="button" disabled={loading || otp.replace(/\s/g,"").length < 6} onClick={() => doVerify(otp)}
                className="w-full flex items-center justify-center gap-2 bg-forest text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</> : <><CheckCircle2 className="w-4 h-4" />Verify & Login</>}
              </button>
              <p className="text-center text-sm text-gray-500">
                {canResend
                  ? <button type="button" onClick={handleSendOTP} className="flex items-center gap-1.5 text-forest font-semibold hover:underline mx-auto"><RefreshCw className="w-3.5 h-3.5" />Resend OTP</button>
                  : <span>Resend in <Countdown seconds={60} onDone={() => setResend(true)} /></span>}
              </p>
            </div>
          )}

          {/* ── EMAIL flow ── */}
          {mode === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={identifier} onChange={(e) => { setId(e.target.value); setNotFound(false); }}
                  placeholder="Email address" required autoComplete="email"
                  className={`${inputBase} ${notFound ? "border-red-300" : ""}`} />
              </div>
              {notFound && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-amber-800">No account with "{identifier}"</p>
                  <button type="button"
                    onClick={() => { handleClose(); navigate(`/auth/register?email=${encodeURIComponent(identifier)}`); }}
                    className="w-full flex items-center justify-center gap-2 bg-forest text-white text-xs font-bold py-2.5 rounded-xl hover:bg-forest/90 transition">
                    <UserPlus className="w-3.5 h-3.5" />Create Account<ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {!notFound && (
                <>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPass ? "text" : "password"} value={password}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder="Password" required autoComplete="current-password"
                      className={`${inputBase} pr-12`} />
                    <button type="button" onClick={() => setShowP((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-forest text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-60">
                    {loading ? "Logging in…" : "Login"}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Sign up link */}
          {step === "input" && (
            <p className="text-center text-xs text-gray-500">
              No account?{" "}
              <button type="button"
                onClick={() => { handleClose(); navigate("/auth/register"); }}
                className="text-forest font-bold hover:underline">Sign Up</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
