const express = require("express");
const app = express();
const User = require("../models/user")

const dashboardController = {
  async dashDetails(req, res) {
    // const doctorId = req.user._id;
      const doctor = await User.findById(doctorId);
      const doctorName = doctor.name;
      const doctorImage = doctor.doctorImage;
      const upcomingAppointment = await Appointment.findOne({ doctorId })
        .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
        .limit(1);
        
        let patientName;
        if (upcomingAppointment) {
          const patientId = upcomingAppointment.patientId;
          const patient = await User.findById(patientId);
          patientName = patient.userName;
        } else {
          patientName = null;
        }

      const currentDate = new Date();
      // Set the time to the beginning of the day
      currentDate.setHours(0, 0, 0, 0);

      // Calculate yesterday's date
      const yesterdayDate = new Date(currentDate);
      yesterdayDate.setDate(currentDate.getDate() - 1);

      // Set the time to the beginning of yesterday
      yesterdayDate.setHours(0, 0, 0, 0);

      const dayBeforeYesterday = new Date(currentDate);
      dayBeforeYesterday.setDate(currentDate.getDate() - 2);

      // Set the time to the beginning of the day before yesterday
      dayBeforeYesterday.setHours(0, 0, 0, 0);

      const weekStartDate = new Date(currentDate);
      weekStartDate.setDate(currentDate.getDate() - 7);

      // Set the time to the beginning of the week
      weekStartDate.setHours(0, 0, 0, 0);

      const lastWeekStartDate = new Date(currentDate);
      lastWeekStartDate.setDate(currentDate.getDate() - 14);

      // Set the time to the beginning of the week
      lastWeekStartDate.setHours(0, 0, 0, 0);

      const duration = req.query.duration;
      if (!duration) {
        const error = {
          status: 400,
          message: "Duration Period Missing",
        };

        return next(error);
      }

      if (duration == "today") {
        const todayPatientCount = await Appointment.find({
          createdAt: { $gte: currentDate, $lt: new Date() },
          doctorId,
        })
          .distinct("patientId")
          .then((patientIds) => patientIds.length);

        const yesPatientCount = await Appointment.find({
          createdAt: { $gte: yesterdayDate, $lt: currentDate },
          doctorId,
        })
          .distinct("patientId")
          .then((patientIds) => patientIds.length);

        let patientPercentageChange;
        if (yesPatientCount === 0) {
          patientPercentageChange = todayPatientCount * 100; // If last week's orders are zero, the change is undefined
        } else {
          patientPercentageChange = (
            ((todayPatientCount - yesPatientCount) / yesPatientCount) *
            100
          ).toFixed(2);
        }

        if (patientPercentageChange > 0) {
          patientPercentageChange = "+" + patientPercentageChange + "%";
        } else {
          patientPercentageChange = patientPercentageChange + "%";
        }

        const todayAppointCount = await Appointment.countDocuments({
          createdAt: { $gte: currentDate, $lt: new Date() },
          doctorId,
        });

        const yesAppointCount = await Appointment.countDocuments({
          createdAt: { $gte: yesterdayDate, $lt: currentDate },
          doctorId,
        });

        let appointmentPercentageChange;
        if (yesAppointCount === 0) {
          appointmentPercentageChange = todayAppointCount * 100; // If last week's orders are zero, the change is undefined
        } else {
          appointmentPercentageChange = (
            ((todayAppointCount - yesAppointCount) / yesAppointCount) *
            100
          ).toFixed(2);
        }

        if (appointmentPercentageChange > 0) {
          appointmentPercentageChange = "+" + appointmentPercentageChange + "%";
        } else {
          appointmentPercentageChange = appointmentPercentageChange + "%";
        }
        return res.json({
          doctorName: doctorName,
          upcomingAppointment: upcomingAppointment,
          todayPatientCount: todayPatientCount,
          patientPercentageChange: patientPercentageChange,
          todayAppointCount: todayAppointCount,
          appointmentPercentageChange: appointmentPercentageChange,
        });
      }
  },

  async getAllUsers(req,res,next){
    try {  
        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
        const usersPerPage = 10;
        const totalUsers = await User.countDocuments(); // Get the total number of posts for the user
        const totalPages = Math.ceil(totalUsers / usersPerPage); // Calculate the total number of pages
  
        const skip = (page - 1) * usersPerPage; // Calculate the number of posts to skip based on the current page
  
        const users = await User.find()
          .skip(skip)
          .limit(usersPerPage);
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
  }
};

module.exports = dashboardController;
