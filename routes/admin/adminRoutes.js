const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../../controllers/admin/adminController");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");

const subscriptionRoutes = require("./subscriptionRoutes");
const schoolUserRoutes = require("./schoolUserRoutes"); 

router.post("/login", loginAdmin);

router.get("/dashboard", authenticate, authorize(["superadmin"]), (req, res) => {
  res.send("Welcome to the Admin Dashboard.");
});

router.use("/subscriptions", subscriptionRoutes);
router.use("/school-users", schoolUserRoutes); 

module.exports = router;
