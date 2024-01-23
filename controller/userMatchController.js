const express = require("express");
const app = express();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const Notification = require("../models/notification.js");
const MatchRequest = require("../models/matchRequest.js");
const JWTService = require("../services/JWTService.js");
const RefreshToken = require("../models/token.js");
const AccessToken = require("../models/accessToken.js");
const { sendchatNotification } = require("../firebase/service/index.js");

const userMatchController = {
  //.......................................userMatch..................................//

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
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 15);

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
  //.......................................RecentlyViewed..................................//

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

  async getRecentViewed(req, res, next) {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "recentlyViewed",
      model: User,
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.json({ success: true, recentlyViewed: user.recentlyViewed });
  },

  //.......................................SendInterest..................................//

  async sendInterest(req, res, next) {
    const interestSchema = Joi.object({
      senderId: Joi.string().required(),
      receiverId: Joi.string().required(),
    });
    const { error } = interestSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { receiverId } = req.body;
    const senderId = req.user._id;
    let receiver;

    try {
      // match userId
      receiver = await User.findOne({ _id: receiverId });
      const matchRequest = new MatchRequest({
        senderId,
        receiverId,
      });
      await matchRequest.save();

      if (receiver == null) {
        const error = {
          status: 401,
          message: "Invalid receiverId",
        };
        return next(error);
      } else {
        let sender = await User.findOne({ _id: senderId });
        const notification = new Notification({
          senderId,
          receiverId,
          title: "Matrimonial",
          message: `${sender?.name} has sent you an interest`,
        });
        await notification.save();

        sendchatNotification(receiverId, {
          message: `${sender?.name} has sent you an interest`,
        });
      }
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({ message: "Interest sent successfully!" });

    // return res.status(200).json({ user: user, auth: true, token: accessToken });
  },

  /////..........................matchRequests..........................//

  async getPendingRequests(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
      const requestsPerPage = 10;
      const receiverId = req.user._id;
      const totalRequests = await MatchRequest.countDocuments({
        receiverId,
        status: "pending",
      });
      const totalPages = Math.ceil(totalRequests / requestsPerPage); // Calculate the total number of pages

      const skip = (page - 1) * requestsPerPage; // Calculate the number of posts to skip based on the current page

      const requests = await MatchRequest.find({
        receiverId,
        status: "pending",
      })
        .skip(skip)
        .limit(requestsPerPage)
        .populate("senderId");
      let previousPage = page > 1 ? page - 1 : null;
      let nextPage = page < totalPages ? page + 1 : null;
      return res.status(200).json({
        requests: requests,
        auth: true,
        previousPage: previousPage,
        nextPage: nextPage,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getMyRequests(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
      const requestsPerPage = 10;
      const senderId = req.user._id;
      const totalRequests = await MatchRequest.countDocuments({
        senderId,
        status: "pending",
      });
      const totalPages = Math.ceil(totalRequests / requestsPerPage); // Calculate the total number of pages

      const skip = (page - 1) * requestsPerPage; // Calculate the number of posts to skip based on the current page

      const requests = await MatchRequest.find({
        senderId,
        status: "pending",
      })
        .skip(skip)
        .limit(requestsPerPage)
        .populate("receiverId");
      let previousPage = page > 1 ? page - 1 : null;
      let nextPage = page < totalPages ? page + 1 : null;
      return res.status(200).json({
        requests: requests,
        auth: true,
        previousPage: previousPage,
        nextPage: nextPage,
      });
    } catch (error) {
      return next(error);
    }
  },

  async acceptRequest(req, res, next) {
    try {
      const requestId = req.query.requestId;
      const request = await MatchRequest.findById(requestId);
      const receiverId = req.user._id;
      if (!request) {
        const error = new Error("Request not found!");
        error.status = 404;
        return next(error);
      }
      request.status = "accept";
      await request.save();
      const requests = await MatchRequest.find({
        receiverId,
        status: "pending",
      });

      return res.status(200).json({
        auth: true,
        requests: requests,
      });
    } catch (error) {
      return next(error);
    }
  },

  async rejectRequest(req, res, next) {
    try {
      const requestId = req.query.requestId;
      const receiverId = req.user._id;
      const request = await MatchRequest.findById(requestId);
      if (!request) {
        const error = new Error("Request not found!");
        error.status = 404;
        return next(error);
      }
      request.status = "reject";
      await request.save();
      const requests = await MatchRequest.find({
        receiverId,
        status: "pending",
      });

      return res.status(200).json({
        auth: true,
        requests: requests,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getAcceptedRequests(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
      const requestsPerPage = 10;
      const receiverId = req.user._id;
      const totalRequests = await MatchRequest.countDocuments({
        receiverId,
        status: "accept",
      });
      const totalPages = Math.ceil(totalRequests / requestsPerPage); // Calculate the total number of pages

      const skip = (page - 1) * requestsPerPage; // Calculate the number of posts to skip based on the current page

      const requests = await MatchRequest.find({
        receiverId,
        status: "accept",
      })
        .skip(skip)
        .limit(requestsPerPage)
        .populate("senderId");
      let previousPage = page > 1 ? page - 1 : null;
      let nextPage = page < totalPages ? page + 1 : null;
      return res.status(200).json({
        requests: requests,
        auth: true,
        previousPage: previousPage,
        nextPage: nextPage,
      });
    } catch (error) {
      return next(error);
    }
  },

  // async getRejectedRequests(req, res, next) {
  //   try {
  //     const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
  //     const requestsPerPage = 10;
  //     const receiverId = req.user._id;
  //     const totalRequests = await MatchRequest.countDocuments({
  //       receiverId,
  //       status: "reject",
  //     });
  //     const totalPages = Math.ceil(totalRequests / requestsPerPage); // Calculate the total number of pages

  //     const skip = (page - 1) * requestsPerPage; // Calculate the number of posts to skip based on the current page

  //     const requests = await MatchRequest.find({
  //       receiverId,
  //       status: "reject",
  //     })
  //       .skip(skip)
  //       .limit(requestsPerPage)
  //       .populate("senderId");
  //     let previousPage = page > 1 ? page - 1 : null;
  //     let nextPage = page < totalPages ? page + 1 : null;
  //     return res.status(200).json({
  //       requests: requests,
  //       auth: true,
  //       previousPage: previousPage,
  //       nextPage: nextPage,
  //     });
  //   } catch (error) {
  //     return next(error);
  //   }
  // },
};

module.exports = userMatchController;
