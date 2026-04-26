// Quick script to create test users for all 3 roles
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user.model');

const MONGO_URI = process.env.MONGO_URI;

async function seedTestUsers() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const password = await bcrypt.hash('Test@123', 10);

  const users = [
    { name: 'Test Patient', email: 'testpatient@medisync.com', password, role: 'patient', isEmailVerified: true },
    { name: 'Test Doctor', email: 'testdoctor@medisync.com', password, role: 'doctor', isEmailVerified: true },
    { name: 'Test Admin', email: 'testadmin@medisync.com', password, role: 'admin', isEmailVerified: true },
  ];

  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      console.log(`✓ ${userData.role} already exists: ${userData.email}`);
    } else {
      await User.create(userData);
      console.log(`✓ Created ${userData.role}: ${userData.email}`);
    }
  }

  // Also create a Doctor profile for the test doctor
  const Doctor = require('./models/doctor.model');
  const doctorUser = await User.findOne({ email: 'testdoctor@medisync.com' });
  if (doctorUser) {
    const existingProfile = await Doctor.findOne({ user: doctorUser._id });
    if (!existingProfile) {
      await Doctor.create({
        user: doctorUser._id,
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        experienceYears: 8,
        consultationFee: 500,
        hospital: 'MediSync Central Hospital',
        bio: 'Experienced general practitioner',
      });
      console.log('✓ Created doctor profile');
    } else {
      console.log('✓ Doctor profile already exists');
    }
  }

  console.log('\n--- Test Credentials ---');
  console.log('Patient: testpatient@medisync.com / Test@123');
  console.log('Doctor:  testdoctor@medisync.com / Test@123');
  console.log('Admin:   testadmin@medisync.com / Test@123');

  await mongoose.disconnect();
  console.log('\nDone!');
}

seedTestUsers().catch(console.error);
