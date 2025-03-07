const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../../controllers/admin/adminController");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");

const subscriptionRoutes = require("../../routes/admin/subscriptionRoutes");

router.post("/login", loginAdmin);
router.get(
  "/dashboard",
  authenticate,
  authorize(["Super Admin"]),
  (req, res) => {
    res.send("Welcome to the Admin Dashboard.");
  }
);

router.use("/subscriptions", subscriptionRoutes);

module.exports = router;
