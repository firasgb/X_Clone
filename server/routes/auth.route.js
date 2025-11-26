const express = require("express");
const { signup, login, logout, getMe } = require("../controllers/auth.controller");
const protectRoute = require("../security/verifyToken");

const router = express.Router();


router.get("/me",protectRoute,getMe)
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)

 

module.exports =  router; 