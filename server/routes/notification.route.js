const express = require("express");
const protectRoute = require("../security/verifyToken");

const {
  getNotifications,
  deleteNotifications,
  deleteOnlyNotification,
  getMyNotifications,
  unreadNotif,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get("/getNotifications", protectRoute, getNotifications);
router.get("/getMyNotifications", protectRoute, getMyNotifications);
router.delete("/deleteNotifications", protectRoute, deleteNotifications);
router.get("/unreadNotif", protectRoute,unreadNotif)
router.delete(
  "/deleteOnlyNotification/:id",
  protectRoute,
  deleteOnlyNotification
);




module.exports = router;
