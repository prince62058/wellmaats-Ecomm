const express = require("express");
const {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} = require("../../controllers/admin/coupon-controller");

const router = express.Router();

router.get("/get", getAllCoupons);
router.post("/add", createCoupon);
router.put("/update/:id", updateCoupon);
router.patch("/toggle/:id", toggleCouponStatus);
router.delete("/delete/:id", deleteCoupon);

module.exports = router;
