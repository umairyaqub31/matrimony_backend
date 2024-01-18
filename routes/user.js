const express = require("express");
const userAuthController = require("../controller/userAuthController");
const userMatchController = require("../controller/userMatchController");
const userNotificationController = require("../controller/userNotificationController");
// const ambulanceCrudController = require("../controller/Ambulance/ambulanceCrudController");
// const ambulanceDashController = require("../controller/Ambulance/ambulanceDashController");
// const ambulanceRequestController = require("../controller/Ambulance/ambulanceRequestController");
const VerificationController = require("../controller/verificationController");
const auth = require("../middlewares/auth");
// const uploadFileController = require("../controller/uploadFileController");
// const multer = require("multer");
const router = express.Router();
// const upload = multer({ dest: "temp/" });

//..............auth...............
router.post("/user/register", userAuthController.register);
router.post("/user/login", userAuthController.login);
// router.post("/user/uploadFile", upload.single("file"), uploadFileController.uploadFile);
// router.post("/user/completeSignup", userAuthController.completeSignup);
router.put("/user/completeProfile", userAuthController.completeProfile);
router.post("/user/logout", auth, userAuthController.logout);
// router.post("/user/refresh", auth, ambulanceAuthController.refresh);

//..............verification.........
router.post("/user/sendCodeToEmail", VerificationController.sendCodeToEmail);
router.post("/user/confirmEmail", VerificationController.confirmEmail);
// router.post("/ambulance/ResetLink", VerificationController.ResetLink);
// router.post("/ambulance/resetPassword", VerificationController.resetPassword);

//................match user....................
router.get("/user/userMatch", auth, userMatchController.userMatch);
router.post("/user/recentlyViewed", auth, userMatchController.recentlyViewed);
router.get("/user/getMatchRequests", auth, userMatchController.getMatchRequests);

//................notifications.............................//
router.get("/user/getNotifications", auth, userNotificationController.getNotifications);


//................................Interests..................................//

router.post("/user/sendInterest", auth, userMatchController.sendInterest);

module.exports = router;
