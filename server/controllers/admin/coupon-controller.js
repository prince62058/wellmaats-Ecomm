const Coupon = require("../../models/Coupon");

// Fetch all coupons for admin
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// Create a new coupon
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      userUsageLimit,
      isActive,
      showInCheckout,
    } = req.body;

    if (!code || !discountAmount) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and discount amount are required",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({ code: cleanCode });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: `Coupon with code "${cleanCode}" already exists`,
      });
    }

    const newCoupon = new Coupon({
      code: cleanCode,
      title: title || "",
      description: description || "",
      discountType: discountType || "percentage",
      discountAmount: Number(discountAmount),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: usageLimit !== "" && usageLimit != null ? Number(usageLimit) : null,
      userUsageLimit: userUsageLimit !== "" && userUsageLimit != null ? Number(userUsageLimit) : 1,
      isActive: isActive !== undefined ? (isActive === true || isActive === "true") : true,
      showInCheckout: showInCheckout !== undefined ? (showInCheckout === true || showInCheckout === "true") : true,
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

// Update an existing coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      description,
      discountType,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      userUsageLimit,
      isActive,
      showInCheckout,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== coupon.code) {
        const duplicate = await Coupon.findOne({ code: cleanCode, _id: { $ne: id } });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: `Coupon code "${cleanCode}" is already taken`,
          });
        }
        coupon.code = cleanCode;
      }
    }

    if (title !== undefined) coupon.title = title;
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountAmount !== undefined) coupon.discountAmount = Number(discountAmount);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount) || 0;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount) || 0;
    if (startDate !== undefined) coupon.startDate = startDate ? new Date(startDate) : new Date();
    if (endDate !== undefined) coupon.endDate = endDate ? new Date(endDate) : null;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit !== "" && usageLimit != null ? Number(usageLimit) : null;
    if (userUsageLimit !== undefined) coupon.userUsageLimit = userUsageLimit !== "" && userUsageLimit != null ? Number(userUsageLimit) : 1;
    if (isActive !== undefined) coupon.isActive = isActive === true || isActive === "true";
    if (showInCheckout !== undefined) coupon.showInCheckout = showInCheckout === true || showInCheckout === "true";

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update coupon",
    });
  }
};

// Toggle active status
const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon is now ${coupon.isActive ? "Active" : "Inactive"}`,
      data: coupon,
    });
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle status",
    });
  }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

module.exports = {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
};
