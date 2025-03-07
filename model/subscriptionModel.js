const { db } = require("../config/firebaseConfig");
const subscriptionsRef = db.collection("subscriptions");

//check by name
const findSubscriptionByName = async (planName) => {
    const snapshot = await subscriptionsRef.where("planName", "==", planName).get();
    return snapshot.empty ? null : snapshot.docs[0];
};

//create subscription
const createSubscription = async (subscriptionData) => {
    const docRef = await subscriptionsRef.add(subscriptionData);
    return docRef.id;
};

//delet by ID
const deleteSubscription = async (id) => {
    const docRef = subscriptionsRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.delete();
    return true;
};

module.exports = {findSubscriptionByName, createSubscription, deleteSubscription};
