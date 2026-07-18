const crypto   = require("crypto");
const razorpay = require("../../helpers/razorpay");
const Order    = require("../../models/Order");
const Cart     = require("../../models/Cart");
const Product  = require("../../models/Product");
const User     = require("../../models/User");
const { processReferralReward } = require("./referral-controller");

const createOrder = async (req, res) => {
  try {
    const {
      userId, cartItems, addressInfo, orderStatus, paymentMethod,
      paymentStatus, totalAmount, orderDate, orderUpdateDate, cartId,
      walletCreditsUsed,
    } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
      return res.status(500).json({ success: false, message: "Razorpay keys are not configured" });

    const finalAmount   = Math.max(0, Number(totalAmount) - Number(walletCreditsUsed || 0));
    const amountInPaise = Math.round(finalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    });

    const newlyCreatedOrder = new Order({
      userId, cartId, cartItems, addressInfo, orderStatus,
      paymentMethod, paymentStatus,
      totalAmount:       Number(totalAmount),
      walletCreditsUsed: Number(walletCreditsUsed || 0),
      orderDate, orderUpdateDate,
      paymentId: "",
      payerId:   razorpayOrder.id,
    });
    await newlyCreatedOrder.save();

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

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      order.paymentStatus = "failed";
      await order.save();
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
