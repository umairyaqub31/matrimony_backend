const mongoose = require("mongoose");

const { Schema } = mongoose;

const verificationCodeSchema = new Schema(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60, // Expires the document after 120 seconds (2 minutes)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "VerificationCode",
  verificationCodeSchema,
  "verificationCodes"
);
