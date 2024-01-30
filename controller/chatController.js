const express = require("express");
const app = express();

const Notification = require("../models/notification.js");

const chatController = {
  //.......................................userMatch..................................//

  async createChatRoom(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
      const notificationsPerPage = 10;
      const receiverId = req.user._id;
      const totalNotifications = await Notification.find({ receiverId });
      const totalPages = Math.ceil(totalNotifications / notificationsPerPage); // Calculate the total number of pages

      const skip = (page - 1) * notificationsPerPage; // Calculate the number of posts to skip based on the current page

      const notifications = await Notification.find({ receiverId })
        .skip(skip)
        .limit(notificationsPerPage)
        .populate("senderId");
      let previousPage = page > 1 ? page - 1 : null;
      let nextPage = page < totalPages ? page + 1 : null;
      return res.status(200).json({
        notifications: notifications,
        auth: true,
        previousPage: previousPage,
        nextPage: nextPage,
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = chatController;
