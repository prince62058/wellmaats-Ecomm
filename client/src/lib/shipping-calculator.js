/**
 * Dynamic Shipping & Delivery Charge Calculator
 * Configurable via SiteSettings > Shipping Settings in Admin
 */

export const DEFAULT_SHIPPING_SETTINGS = {
  freeDeliveryThreshold: 2499, // Minimum order value for free delivery (₹2,499)
  enableWeightBasedShipping: true,
  baseShippingCharge: 70,       // ₹70 base fee
  baseWeightLimitGrams: 500,    // up to 500g covered in base fee
  additionalChargePerKg: 40,    // +₹40 per additional 1 kg
  flatFallbackDeliveryCharge: 70,
  deliveryNotice: "Free delivery on all orders above ₹2,499!",
};

/**
 * Calculates total gross weight of cart items in grams
 */
export function calculateTotalWeightGrams(cartItems = []) {
  if (!Array.isArray(cartItems) || !cartItems.length) return 0;
  return cartItems.reduce((acc, item) => {
    const qty = Number(item?.quantity) || 1;
    let weight = Number(item?.grossWeightInGrams);
    if (!weight || isNaN(weight) || weight <= 0) {
      // Fallback to netWeight if provided
      if (item?.weightUnit === "kg") {
        weight = (Number(item?.netWeight) || 0.25) * 1000;
      } else {
        weight = Number(item?.netWeight) || 250; // default 250g
      }
    }
    return acc + (weight * qty);
  }, 0);
}

/**
 * Formats weight nicely for UI (e.g. 450 g or 1.2 kg)
 */
export function formatWeight(grams = 0) {
  if (grams < 1000) return `${Math.round(grams)} g`;
  const kg = (grams / 1000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1");
  return `${kg} kg`;
}

/**
 * Calculate dynamic delivery charge for cart or checkout
 */
export function calculateDeliveryCharge(cartItems = [], subtotal = 0, customSettings = null) {
  const settings = {
    ...DEFAULT_SHIPPING_SETTINGS,
    ...(customSettings || {}),
  };

  const threshold = Number(settings.freeDeliveryThreshold) || 2499;
  const numSubtotal = Number(subtotal) || 0;
  const totalWeightGrams = calculateTotalWeightGrams(cartItems);

  // If order reaches or exceeds free delivery threshold -> Free Shipping
  if (numSubtotal >= threshold && numSubtotal > 0) {
    return {
      deliveryCharge: 0,
      isFree: true,
      amountNeededForFree: 0,
      freeDeliveryProgress: 100,
      totalWeightGrams,
      freeDeliveryThreshold: threshold,
      weightFormatted: formatWeight(totalWeightGrams),
    };
  }

  // Below threshold: calculate delivery fee based on weight / rules
  const baseCharge = Number(settings.baseShippingCharge) || 70;
  const baseWeight = Number(settings.baseWeightLimitGrams) || 500;
  const addPerKg   = Number(settings.additionalChargePerKg) || 40;

  let fee = baseCharge;

  if (settings.enableWeightBasedShipping && totalWeightGrams > baseWeight) {
    const extraWeight = totalWeightGrams - baseWeight;
    const extraKg = Math.ceil(extraWeight / 1000);
    fee += (extraKg * addPerKg);
  }

  const amountNeeded = Math.max(0, threshold - numSubtotal);
  const progress = threshold > 0 ? Math.min(100, Math.round((numSubtotal / threshold) * 100)) : 100;

  return {
    deliveryCharge: fee,
    isFree: false,
    amountNeededForFree: amountNeeded,
    freeDeliveryProgress: progress,
    totalWeightGrams,
    freeDeliveryThreshold: threshold,
    weightFormatted: formatWeight(totalWeightGrams),
  };
}
