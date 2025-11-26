const express = require("express");
const protectRoute = require("../security/verifyToken");
const router = express.Router();
const {
  getUserProfile,
  followUnfollowUser,
  updateProfile,
  suggestedUsers,
} = require("../controllers/user.controller");

router.get("/profile/:id", protectRoute, getUserProfile);
router.get("/suggested/:id", protectRoute, suggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update/:id", protectRoute, updateProfile);

module.exports = router;
