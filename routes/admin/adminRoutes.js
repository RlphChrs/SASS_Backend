const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../../controllers/admin/adminController");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");

const subscriptionRoutes = require("../../routes/admin/subscriptionRoutes");

router.post("/login", loginAdmin);
router.get("/dashboard", authenticate, authorize(["Admin"]), (req, res) => {
  res.send("Welcome to the Admin Dashboard."); //pwede nani nimo tangtangon ug dli ka ganahan hahahahah
});

//Subcription Management Routes
router.use("/subscription", subscriptionRoutes);

module.exports = router; 
