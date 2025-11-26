const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    role: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN"],
    },
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    links: {
      type: String,
      default: "",
    },
    situation: {
      type: String,
      enum: ["Célibataire", "Mariée", "C'est compliqué", "Divorcée", "En couple", ""],
      default: null,
      required: false
    }
    ,
    birthdate: {
      type: Date,
      default: null,
    },
    blueBadge: {
      type: Boolean,
      default: false,
    }, 
    likedPosts:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: []
      }
    ]
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
