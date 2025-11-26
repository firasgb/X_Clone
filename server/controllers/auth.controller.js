const User = require("../models/user.model");
const validateSignupData = require("../formValidation/signup.validation");
const validateLoginData = require("../formValidation/login.validation");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateTokenAndSetCookie = require("../security/generateToken");

async function signup(req, res) {
  let { errors, isValid } = validateSignupData(req.body);
  const { firstName, lastName, gender, email, password, confirmPassword } =
    req.body;
  try {
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
    });
    await newUser.save();
    generateTokenAndSetCookie(newUser, res);
    return res.status(201).json({
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      gender: newUser.gender,
      profileImg: newUser.profileImg || null,
      coverImg: newUser.coverImg || null,
      followers: newUser.followers || [],
      following: newUser.following || [],
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  let { errors, isValid } = validateLoginData(req.body);
  const { email, password } = req.body;

  if (!isValid) {
    if (errors.password)
      return res.status(400).json({ error: errors.password });
    return res.status(400).json({ error: errors.email });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const matched = await bcrypt.compare(password, user.password || "");
    if (!matched) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    generateTokenAndSetCookie(user, res);
    return res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function logout(req, res) {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  signup,
  login,
  logout,
  getMe,
};
