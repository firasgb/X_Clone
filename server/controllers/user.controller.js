const User = require("../models/user.model");
const notification = require("../models/notification.model");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const cloudinary = require("cloudinary").v2;

const getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user._id);
    const UserToFollow = await User.findById(id);

    if (id === req.user.id) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }
    if (!currentUser || !UserToFollow) {
      return res.status(404).json({ error: "User not found" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (!isFollowing) {
      //follow
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { following: id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        id,
        { $push: { followers: req.user._id } },
        { new: true }
      );
      const newNotification = new notification({
        type: "follow",
        sender: req.user._id,
        recipient: UserToFollow._id,
      });
      await newNotification.save();
      res.status(200).json({ message: "User followed successfully" });
    } else {
      //unfollow
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        id,
        { $pull: { followers: req.user._id } },
        { new: true }
      );
      res.status(200).json({ message: "User unfollowed successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const updateProfile = async (req, res) => {
  let {
    firstName,
    lastName,
    email,
    bio,
    newPassword,
    currentPassword,
    confirmPassword,
    links,
    situation,
    birthdate,
  } = req.body;
  const { id } = req.params;
  let { profileImg, coverImg } = req.body;

  try {
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (currentPassword && newPassword && confirmPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6 || confirmPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password should be at least 6 characters long" });
      }
      if (!validator.equals(newPassword, confirmPassword)) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      if (currentPassword || newPassword || confirmPassword) {
        res.status(400).json({ error: "passwords are required" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }
    if (profileImg) {
      if (user.profileImg) {
        const publicId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(profileImg);
      profileImg = result.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        const publicId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(coverImg);
      coverImg = result.secure_url;
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (links) user.links = links;
    if (situation) user.situation = situation;
    if (birthdate) user.birthdate = birthdate;
    if (profileImg) user.profileImg = profileImg;
    if (coverImg) user.coverImg = coverImg;

    user = await user.save(id, user, { new: true });

    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const suggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    // get the users followed by the current user
    let usersFollowedByMe = await User.findById(currentUserId).select(
      "following"
    );
    // get 10 users exclude the current user
    let users = await User.aggregate([
      { $match: { _id: { $ne: currentUserId } } },
      { $sample: { size: 10 } },
    ]);
    // exclude the user already followed by the current user
    let filtredUsers = await users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    // get 0 to 4 users from 10 
    let suggestedUsers = filtredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserProfile,
  followUnfollowUser,
  updateProfile,
  suggestedUsers,
};
