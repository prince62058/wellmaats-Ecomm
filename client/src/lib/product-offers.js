/** Discount % from MRP vs sale price */
export function getDiscountPercent(product) {
  const price = Number(product?.price);
  const sale = Number(product?.salePrice);
  if (!price || !sale || sale <= 0 || sale >= price) return 0;
  return Math.round(((price - sale) / price) * 100);
}

/** Flash sale active (not expired) */
export function isFlashSaleActive(product) {
  if (!product?.isFlashSale) return false;
  if (!product?.flashSaleEndsAt) return true;
  return new Date(product.flashSaleEndsAt) > new Date();
}

export function getOfferLabel(product) {
  if (isFlashSaleActive(product)) return product?.offerLabel || "Flash Sale";
  if (getDiscountPercent(product) > 0) return `${getDiscountPercent(product)}% OFF`;
  return null;
}

export function formatFlashSaleEnds(isoDate) {
  if (!isoDate) return null;
  const end = new Date(isoDate);
  if (end <= new Date()) return "Expired";
  return end.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDatetimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getTimeLeft(isoDate) {
  if (!isoDate) return null;
  const diff = new Date(isoDate) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}
