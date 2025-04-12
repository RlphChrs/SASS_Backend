const { db } = require('../../config/firebaseConfig');

// 📁 controllers/sao/reportListController.js
const getAllReports = async (req, res) => {
    try {
      const schoolId = req.user.schoolId;
  
      const snapshot = await db
        .collection('reports')
        .where('schoolId', '==', schoolId)
        .orderBy('dateSubmitted', 'desc')
        .get();
  
      const reports = snapshot.docs.map(doc => {
        const data = doc.data();
  
        return {
          id: doc.id,
          ...data,
          dateSubmitted: data.dateSubmitted instanceof Object && 'seconds' in data.dateSubmitted
            ? data.dateSubmitted
            : null,
          status: data.status || 'Pending',
        };
      });
  
      return res.status(200).json({ reports });
    } catch (error) {
      console.error('Error fetching reports:', error.message);
      res.status(500).json({ message: 'Failed to fetch reports.' });
    }
  };
  

module.exports = { getAllReports };
