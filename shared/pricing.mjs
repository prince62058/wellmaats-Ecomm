// Prices are GST-inclusive. Money is allocated in paise to preserve invoice totals.
export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
export function isFlashSaleActive(product, now = Date.now()) {
  return (product?.isFlashSale === true || product?.isFlashSale === 'true') &&
    (!product.flashSaleEndsAt || new Date(product.flashSaleEndsAt).getTime() > now);
}
export function getSellingPrice(product, now = Date.now()) {
  if (isFlashSaleActive(product, now) && Number(product.flashSalePrice) > 0) return Number(product.flashSalePrice);
  return Number(product?.salePrice) > 0 ? Number(product.salePrice) : Number(product?.price) || 0;
}
export function getUnitPrice(product) {
  const size = Number(product?.sizeValue);
  return size > 0 && product?.sizeUnit ? roundMoney(getSellingPrice(product) / size) : null;
}
export function calculateTaxBreakdown(inclusivePrice = 0, rate = 5) {
  const price = roundMoney(Math.max(0, Number(inclusivePrice) || 0));
  const gstRate = Math.max(0, Number(rate ?? 5) || 0);
  const taxableAmount = roundMoney(price / (1 + gstRate / 100));
  const gstAmount = roundMoney(price - taxableAmount);
  const cgstAmount = roundMoney(gstAmount / 2);
  return { inclusivePrice: price, taxableAmount, gstAmount, cgstAmount,
    sgstAmount: roundMoney(gstAmount - cgstAmount), gstRate, cgstRate: gstRate / 2, sgstRate: gstRate / 2 };
}
export function calculateCartTaxBreakdown(items = [], defaultRate = 5, discount = 0) {
  const lines = items.map(item => Math.round(getSellingPrice(item) * Number(item.quantity ?? 1) * 100));
  const subtotalPaise = lines.reduce((sum, n) => sum + n, 0);
  const discountPaise = Math.min(subtotalPaise, Math.max(0, Math.round(Number(discount || 0) * 100)));
  let cumulative = 0, allocated = 0;
  const itemBreakdown = items.map((item, index) => {
    cumulative += lines[index];
    const target = subtotalPaise ? Math.round(discountPaise * cumulative / subtotalPaise) : 0;
    const lineDiscount = target - allocated;
    allocated = target;
    const lineTotal = (lines[index] - lineDiscount) / 100;
    return { ...item, lineTotal, lineDiscount: lineDiscount / 100,
      ...calculateTaxBreakdown(lineTotal, item.gstRate ?? defaultRate) };
  });
  const taxableAmount = roundMoney(itemBreakdown.reduce((sum, item) => sum + item.taxableAmount, 0));
  const discountedSubtotal = (subtotalPaise - discountPaise) / 100;
  const gstAmount = roundMoney(discountedSubtotal - taxableAmount);
  const cgstAmount = roundMoney(gstAmount / 2);
  return { subtotal: subtotalPaise / 100, discountedSubtotal, discount: discountPaise / 100,
    taxableAmount, gstAmount, cgstAmount, sgstAmount: roundMoney(gstAmount - cgstAmount),
    effectiveGstRate: taxableAmount ? roundMoney(gstAmount / taxableAmount * 100) : 0, itemBreakdown };
}
export const DEFAULT_SHIPPING_SETTINGS = {
  freeDeliveryThreshold: 2499, enableWeightBasedShipping: true, baseShippingCharge: 70,
  baseWeightLimitGrams: 500, additionalChargePerKg: 40, flatFallbackDeliveryCharge: 70,
  deliveryNotice: 'Free delivery on orders of ₹2,499 or more!',
};
export function calculateTotalWeightGrams(items = []) {
  return items.reduce((sum, item) => {
    const weight = Number(item.grossWeightInGrams) || Number(item.netWeight) * (item.weightUnit === 'kg' ? 1000 : 1) || 250;
    return sum + weight * Number(item.quantity ?? 1);
  }, 0);
}
export function formatWeight(grams = 0) {
  return grams < 1000 ? `${Math.round(grams)} g` : `${Number((grams / 1000).toFixed(2))} kg`;
}
export function calculateDeliveryCharge(items = [], subtotal = 0, customSettings = {}) {
  const settings = { ...DEFAULT_SHIPPING_SETTINGS, ...(customSettings || {}) };
  const threshold = Number(settings.freeDeliveryThreshold);
  const weight = calculateTotalWeightGrams(items);
  // Slabs: up to 500 g, then up to 1 kg, 2 kg, 3 kg, ...
  const baseWeight = Math.max(1, Number(settings.baseWeightLimitGrams));
  const billedWeightGrams = weight <= baseWeight ? baseWeight : Math.ceil(weight / 1000) * 1000;
  const extraSlabs = weight > baseWeight ? Math.ceil(billedWeightGrams / 1000) - Math.floor(baseWeight / 1000) : 0;
  const isFree = items.length > 0 && subtotal >= threshold;
  const fee = settings.enableWeightBasedShipping
    ? Number(settings.baseShippingCharge) + extraSlabs * Number(settings.additionalChargePerKg)
    : Number(settings.flatFallbackDeliveryCharge);
  return { deliveryCharge: isFree || !items.length ? 0 : roundMoney(fee), isFree,
    amountNeededForFree: Math.max(0, roundMoney(threshold - subtotal)),
    freeDeliveryProgress: threshold > 0 ? Math.min(100, Math.round(subtotal / threshold * 100)) : 100,
    totalWeightGrams: weight, billedWeightGrams, freeDeliveryThreshold: threshold, weightFormatted: formatWeight(weight) };
}
export function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon || subtotal < Number(coupon.minOrderAmount || 0)) return 0;
  let discount = coupon.discountType === 'percentage' ? subtotal * Number(coupon.discountAmount) / 100 : Number(coupon.discountAmount);
  if (coupon.discountType === 'percentage' && Number(coupon.maxDiscountAmount) > 0) discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  return roundMoney(Math.max(0, Math.min(subtotal, discount || 0)));
}
