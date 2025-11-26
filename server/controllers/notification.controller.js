const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("following");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Following List:", user.following);

    const notifications = await Notification.find({
      $or: [
        { sender: { $in: user.following, $ne: null } },
        { recipient: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName profileImg gender")
      .populate("recipient", "firstName lastName profileImg gender");

    await Notification.updateMany(
      {
        $or: [
          { sender: { $in: user.following, $ne: null } },
          { recipient: userId },
        ],
      },
      { read: true }
    );

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "sender",
        select: "firstName lastName profileImg gender",
      });
    await Notification.updateMany({ recipient: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await Notification.deleteMany({ recipient: userId });
    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOnlyNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unreadNotif = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getNotifications,
  deleteNotifications,
  deleteOnlyNotification,
  getMyNotifications,
  unreadNotif,
};
