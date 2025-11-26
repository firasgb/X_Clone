const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const decodedUserToken = jwt.verify(token, process.env.PRIVATE_KEY);
    if (!decodedUserToken) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    const user = await User.findById(decodedUserToken._id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    return res
      .status(500)
      .json({ error: "Server error: Internal server error" });
  }
};
module.exports = protectRoute;
