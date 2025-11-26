const validator = require("validator");
const isEmpty = require("./isEmpty");

const validateLogin = function (data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is not valid";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "password is required";
  } else if (/^\s|\s$/.test(data.password)) {
    errors.password = "Invalid email or password";
  }else if (!validator.isLength(data.password, { min: 6 })) {
    errors.password = "Password must be at least 6 characters long"; 
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateLogin;
