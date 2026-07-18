const Wishlist = require("../../models/Wishlist");

// GET user wishlist
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = { userId, products: [] };
    res.json({ success: true, data: wishlist });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// TOGGLE product in wishlist (add or remove)
const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = new Wishlist({ userId, products: [] });

    const idx = wishlist.products.indexOf(productId);
    let action;
    if (idx === -1) {
      wishlist.products.push(productId);
      action = "added";
    } else {
      wishlist.products.splice(idx, 1);
      action = "removed";
    }
    await wishlist.save();
    res.json({ success: true, action, data: wishlist });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getWishlist, toggleWishlist };
