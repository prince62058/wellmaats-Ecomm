const express = require("express");
const adminMiddleware = require("../../middleware/admin-middleware");
const {
  updateSiteSettings,
  resetSiteSettings,
} = require("../../controllers/admin/site-settings-controller");

const router = express.Router();

router.put("/update", adminMiddleware, updateSiteSettings);
router.post("/reset", adminMiddleware, resetSiteSettings);

module.exports = router;
