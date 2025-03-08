const { db } = require("../config/firebaseConfig");
const subscriptionsRef = db.collection("subscriptions");


// get all plans
const getAllPlans = async () => {
    const querySnapshot = await  subscriptionsRef.get();
    console.log('snapchattt', querySnapshot)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

const searchSubscriptions = async (name) => {
    const snapshot = await subscriptionsRef.where("keywords", "array-contains", name.toLowerCase()).get();
    return snapshot.empty ? null : snapshot.docs.map(doc => ({ id: doc.id, ...doc.data ()}));
}

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

//delete by ID
const deleteSubscription = async (id) => {
    const docRef = subscriptionsRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.delete();
    return true;
};

module.exports = {findSubscriptionByName, createSubscription, deleteSubscription, getAllPlans, searchSubscriptions };
