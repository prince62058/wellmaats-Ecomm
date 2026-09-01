const express  = require("express");
const router   = express.Router();
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { getReferralInfo, validateCode, applyWallet, getWallet } = require("../../controllers/shop/referral-controller");

router.get("/info",              authMiddleware, getReferralInfo);
router.get("/wallet",            authMiddleware, getWallet);
router.post("/apply-wallet",     authMiddleware, applyWallet);
router.get("/validate/:code",    validateCode);

module.exports = router;
