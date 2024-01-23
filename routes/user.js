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

//..............verification.....................//
router.post("/user/sendCodeToEmail", VerificationController.sendCodeToEmail);
router.post("/user/confirmEmail", VerificationController.confirmEmail);
// router.post("/ambulance/ResetLink", VerificationController.ResetLink);
// router.post("/ambulance/resetPassword", VerificationController.resetPassword);

//....................recentlyViewed...................//
router.post("/user/recentlyViewed", auth, userMatchController.recentlyViewed);
router.get("/user/getRecentViewed", auth, userMatchController.getRecentViewed);


//................match user....................
router.get("/user/userMatch", auth, userMatchController.userMatch);
router.get("/user/getPendingRequests", auth, userMatchController.getPendingRequests);
router.post("/user/acceptRequest", auth, userMatchController.acceptRequest);
router.post("/user/rejectRequest", auth, userMatchController.rejectRequest);
router.get("/user/getAcceptedRequests", auth, userMatchController.getAcceptedRequests);
router.post("/user/getMyRequests", auth, userMatchController.getMyRequests);

//................notifications.............................//
router.get("/user/getNotifications", auth, userNotificationController.getNotifications);


//................................Interests..................................//

router.post("/user/sendInterest", auth, userMatchController.sendInterest);

module.exports = router;
