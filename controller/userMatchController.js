const express = require("express");
const app = express();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const JWTService = require("../services/JWTService.js");
const RefreshToken = require("../models/token.js");
const AccessToken = require("../models/accessToken.js");

const userMatchController = {
  async userMatch(req, res, next) {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const userGender = user.gender;
    const gender = userGender === "male" ? "female" : "male";
    const matchType = req.query.matchType;
    const maritalStatus = user.partnerPreference.partnerMaritalStatus;
    const ageRange = user.partnerPreference.partnerAge.split("-");
    const minAge = parseInt(ageRange[0], 10);
    const maxAge = parseInt(ageRange[1], 10);
    const heightRange = user.partnerPreference.partnerHeight.split("-");
    const minheight = parseInt(heightRange[0], 10);
    const maxheight = parseInt(heightRange[1], 10);
    const education = user.partnerPreference.education;
    const occupation = user.partnerPreference.partnerOccupation;
    const motherTongue = user.partnerPreference.partnerMotherTongue;
    const incomeRange = user.partnerPreference.partnerAnnualIncome.split("-");
    const minIncome = parseInt(incomeRange[0], 10);
    const maxIncome = parseInt(incomeRange[1], 10);
    const sect = user.partnerPreference.partnerSect;
    const city = user.partnerPreference.partnerCity;
    let matchedUsers;
    if (matchType == "newUsers") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch users with the opposite gender and requests from the last 7 days
      matchedUsers = await User.find({
        gender: gender, // Opposite gender
        createdAt: { $gte: sevenDaysAgo }, // Requests from the last 7 days
      });
      //   console.log(matchedUsers)

      // Do something with the matchedUsers, like sending them as a response
      res.json({ matchedUsers });
    } else if (matchType == "match") {
      const partnerPreferenceCriteria = {
        age: { $gte: minAge, $lte: maxAge },
        gender: gender,
        maritalStatus: maritalStatus,
        $or: [
          { height: { $gte: minheight, $lte: maxheight } },
          { education: education },
          { occupation: occupation },
          { motherTongue: motherTongue },
          { annualIncome: { $gte: minIncome, $lte: maxIncome } },
          { sect: sect },
          { city: city },
          // Add more conditions as needed
        ],
      };

      const matchedUsers = await User.find(partnerPreferenceCriteria);

      //  matchedUsers = await User.find({
      //     gender,
      //     maritalStatus
      //   });
      res.json({ matchedUsers });
    }
  },

  async recentlyViewed(req, res, next) {
    const viewerId = req.user._id;
    const viewedUserId = req.query.userId; // Assuming the user ID is in the userId property

    try {
      // Find the viewer user in the database
      const viewerUser = await User.findById(viewerId);

      if (!viewerUser) {
        return res.status(404).json({ error: "Viewer user not found" });
      }
      // Check if viewedUserId is already in the most recent position
      console.log(viewerUser.recentlyViewed.length);
      console.log(viewerUser.recentlyViewed[0]);
      console.log(viewedUserId);
      if (
        viewerUser.recentlyViewed.length > 0 &&
        viewerUser.recentlyViewed[0] == viewedUserId // Convert ObjectId to string for comparison
      ) {
        return res.json({
          success: true,
          message: "User already in the most recent position",
        });
      }
      // Add viewedUserId to the most recent position
      viewerUser.recentlyViewed.unshift(viewedUserId);

      // Limit the array to a certain size (optional)
      const maxArraySize = 10; // You can adjust this based on your requirements
      viewerUser.recentlyViewed = viewerUser.recentlyViewed.slice(
        0,
        maxArraySize
      );

      // Save the updated user document
      await viewerUser.save();

      res.json({ success: true, message: "User added to recently viewed" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = userMatchController;
