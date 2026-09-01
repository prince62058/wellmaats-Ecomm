const Blog = require("../../models/Blog");

// GET all blogs (admin sees all including drafts)
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// CREATE blog
const createBlog = async (req, res) => {
  try {
    const { title, slug, excerpt, content, image, category, tags, author, readTime, isPublished } = req.body;
    const autoSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    const blog = new Blog({ title, slug: autoSlug, excerpt, content, image, category, tags, author, readTime, isPublished });
    await blog.save();
    res.json({ success: true, data: blog });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// UPDATE blog
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: blog });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE blog
const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getAllBlogs, createBlog, updateBlog, deleteBlog };
