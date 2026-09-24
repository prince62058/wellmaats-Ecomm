const express = require("express");
const {
  getAvailableCoupons,
  applyCoupon,
} = require("../../controllers/shop/coupon-controller");

const router = express.Router();

router.get("/available", getAvailableCoupons);
router.post("/apply", applyCoupon);

module.exports = router;
