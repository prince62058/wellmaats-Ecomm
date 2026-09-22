import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { googleLoginUser } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const GOOGLE_CLIENT_ID = "443465664046-u5mck44g396j6861ghdgh7nr244a37vv.apps.googleusercontent.com";

export default function GoogleLoginButton({ text = "Continue with Google", className = "", onSuccess }) {
  const [loading, setLoading] = useState(false);
  const hiddenGsiRef = useRef(null);
  const tokenClientRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSuccess = async (payload) => {
    setLoading(true);
    try {
      const result = await dispatch(googleLoginUser(payload));
      if (result?.payload?.success) {
        toast({ title: "Welcome! Logged in with Google 🎉" });
        if (onSuccess) {
          onSuccess(result.payload.user);
        } else if (result.payload.user?.role === "admin") {
          window.location.assign("/admin/dashboard");
        } else {
          navigate("/shop/home", { replace: true });
        }
      } else {
        toast({
          title: result?.payload?.message || "Google sign-in failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ title: "Google sign-in error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function init() {
      if (!window.google) return;

      // 1. Setup GIS Token Client (for custom button click)
      try {
        if (window.google.accounts?.oauth2) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "email profile openid",
            callback: (resp) => {
              if (resp?.access_token) {
                handleSuccess({ access_token: resp.access_token });
              }
            },
          });
        }
      } catch (e) {
        console.warn("GIS token client init:", e);
      }

      // 2. Setup ID Token client (for standard GSI button)
      try {
        if (window.google.accounts?.id && hiddenGsiRef.current) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: ({ credential }) => {
              if (credential) handleSuccess({ credential });
            },
          });
          window.google.accounts.id.renderButton(hiddenGsiRef.current, {
            type: "standard",
            shape: "pill",
            theme: "outline",
            size: "large",
            text: "signin_with",
            width: 280,
          });
        }
      } catch (e) {
        console.warn("GSI id init:", e);
      }
    }

    if (window.google) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          init();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const handleClick = () => {
    if (loading) return;

    // Try Token Client first
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      return;
    }

    // Fallback: trigger click on rendered hidden GSI button
    if (hiddenGsiRef.current) {
      const btn = hiddenGsiRef.current.querySelector('div[role="button"]') || hiddenGsiRef.current.querySelector('iframe');
      if (btn) {
        btn.click();
        return;
      }
    }

    // If script hasn't loaded yet
    toast({
      title: "Connecting to Google services, please wait a moment...",
      variant: "default",
    });
  };

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Visual Custom High-converting Google Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full max-w-sm flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-forest" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span className="font-semibold text-gray-700">
          {loading ? "Signing in..." : text}
        </span>
      </button>

      {/* Hidden iframe container for standard GSI */}
      <div ref={hiddenGsiRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
