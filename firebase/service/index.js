const { chatnotificationsCategories, getFcmTokenForChat } = require('./chatNotificationCategories')

async function sendchatNotification( userId, chatnotificationCategory, messageData, channelId, senderId){
    const {type, template,path} =  chatnotificationsCategories[chatnotificationCategory];
    let userToken = await getFcmTokenForChat(userId)

    const [chatTemplateData, userType] = await Promise.all([
        chatTemplatePlaceholder(type, template, messageData, senderId),
        getchatsUserType(userId)
    ]);

    let message = {
        token: userToken.toString(),
        notification: {
            title: chatTemplateData[0],
            body: chatTemplateData[1]
        }
    }

    try {
        const response = await firebase.messaging().send(message)
        info("firebase notification sent successfully!", response)
    } catch (err){
        error("error sending notification!", err)
    }
}


module.exports = {sendchatNotification}