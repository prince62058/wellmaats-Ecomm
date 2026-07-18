const Order = require("../../models/Order");
const User = require("../../models/User");
const Product = require("../../models/Product");

async function enrichOrder(orderDoc) {
  const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };

  const user = order.userId
    ? await User.findById(order.userId).select("userName email").lean()
    : null;

  const cartItems = await Promise.all(
    (order.cartItems || []).map(async (item) => {
      const row = { ...item };
      if (!row.image && row.productId) {
        const product = await Product.findById(row.productId).select("image title").lean();
        if (product) {
          row.image = product.image || "";
          if (!row.title) row.title = product.title;
        }
      }
      return row;
    })
  );

  return {
    ...order,
    cartItems,
    customerInfo: user
      ? { userName: user.userName, email: user.email }
      : null,
  };
}

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = {};

    if (status && status !== "all") {
      filters.orderStatus = status;
    }

    let orders = await Order.find(filters).sort({ orderDate: -1 });

    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          String(o._id).toLowerCase().includes(q) ||
          o.addressInfo?.phone?.includes(q) ||
          o.addressInfo?.city?.toLowerCase().includes(q)
      );
    }

    const enriched = await Promise.all(orders.map(enrichOrder));

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const enriched = await enrichOrder(order);

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus, orderUpdateDate: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const enriched = await enrichOrder(order);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
      data: enriched,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
