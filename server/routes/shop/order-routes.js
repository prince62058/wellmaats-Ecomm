const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();
const { authMiddleware } = require("../../controllers/auth/auth-controller");

router.post("/create", authMiddleware, createOrder);
router.post("/capture", authMiddleware, capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

module.exports = router;
