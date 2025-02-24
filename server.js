const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/sao/userRoutes');
const studentRoutes = require('./routes/student/studentRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const uploadRoutes = require('./routes/sao/uploadRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
