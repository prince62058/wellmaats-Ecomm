const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId:            String,
  cartId:            String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
      hsnCode: { type: String, default: "3004" },
      gstRate: { type: Number, default: 5 },
      productType: { type: String, default: "Capsule" },
      sizeValue: { type: String, default: "" },
      sizeUnit: { type: String, default: "" },
      netWeight: { type: Number, default: 0 },
      weightUnit: { type: String, default: "gm" },
    },
  ],
  addressInfo:       { addressId: String, address: String, city: String, pincode: String, phone: String, notes: String },
  orderStatus:       String,
  paymentMethod:     String,
  paymentStatus:     String,
  subTotal:          { type: Number, default: 0 },
  deliveryCharges:   { type: Number, default: 0 },
  totalWeightGrams:  { type: Number, default: 0 },
  taxableAmount:     { type: Number, default: 0 },
  gstAmount:         { type: Number, default: 0 },
  gstRate:           { type: Number, default: 5 },
  totalAmount:       Number,
  walletCreditsUsed: { type: Number, default: 0 },
  couponDetails: {
    couponCode:     { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
    discountType:   { type: String, default: "" },
  },
  orderDate:         Date,
  orderUpdateDate:   Date,
  paymentId:         String,
  payerId:           String,
  trackingInfo: {
    courierName:    { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl:    { type: String, default: "" },
  },
});

module.exports = mongoose.model("Order", OrderSchema);
