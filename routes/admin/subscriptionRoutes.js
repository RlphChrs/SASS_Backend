const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { createSubscriptionController, deleteSubscriptionController, getSubscriptions, querySubscriptions } = require("../../controllers/admin/subscriptionController");

// adminRoutes already includes (/subscriptions) ayg katinga kung puro rana linya naa dira hahahahaha
router.get('/', getSubscriptions)
router.post("/", authenticate, authorize(["superadmin"]), createSubscriptionController);
router.get('/search/:name', authenticate, authorize(['superadmin']), querySubscriptions);
router.delete("/:id", authenticate, authorize(["superadmin"]), deleteSubscriptionController);


module.exports = router;
