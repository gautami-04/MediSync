const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const app = express();
const userRoutes = require('./routes/user.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const doctorRoutes = require('./routes/doctor.routes');
const reviewRoutes = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('API is running...');
});


app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

module.exports = app;