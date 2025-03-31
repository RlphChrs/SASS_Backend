const admin = require('firebase-admin');
const { db } = require('../config/firebaseConfig');

const sendPushNotification = async (fcmToken, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
  } catch (error) {
    console.error('❌ Error sending FCM:', error.message);
  }
};

module.exports = { sendPushNotification };
