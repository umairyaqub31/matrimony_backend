const mongoose = require("mongoose");

const { Schema } = mongoose;

const notificatioSchema = Schema(
  {
    senderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User"
    },
    receiverId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User"
    },
    title: {
        type: String
    },
    message: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60, // Expires the document after 120 seconds (2 minutes)
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Notification",
  notificatioSchema,
  "notifications"
);
