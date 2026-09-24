/**
 * Dynamic Tax & GST Calculator (India GST Compliant)
 * 
 * In this system, all catalog selling prices (e.g. ₹800 or ₹1,000) are INCLUSIVE of GST.
 * The customer pays the selling price for the product.
 * Delivery charges (if applicable) are added separately.
 * 
 * Standard Reverse Tax Formula (Indian GST):
 * Taxable Base Amount = Selling Price / (1 + (GST_Rate / 100))
 * Total GST Amount = Selling Price - Taxable Base Amount
 * CGST = Total GST / 2
 * SGST = Total GST / 2
 */

export const DEFAULT_TAX_SETTINGS = {
  defaultGstRate: 5,         // 5% standard rate for Ayurvedic / Herbal formulations
  gstNumber: "",              // Company GSTIN
  panNumber: "",              // Company PAN
  pricesIncludeGst: true,     // Selling prices displayed are inclusive of GST
  taxInvoicePrefix: "INV-WM",
};

/**
 * Calculates reverse GST breakdown for an inclusive price
 * @param {number} inclusivePrice - Final selling price (e.g. 800)
 * @param {number} rate - GST rate in percent (e.g. 5)
 */
export function calculateTaxBreakdown(inclusivePrice = 0, rate = 5) {
  const price = Math.max(0, Number(inclusivePrice) || 0);
  const gstRate = Math.max(0, Number(rate != null ? rate : 5));

  if (price === 0 || gstRate === 0) {
    return {
      inclusivePrice: price,
      taxableAmount: price,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      gstRate: 0,
      cgstRate: 0,
      sgstRate: 0,
    };
  }

  // Reverse Tax Formula: Base = Total / (1 + r/100)
  const taxable = Number((price / (1 + gstRate / 100)).toFixed(2));
  const totalGst = Number((price - taxable).toFixed(2));
  const cgst = Number((totalGst / 2).toFixed(2));
  const sgst = Number((totalGst - cgst).toFixed(2));

  return {
    inclusivePrice: price,
    taxableAmount: taxable,
    gstAmount: totalGst,
    cgstAmount: cgst,
    sgstAmount: sgst,
    gstRate,
    cgstRate: gstRate / 2,
    sgstRate: gstRate / 2,
  };
}

/**
 * Calculates aggregate tax breakdown across all cart items
 * Handles mixed GST rates across different items dynamically
 */
export function calculateCartTaxBreakdown(cartItems = [], defaultRate = 5) {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    return {
      subtotal: 0,
      taxableAmount: 0,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      effectiveGstRate: defaultRate,
      itemBreakdown: [],
    };
  }

  let totalSubtotal = 0;
  let totalTaxable = 0;
  let totalGst = 0;

  const itemBreakdown = cartItems.map((item) => {
    const qty = Number(item.quantity) || 1;
    const unitPrice = Number(item.salePrice > 0 ? item.salePrice : item.price) || 0;
    const lineTotal = unitPrice * qty;
    const itemGstRate = item.gstRate != null && !isNaN(Number(item.gstRate))
      ? Number(item.gstRate)
      : defaultRate;

    const breakdown = calculateTaxBreakdown(lineTotal, itemGstRate);
    totalSubtotal += lineTotal;
    totalTaxable += breakdown.taxableAmount;
    totalGst += breakdown.gstAmount;

    return {
      ...item,
      lineTotal,
      hsnCode: item.hsnCode || "3004",
      ...breakdown,
    };
  });

  const roundedSubtotal = Number(totalSubtotal.toFixed(2));
  const roundedTaxable = Number(totalTaxable.toFixed(2));
  const roundedGst = Number((roundedSubtotal - roundedTaxable).toFixed(2));
  const cgst = Number((roundedGst / 2).toFixed(2));
  const sgst = Number((roundedGst - cgst).toFixed(2));

  return {
    subtotal: roundedSubtotal,
    taxableAmount: roundedTaxable,
    gstAmount: roundedGst,
    cgstAmount: cgst,
    sgstAmount: sgst,
    effectiveGstRate: defaultRate,
    itemBreakdown,
  };
}
