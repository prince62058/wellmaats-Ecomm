import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, Flame, Droplets, Wind, Heart, Brain, Bone,
  Sparkles, Activity, Stethoscope, Scale, Baby, Leaf,
  ChevronRight, ArrowRight, Grid3X3,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

const ICON_MAP = {
  Shield, Flame, Droplets, Wind, Heart, Brain, Bone,
  Sparkles, Activity, Stethoscope, Scale, Baby, Leaf,
  Grid3X3,
};

function MegaMenu({ light, onNavigate }) {
  const navigate = useNavigate();
  const { megaMenu = [] } = useSiteSettings();
  const [activeId, setActiveId] = useState(megaMenu[0]?.id || null);
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef(null);

  const activeCategory = megaMenu.find((c) => c.id === activeId) || megaMenu[0];

  function handleEnter() {
    clearTimeout(leaveTimer.current);
    setOpen(true);
  }

  function handleLeave() {
    leaveTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function go(href) {
    setOpen(false);
    onNavigate?.();
    navigate(href);
  }

  const triggerClass = light
    ? "text-sm font-medium text-white/90 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
    : "text-sm font-medium text-forest/80 hover:text-forest flex items-center gap-1 cursor-pointer transition-colors";

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Trigger */}
      <button type="button" className={triggerClass}>
        <Grid3X3 className="w-3.5 h-3.5 opacity-70" />
        Shop By Category
        <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="fixed left-0 right-0 z-[999] shadow-2xl border-t border-forest/10"
          style={{ top: "calc(var(--header-h, 64px))" }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="flex bg-white max-h-[520px]" style={{ maxWidth: "100vw" }}>
            {/* Left sidebar */}
            <div className="w-56 shrink-0 bg-[#f6faf6] border-r border-forest/10 overflow-y-auto">
              {megaMenu.map((cat) => {
                const Icon = ICON_MAP[cat.icon] || Leaf;
                const isImg = cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("/"));
                const isActive = cat.id === activeId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 text-left ${
                      isActive
                        ? "border-forest bg-white text-forest font-semibold"
                        : "border-transparent text-forest/70 hover:bg-white hover:text-forest"
                    }`}
                    onMouseEnter={() => setActiveId(cat.id)}
                    onClick={() => go(cat.href || `/shop/listing?category=${cat.id}`)}
                  >
                    {isImg
                      ? <img src={cat.icon} alt="" className={`w-4 h-4 shrink-0 object-contain ${isActive ? "opacity-100" : "opacity-60"}`} />
                      : <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-forest" : "text-forest/50"}`} />}
                    <span className="truncate">{cat.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40 shrink-0" />
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => go("/shop/listing")}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gold border-t border-forest/10 hover:bg-leaf transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                View All Products
              </button>
            </div>

            {/* Right panel */}
            {activeCategory && (
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-forest/8">
                  {(() => {
                    const isImg = activeCategory.icon && (activeCategory.icon.startsWith("http") || activeCategory.icon.startsWith("/"));
                    if (isImg) return <img src={activeCategory.icon} alt="" className="w-5 h-5 object-contain" />;
                    const Icon = ICON_MAP[activeCategory.icon] || Leaf;
                    return <Icon className="w-5 h-5 text-forest" />;
                  })()}
                  <h3 className="font-display font-bold text-forest text-lg">{activeCategory.label}</h3>
                  <button
                    type="button"
                    onClick={() => go(activeCategory.href || `/shop/listing?category=${activeCategory.id}`)}
                    className="ml-auto text-xs text-gold font-semibold flex items-center gap-1 hover:underline"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(activeCategory.columns || []).map((col, ci) => (
                    <div key={ci}>
                      <p className="text-xs font-bold uppercase tracking-widest text-forest/50 mb-2.5">
                        {col.heading}
                      </p>
                      <ul className="space-y-1.5">
                        {(col.items || []).map((item, ii) => (
                          <li key={ii}>
                            <button
                              type="button"
                              onClick={() => go(item.href)}
                              className="text-sm text-forest/75 hover:text-forest hover:font-medium transition-colors text-left"
                            >
                              {item.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MegaMenu;
