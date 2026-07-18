import { Package, ShoppingBag, Star, AlertTriangle } from "lucide-react";

function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-forest">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* Gradient stat cards matching dashboard style */
const GRADIENTS = [
  "bg-gradient-to-br from-emerald-500 to-emerald-700",
  "bg-gradient-to-br from-amber-400 to-amber-600",
  "bg-gradient-to-br from-violet-500 to-violet-700",
  "bg-gradient-to-br from-blue-500 to-blue-700",
];

function AdminStatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s, i) => (
        <div key={s.label}
          className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-md ${GRADIENTS[i % GRADIENTS.length]}`}>
          <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[11px] text-white/75 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { AdminPageHeader, AdminStatCards, Package, ShoppingBag, Star, AlertTriangle };
