const express = require('express');
const { db } = require('../config/firebaseConfig');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authenticateSAO } = require('../middlewares/saoAuthMiddleware');


router.post('/book', authenticate, appointmentController.bookAppointment);
router.get('/student/:studentId', authenticate, appointmentController.getStudentBookings);      
router.get('/availability/:schoolId/:date', authenticate, appointmentController.getAvailableTimeSlots); 
router.get('/booked/:date', authenticate, appointmentController.getAppointmentsByDateForStudent);


router.post('/sao/book', authenticateSAO, appointmentController.bookAppointmentAsSAO);
router.get('/:schoolId/:date', authenticateSAO, appointmentController.getAppointmentsByDate);
router.delete('/:appointmentId', authenticateSAO, appointmentController.deleteAppointment);

module.exports = router;
