const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  authMiddleware,
  checkAuth,
} = require("../../controllers/auth/auth-controller");
const { upload, imageUploadUtil } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update-profile", authMiddleware, updateProfile);
router.get("/check-auth", authMiddleware, checkAuth);

// Upload avatar image → Cloudinary
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const b64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await imageUploadUtil(b64);
    res.json({ success: true, url: result.secure_url });
  } catch (e) {
    console.error("Avatar upload error:", e);
    res.status(500).json({ success: false, message: "Upload failed. Please try again." });
  }
});

module.exports = router;
