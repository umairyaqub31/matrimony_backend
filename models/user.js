const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
    },
    DOB: {
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
    partnerPreference: {
        age: Number,
        maritalStatus: String,
        height: Number,
        education: String,
        partnerOccupation: String,
        motherTongue: String,
        partnerAnnualIncome: Number,
        sect: String,
        city: String,
      },
  },
  {
    timestamps: true
  }
);

const user = mongoose.model(
  "user",
  userSchema,
  "users"
);

module.exports = user;
