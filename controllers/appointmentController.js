const { db } = require('../config/firebaseConfig');
const admin = require('firebase-admin');
const { sendPushNotification } = require('../utils/sendPushNotification');
const { getSAOToken } = require('../utils/getSaoToken');

// bookAppointment - for students
exports.bookAppointment = async (req, res) => {
  try {
    const studentId = req.user.uid;
    const studentName = `${req.user.firstName} ${req.user.lastName}`;
    const schoolId = req.user.schoolName;
    const { date, fromTime, toTime, description } = req.body;

    if (!date || !fromTime || !toTime || !description) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Flat collection
    const appointmentsRef = db.collection('appointments');

    // Check for overlapping time slot
    const existing = await appointmentsRef
      .where('schoolId', '==', schoolId)
      .where('date', '==', date)
      .where('fromTime', '<', toTime)
      .where('toTime', '>', fromTime)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: 'Time slot is already booked.' });
    }

    const bookingData = {
      studentId,
      studentName,
      fromTime,
      toTime,
      description,
      date,
      schoolId,
      createdBy: 'Student',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await appointmentsRef.add(bookingData);
    return res.status(201).json({ message: 'Appointment booked successfully.' });

  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// bookAppointmentAsSAO
exports.bookAppointmentAsSAO = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.user.schoolName;
    const { studentName, fromTime, toTime, date, description } = req.body;
  

    if (!studentName || !fromTime || !toTime || !date || !description) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const appointmentsRef = db.collection('appointments');

    const existing = await appointmentsRef
      .where('schoolId', '==', schoolId)
      .where('date', '==', date)
      .where('fromTime', '<', toTime)
      .where('toTime', '>', fromTime)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: 'Time slot already booked.' });
    }

    const bookingData = {
      studentName,
      fromTime,
      toTime,
      description,
      date,
      schoolId,
      createdBy: 'SAO',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await appointmentsRef.add(bookingData);
    return res.status(201).json({ message: 'Appointment booked by SAO.' });

  } catch (err) {
    console.error('SAO booking error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get appointments by school and date
exports.getAppointmentsByDate = async (req, res) => {
  const { schoolId, date } = req.params;

  try {
    const snapshot = await db
    .collection('appointments')
    .where('schoolId', '==', schoolId)
    .where('date', '==', date)
    .get();
  


    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ bookings });

  } catch (err) {
    console.error('Fetching appointments error:', err);
    res.status(500).json({ error: 'Unable to fetch appointments.' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const ref = db.collection('appointments').doc(appointmentId);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    await ref.delete();
    res.status(200).json({ message: 'Appointment deleted.' });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Delete failed.' });
  }
};

// Get student's own bookings
exports.getStudentBookings = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const snapshot = await db
      .collection('appointments')
      .where('studentId', '==', studentId)
      .orderBy('timestamp', 'desc')
      .get();

    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ bookings });
  } catch (err) {
    console.error('Error fetching student bookings:', err);
    res.status(500).json({ error: 'Unable to fetch bookings.' });
  }
};

// Get available time slots
exports.getAvailableTimeSlots = async (req, res) => {
  const { schoolId, date } = req.params;
  const slots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  try {
    const snapshot = await db
      .collection('appointments')
      .where('schoolId', '==', schoolId)
      .where('date', '==', date)
      .get();

    const bookedSlots = new Set();
    snapshot.forEach(doc => bookedSlots.add(doc.data().fromTime));

    const available = slots.filter(slot => !bookedSlots.has(slot));
    res.status(200).json({ available });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Unable to fetch available time slots.' });
  }
};


