const express = require("express");
const { getSiteSettings } = require("../../controllers/common/site-settings-controller");

const router = express.Router();

router.get("/get", getSiteSettings);

module.exports = router;
