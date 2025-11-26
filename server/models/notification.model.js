const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type !== "create" ? true : false; // always Required but not in "create"
      },
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "create"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    commentText:{
      type: String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
