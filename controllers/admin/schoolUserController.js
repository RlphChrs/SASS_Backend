const { db } = require("../../config/firebaseConfig");

// Get all unique schools from SAO users
const getAllSchools = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", "School Admin")
      .orderBy("createdAt", "asc") // Ensure earliest admin first
      .get();

    const schoolsMap = new Map();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const schoolId = data.schoolId?.trim();

      if (!schoolId) continue;

      if (!schoolsMap.has(schoolId)) {
        // Count students from this school
        const studentSnap = await db
          .collection("students")
          .where("schoolName", "==", schoolId)
          .get();

        schoolsMap.set(schoolId, {
          schoolId,
          schoolName: schoolId,
          createdAt: data.createdAt,
          studentCount: studentSnap.size,
        });
      }
    }

    const schoolList = Array.from(schoolsMap.values());
    return res.status(200).json({ schools: schoolList });
  } catch (error) {
    console.error("❌ Failed to fetch schools:", error.message);
    return res.status(500).json({
      message: "Failed to fetch schools",
      error: error.message,
    });
  }
};

// Get SAO Admins by School ID
const getSAOAdminsBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", "School Admin")
      .where("schoolId", "==", schoolId)
      .get();

    const admins = [];
    snapshot.forEach((doc) => {
      admins.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ schoolId, admins });
  } catch (error) {
    console.error("❌ Failed to fetch SAO admins:", error.message);
    return res.status(500).json({
      message: "Failed to fetch SAO admins",
      error: error.message,
    });
  }
};

// Get Students by School ID
const getStudentsBySchool = async (req, res) => {
  const { schoolId } = req.params;
  const trimmedSchoolId = schoolId.trim();

  console.log("📥 Incoming request to fetch students for:", trimmedSchoolId);

  try {
    const snapshot = await db.collection("students").get();

    const students = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const studentSchoolId = data.schoolName ? data.schoolName.trim() : null;

      if (studentSchoolId === trimmedSchoolId) {
        students.push({ id: doc.id, ...data });
      }
    });

    console.log("📄 Matched students:", students.length);

    return res.status(200).json({ schoolId: trimmedSchoolId, students });
  } catch (error) {
    console.error("❌ Error fetching students:", error.message);
    return res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

module.exports = { getAllSchools, getSAOAdminsBySchool,  getStudentsBySchool};
