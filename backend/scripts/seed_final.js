const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: './.env' });

const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');
const MedicalRecord = require('../models/medicalRecord.model');
const Payment = require('../models/payment.model');

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Doctor.deleteMany({});
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await MedicalRecord.deleteMany({});
        await Payment.deleteMany({});
        console.log('Data cleared.');

        const hashedPassword = await bcrypt.hash('password@123', 10);

        // 1. Create Patient: jovabsabu@gmail.com
        const patientUser = await User.create({
            name: 'Jovab Sabu Patient',
            email: 'jovabsabu@gmail.com',
            password: hashedPassword,
            role: 'patient',
            isEmailVerified: true
        });

        const patientProfile = await Patient.create({
            user: patientUser._id,
            phone: '1234567890',
            gender: 'male',
            dateOfBirth: new Date('2000-01-01'),
            address: '123 Patient St, City'
        });

        // 2. Create Doctor: jovabsabu2006@gmail.com
        const doctorUser = await User.create({
            name: 'Dr. Jovab Sabu',
            email: 'jovabsabu2006@gmail.com',
            password: hashedPassword,
            role: 'doctor',
            isEmailVerified: true
        });

        const doctorProfile = await Doctor.create({
            user: doctorUser._id,
            specialization: 'Cardiology',
            qualification: 'MBBS, MD',
            experienceYears: 15,
            consultationFee: 1500,
            hospital: 'City Heart Center',
            bio: 'Expert in cardiology with over 15 years of experience.',
            isApproved: true,
            availableSlots: [
                { day: 'Monday', startTime: '09:00', endTime: '10:00' },
                { day: 'Monday', startTime: '10:00', endTime: '11:00' },
                { day: 'Tuesday', startTime: '14:00', endTime: '15:00' }
            ]
        });

        // 3. Create Admin: admin@gmail.com
        await User.create({
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin',
            isEmailVerified: true
        });

        // 4. Create 15 other random Doctors
        console.log('Creating random doctors...');
        const otherDoctors = [];
        for (let i = 0; i < 15; i++) {
            const dUser = await User.create({
                name: `Dr. ${faker.person.fullName()}`,
                email: faker.internet.email(),
                password: hashedPassword,
                role: 'doctor',
                isEmailVerified: true
            });

            const dProfile = await Doctor.create({
                user: dUser._id,
                specialization: faker.helpers.arrayElement(['Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Practice']),
                qualification: 'MBBS, MD',
                experienceYears: faker.number.int({ min: 2, max: 25 }),
                consultationFee: faker.number.int({ min: 500, max: 3000 }),
                hospital: faker.company.name() + ' Hospital',
                bio: faker.lorem.sentence(),
                isApproved: i >= 5 // 5 doctors unapproved for admin to verify
            });
            otherDoctors.push(dProfile);
        }

        // 5. Create 15 other random Patients
        console.log('Creating random patients...');
        const otherPatients = [];
        for (let i = 0; i < 15; i++) {
            const pUser = await User.create({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: hashedPassword,
                role: 'patient',
                isEmailVerified: true
            });

            const pProfile = await Patient.create({
                user: pUser._id,
                phone: faker.phone.number(),
                gender: faker.helpers.arrayElement(['male', 'female']),
                dateOfBirth: faker.date.birthdate(),
                address: faker.location.streetAddress()
            });
            otherPatients.push(pProfile);
        }

        // 6. Data for jovabsabu@gmail.com (Patient) - Many visited doctors
        console.log('Seeding data for jovabsabu@gmail.com...');
        for (let i = 0; i < 10; i++) {
            const doctor = otherDoctors[i];
            const appointment = await Appointment.create({
                patient: patientProfile._id,
                doctor: doctor._id,
                date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
                time: '10:00',
                status: 'completed',
                diagnosis: faker.lorem.sentence(),
                consultationFee: doctor.consultationFee
            });

            await MedicalRecord.create({
                patient: patientUser._id,
                doctor: doctor._id,
                appointment: appointment._id,
                title: 'Checkup for ' + doctor.specialization,
                diagnosis: appointment.diagnosis,
                symptoms: [faker.word.noun(), faker.word.noun()],
                medications: [
                    { medicineName: 'Medication A', dosage: '10mg', frequency: 'Daily', duration: '5 days' }
                ],
                notes: faker.lorem.paragraph()
            });

            await Payment.create({
                patient: patientProfile._id,
                appointment: appointment._id,
                doctorName: (await User.findById(doctor.user)).name,
                specialty: doctor.specialization,
                amount: doctor.consultationFee,
                status: 'paid',
                referenceId: faker.string.uuid(),
                paidAt: new Date(),
                method: 'card'
            });
        }

        // 7. Data for jovabsabu2006@gmail.com (Doctor) - Many appointments and users
        console.log('Seeding data for jovabsabu2006@gmail.com...');
        for (let i = 0; i < 15; i++) {
            const patient = otherPatients[i % otherPatients.length];
            const status = faker.helpers.arrayElement(['booked', 'confirmed', 'completed', 'cancelled']);
            const todayStr = new Date().toISOString().split('T')[0];
            const appointment = await Appointment.create({
                patient: patient._id,
                doctor: doctorProfile._id,
                date: i < 5 ? todayStr : faker.date.soon({ days: 30 }).toISOString().split('T')[0],
                time: `${(9 + (i % 8)).toString().padStart(2, '0')}:00`, // Vary the time from 09:00 to 16:00
                status: status,
                consultationFee: doctorProfile.consultationFee
            });

            if (status === 'completed') {
                await MedicalRecord.create({
                    patient: (await User.findById(patient.user))._id,
                    doctor: doctorProfile._id,
                    appointment: appointment._id,
                    title: 'Regular Checkup',
                    diagnosis: faker.lorem.sentence(),
                    notes: faker.lorem.paragraph()
                });

                await Payment.create({
                    patient: patient._id,
                    appointment: appointment._id,
                    doctorName: doctorUser.name,
                    specialty: doctorProfile.specialization,
                    amount: doctorProfile.consultationFee,
                    status: 'paid',
                    referenceId: faker.string.uuid(),
                    paidAt: new Date(),
                    method: 'card'
                });
            }
        }

        // 8. Admin Revenues (Many payments)
        console.log('Seeding admin revenues...');
        for (let i = 0; i < 20; i++) {
            const randomPatient = faker.helpers.arrayElement(otherPatients);
            const randomDoctor = faker.helpers.arrayElement(otherDoctors);
            await Payment.create({
                patient: randomPatient._id,
                doctorName: (await User.findById(randomDoctor.user)).name,
                specialty: randomDoctor.specialization,
                amount: randomDoctor.consultationFee,
                status: 'paid',
                referenceId: faker.string.uuid(),
                paidAt: faker.date.recent({ days: 30 }),
                method: 'card'
            });
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
