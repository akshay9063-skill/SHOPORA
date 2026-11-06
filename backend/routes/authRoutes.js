
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile
} = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");

// Customer registration
router.post("/register", register);

// Customer login
router.post("/login", login);

// Customer profile (requires login)
router.get("/profile", verifyToken, getProfile);

module.exports = router;
