const express = require("express");
const userAuthController = require("../controller/userAuthController");
// const ambulanceCrudController = require("../controller/Ambulance/ambulanceCrudController");
// const ambulanceDashController = require("../controller/Ambulance/ambulanceDashController");
// const ambulanceRequestController = require("../controller/Ambulance/ambulanceRequestController");
const VerificationController = require("../controller/verificationController");
const auth = require('../middlewares/auth');
// const uploadFileController = require("../controller/uploadFileController");
// const multer = require("multer");
const router = express.Router();
// const upload = multer({ dest: "temp/" });


//..............auth...............
router.post("/user/register", userAuthController.register);
router.post("/user/login", userAuthController.login);
// router.post("/user/uploadFile", upload.single("file"), uploadFileController.uploadFile);
// router.post("/user/completeSignup", userAuthController.completeSignup);
// router.put("/user/updateProfile", auth, userAuthController.updateProfile);
router.post("/user/logout", auth, userAuthController.logout);
// router.post("/user/refresh", auth, ambulanceAuthController.refresh);

//..............verification.........
router.post("/user/sendCodeToEmail", VerificationController.sendCodeToEmail);
router.post("/user/confirmEmail", VerificationController.confirmEmail);
// router.post("/ambulance/ResetLink", VerificationController.ResetLink);
// router.post("/ambulance/resetPassword", VerificationController.resetPassword);

module.exports = router;
