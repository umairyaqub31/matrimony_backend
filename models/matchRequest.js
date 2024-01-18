const mongoose = require("mongoose");

const { Schema } = mongoose;

const matchRequestSchema = Schema(
  {
    senderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accept", "reject"],
      default: "pending"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Match Request",
  matchRequestSchema,
  "match requests"
);
