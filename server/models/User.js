const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, default: "", sparse: true },
  password: { type: String, required: true },
  role:     { type: String, default: "user" },
  avatar:   { type: String, default: "" },     // optional profile image URL
  createdAt:{ type: Date,   default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
