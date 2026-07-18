export const ORDER_STATUSES = [
  { id: "pending", label: "Pending", color: "bg-amber-500" },
  { id: "confirmed", label: "Confirmed", color: "bg-emerald-500" },
  { id: "inProcess", label: "Processing", color: "bg-blue-500" },
  { id: "inShipping", label: "Shipped", color: "bg-violet-500" },
  { id: "delivered", label: "Delivered", color: "bg-forest" },
  { id: "rejected", label: "Rejected", color: "bg-red-600" },
];

export function getStatusMeta(status) {
  return ORDER_STATUSES.find((s) => s.id === status) || {
    id: status,
    label: status || "Unknown",
    color: "bg-gray-500",
  };
}

export function formatOrderDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatOrderDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortOrderId(id) {
  if (!id) return "—";
  return `#${String(id).slice(-8).toUpperCase()}`;
}

export function getPaymentStatusStyle(status) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "failed") return "bg-red-50 text-red-700 border-red-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}
