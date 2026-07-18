import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReferralInfo } from "@/store/shop/referral-slice";
import { useSiteSettings } from "@/hooks/use-site-settings";
import {
  Gift, Copy, Check, Share2, Users, Wallet, TrendingUp,
  Clock, CheckCircle2, IndianRupee, ArrowUpRight, ArrowDownLeft,
  Loader2, MessageCircle, Link2, Sparkles, Star, ChevronRight,
  Trophy, Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const REFERRER_REWARD = 100;
const REFERRED_REWARD = 50;

export default function ReferralPage() {
  const dispatch        = useDispatch();
  const { toast }       = useToast();
  const { info, isLoading } = useSelector((s) => s.referral);
  const { siteUrl }     = useSiteSettings();
  const [copied, setCopied] = useState(false);

  useEffect(() => { dispatch(fetchReferralInfo()); }, [dispatch]);

  const host        = (siteUrl || "").replace(/\/$/, "") || window.location.origin;
  const referralUrl = info ? `${host}/ref/${info.referralCode}` : "";

  function copyLink() {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      toast({ title: "🎉 Link copied!", description: "Share it with friends to earn ₹" + REFERRER_REWARD });
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `🌿 Try Mother Tatwa — 100% Ayurvedic drops!\nUse my link & get ₹${REFERRED_REWARD} OFF your first order 🎁\n\n${referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({
        title: "Get ₹50 off on Mother Tatwa!",
        text:  `Use my referral link and get ₹${REFERRED_REWARD} off! 🌿`,
        url:   referralUrl,
      });
    } else copyLink();
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-28 gap-3 text-muted-foreground">
      <div className="w-12 h-12 rounded-2xl bg-forest/10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-forest" />
      </div>
      <p className="text-sm font-medium">Loading your referral info…</p>
    </div>
  );

  const stats    = info?.stats || {};
  const referrals = info?.referrals || [];
  const txns     = info?.walletTransactions || [];
  const balance  = info?.walletBalance || 0;

  return (
    <div className="space-y-5 pb-12">

      {/* ══════════════════════════════════════
          HERO — Invite Banner
      ══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2b1a] via-[#1a4731] to-[#0f3a25] shadow-2xl">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-[#c8963e]/10" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/[0.04]" />

        <div className="relative p-6 sm:p-8">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 bg-[#c8963e]/20 border border-[#c8963e]/30 text-[#c8963e] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Referral Program · Earn Real Rewards
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex-1">
              <h1 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                Invite Friends,<br />
                <span className="text-[#c8963e]">Earn ₹{REFERRER_REWARD}</span> Each
              </h1>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Share your unique link. When a friend places their first order —
                you get <span className="text-white/90 font-semibold">₹{REFERRER_REWARD} wallet credits</span> and
                they get <span className="text-white/90 font-semibold">₹{REFERRED_REWARD} off</span>.
              </p>
            </div>

            {/* Reward pills */}
            <div className="flex gap-3 sm:flex-col sm:items-end shrink-0">
              <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-center">
                <p className="text-2xl font-black text-[#c8963e]">₹{REFERRER_REWARD}</p>
                <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">You get</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-center">
                <p className="text-2xl font-black text-emerald-400">₹{REFERRED_REWARD}</p>
                <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Friend gets</p>
              </div>
            </div>
          </div>

          {/* Referral link box */}
          <div className="mt-6 bg-white/[0.07] border border-white/10 rounded-2xl p-1 flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 min-w-0">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-0.5">Your Referral Link</p>
              <p className="text-white/90 text-xs font-mono truncate">{referralUrl || "Generating…"}</p>
            </div>
            <div className="flex gap-1.5 pr-1.5 shrink-0">
              <button onClick={copyLink}
                className="flex items-center gap-1.5 bg-white text-[#1a4731] text-xs font-bold px-3.5 py-2.5 rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={shareWhatsApp} title="Share on WhatsApp"
                className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center hover:bg-[#20bc5a] transition-all active:scale-95 shrink-0">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
              <button onClick={shareNative} title="Share"
                className="w-10 h-10 rounded-xl bg-[#c8963e] flex items-center justify-center hover:bg-[#b8863e] transition-all active:scale-95 shrink-0">
                <Share2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Code pill */}
          <div className="mt-3 flex items-center gap-3">
            <p className="text-white/40 text-xs">Or share code</p>
            <button onClick={() => { navigator.clipboard.writeText(info?.referralCode || ""); toast({ title: "Code copied!" }); }}
              className="font-mono text-sm font-black text-[#c8963e] bg-[#c8963e]/10 border border-[#c8963e]/25 px-3 py-1 rounded-lg tracking-[0.15em] hover:bg-[#c8963e]/20 transition-colors">
              {info?.referralCode || "——"}
            </button>
            <span className="text-white/25 text-xs">click to copy</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STATS ROW
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Wallet, label: "Wallet Balance", value: `₹${balance}`,
            sub: "Use at checkout",
            bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
            glow: "shadow-emerald-200",
          },
          {
            icon: Users, label: "Friends Invited", value: stats.total || 0,
            sub: "Total referrals",
            bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
            glow: "shadow-blue-200",
          },
          {
            icon: Trophy, label: "Converted", value: stats.rewarded || 0,
            sub: "Placed first order",
            bg: "bg-gradient-to-br from-[#1a4731] to-[#0d3320]",
            glow: "shadow-green-200",
          },
          {
            icon: TrendingUp, label: "Total Earned", value: `₹${stats.earned || 0}`,
            sub: "Lifetime credits",
            bg: "bg-gradient-to-br from-amber-500 to-orange-600",
            glow: "shadow-amber-200",
          },
        ].map(({ icon: Icon, label, value, sub, bg, glow }) => (
          <div key={label} className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-lg ${glow} ${bg}`}>
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10" />
            <Icon className="w-5 h-5 text-white/70 mb-3 relative" />
            <p className="text-2xl font-black relative">{value}</p>
            <p className="text-[11px] font-bold text-white/80 mt-0.5">{label}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-forest" />
          </div>
          <h2 className="font-bold text-forest text-base">How it works</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              num: "1", emoji: "🔗",
              title: "Share your link",
              desc: "Copy your unique referral link and share it with friends on WhatsApp, Instagram, or anywhere.",
              color: "from-blue-50 to-indigo-50 border-blue-100",
            },
            {
              num: "2", emoji: "🛒",
              title: "Friend orders",
              desc: "Your friend signs up using your link and places their very first order on Mother Tatwa.",
              color: "from-amber-50 to-orange-50 border-amber-100",
            },
            {
              num: "3", emoji: "🎁",
              title: "Both earn rewards",
              desc: `You get ₹${REFERRER_REWARD} wallet credits instantly. Your friend gets ₹${REFERRED_REWARD} off that order.`,
              color: "from-emerald-50 to-green-50 border-emerald-100",
            },
          ].map((s) => (
            <div key={s.num} className={`relative rounded-2xl border bg-gradient-to-br ${s.color} p-4`}>
              <div className="text-2xl mb-3">{s.emoji}</div>
              <div className="absolute top-3.5 right-4 text-6xl font-black text-black/[0.04] leading-none select-none">{s.num}</div>
              <p className="font-bold text-forest text-sm mb-1">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          REFERRALS LIST + WALLET — side by side on desktop
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* ── My Referrals ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-forest text-sm">My Referrals</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Friends who joined your link</p>
            </div>
            <span className="text-xs font-bold bg-forest/10 text-forest px-2.5 py-1 rounded-full">
              {referrals.length}
            </span>
          </div>

          {referrals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f5faf4] to-[#e8f5e1] flex items-center justify-center mb-4 shadow-inner">
                <Users className="w-7 h-7 text-forest/30" />
              </div>
              <p className="font-bold text-forest text-sm">No referrals yet</p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-[180px]">
                Share your link above and start earning ₹{REFERRER_REWARD} per friend!
              </p>
              <button onClick={copyLink}
                className="mt-4 flex items-center gap-2 bg-forest text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-forest/90 transition-all active:scale-95">
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 flex-1">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-forest/20 to-forest/10 flex items-center justify-center shrink-0 font-bold text-forest text-sm">
                    {r.userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-forest text-sm truncate">{r.userName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                    </p>
                  </div>
                  {r.status === "rewarded" ? (
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Rewarded
                      </span>
                      <p className="text-xs font-black text-emerald-600 mt-0.5">+₹{r.reward}</p>
                    </div>
                  ) : (
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting order</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Wallet ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {/* Wallet balance hero */}
          <div className="bg-gradient-to-br from-[#1a4731] to-[#0d3320] px-5 py-5">
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Wallet Balance</p>
            <p className="text-4xl font-black text-white">₹{balance}</p>
            <p className="text-white/50 text-xs mt-1">Available to redeem at checkout</p>
            {balance > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-[#c8963e]/20 border border-[#c8963e]/30 text-[#c8963e] text-xs font-bold px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3" /> Ready to use
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-b border-gray-50">
            <h3 className="font-bold text-forest text-sm">Transaction History</h3>
          </div>

          {txns.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <IndianRupee className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No transactions yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Earn credits by referring friends</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-72">
              {txns.map((tx, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-emerald-50" : "bg-red-50"}`}>
                    {tx.type === "credit"
                      ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      : <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-forest truncate">{tx.note || "Wallet transaction"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {tx.date ? new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : ""}
                    </p>
                  </div>
                  <p className={`text-sm font-black shrink-0 ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : "−"}₹{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          TERMS
      ══════════════════════════════════════ */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
        <p className="font-bold text-amber-800 text-xs mb-2 flex items-center gap-1.5">
          <span>📋</span> Terms & Conditions
        </p>
        <ul className="text-[11px] text-amber-700 space-y-1 list-disc list-inside leading-relaxed">
          <li>Reward credited only after friend's first successful payment</li>
          <li>Self-referrals are not allowed and will be disqualified</li>
          <li>Wallet credits are redeemable at checkout (min order ₹299)</li>
          <li>Credits expire 12 months from date of issue</li>
          <li>Wellmaats reserves the right to modify the program at any time</li>
        </ul>
      </div>
    </div>
  );
}
