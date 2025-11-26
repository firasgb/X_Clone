const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (user,res) => {
  // creation de token
  const token = jwt.sign(
    {
      _id: user._id,
      Firstname: user.Firstname,
      Lastname: user.Lastname,
      Email: user.Email,
      Role: user.Role
    },
    process.env.PRIVATE_KEY,
    { expiresIn: "1h" }
  );
  // set le token dans le cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "strict",
  });
};
module.exports = generateTokenAndSetCookie;
