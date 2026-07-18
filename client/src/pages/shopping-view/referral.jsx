import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReferralInfo } from "@/store/shop/referral-slice";
import { useSiteSettings } from "@/hooks/use-site-settings";
import {
  Gift, Copy, Check, Share2, Users, Wallet, TrendingUp,
  Clock, CheckCircle2, ChevronRight, Star, IndianRupee,
  ArrowUpRight, ArrowDownLeft, Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const REFERRER_REWARD = 100;
const REFERRED_REWARD = 50;

function StatCard({ icon: Icon, label, value, gradient, sub }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md ${gradient}`}>
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-white/75 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-white/60 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function ReferralPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { info, isLoading } = useSelector((s) => s.referral);
  const { user }            = useSelector((s) => s.auth);
  const { siteUrl }         = useSiteSettings();
  const [copied, setCopied] = useState(false);

  useEffect(() => { dispatch(fetchReferralInfo()); }, [dispatch]);

  // Use admin-configured domain if set, otherwise fall back to current origin
  const host        = (siteUrl || "").replace(/\/$/, "") || window.location.origin;
  const referralUrl = info ? `${host}/ref/${info.referralCode}` : "";

  function copyLink() {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      toast({ title: "Link copied! 🎉", description: "Share it with friends to earn ₹" + REFERRER_REWARD });
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({
        title:  "Get ₹50 off on Mother Tatwa!",
        text:   `Use my referral link and get ₹${REFERRED_REWARD} off your first order! 🌿`,
        url:    referralUrl,
      });
    } else copyLink();
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading referral info…
    </div>
  );

  const stats = info?.stats || {};
  const referrals = info?.referrals || [];
  const txns = info?.walletTransactions || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a4731] to-[#0f2d1e] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#c8963e]/20 translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#c8963e] flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#c8963e] text-sm uppercase tracking-wider">Referral Program</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Invite Friends, Earn ₹{REFERRER_REWARD}
          </h1>
          <p className="text-white/70 text-sm mb-6">
            Share your referral link. When a friend signs up and places their first order,
            you earn <strong className="text-[#c8963e]">₹{REFERRER_REWARD}</strong> wallet credits
            and they get <strong className="text-[#c8963e]">₹{REFERRED_REWARD}</strong> off!
          </p>

          {/* Referral link box */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-1 flex items-center gap-2 border border-white/15">
            <div className="flex-1 px-3 py-2 min-w-0">
              <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-0.5">Your Referral Link</p>
              <p className="text-white text-xs font-mono truncate">{referralUrl || "Loading…"}</p>
            </div>
            <div className="flex gap-1.5 shrink-0 pr-1">
              <button onClick={copyLink}
                className="flex items-center gap-1.5 bg-white text-forest text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={shareLink}
                className="w-8 h-8 rounded-xl bg-[#c8963e] flex items-center justify-center hover:bg-[#b8863e] transition-colors">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Referral code */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-white/50 text-xs">Or share code:</span>
            <button onClick={() => { navigator.clipboard.writeText(info?.referralCode || ""); toast({ title: "Code copied!" }); }}
              className="font-mono font-bold text-[#c8963e] text-sm tracking-widest bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors">
              {info?.referralCode || "——"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Wallet Balance" value={`₹${info?.walletBalance || 0}`}
          icon={Wallet} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" sub="Redeemable at checkout" />
        <StatCard label="Total Referred" value={stats.total || 0}
          icon={Users} gradient="bg-gradient-to-br from-blue-500 to-blue-700" sub="Friends who joined" />
        <StatCard label="Rewarded" value={stats.rewarded || 0}
          icon={CheckCircle2} gradient="bg-gradient-to-br from-forest to-[#0d3320]" sub="First orders placed" />
        <StatCard label="Total Earned" value={`₹${stats.earned || 0}`}
          icon={TrendingUp} gradient="bg-gradient-to-br from-amber-500 to-amber-700" sub="Lifetime credits" />
      </div>

      {/* ── How it works ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-forest text-base mb-5">How it works</h2>
        <div className="space-y-4">
          {[
            { step: "01", title: "Share your referral link", desc: "Copy your unique link or code and share it with friends on WhatsApp, Instagram, or anywhere." },
            { step: "02", title: "Friend signs up & orders", desc: `Your friend registers using your link and places their first order on Mother Tatwa.` },
            { step: "03", title: "Both of you earn!", desc: `You get ₹${REFERRER_REWARD} wallet credits · Your friend gets ₹${REFERRED_REWARD} off their first order.` },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forest to-[#0d3320] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                {s.step}
              </div>
              <div className="pt-1 min-w-0">
                <p className="font-bold text-forest text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Referral History ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-forest text-base">My Referrals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Friends who joined using your link</p>
        </div>
        {referrals.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-bold text-forest text-sm">No referrals yet</p>
            <p className="text-xs text-muted-foreground mt-1">Share your link to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center shrink-0 text-forest font-bold text-sm">
                  {r.userName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-forest text-sm">{r.userName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Joined {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString("en-IN") : "—"}
                  </p>
                </div>
                {r.status === "rewarded" ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Rewarded
                    </span>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">+₹{r.reward}</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting first order</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Wallet Transactions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <h2 className="font-bold text-forest text-base">Wallet History</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Credits earned & redeemed</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-forest">₹{info?.walletBalance || 0}</p>
            <p className="text-[10px] text-muted-foreground">Available balance</p>
          </div>
        </div>
        {txns.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <IndianRupee className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No wallet activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {txns.map((tx, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-emerald-50" : "bg-red-50"}`}>
                  {tx.type === "credit"
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest truncate">{tx.note || "Wallet transaction"}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.date ? new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</p>
                </div>
                <p className={`text-sm font-bold ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "credit" ? "+" : "−"}₹{tx.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Terms ── */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
        <p className="font-bold">📋 Terms & Conditions</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-700">
          <li>Referral reward is credited only after your friend's first successful payment</li>
          <li>Self-referrals are not allowed</li>
          <li>Wallet credits can be redeemed at checkout (min order ₹299)</li>
          <li>Credits expire 12 months from date of issue</li>
          <li>Wellmaats reserves the right to modify or terminate the program anytime</li>
        </ul>
      </div>
    </div>
  );
}
