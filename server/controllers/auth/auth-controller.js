const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../../models/User");
const Referral = require("../../models/Referral");

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};
const JWT_SECRET    = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

// ── In-memory OTP store ────────────────────────────────────────
const otpStore = new Map();

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, userName: user.userName, phone: user.phone || "" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function userPayload(user) {
  return {
    id: user._id, email: user.email, role: user.role,
    userName: user.userName, phone: user.phone || "",
    avatar: user.avatar || "", createdAt: user.createdAt,
    walletBalance: user.walletBalance || 0,
    referralCode:  user.referralCode  || "",
  };
}
function genOTP()  { return "123456"; }

/* Generate unique 8-char referral code */
async function genReferralCode(userId) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const exists = await User.findOne({ referralCode: code });
    if (!exists) return code;
  }
  // Fallback: use userId tail
  return String(userId).slice(-8).toUpperCase();
}

// ── Register ──────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { userName, email, password, phone, referralCode } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.json({ success: false, message: "Email already registered. Please login." });
    if (phone && phone.trim() && await User.findOne({ phone: phone.trim() }))
      return res.json({ success: false, message: "Phone number already registered." });

    const hash = password
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash(Math.random().toString(36), 12);

    // Resolve referrer
    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
    }

    const newUser = new User({
      userName, email,
      password: hash,
      phone:    phone || "",
      referredBy: referredByUser?._id || null,
    });

    // Generate own referral code
    newUser.referralCode = await genReferralCode(newUser._id);
    await newUser.save();

    // Create pending referral record
    if (referredByUser) {
      await Referral.create({
        referrerId: referredByUser._id,
        referredId: newUser._id,
        status:     "pending",
      });
    }

    res.status(200).json({ success: true, message: "Account created successfully! Please login." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

// ── Send OTP ──────────────────────────────────────────────────
const sendOTP = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ success: false, message: "Email or phone is required." });

  try {
    const isPhone = /^[0-9+]/.test(identifier.trim());
    const user = isPhone
      ? await User.findOne({ phone: identifier.trim() })
      : await User.findOne({ email: identifier.trim().toLowerCase() });

    const otp = "123456";
    const key = identifier.trim().toLowerCase();
    otpStore.set(key, { otp, expires: Date.now() + 15 * 60 * 1000, userId: user?._id });

    console.log(`\n🔐 OTP for ${key}: ${otp} (fixed testing OTP: 123456)\n`);

    res.json({
      success: true,
      message: `OTP sent successfully. Use: 123456`,
      accountExists: true,
      devOtp: "123456",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to send OTP. Try again." });
  }
};

// ── Verify OTP & Login ────────────────────────────────────────
const verifyOTP = async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp)
    return res.status(400).json({ success: false, message: "Identifier and OTP are required." });

  const key = identifier.trim().toLowerCase();
  const record = otpStore.get(key);
  const inputOtp = String(otp).trim();

  // Accept static 123456 or matching record OTP
  const isMasterOtp = inputOtp === "123456";
  if (!isMasterOtp) {
    if (!record) return res.json({ success: false, message: "OTP not found or expired. Please request a new one." });
    if (Date.now() > record.expires) { otpStore.delete(key); return res.json({ success: false, message: "OTP has expired." }); }
    if (record.otp !== inputOtp) return res.json({ success: false, message: "Incorrect OTP. Please enter 123456" });
  }
  if (record) otpStore.delete(key);

  try {
    const isPhone = /^[0-9+]/.test(identifier.trim());
    let user = isPhone
      ? await User.findOne({ phone: identifier.trim() })
      : await User.findOne({ email: identifier.trim().toLowerCase() });

    // Auto-create user account if not yet registered
    if (!user) {
      const cleanPhone = identifier.trim().replace(/[^0-9]/g, "");
      const autoEmail = isPhone ? `${cleanPhone || Date.now()}@wellmaats.com` : identifier.trim().toLowerCase();
      const autoName = isPhone ? `User ${cleanPhone.slice(-4) || ""}`.trim() : identifier.trim().split("@")[0];
      const randomPass = await bcrypt.hash("User@" + Math.random().toString(36), 10);
      user = new User({
        userName: autoName || "Wellmaats User",
        email: autoEmail,
        phone: isPhone ? identifier.trim() : "",
        password: randomPass,
        role: "user",
      });
      user.referralCode = await genReferralCode(user._id);
      await user.save();
    }

    // Ensure referral code assigned
    if (!user.referralCode) {
      user.referralCode = await genReferralCode(user._id);
      await user.save();
    }

    const token = signToken(user);
    res.cookie("token", token, cookieOptions).json({
      success: true, message: "Logged in successfully!", user: userPayload(user),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Login failed. Try again." });
  }
};

// ── Logout ────────────────────────────────────────────────────
const logoutUser = (req, res) =>
  res.clearCookie("token", cookieOptions).json({ success: true, message: "Logged out successfully!" });

// ── Update Profile ────────────────────────────────────────────
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
    if (userName)          user.userName = userName;
    if (phone !== undefined) user.phone  = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    const token = signToken(user);
    res.cookie("token", token, cookieOptions).json({
      success: true, message: "Profile updated successfully!", user: userPayload(user),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Update failed. Try again." });
  }
};

// ── Auth Middleware ───────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Unauthorised user!" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ success: false, message: "Unauthorised user!" }); }
};

// ── Check Auth ────────────────────────────────────────────────
const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found." });
    res.json({ success: true, user: userPayload(user) });
  } catch {
    res.status(500).json({ success: false, message: "Auth check failed." });
  }
};

// ── Email + Password Login ────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) return res.json({ success: false, message: "No account found with this email. Please register." });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Incorrect password. Please try again." });

    if (!user.referralCode) {
      user.referralCode = await genReferralCode(user._id);
      await user.save();
    }

    const token = signToken(user);
    res.cookie("token", token, cookieOptions).json({ success: true, message: "Logged in successfully!", user: userPayload(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Login failed. Try again." });
  }
};

module.exports = { registerUser, loginUser, sendOTP, verifyOTP, logoutUser, updateProfile, authMiddleware, checkAuth };
