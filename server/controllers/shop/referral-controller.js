const User     = require("../../models/User");
const Referral = require("../../models/Referral");
const Order    = require("../../models/Order");

/* ── Helper: generate unique referral code ──────────────────── */
function makeCode(userId) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seed  = String(userId).slice(-4);
  let code    = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return (seed + code).toUpperCase().slice(0, 8);
}

/* GET /api/shop/referral/info  — referral page data for logged-in user */
const getReferralInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId).select("referralCode walletBalance walletTransactions userName");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Ensure code exists
    if (!user.referralCode) {
      user.referralCode = makeCode(userId);
      await user.save();
    }

    const referrals = await Referral.find({ referrerId: userId })
      .populate("referredId", "userName createdAt")
      .sort({ createdAt: -1 });

    const pending  = referrals.filter(r => r.status === "pending").length;
    const rewarded = referrals.filter(r => r.status === "rewarded").length;
    const earned   = referrals.reduce((s, r) => s + (r.status === "rewarded" ? r.referrerReward : 0), 0);

    res.json({
      success: true,
      data: {
        referralCode:       user.referralCode,
        walletBalance:      user.walletBalance || 0,
        walletTransactions: (user.walletTransactions || []).slice(-20).reverse(),
        stats: { total: referrals.length, pending, rewarded, earned },
        referrals: referrals.map(r => ({
          id:         r._id,
          userName:   r.referredId?.userName || "User",
          joinedAt:   r.referredId?.createdAt,
          status:     r.status,
          reward:     r.referrerReward,
          rewardedAt: r.rewardedAt,
        })),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to fetch referral info" });
  }
};

/* GET /api/shop/referral/validate/:code  — check if referral code valid (public) */
const validateCode = async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findOne({ referralCode: code.toUpperCase() }).select("userName referralCode");
    if (!user) return res.json({ success: false, message: "Invalid referral code" });
    res.json({ success: true, data: { referralCode: user.referralCode, referrerName: user.userName } });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* POST /api/shop/referral/apply-wallet  — apply wallet credits at checkout */
const applyWallet = async (req, res) => {
  try {
    const userId    = req.user.id;
    const { amount } = req.body; // how many credits to apply
    const user      = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const available = user.walletBalance || 0;
    const apply     = Math.min(Number(amount) || 0, available);
    if (apply <= 0) return res.json({ success: false, message: "No wallet balance available" });

    res.json({ success: true, data: { applied: apply, remaining: available - apply } });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* GET /api/shop/referral/wallet  — wallet balance + recent transactions */
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance walletTransactions");
    res.json({
      success: true,
      data: {
        balance:      user?.walletBalance || 0,
        transactions: (user?.walletTransactions || []).slice(-30).reverse(),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* Internal: called from order controller after payment success */
const processReferralReward = async (userId, orderId) => {
  try {
    // Check if this user was referred
    const referral = await Referral.findOne({ referredId: userId, status: "pending" });
    if (!referral) return;

    // Check it's user's first paid order
    const paidOrders = await Order.countDocuments({ userId: String(userId), paymentStatus: "paid" });
    if (paidOrders !== 1) return; // only first order triggers reward

    const referrer = await User.findById(referral.referrerId);
    const referred = await User.findById(userId);
    if (!referrer || !referred) return;

    const now = new Date();

    // Credit referrer
    referrer.walletBalance  = (referrer.walletBalance  || 0) + referral.referrerReward;
    referrer.walletTransactions = [
      ...(referrer.walletTransactions || []),
      { type: "credit", amount: referral.referrerReward, note: `Referral reward — ${referred.userName} placed first order`, date: now },
    ];
    await referrer.save();

    // Credit referred user
    referred.walletBalance  = (referred.walletBalance  || 0) + referral.referredReward;
    referred.walletTransactions = [
      ...(referred.walletTransactions || []),
      { type: "credit", amount: referral.referredReward, note: "Welcome bonus — referred by friend", date: now },
    ];
    await referred.save();

    // Mark referral rewarded
    referral.status          = "rewarded";
    referral.referredOrderId = orderId;
    referral.rewardedAt      = now;
    await referral.save();

    console.log(`✅ Referral rewarded: ${referrer.userName} +₹${referral.referrerReward} | ${referred.userName} +₹${referral.referredReward}`);
  } catch (e) {
    console.error("Referral reward error:", e);
  }
};

module.exports = { getReferralInfo, validateCode, applyWallet, getWallet, processReferralReward };
