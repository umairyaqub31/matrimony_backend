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
      type: String,
    },
    height: {
      type: String,
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
      type: String,
    },
    workLocation: {
      type: String,
    },
    maritalStatus: {
      type: String,
    },
    userImages: [
      {
        type: String,
      },
    ],
    partnerPreference: {
      partnerAge: Number,
      partnerMaritalStatus: String,
      partnerHeight: Number,
      education: String,
      partnerOccupation: String,
      partnerMotherTongue: String,
      partnerAnnualIncome: Number,
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
