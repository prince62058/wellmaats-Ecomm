import test from 'node:test';
import assert from 'node:assert/strict';
import { getSellingPrice, getUnitPrice, calculateTaxBreakdown, calculateCartTaxBreakdown, calculateDeliveryCharge, calculateCouponDiscount } from '../pricing.mjs';
const product = { price: 1200, salePrice: 1000, flashSalePrice: 800, isFlashSale: true, gstRate: 5, quantity: 1, sizeValue: 60, sizeUnit: 'Capsules', grossWeightInGrams: 500 };
test('MRP, regular price, flash price and expiry use GST-inclusive selling amounts', () => {
  assert.equal(getSellingPrice(product), 800);
  assert.equal(getSellingPrice({ ...product, isFlashSale: false }), 1000);
  assert.equal(getSellingPrice({ ...product, flashSaleEndsAt: '2020-01-01' }), 1000);
  assert.equal(getSellingPrice({ price: 1200 }), 1200);
  assert.equal(getUnitPrice(product), 20);
});
test('reverse GST uses configured slabs including zero', () => {
  assert.equal(calculateTaxBreakdown(800, 5).taxableAmount, 761.90);
  assert.equal(calculateTaxBreakdown(800, 5).gstAmount, 38.10);
  assert.equal(calculateTaxBreakdown(1120, 12).taxableAmount, 1000);
  assert.equal(calculateTaxBreakdown(1180, 18).gstAmount, 180);
  assert.equal(calculateTaxBreakdown(800, 0).gstAmount, 0);
});
test('mixed-slab coupon allocation preserves every paise and final tax total', () => {
  const items = [{ price: 105, quantity: 1, gstRate: 5 }, { price: 112, quantity: 2, gstRate: 12 }, { price: 118, quantity: 1, gstRate: 18 }];
  const result = calculateCartTaxBreakdown(items, 5, 47.01);
  assert.equal(result.discountedSubtotal, 399.99);
  assert.equal(Math.round((result.taxableAmount + result.gstAmount) * 100), 39999);
  assert.equal(Math.round(result.itemBreakdown.reduce((sum, item) => sum + item.lineDiscount, 0) * 100), 4701);
  for (const item of result.itemBreakdown) assert.equal(Math.round((item.taxableAmount + item.gstAmount) * 100), Math.round(item.lineTotal * 100));
});
test('delivery slabs are 500g then whole kilograms; free threshold and flat/zero settings work', () => {
  for (const [weight, charge] of [[500,70],[501,110],[1000,110],[1001,150],[1500,150],[2000,150],[2001,190]]) {
    assert.equal(calculateDeliveryCharge([{ ...product, grossWeightInGrams: weight }], 800).deliveryCharge, charge);
  }
  assert.equal(calculateDeliveryCharge([product], 2499).deliveryCharge, 0);
  assert.equal(calculateDeliveryCharge([product], 2498.99).deliveryCharge, 70);
  assert.equal(calculateDeliveryCharge([product], 800, { enableWeightBasedShipping: false, flatFallbackDeliveryCharge: 45 }).deliveryCharge, 45);
  assert.equal(calculateDeliveryCharge([product], 800, { baseShippingCharge: 0 }).deliveryCharge, 0);
  assert.equal(calculateDeliveryCharge([], 0).deliveryCharge, 0);
});
test('coupon amount recalculates after cart changes and obeys its cap and minimum', () => {
  const coupon = { discountType: 'percentage', discountAmount: 10, minOrderAmount: 500, maxDiscountAmount: 150 };
  assert.equal(calculateCouponDiscount(coupon, 800), 80);
  assert.equal(calculateCouponDiscount(coupon, 2000), 150);
  assert.equal(calculateCouponDiscount(coupon, 400), 0);
});
