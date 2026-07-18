const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  authMiddleware,
  checkAuth,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update-profile", authMiddleware, updateProfile);
router.get("/check-auth", authMiddleware, checkAuth);

module.exports = router;
