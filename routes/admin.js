const express = require("express");
const router = express.Router();
const adminDashController = require("../controller/dashboardController");

//..............dashboard...............
router.get("/admin/getAllUsers", adminDashController.getAllUsers);
router.get("/admin/dashDetails", adminDashController.dashDetails);


module.exports = router;
