import { Package, ShoppingBag, Star, AlertTriangle } from "lucide-react";

function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-forest">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function AdminStatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-forest/10 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-forest">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { AdminPageHeader, AdminStatCards, Package, ShoppingBag, Star, AlertTriangle };
