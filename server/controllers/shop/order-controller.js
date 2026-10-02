const crypto   = require("crypto");
const razorpay = require("../../helpers/razorpay");
const Order    = require("../../models/Order");
const Cart     = require("../../models/Cart");
const Product  = require("../../models/Product");
const User     = require("../../models/User");
const Coupon   = require("../../models/Coupon");
const { processReferralReward } = require("./referral-controller");

const SiteSettings = require("../../models/SiteSettings");
const Address = require("../../models/Address");

const createOrder = async (req, res) => {
  try {
    const { getSellingPrice, calculateCartTaxBreakdown, calculateDeliveryCharge, roundMoney } = await import("../../../shared/pricing.mjs");
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const address = await Address.findOne({ _id: req.body.addressInfo?.addressId, userId }).lean();
    if (!cart?.items?.length || !address) return res.status(400).json({ success: false, message: "A non-empty cart and your delivery address are required." });
    const settings = await SiteSettings.findOne({ key: "site" }).lean();
    const cartItems = [];
    for (const item of cart.items) {
      const product = item.productId;
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || product.totalStock < item.quantity) {
        return res.status(400).json({ success: false, message: "A cart item is unavailable or exceeds available stock. Please update your cart." });
      }
      cartItems.push({ productId: String(product._id), title: product.title, image: product.image,
        quantity: item.quantity, price: getSellingPrice(product), gstRate: product.gstRate ?? settings?.taxSettings?.defaultGstRate ?? 5,
        hsnCode: product.hsnCode, grossWeightInGrams: product.grossWeightInGrams,
        productType: product.productType, sizeValue: product.sizeValue, sizeUnit: product.sizeUnit,
        netWeight: product.netWeight, weightUnit: product.weightUnit });
    }
    const subTotal = roundMoney(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
    let couponDiscount = 0;
    let couponCode = "", discountType = "";
    const requestedCode = req.body.couponDetails?.couponCode;
    if (requestedCode) {
      const coupon = await Coupon.findOne({ code: String(requestedCode).trim().toUpperCase() });
      const now = new Date();
      if (!coupon || !coupon.isActive || coupon.startDate > now || (coupon.endDate && coupon.endDate < now)
        || subTotal < coupon.minOrderAmount || (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit)
        || (coupon.userUsageLimit > 0 && coupon.usedBy.filter(u => String(u.userId) === String(userId)).length >= coupon.userUsageLimit)) {
        return res.status(400).json({ success: false, message: "Coupon is no longer eligible. Remove it or choose another coupon." });
      }
      couponCode = coupon.code; discountType = coupon.discountType;
      couponDiscount = coupon.discountType === "percentage" ? subTotal * coupon.discountAmount / 100 : coupon.discountAmount;
      if (coupon.maxDiscountAmount > 0 && coupon.discountType === "percentage") couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
      couponDiscount = roundMoney(Math.min(subTotal, couponDiscount));
    }
    const tax = calculateCartTaxBreakdown(cartItems, settings?.taxSettings?.defaultGstRate ?? 5, couponDiscount);
    const shipping = calculateDeliveryCharge(cartItems, tax.discountedSubtotal, settings?.shippingSettings);
    const totalAmount = roundMoney(tax.discountedSubtotal + shipping.deliveryCharge);
    const user = await User.findById(userId);
    const walletCreditsUsed = Math.max(0, roundMoney(Math.min(Number(req.body.walletCreditsUsed) || 0, user?.walletBalance || 0, totalAmount)));
    const paymentAmount = roundMoney(totalAmount - walletCreditsUsed);
    if (paymentAmount < 1) return res.status(400).json({ success: false, message: "Online payment must be at least ₹1. Reduce wallet credits or choose another coupon." });
    if (!razorpay) return res.status(503).json({ success: false, message: "Online payments are not configured." });
    const amountInPaise = Math.round(paymentAmount * 100);
    const razorpayOrder = await razorpay.orders.create({ amount: amountInPaise, currency: "INR", receipt: `receipt_${Date.now()}` });
    const newlyCreatedOrder = await Order.create({ userId, cartId: String(cart._id), cartItems: tax.itemBreakdown,
      addressInfo: { addressId: String(address._id), address: address.address, city: address.city, pincode: address.pincode, phone: address.phone, notes: address.notes },
      orderStatus: "pending", paymentMethod: "razorpay", paymentStatus: "pending",
      subTotal, deliveryCharges: shipping.deliveryCharge, totalWeightGrams: shipping.totalWeightGrams,
      taxableAmount: tax.taxableAmount, gstAmount: tax.gstAmount, gstRate: tax.effectiveGstRate,
      gstNumber: settings?.taxSettings?.gstNumber || "",
      panNumber: settings?.taxSettings?.panNumber || "", invoicePrefix: settings?.taxSettings?.taxInvoicePrefix || "WM",
      sellerInfo: { companyName: settings?.defaultManufacturingDetails?.soldBy || settings?.brand?.company || "",
        address: settings?.defaultManufacturingDetails?.sellerAddress || settings?.contact?.office || "",
        email: settings?.contact?.email || "", phone: settings?.contact?.phone || "", siteUrl: settings?.brand?.siteUrl || "" },
      totalAmount, paymentAmount, walletCreditsUsed,
      couponDetails: { couponCode, couponDiscount, discountType },
      orderDate: new Date(), orderUpdateDate: new Date(), paymentId: "", payerId: razorpayOrder.id });

    res.status(201).json({
      success:        true,
      orderId:        newlyCreatedOrder._id,
      razorpayOrderId:razorpayOrder.id,
      amount:         amountInPaise,
      currency:       "INR",
      keyId:          process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error while creating order" });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.payerId !== razorpayOrderId) return res.status(400).json({ success: false, message: "Payment does not belong to this order." });
    if (order.paymentStatus === "paid") return res.json({ success: true, data: order });
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    order.paymentStatus = "paid";
    order.orderStatus   = "confirmed";
    order.paymentId     = razorpayPaymentId;
    order.payerId       = razorpayOrderId;

    for (let item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ success: false, message: `Product not found: ${item.title}` });
      product.totalStock -= item.quantity;
      await product.save();
    }

    // Deduct wallet credits if used
    if (order.walletCreditsUsed > 0) {
      const user = await User.findById(order.userId);
      if (user && user.walletBalance >= order.walletCreditsUsed) {
        user.walletBalance -= order.walletCreditsUsed;
        user.walletTransactions = [
          ...(user.walletTransactions || []),
          {
            type:   "debit",
            amount: order.walletCreditsUsed,
            note:   `Applied at checkout — Order #${String(order._id).slice(-6).toUpperCase()}`,
            date:   new Date(),
          },
        ];
        await user.save();
      }
    }

    // Record coupon usage if coupon was applied
    if (order.couponDetails && order.couponDetails.couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: order.couponDetails.couponCode.toUpperCase() },
          {
            $inc: { usageCount: 1 },
            $push: {
              usedBy: {
                userId: order.userId,
                orderId: order._id,
                discountApplied: order.couponDetails.couponDiscount,
                usedAt: new Date(),
              },
            },
          }
        );
      } catch (couponErr) {
        console.error("Error updating coupon usage:", couponErr);
      }
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);
    await order.save();

    // Trigger referral reward (async, non-blocking)
    processReferralReward(order.userId, order._id).catch(console.error);

    res.status(200).json({ success: true, message: "Order confirmed", data: order });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Payment capture failed" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    if (!orders.length)
      return res.status(404).json({ success: false, message: "No orders found!" });
    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found!" });
    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createOrder, capturePayment, getAllOrdersByUser, getOrderDetails };
