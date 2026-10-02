const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { getSellingPrice, isFlashSaleActive } = await import("../../../shared/pricing.mjs");
    const filters = {};
    for (const key of ["mainCategory", "category", "subCategory", "childCategory", "brand", "productType"]) {
      if (typeof req.query[key] === "string" && req.query[key]) filters[key] = { $in: req.query[key].split(",") };
    }
    if (req.query.availability === "in-stock") filters.totalStock = { $gt: 0 };
    if (req.query.rating === "4") filters.averageReview = { $gte: 4 };
    let products = await Product.find(filters).lean();
    if (req.query.flashSale === "true") products = products.filter(p => isFlashSaleActive(p));
    if (req.query.onSale === "true") products = products.filter(p => getSellingPrice(p) < p.price);
    const ranges = typeof req.query.priceRange === "string" ? req.query.priceRange.split(",") : [];
    if (ranges.length) products = products.filter(p => ranges.some(range => {
      const [min, max] = range.split("-");
      const price = getSellingPrice(p);
      return price >= Number(min) && (max === "plus" || price < Number(max));
    }));
    const sort = req.query.sortBy || "price-lowtohigh";
    products.sort((a, b) => sort.startsWith("title-")
      ? String(a.title).localeCompare(String(b.title)) * (sort === "title-ztoa" ? -1 : 1)
      : (getSellingPrice(a) - getSellingPrice(b)) * (sort === "price-hightolow" ? -1 : 1));

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
