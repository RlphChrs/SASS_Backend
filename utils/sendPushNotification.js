const { admin } = require('../config/firebaseConfig');

const sendPushNotification = async (fcmToken, { title, body, data }) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: title, 
        body: body    
      },
      data: data || {}
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Push notification sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    throw error;
  }
};

module.exports = sendPushNotification;
