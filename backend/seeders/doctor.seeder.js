const { faker } = require('@faker-js/faker');
const Doctor = require('../models/doctor.model');
const User = require('../models/user.model');

const specializations = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'Orthopedic',
  'Psychiatrist',
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const generateSlots = () => {
  return days.map(day => ({
    day,
    from: '10:00',
    to: '16:00',
  }));
};

const seedDoctors = async () => {
  console.log('👨‍⚕️ Seeding doctors...');

  const existingDoctors = await Doctor.find();

  // Prevent duplicate seeding
  if (existingDoctors.length > 0) {
    console.log('⚠️ Doctors already exist. Skipping...');
    return;
  }

  for (let i = 0; i < 10; i++) {
    const user = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '$2b$10$dummyhashedpassword',
      role: 'doctor',
      isEmailVerified: true,
    });

    await Doctor.create({
      user: user._id,
      specialization: faker.helpers.arrayElement(specializations),
      qualification: faker.person.jobTitle(),
      experienceYears: faker.number.int({ min: 1, max: 20 }),
      consultationFee: faker.number.int({ min: 300, max: 1500 }), // ₹
      hospital: faker.company.name(),
      bio: faker.lorem.paragraph(),
      availableSlots: generateSlots(),
    });
  }

  console.log('✅ Doctors seeded successfully');
};

module.exports = seedDoctors;