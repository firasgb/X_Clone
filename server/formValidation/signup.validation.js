const validator = require("validator");
const isEmpty = require("./isEmpty");

const validateUser = function (data) {
  let errors = {};

  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmpassword = !isEmpty(data.confirmpassword) ? data.confirmpassword : "";
  data.gender = !isEmpty(data.gender) ? data.gender : "";

  if (validator.isEmpty(data.firstName)) {
    errors.firstName = "firstName is required";
  } else if (/^\s|\s$/.test(data.firstName)) {
    errors.firstName = "firstName cannot start or end with spaces";
  }

  if (validator.isEmpty(data.lastName)) {
    errors.lastName = "lastName is required";
  } else if (/^\s|\s$/.test(data.lastName)) {
    errors.lastName = "lastName cannot start or end with spaces";
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "email is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "email is not valid";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "password is required";
  } else if (/^\s|\s$/.test(data.password)) {
    errors.password = "password cannot start or end with spaces";
  }

  if (validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password is required";
  } else if (/^\s|\s$/.test(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password cannot start or end with spaces";
  }

  if (!validator.equals(data.password, data.confirmPassword)) {
    errors.confirmassword = "passwords do not match";
  }

  if (validator.isEmpty(data.gender)) {
    errors.gender = "Gender is required";
  }

  if(!validator.isLength(data.password,{min:6})){
    errors.password = "Password must be at least 6 characters";
    }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateUser;
