import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Gift, Leaf, Check, ArrowRight } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export default function RefLanding() {
  const { code }      = useParams();
  const navigate      = useNavigate();
  const [name, setName] = useState("");
  const [valid, setValid] = useState(null);

  useEffect(() => {
    if (!code) return;
    // Store in localStorage for use during registration
    localStorage.setItem("pendingReferral", code.toUpperCase());

    axiosInstance.get(`/api/shop/referral/validate/${code}`)
      .then((r) => {
        if (r.data?.success) {
          setValid(true);
          setName(r.data.data?.referrerName || "a friend");
        } else {
          setValid(false);
        }
      })
      .catch(() => setValid(false));
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5faf4] to-[#e8f5e1] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a4731] to-[#0f2d1e] p-8 text-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#c8963e] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">Special Invitation</p>
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              You've been invited!
            </h1>
            {valid && name && (
              <p className="text-white/80 text-sm">
                <strong className="text-[#c8963e]">{name}</strong> invited you to Mother Tatwa
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {valid === false && (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm text-center font-medium">
              ⚠️ This referral link may be invalid or expired.
            </div>
          )}

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 text-center border border-emerald-100">
            <p className="text-3xl font-bold text-forest">₹50 OFF</p>
            <p className="text-sm text-muted-foreground mt-1">on your first order at Mother Tatwa</p>
          </div>

          <div className="space-y-3">
            {[
              "Sign up with this special link",
              "Explore 100% Ayurvedic drops",
              "Place your first order — ₹50 is auto-applied",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-forest" />
                </div>
                <p className="text-sm text-forest">{step}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate("/auth/register")}
              className="w-full bg-gradient-to-r from-[#1a4731] to-[#0d3320] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/shop/home")}
              className="w-full text-forest text-sm font-medium py-2.5 rounded-2xl border border-forest/15 hover:bg-leaf transition-colors"
            >
              Browse Products First
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Leaf className="w-3.5 h-3.5 text-forest" />
            Mother Tatwa · Nature Cures Life
          </div>
        </div>
      </div>
    </div>
  );
}
