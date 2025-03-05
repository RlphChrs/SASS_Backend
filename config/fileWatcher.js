const admin = require("firebase-admin");
const axios = require("axios");
const { bucket } = require("./firebaseConfig"); 

// Watch for new file uploads in Firebase Storage
const watchFileUpload = async (filePath) => {
  console.log(`📂 New file uploaded: ${filePath}`);

  // Notify Python backend to process the file
  try {
    await axios.post("http://localhost:8000/process_file", {
      file_path: filePath,
    });
    console.log("✅ File processing request sent successfully!");
  } catch (error) {
    console.error("❌ Error sending file processing request:", error.message);
  }
};

module.exports = { watchFileUpload };
