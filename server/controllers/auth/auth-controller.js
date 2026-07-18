const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, userName: user.userName, phone: user.phone || "" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function userPayload(user) {
  return { id: user._id, email: user.email, role: user.role, userName: user.userName, phone: user.phone || "", avatar: user.avatar || "", createdAt: user.createdAt };
}

// ── Register ──────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { userName, email, password, phone } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.json({ success: false, message: "Email already registered. Please login." });

    if (phone && await User.findOne({ phone, phone: { $ne: "" } }))
      return res.json({ success: false, message: "Phone number already registered." });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ userName, email, password: hashPassword, phone: phone || "" });
    await newUser.save();
    res.status(200).json({ success: true, message: "Registration successful! Please login." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

// ── Login (email OR phone) ────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;   // `email` field may contain email or phone
  try {
    const isPhone = /^[0-9+]/.test(email?.trim() || "");
    const checkUser = isPhone
      ? await User.findOne({ phone: email.trim() })
      : await User.findOne({ email: email.trim() });

    if (!checkUser)
      return res.json({ success: false, message: isPhone ? "No account found with this phone number." : "No account found with this email." });

    const passwordMatch = await bcrypt.compare(password, checkUser.password);
    if (!passwordMatch)
      return res.json({ success: false, message: "Incorrect password. Please try again." });

    const token = signToken(checkUser);
    res.cookie("token", token, cookieOptions).json({
      success: true,
      message: "Logged in successfully",
      user: userPayload(checkUser),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// ── Logout ────────────────────────────────────────────────
const logoutUser = (req, res) => {
  res.clearCookie("token", cookieOptions).json({ success: true, message: "Logged out successfully!" });
};

// ── Update Profile ────────────────────────────────────────
const updateProfile = async (req, res) => {
  const { userName, phone, avatar, currentPassword, newPassword } = req.body;
  const userId = req.user?.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Change password if requested
    if (newPassword) {
      if (!currentPassword) return res.json({ success: false, message: "Current password is required to change password." });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.json({ success: false, message: "Current password is incorrect." });
      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (userName) user.userName = userName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    // Re-issue token with updated info
    const token = signToken(user);
    res.cookie("token", token, cookieOptions).json({
      success: true,
      message: "Profile updated successfully!",
      user: userPayload(user),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Update failed. Please try again." });
  }
};

// ── Auth Middleware ───────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorised user!" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Unauthorised user!" });
  }
};

// ── Check Auth ────────────────────────────────────────────
const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found." });
    res.json({ success: true, user: userPayload(user) });
  } catch {
    res.status(500).json({ success: false, message: "Auth check failed." });
  }
};

module.exports = { registerUser, loginUser, logoutUser, updateProfile, authMiddleware, checkAuth };
