const notification = require("../models/notification.model");
const Post = require("../models/post.model");
const User = require("../models/user.model");
const cloudinary = require("cloudinary").v2;

const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    if (!text && !img) {
      return res.status(400).json({ error: "Text or image is required" });
    }
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }
    const newPost = new Post({
      text,
      img,
      user: userId,
    });
    const savedPost = await newPost.save();
    const createNotification = new notification({
      sender: req.user._id,
      recipient: null,
      type: "create",
    });
    await createNotification.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const authUser = req.user._id.toString();

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (authUser !== post.user.toString()) {
      return res
        .status(401)
        .json({ error: "Unauthorized to delete this post" });
    }
    if (post.img) {
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id.toString();
    const idPost = req.params.id;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const post = await Post.findById(idPost);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const savedPost = await Post.findByIdAndUpdate(
      idPost,
      { $push: { comments: { text, user: userId } } },
      { new: true }
    );
    const commentNotification = new notification({
      sender: req.user._id,
      recipient: post.user,
      type: "comment",
      commentText: text,
    });
    await commentNotification.save();
    res.status(200).json(savedPost.comments);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const idPost = req.params.id;
    const userId = req.user._id.toString();
    const post = await Post.findById(idPost);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      //unlike post
      const postUnlike = await Post.findByIdAndUpdate(
        idPost,
        { $pull: { likes: userId } },
        { new: true }
      );
      const likedPost = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { likedPosts: idPost } },
        { new: true }
      );
      const updatedLikes = postUnlike.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      //Like post
      const postLike = await Post.findByIdAndUpdate(
        idPost,
        { $push: { likes: userId } },
        { new: true }
      );
      const likedPost = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { likedPosts: idPost } },
        { new: true }
      );

      const newNotification = new notification({
        sender: req.user._id,
        recipient: post.user,
        type: "like",
      });
      await newNotification.save();
      const updatedLikes = postLike.likes;
      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPostIds = user.likedPosts || [];
    
    if (likedPostIds.length === 0) {
      return res.status(200).json([]);
    }

    const likedPosts = await Post.find({ _id: { $in: likedPostIds } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

          res.status(200).json(likedPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const Postsfollowing = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User is not found" });
    }
    // const following = await Post.find(userId).select("following")
    const followingPosts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (followingPosts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(followingPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const userPosts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (userPosts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(userPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  deletePost,
  commentPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  Postsfollowing,
  getUserPosts,
};
