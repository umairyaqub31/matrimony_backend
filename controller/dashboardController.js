const express = require("express");
const app = express();
const User = require("../models/user");

const dashboardController = {
  async dashDetails(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const paidUsers = await User.countDocuments({ isPaid: true });
      const featuredUsers = await User.countDocuments({ isFeatured: true });

      const currentDate = new Date();
      // Set the time to the beginning of the day
      currentDate.setHours(0, 0, 0, 0);

      // Calculate 30 days before date
      const thirtyDaysBeforeDate = new Date(currentDate);
      thirtyDaysBeforeDate.setDate(currentDate.getDate() - 30);

      // Set the time to the beginning of the day
      thirtyDaysBeforeDate.setHours(0, 0, 0, 0);

      const lastThirtyDaysUserCount = await User.countDocuments({
        createdAt: { $gte: thirtyDaysBeforeDate },
      });

      const beforeThirtyDaysUserCount = await User.countDocuments({
        createdAt: { $lt: thirtyDaysBeforeDate },
      });

      const lastThirtyDaysActiveUserCount = await User.countDocuments({
        createdAt: { $gte: thirtyDaysBeforeDate },
        isActive: true,
      });

      const beforeThirtyDaysActiveUserCount = await User.countDocuments({
        createdAt: { $lt: thirtyDaysBeforeDate },
        isActive: true,
      });

      const lastThirtyDaysPaidUserCount = await User.countDocuments({
        createdAt: { $gte: thirtyDaysBeforeDate },
        isPaid: true,
      });

      const beforeThirtyDaysPaidUserCount = await User.countDocuments({
        createdAt: { $lt: thirtyDaysBeforeDate },
        isPaid: true,
      });

      const lastThirtyDaysFeaturedUserCount = await User.countDocuments({
        createdAt: { $gte: thirtyDaysBeforeDate },
        isPaid: true,
      });

      const beforeThirtyDaysFeaturedUserCount = await User.countDocuments({
        createdAt: { $lt: thirtyDaysBeforeDate },
        isPaid: true,
      });

      let userPercentageChange;
      if (beforeThirtyDaysUserCount === 0) {
        userPercentageChange = lastThirtyDaysUserCount * 100; // If last week's orders are zero, the change is undefined
      } else {
        userPercentageChange = (
          ((lastThirtyDaysUserCount - beforeThirtyDaysUserCount) /
            beforeThirtyDaysUserCount) *
          100
        ).toFixed(2);
      }

      if (userPercentageChange > 0) {
        userPercentageChange = "+" + userPercentageChange + "%";
      } else {
        userPercentageChange = userPercentageChange + "%";
      }

      let activeUserPercentageChange;
      if (beforeThirtyDaysActiveUserCount === 0) {
        activeUserPercentageChange = lastThirtyDaysActiveUserCount * 100; // If last week's orders are zero, the change is undefined
      } else {
        activeUserPercentageChange = (
          ((lastThirtyDaysActiveUserCount - beforeThirtyDaysActiveUserCount) /
            beforeThirtyDaysActiveUserCount) *
          100
        ).toFixed(2);
      }

      if (activeUserPercentageChange > 0) {
        activeUserPercentageChange = "+" + activeUserPercentageChange + "%";
      } else {
        activeUserPercentageChange = activeUserPercentageChange + "%";
      }

      let paidUserPercentageChange;
      if (beforeThirtyDaysPaidUserCount === 0) {
        paidUserPercentageChange = lastThirtyDaysPaidUserCount * 100; // If last week's orders are zero, the change is undefined
      } else {
        paidUserPercentageChange = (
          ((lastThirtyDaysPaidUserCount - beforeThirtyDaysPaidUserCount) /
            beforeThirtyDaysPaidUserCount) *
          100
        ).toFixed(2);
      }

      if (paidUserPercentageChange > 0) {
        paidUserPercentageChange = "+" + paidUserPercentageChange + "%";
      } else {
        paidUserPercentageChange = paidUserPercentageChange + "%";
      }

      let featuredUserPercentageChange;
      if (beforeThirtyDaysFeaturedUserCount === 0) {
        featuredUserPercentageChange = lastThirtyDaysFeaturedUserCount * 100; // If last week's orders are zero, the change is undefined
      } else {
        featuredUserPercentageChange = (
          ((lastThirtyDaysFeaturedUserCount -
            beforeThirtyDaysFeaturedUserCount) /
            beforeThirtyDaysFeaturedUserCount) *
          100
        ).toFixed(2);
      }

      if (featuredUserPercentageChange > 0) {
        featuredUserPercentageChange = "+" + featuredUserPercentageChange + "%";
      } else {
        featuredUserPercentageChange = featuredUserPercentageChange + "%";
      }

      return res.json({
        totalUsers: totalUsers,
        userPercentageChange: userPercentageChange,
        activeUsers: activeUsers,
        activeUserPercentageChange: activeUserPercentageChange,
        paidUsers: paidUsers,
        paidUserPercentageChange: paidUserPercentageChange,
        featuredUsers: featuredUsers,
        featuredUserPercentageChange: featuredUserPercentageChange,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
      const usersPerPage = 10;
      const totalUsers = await User.countDocuments(); // Get the total number of posts for the user
      const totalPages = Math.ceil(totalUsers / usersPerPage); // Calculate the total number of pages

      const skip = (page - 1) * usersPerPage; // Calculate the number of posts to skip based on the current page

      const users = await User.find().skip(skip).limit(usersPerPage);
      let previousPage = page > 1 ? page - 1 : null;
      let nextPage = page < totalPages ? page + 1 : null;
      return res.status(200).json({
        users: users,
        auth: true,
        previousPage: previousPage,
        nextPage: nextPage,
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = dashboardController;
