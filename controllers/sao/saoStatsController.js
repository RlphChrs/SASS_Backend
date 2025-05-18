const { db } = require('../../config/firebaseConfig');

const getRegisteredUsersStats = async (req, res) => {
  const { schoolId } = req.user;

  console.log(`📌 SAO schoolId received: "${schoolId}"`);

  try {
    const stats = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };

    // Calculate the start of the current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(now.setDate(now.getDate() + mondayOffset));
    startOfWeek.setHours(0, 0, 0, 0);

    const snapshot = await db
      .collection('students')
      .where('schoolName', '==', schoolId)
      .get();

    console.log(`📊 Total students found for "${schoolId}": ${snapshot.size}`);

    snapshot.forEach(doc => {
      const data = doc.data();
      const { createdAt } = data;

      if (!createdAt) {
        console.warn(`⚠️ Missing 'createdAt' for student ID: ${doc.id}`);
        return;
      }

      let date;
      try {
        date = createdAt.toDate();
      } catch (err) {
        console.warn(`❌ Error converting 'createdAt' for student ${doc.id}:`, err);
        return;
      }

      // Filter out students not registered this week
      if (date < startOfWeek) {
        console.log(`⏩ Skipping student ${doc.id}, registered on ${date.toLocaleDateString()} (before start of week)`);
        return;
      }

      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      console.log(`🗓️ Student "${doc.id}" registered on: ${date} → ${day}`);

      if (stats[day] !== undefined) {
        stats[day]++;
      } else {
        console.warn(`⚠️ Unexpected weekday key: ${day}`);
      }
    });

    console.log('✅ Final computed stats:', stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error fetching registered users:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
};

module.exports = { getRegisteredUsersStats };
