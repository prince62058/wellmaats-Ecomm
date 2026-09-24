const Coupon = require("../../models/Coupon");

// Get public coupons visible on cart/checkout
const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      showInCheckout: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }).sort({ discountAmount: -1 });

    // Filter out coupons that exceeded global usage limit
    const validCoupons = coupons.filter(
      (c) => c.usageLimit == null || c.usageCount < c.usageLimit
    );

    // Return sanitized customer fields
    const sanitized = validCoupons.map((c) => ({
      _id: c._id,
      code: c.code,
      title: c.title,
      description: c.description,
      discountType: c.discountType,
      discountAmount: c.discountAmount,
      minOrderAmount: c.minOrderAmount,
      maxDiscountAmount: c.maxDiscountAmount,
      endDate: c.endDate,
    }));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    console.error("Error fetching available coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// Validate and apply a coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, cartSubtotal, userId, userEmail } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a coupon code",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon "${cleanCode}" is invalid`,
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is currently inactive`,
      });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is not yet active`,
      });
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" has expired`,
      });
    }

    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" has reached its maximum usage limit`,
      });
    }

    const subtotal = Number(cartSubtotal || 0);

    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon (Current: ₹${subtotal})`,
      });
    }

    // Check user-specific usage limit if userId is provided
    if (userId && coupon.userUsageLimit > 0 && Array.isArray(coupon.usedBy)) {
      const timesUsedByUser = coupon.usedBy.filter(
        (u) => String(u.userId) === String(userId)
      ).length;
      if (timesUsedByUser >= coupon.userUsageLimit) {
        return res.status(400).json({
          success: false,
          message: `You have already used this coupon (Limit: ${coupon.userUsageLimit} time${coupon.userUsageLimit > 1 ? "s" : ""})`,
        });
      }
    }

    // Calculate discount amount
    let calculatedDiscount = 0;
    if (coupon.discountType === "percentage") {
      calculatedDiscount = (subtotal * coupon.discountAmount) / 100;
      if (coupon.maxDiscountAmount > 0 && calculatedDiscount > coupon.maxDiscountAmount) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      // Flat discount
      calculatedDiscount = Math.min(coupon.discountAmount, subtotal);
    }

    calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;

    res.status(200).json({
      success: true,
      message: `🎉 Coupon "${coupon.code}" applied! You saved ₹${calculatedDiscount}`,
      data: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        discountValueCalculated: calculatedDiscount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
    });
  }
};

module.exports = {
  getAvailableCoupons,
  applyCoupon,
};
