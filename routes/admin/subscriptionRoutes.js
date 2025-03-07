const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { createSubscriptionController, deleteSubscriptionController } = require("../../controllers/admin/subscriptionController");

// adminRoutes already includes (/subscription) ayg katinga kung puro rana linya naa dira hahahahaha
router.post("/", authenticate, authorize(["Super Admin"]), createSubscriptionController);
router.delete("/:id", authenticate, authorize(["Super Admin"]), deleteSubscriptionController);

module.exports = router;
