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

    // 🔍 Enhanced logging for visibility
    console.log("📨 Preparing to send push notification...");
    console.log("🎯 FCM Token:", fcmToken);
    console.log("📝 Title:", title);
    console.log("📝 Body:", body);
    if (data && Object.keys(data).length > 0) {
      console.log("📦 Data Payload:", data);
    }

    const response = await admin.messaging().send(message);
    console.log("✅ Push notification sent successfully:", response);

    return response;
  } catch (error) {
    console.error("❌ Error sending push notification:", error.message);
    throw error;
  }
};

module.exports = sendPushNotification;
