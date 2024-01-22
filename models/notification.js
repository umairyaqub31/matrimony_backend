const mongoose = require("mongoose");

const { Schema } = mongoose;

const notificatioSchema = Schema(
  {
    senderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
    receiverId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 120,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Notification",
  notificatioSchema,
  "notifications"
);
