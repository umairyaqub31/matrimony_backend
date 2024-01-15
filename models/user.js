const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    DOB: {
      type: String,
    },
    age: {
      type: Number,
    },
    height: {
      type: Number,
    },
    motherTongue: {
      type: String,
    },
    sect: {
      type: String,
    },
    city: {
      type: String,
    },
    highestDegree: {
      type: String,
    },
    occupation: {
      type: String,
    },
    employedIn: {
      type: String,
    },
    annualIncome: {
      type: Number,
    },
    workLocation: {
      type: String,
    },
    maritalStatus: {
      type: String,
    },
    recentlyViewed: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        default: []
      },
    ],
    userImages: [
      {
        type: String,
      },
    ],
    partnerPreference: {
      partnerAge: String,
      partnerMaritalStatus: String,
      partnerHeight: String,
      education: String,
      partnerOccupation: String,
      partnerMotherTongue: String,
      partnerAnnualIncome: String,
      partnerSect: String,
      partnerCity: String,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("user", userSchema, "users");

module.exports = user;
