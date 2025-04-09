const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./config/firebaseConfig');

const userRoutes = require('./routes/sao/userRoutes');
const studentRoutes = require('./routes/student/studentRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const uploadRoutes = require('./routes/sao/uploadRoutes');
const studentSubmissionRoutes = require('./routes/student/submissionRoutes');
const saoSubmissionRoutes = require('./routes/sao/submissionRoutes');
const studentUploadRoutes = require('./routes/student/studentUploadRoutes');
const saoNotificationRoutes = require('./routes/sao/notificationRoutes');
const saoStudentNotificationRoutes = require('./routes/sao/studentNotificationRoutes');
const studentNotificationRoutes = require('./routes/student/studentNotificationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const studentReportRoutes = require('./routes/student/studentReportRoutes');
const reportResponseRoutes = require('./routes/sao/reportResponseRoutes');



dotenv.config();

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/student/submissions', studentSubmissionRoutes);
app.use('/api/sao/submissions', saoSubmissionRoutes);
app.use('/api/student/uploads', studentUploadRoutes);
app.use('/api/sao', saoNotificationRoutes);
app.use('/api/sao/notifications', saoStudentNotificationRoutes);
app.use('/api/student/notifications', studentNotificationRoutes);
app.use('/api/student/appointments', appointmentRoutes); 
app.use('/api/student/report', studentReportRoutes);
app.use('/api/sao/respond', reportResponseRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
