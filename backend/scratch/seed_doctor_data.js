const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');
const Review = require('../models/review.model');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medisync';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    const doctorEmail = 'jovabsabu2006@gmail.com';
    let doctorUser = await User.findOne({ email: doctorEmail });

    if (!doctorUser) {
      console.log('Doctor user not found. Creating one...');
      doctorUser = await User.create({
        name: 'Jovab Sabu',
        email: doctorEmail,
        password: 'password@123', // Match user info
        role: 'doctor'
      });
    }

    let doctorProfile = await Doctor.findOne({ user: doctorUser._id });
    if (!doctorProfile) {
      doctorProfile = await Doctor.create({
        user: doctorUser._id,
        specialization: 'Cardiology',
        experienceYears: 12,
        consultationFee: 800,
        hospital: 'City General Hospital',
        bio: 'Senior Cardiologist with 10+ years of experience in clinical excellence.',
        isApproved: true,
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '12:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
          { day: 'Friday', startTime: '10:00', endTime: '15:00' }
        ]
      });
    } else {
      doctorProfile.isApproved = true;
      await doctorProfile.save();
    }

    console.log('Doctor profile ready:', doctorProfile._id);

    // Create 3 patients
    const patientData = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Alice Walker', email: 'alice@example.com' }
    ];

    const patients = [];
    for (const p of patientData) {
      let u = await User.findOne({ email: p.email });
      if (!u) {
        u = await User.create({ name: p.name, email: p.email, password: 'password123', role: 'patient' });
      }
      let profile = await Patient.findOne({ user: u._id });
      if (!profile) {
        profile = await Patient.create({ user: u._id, gender: 'other', bloodGroup: 'O+' });
      }
      patients.push(profile);
    }

    console.log('Patients ready:', patients.length);

    // Create 5 appointments
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');

    const appointmentData = [
      { patient: patients[0]._id, date: today, time: '10:00', status: 'booked', reason: 'Regular checkup' },
      { patient: patients[1]._id, date: today, time: '14:30', status: 'confirmed', reason: 'Heart palpitations' },
      { patient: patients[2]._id, date: yesterday, time: '09:00', status: 'completed', reason: 'Follow up' },
      { patient: patients[0]._id, date: tomorrow, time: '11:00', status: 'booked', reason: 'Consultation' },
      { patient: patients[1]._id, date: yesterday, time: '16:00', status: 'cancelled', reason: 'Emergency' }
    ];

    for (const a of appointmentData) {
      const appt = await Appointment.create({
        ...a,
        doctor: doctorProfile._id,
        consultationFee: doctorProfile.consultationFee
      });

      // Create payment for completed/confirmed
      if (a.status === 'completed' || a.status === 'confirmed') {
        await Payment.create({
          appointment: appt._id,
          patient: a.patient,
          doctor: doctorProfile._id,
          amount: doctorProfile.consultationFee,
          status: 'paid',
          method: 'card',
          referenceId: 'PAY_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          paidAt: new Date()
        });
      }
    }

    console.log('Appointments and Payments ready.');

    // Create 2 reviews
    await Review.create({
      doctor: doctorUser._id,
      patient: patients[0].user,
      rating: 5,
      comment: 'Excellent doctor, very attentive!'
    });

    await Review.create({
      doctor: doctorUser._id,
      patient: patients[1].user,
      rating: 4,
      comment: 'Wait time was a bit long but the consultation was great.'
    });

    console.log('Reviews ready.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
