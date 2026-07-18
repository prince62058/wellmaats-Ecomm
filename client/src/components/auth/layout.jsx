import { Outlet } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";

function TreeLogo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
      <rect x="29" y="54" width="6" height="14" rx="3" fill="#C8A54A" />
      <path d="M35 63 Q44 65 48 68" stroke="#C8A54A" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 63 Q20 65 16 68" stroke="#C8A54A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="44" r="18" fill="#C8A54A" opacity="0.13" />
      <circle cx="32" cy="40" r="14" fill="#C8A54A" opacity="0.22" />
      <circle cx="32" cy="35" r="11" fill="#C8A54A" opacity="0.38" />
      <circle cx="32" cy="30" r="8" fill="#C8A54A" opacity="0.62" />
      <circle cx="32" cy="25" r="6" fill="#C8A54A" opacity="0.95" />
      <circle cx="22" cy="32" r="2.2" fill="#C8A54A" opacity="0.82" />
      <circle cx="42" cy="32" r="2.2" fill="#C8A54A" opacity="0.82" />
      <circle cx="20" cy="42" r="1.8" fill="#C8A54A" opacity="0.6" />
      <circle cx="44" cy="42" r="1.8" fill="#C8A54A" opacity="0.6" />
    </svg>
  );
}

const FEATURES = [
  { emoji: "🌿", label: "100% Ayurvedic" },
  { emoji: "🧪", label: "Lab Tested" },
  { emoji: "🛡️", label: "GMP Certified" },
  { emoji: "🚫", label: "No Harmful Chemicals" },
];

function Leaf({ style }) {
  return (
    <div className="absolute pointer-events-none" style={style}>
      <svg viewBox="0 0 30 50" fill="none" width="100%" height="100%">
        <path
          d="M15 1C6 6 3 18 5 30C7 42 13 48 15 50C17 48 23 42 25 30C27 18 24 6 15 1Z"
          fill="#3a7d50"
          opacity="0.7"
        />
        <line x1="15" y1="1" x2="15" y2="50" stroke="#2d5e3a" strokeWidth="1.2" opacity="0.55" />
      </svg>
    </div>
  );
}

const LEAVES = [
  { top: "-4%", left: "8%", w: 26, h: 42, r: 12, dur: "8s", del: "0s" },
  { top: "-6%", left: "28%", w: 20, h: 34, r: -22, dur: "10s", del: "1.8s" },
  { top: "-3%", left: "55%", w: 30, h: 48, r: 7, dur: "7.5s", del: "3.2s" },
  { top: "-5%", left: "78%", w: 18, h: 30, r: -15, dur: "11s", del: "0.6s" },
];

export default function AuthLayout() {
  const { brand } = useSiteSettings();

  return (
    <div className="md:fixed md:inset-0 flex min-h-screen w-full overflow-x-hidden bg-[#f5faf4]">
      {/* LEFT — full height image panel */}
      <aside className="hidden md:flex md:w-[46%] lg:w-1/2 relative shrink-0 h-full">
        <img
          src="/auth-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(248,255,250,0.88) 0%, rgba(240,255,245,0.55) 38%, rgba(200,240,210,0.08) 72%, transparent 100%)",
          }}
        />

        <style>{`
          @keyframes leafFall {
            0% { transform: translateY(-60px) rotate(var(--r)); opacity: 0; }
            10% { opacity: 0.85; }
            100% { transform: translateY(105vh) rotate(calc(var(--r) + 50deg)); opacity: 0; }
          }
        `}</style>
        {LEAVES.map((l, i) => (
          <Leaf
            key={i}
            style={{
              top: l.top,
              left: l.left,
              width: l.w,
              height: l.h,
              "--r": `${l.r}deg`,
              animation: `leafFall ${l.dur} linear ${l.del} infinite`,
            }}
          />
        ))}

        <div className="relative z-10 flex flex-col justify-center h-full px-8 lg:px-12 py-10 max-w-[52%]">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-3 text-[#C8A54A]">
            {brand.name || "Mother Tatwa"} · Drops
          </p>
          <h1 className="font-display font-bold text-[#1a3d2a] leading-[1.08] text-[clamp(2.2rem,3.2vw,3.4rem)] mb-3">
            Nature
            <br />
            Cures Life
          </h1>
          <p className="text-sm text-[#2a5c3a] leading-relaxed mb-7 max-w-[220px]">
            Embrace the power of Ayurveda for a healthier &amp; better you
          </p>
          <div className="flex flex-col gap-2.5">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-fit bg-white/55 backdrop-blur-sm border border-white/60"
              >
                <span className="text-base leading-none">{f.emoji}</span>
                <span className="font-semibold text-sm text-[#1a3d2a]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT — scrollable form */}
      <main className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto bg-[#f5faf4]">
        {/* Mobile banner */}
        <div className="md:hidden relative h-[120px] shrink-0">
          <img src="/auth-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center">
            <p className="font-display font-bold text-white text-xl">Nature Cures Life</p>
            <p className="text-white/75 text-xs italic mt-0.5">— Ayurvedic Wellness —</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
          <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col items-center mb-6 select-none">
              <TreeLogo size={56} />
              <div className="text-center mt-2">
                <p className="font-display font-bold text-[1.05rem] tracking-[0.18em] uppercase text-[#1a3d2a]">
                  {brand.name || "Mother Tatwa"}
                </p>
                <div className="flex items-center justify-center gap-2 my-0.5">
                  <span className="h-px w-5 bg-[#C8A54A]" />
                  <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A54A]">Drops</p>
                  <span className="h-px w-5 bg-[#C8A54A]" />
                </div>
                <p className="text-[11px] italic text-[#C8A54A]">
                  — {brand.tagline || "Nature Cures Life"} —
                </p>
              </div>
            </div>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
