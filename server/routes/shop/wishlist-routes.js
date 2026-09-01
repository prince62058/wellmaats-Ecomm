const express = require("express");
const { getWishlist, toggleWishlist } = require("../../controllers/shop/wishlist-controller");
const router = express.Router();

router.get("/:userId", getWishlist);
router.post("/toggle", toggleWishlist);

module.exports = router;
