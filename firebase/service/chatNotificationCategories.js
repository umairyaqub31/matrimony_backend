const {
  TEXT_MESSAGE,
  QUATATION,
  IMAGES,
  DOCUMENTS,
} = require("../Notifications/chatNotificationTypes");

const chatnotificationsCategories = {
  [TEXT_MESSAGE]: {
    type: "%Name%",
    template: "%messagedata%",
    path: "/chatDetailScreen",
  },
  [IMAGES]: {
    type: "%Name%",
    template: "sent a Image!",
    path: "/chatDetailScreen",
  },
  [DOCUMENTS]: {
    type: "%Name%",
    template: "sent a document!",
    path: "/chatDetailScreen",
  },
  [QUATATION]: {
    type: "%Name%",
    template: "sent a quotation!",
    path: "/chatDetailScreen",
  },
};

async function getFcmTokenForChat(userId){
    try {
        const gettingDeviceToken = await userModel.findById({_id: userId})
        let deviceToken = gettingDeviceToken.firebaseToken
        if(deviceToken){
            return deviceToken
        } else {
            error("users device token does not exist")
        }
    } catch (err) {
        error("error retreiving FCM token:", err)
        throw err
    }
}

module.exports = { chatnotificationsCategories };
