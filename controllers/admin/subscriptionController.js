const { findSubscriptionByName, createSubscription, deleteSubscription } = require("../../model/subscriptionModel");

//crerate subs
const createSubscriptionController = async (req, res) => {
    try {
        const { planName, paymentType, price, billingPeriod, trialPeriod, features } = req.body;

        // ✅ Validate required fields
        if (!planName || !paymentType || !price || !billingPeriod || !features) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 🔍 Check if the subscription already exists
        const existingPlan = await findSubscriptionByName(planName);
        if (existingPlan) {
            return res.status(400).json({ message: "Subscription plan already exists. Please choose a different name." });
        }

        // ✅ Structure trialPeriod properly
        const trialPeriodData = trialPeriod && typeof trialPeriod === "object" &&
            trialPeriod.hasOwnProperty("enabled") && trialPeriod.hasOwnProperty("days")
            ? trialPeriod
            : { enabled: false, days: 0 };

        // ✅ Prepare subscription data
        const subscriptionData = {
            planName,
            paymentType,  
            price,
            billingPeriod, 
            trialPeriod: trialPeriodData,
            features, 
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // ✅ Store in Firestore
        const subscriptionId = await createSubscription(subscriptionData);
        res.status(201).json({ message: "Subscription plan created successfully", id: subscriptionId });

    } catch (error) {
        res.status(500).json({ message: "Error creating subscription", error: error.message });
    }
};

//protected delete (super admin only)
const deleteSubscriptionController = async (req, res) => {
    try {
        const { id } = req.params;

        //Check if the subscription exists by ID - pwede ra ilisan by name (ikaw ug unsa prefer nimo par)
        const deleted = await deleteSubscription(id);
        if (!deleted) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.json({ message: "Subscription deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deleting subscription", error: error.message });
    }
};

module.exports = { createSubscriptionController, deleteSubscriptionController };
