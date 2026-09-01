const mongoose = require("mongoose");

const WalletTxSchema = new mongoose.Schema({
  type:   { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  note:   { type: String, default: "" },
  date:   { type: Date, default: Date.now },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  userName:           { type: String, required: true, unique: true },
  email:              { type: String, required: true, unique: true },
  phone:              { type: String, default: "", sparse: true },
  password:           { type: String, required: true },
  role:               { type: String, default: "user" },
  avatar:             { type: String, default: "" },
  createdAt:          { type: Date,   default: Date.now },

  // Referral
  referralCode:       { type: String, unique: true, sparse: true },
  referredBy:         { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Wallet
  walletBalance:      { type: Number, default: 0 },
  walletTransactions: [WalletTxSchema],
});

module.exports = mongoose.model("User", UserSchema);
