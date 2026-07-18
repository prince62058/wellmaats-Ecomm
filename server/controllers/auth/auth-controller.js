const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const cookieOptions = { httpOnly: true, secure: true, sameSite: "none" };
const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

// ── In-memory OTP store: key → { otp, expires, userId? } ──
const otpStore = new Map();

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
function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Register ──────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { userName, email, password, phone } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.json({ success: false, message: "Email already registered. Please login." });
    if (phone && phone.trim() && await User.findOne({ phone: phone.trim() }))
      return res.json({ success: false, message: "Phone number already registered." });

    // password optional if using OTP-only flow (we store a random hash)
    const hash = password
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash(Math.random().toString(36), 12);

    const newUser = new User({ userName, email, password: hash, phone: phone || "" });
    await newUser.save();
    res.status(200).json({ success: true, message: "Account created successfully! Please login." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

// ── Send OTP ──────────────────────────────────────────────
const sendOTP = async (req, res) => {
  const { identifier } = req.body; // email or phone
  if (!identifier) return res.status(400).json({ success: false, message: "Email or phone is required." });

  try {
    const isPhone = /^[0-9+]/.test(identifier.trim());
    const user = isPhone
      ? await User.findOne({ phone: identifier.trim() })
      : await User.findOne({ email: identifier.trim().toLowerCase() });

    // We send OTP regardless (for registration flow we allow unknown identifiers too)
    const otp = genOTP();
    const key = identifier.trim().toLowerCase();
    otpStore.set(key, { otp, expires: Date.now() + 5 * 60 * 1000, userId: user?._id });

    // ── In production: send via SMS (Twilio/MSG91) or email (Nodemailer/SendGrid) ──
    // For now: log to console so admin/dev can see it
    console.log(`\n🔐 OTP for ${key}: ${otp} (valid 5 min)\n`);

    res.json({
      success: true,
      message: `OTP sent to ${isPhone ? "your phone" : "your email"}.`,
      accountExists: !!user,
      // Return OTP only in development so demo works without SMS setup
      ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to send OTP. Try again." });
  }
};

// ── Verify OTP & Login ────────────────────────────────────
const verifyOTP = async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp)
    return res.status(400).json({ success: false, message: "Identifier and OTP are required." });

  const key = identifier.trim().toLowerCase();
  const record = otpStore.get(key);

  if (!record) return res.json({ success: false, message: "OTP not found or expired. Please request a new one." });
  if (Date.now() > record.expires) {
    otpStore.delete(key);
    return res.json({ success: false, message: "OTP has expired. Please request a new one." });
  }
  if (record.otp !== otp.trim()) return res.json({ success: false, message: "Incorrect OTP. Please try again." });

  otpStore.delete(key); // one-time use

  try {
    const isPhone = /^[0-9+]/.test(identifier.trim());
    const user = isPhone
      ? await User.findOne({ phone: identifier.trim() })
      : await User.findOne({ email: identifier.trim().toLowerCase() });

    if (!user) return res.json({ success: false, message: "Account not found. Please register first." });

    const token = signToken(user);
    res.cookie("token", token, cookieOptions).json({
      success: true,
      message: "Logged in successfully!",
      user: userPayload(user),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Login failed. Try again." });
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

    if (newPassword) {
      if (!currentPassword) return res.json({ success: false, message: "Current password is required." });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.json({ success: false, message: "Current password is incorrect." });
      user.password = await bcrypt.hash(newPassword, 12);
    }
    if (userName) user.userName = userName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    const token = signToken(user);
    res.cookie("token", token, cookieOptions).json({
      success: true,
      message: "Profile updated successfully!",
      user: userPayload(user),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Update failed. Try again." });
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

// ── Email + Password Login ────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) return res.json({ success: false, message: "No account found with this email. Please register." });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Incorrect password. Please try again." });
    const token = signToken(user);
    res.cookie("token", token, cookieOptions).json({ success: true, message: "Logged in successfully!", user: userPayload(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Login failed. Try again." });
  }
};

module.exports = { registerUser, loginUser, sendOTP, verifyOTP, logoutUser, updateProfile, authMiddleware, checkAuth };
