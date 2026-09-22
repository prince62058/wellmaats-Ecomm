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

const getTransactionStats = async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const now = new Date();
    let startDate;

    if (period === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // last 3 months
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await Order.find({
      orderDate: { $gte: startDate },
    }).lean();

    // Group by date string YYYY-MM-DD
    const byDate = {};
    for (const order of orders) {
      const d = new Date(order.orderDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!byDate[key]) byDate[key] = { date: key, revenue: 0, orders: 0, paid: 0 };
      byDate[key].orders += 1;
      byDate[key].revenue += order.totalAmount || 0;
      if (order.paymentStatus === "paid") byDate[key].paid += 1;
    }

    // Fill in missing days in range
    const dateList = [];
    const cursor = new Date(startDate);
    while (cursor <= now) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      dateList.push(byDate[key] || { date: key, revenue: 0, orders: 0, paid: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Summary totals
    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Status breakdown
    const statusBreakdown = {};
    for (const order of orders) {
      const s = order.orderStatus || "pending";
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
    }

    res.status(200).json({
      success: true,
      data: {
        timeline: dateList,
        summary: { totalRevenue, totalOrders, paidOrders, avgOrderValue },
        statusBreakdown,
        period,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  getTransactionStats,
};
