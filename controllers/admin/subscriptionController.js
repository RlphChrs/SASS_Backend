const { findSubscriptionByName, createSubscription, deleteSubscription, getAllPlans, searchSubscriptions } = require("../../model/subscriptionModel");

// get subs
const getSubscriptions = async (_, res) => {
    try {
        const plans = await getAllPlans()
       
        return res.status(200).json({ success: true, plans })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Error fetching subscriptions', error: e.message})
    }
}

// search sub by name
const querySubscriptions = async (req, res) => {
    try {
        const plans = await searchSubscriptions(req.params.name)
        return res.status(200).json({ success: true, plans })
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Error finding plans hehe', error: e.message })
    }
}

//crerate subs
const createSubscriptionController = async (req, res) => {
    try {
        const { name: planName, billingType: paymentType, price, currency, billingPeriod, trialPeriod, features, description } = req.body;

        console.log('currency is: ', currency)

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
            currency,
            billingPeriod,
            description, 
            trialPeriod: trialPeriodData,
            features,
            keywords: planName.toLowerCase().split(' ') , 
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

module.exports = { createSubscriptionController, deleteSubscriptionController, getSubscriptions, querySubscriptions };
