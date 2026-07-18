const Blog = require("../../models/Blog");

// GET published blogs (with optional category filter)
const getPublishedBlogs = async (req, res) => {
  try {
    const { category, limit = 12, page = 1 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(Number(limit)).select("-content"),
      Blog.countDocuments(filter),
    ]);
    res.json({ success: true, data: blogs, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET single blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: blog });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getPublishedBlogs, getBlogBySlug };
