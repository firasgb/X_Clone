const express = require("express");
const protectRoute = require("../security/verifyToken");
const {
  createPost,
  deletePost,
  commentPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  Postsfollowing,
  getUserPosts,
} = require("../controllers/post.controller");

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, Postsfollowing);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/userPost/:id", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.post("/comment/:id", protectRoute, commentPost);
router.post("/likeUnlike/:id", protectRoute, likeUnlikePost);

module.exports = router;
