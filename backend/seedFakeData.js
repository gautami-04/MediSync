require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const User = require('./models/user.model');
const Doctor = require('./models/doctor.model');
const Patient = require('./models/patient.model');
const Appointment = require('./models/appointment.model');
const MedicalRecord = require('./models/medicalRecord.model');
const Payment = require('./models/payment.model');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Target user details
        const targetUserId = new mongoose.Types.ObjectId('69e9a43f3e2e5805ca690953');
        
        let targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            targetUser = new User({
                _id: targetUserId,
                name: 'JOVAB SABU',
                email: 'jovab.sabu.s.130@kalvium.community',
                password: '$2b$10$GyPCKI36etTk8FiwywT7DOoOH.Hi3wbFdzvOOrT.FVIX370PW6ULW',
                role: 'patient',
                isEmailVerified: true
            });
            await targetUser.save();
            console.log('Target User created');
        } else {
            console.log('Target User found');
        }

        let patientRecord = await Patient.findOne({ user: targetUserId });
        if (!patientRecord) {
            patientRecord = new Patient({
                user: targetUserId,
                phone: faker.phone.number(),
                gender: 'male',
                dateOfBirth: faker.date.birthdate(),
                bloodGroup: 'O+',
                address: faker.location.streetAddress()
            });
            await patientRecord.save();
            console.log('Patient record created');
        } else {
            console.log('Patient record found');
        }

        // Generate 5 fake doctors
        console.log('Generating fake doctors...');
        const doctors = [];
        for (let i = 0; i < 5; i++) {
            const docUser = new User({
                name: `Dr. ${faker.person.lastName()}`,
                email: faker.internet.email(),
                password: await require('bcryptjs').hash('password123', 10),
                role: 'doctor',
                isEmailVerified: true
            });
            await docUser.save();

            const doctorProfile = new Doctor({
                user: docUser._id,
                specialization: faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology']),
                qualification: 'MBBS, MD',
                experienceYears: faker.number.int({ min: 2, max: 20 }),
                consultationFee: faker.number.int({ min: 500, max: 2000 }),
                hospital: `${faker.company.name()} Hospital`,
                bio: faker.lorem.paragraph(),
                availableSlots: [
                    { day: 'Monday', from: '09:00', to: '17:00' },
                    { day: 'Wednesday', from: '09:00', to: '17:00' },
                    { day: 'Friday', from: '09:00', to: '17:00' }
                ]
            });
            await doctorProfile.save();
            doctors.push(doctorProfile);
        }
        console.log('5 Doctors created');

        // Generate appointments, records and payments
        console.log('Generating appointments and related records...');
        for (let i = 0; i < 5; i++) {
            const randomDoctor = faker.helpers.arrayElement(doctors);
            
            const appointment = new Appointment({
                patient: targetUserId,
                doctor: randomDoctor.user,
                date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
                time: '10:00',
                status: faker.helpers.arrayElement(['booked', 'completed'])
            });
            await appointment.save();

            // Create Medical Record
            const record = new MedicalRecord({
                patient: targetUserId,
                doctor: randomDoctor._id,
                appointment: appointment._id,
                title: `Consultation with ${randomDoctor.specialization} specialist`,
                diagnosis: faker.lorem.sentence(),
                symptoms: [faker.word.noun(), faker.word.noun()],
                medications: [
                    {
                        medicineName: faker.science.chemicalElement().name,
                        dosage: '1 tablet',
                        frequency: 'Twice a day',
                        duration: '5 days'
                    }
                ],
                testsRecommended: [],
                notes: faker.lorem.paragraph()
            });
            await record.save();

            // Create Payment
            const payment = new Payment({
                user: targetUserId,
                patient: patientRecord._id,
                appointment: appointment._id,
                amount: randomDoctor.consultationFee,
                currency: 'INR',
                method: 'Credit Card',
                status: 'paid'
            });
            await payment.save();
        }

        console.log('Dummy data generation completed successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding DB:', err);
        process.exit(1);
    }
};

seedDB();
