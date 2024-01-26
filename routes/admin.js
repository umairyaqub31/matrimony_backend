const express = require("express");
const router = express.Router();
const adminDashController = require("../controller/dashboardController");

//..............dashboard...............
router.get("/admin/getAllUsers", adminDashController.getAllUsers);


module.exports = router;
