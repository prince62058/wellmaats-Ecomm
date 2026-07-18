const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({
  referrerId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  referredId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status:       { type: String, enum: ["pending", "rewarded"], default: "pending" },
  referredOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  referrerReward:  { type: Number, default: 100 },   // ₹ credited to referrer
  referredReward:  { type: Number, default: 50  },   // ₹ credited to referred user
  createdAt:    { type: Date, default: Date.now },
  rewardedAt:   { type: Date, default: null },
});

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referredId: 1, status: 1 });

module.exports = mongoose.model("Referral", ReferralSchema);
