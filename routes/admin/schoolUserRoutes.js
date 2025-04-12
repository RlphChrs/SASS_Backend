const express = require("express");
const router = express.Router();

const { getAllSchools, getSAOAdminsBySchool, getStudentsBySchool } = require("../../controllers/admin/schoolUserController");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

router.get("/schools", authenticate, authorize(["superadmin"]), getAllSchools);
router.get("/schools/:schoolId/admins", authenticate, authorize(["superadmin"]), getSAOAdminsBySchool);
router.get("/schools/:schoolId/students", authenticate, authorize(["superadmin"]), getStudentsBySchool);

module.exports = router;
