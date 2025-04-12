const { db } = require("../../config/firebaseConfig");

// Get all unique schools from SAO users
const getAllSchools = async (req, res) => {
  try {
    const snapshot = await db.collection("users").where("role", "==", "School Admin").get();

    const schools = new Map();

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.schoolId) {
        schools.set(data.schoolId, {
          schoolId: data.schoolId,
          schoolName: data.schoolId 
        });
      }
    });

    const schoolList = Array.from(schools.values());
    return res.status(200).json({ schools: schoolList });
  } catch (error) {
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
    snapshot.forEach(doc => {
      admins.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ schoolId, admins });
  } catch (error) {
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
    snapshot.forEach(doc => {
      const data = doc.data();

      const studentSchoolId = data.schoolName ? data.schoolName.trim() : null;
      console.log(`🔍 Checking student ${doc.id}: schoolName="${studentSchoolId}"`);

      if (studentSchoolId === trimmedSchoolId) {
        console.log("✅ Matched:", doc.id);
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





module.exports = { getAllSchools, getSAOAdminsBySchool, getStudentsBySchool };
