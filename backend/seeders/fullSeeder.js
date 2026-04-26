const { faker } = require('@faker-js/faker');

const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const MedicalRecord = require('../models/medicalRecord.model');
const Payment = require('../models/payment.model');
const Review = require('../models/review.model');

const PATIENT_ID = '69e9a43f3e2e5805ca690953';

// ---------------- MEDICATION GENERATOR ----------------
const generateMedications = () => {
  const meds = [];

  const count = faker.number.int({ min: 1, max: 3 });

  for (let i = 0; i < count; i++) {
    meds.push({
      medicineName: faker.helpers.arrayElement([
        'Paracetamol',
        'Ibuprofen',
        'Amoxicillin',
        'Cetirizine',
        'Metformin',
      ]),
      dosage: `${faker.number.int({ min: 1, max: 2 })} tablet`,
      frequency: faker.helpers.arrayElement([
        'Once a day',
        'Twice a day',
        'After meals',
      ]),
      duration: `${faker.number.int({ min: 3, max: 10 })} days`,
    });
  }

  return meds;
};

// ---------------- MAIN SEED ----------------
const seedAll = async () => {
  console.log('🚀 Seeding full data...');

  const doctors = await Doctor.find().populate('user');

  if (!doctors.length) {
    throw new Error('❌ No doctors found. Run doctor seeder first.');
  }

  for (let i = 0; i < 8; i++) {
    const doctor = faker.helpers.arrayElement(doctors);

    // ---------------- APPOINTMENT ----------------
    const appointment = await Appointment.create({
      patient: PATIENT_ID,
      doctor: doctor._id,
      date: faker.date.recent(),
      status: 'completed',
      reason: faker.lorem.words(3),
    });

    // ---------------- MEDICAL RECORD ----------------
    await MedicalRecord.create({
      patient: PATIENT_ID,
      doctor: doctor._id,
      appointment: appointment._id,
      title: faker.helpers.arrayElement([
        'General Checkup',
        'Fever Consultation',
        'Skin Allergy',
        'Follow-up Visit',
      ]),
      diagnosis: faker.lorem.words(4),
      symptoms: faker.lorem.words(5).split(' '),
      medications: generateMedications(),
      testsRecommended: faker.helpers.arrayElements(
        ['Blood Test', 'X-Ray', 'MRI', 'Urine Test'],
        2
      ),
      notes: faker.lorem.paragraph(),
      attachments: [],
    });

    // ---------------- PAYMENT (₹ INR) ----------------
    await Payment.create({
  user: PATIENT_ID,
  patient: PATIENT_ID,
  appointment: appointment._id,
  amount: faker.number.int({ min: 300, max: 2000 }),
  currency: 'INR',
  method: faker.helpers.arrayElement(['UPI', 'Card', 'Net Banking']),
  status: 'paid',
  referenceId: faker.string.uuid(), // ✅ FIX
  metadata: {
    txnId: faker.string.uuid(),
  },
});

    // ---------------- REVIEW ----------------
    await Review.create({
      patient: PATIENT_ID,
      doctor: doctor.user._id, // IMPORTANT: review expects User
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.lorem.sentence(),
    });
  }

  console.log('✅ Full data seeded successfully');
};

module.exports = seedAll;