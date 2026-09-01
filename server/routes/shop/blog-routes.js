const express = require("express");
const { getPublishedBlogs, getBlogBySlug } = require("../../controllers/shop/blog-controller");
const router = express.Router();

router.get("/", getPublishedBlogs);
router.get("/:slug", getBlogBySlug);

module.exports = router;
