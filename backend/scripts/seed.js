const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // 🔥 Correct path to .env

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // DROP DATABASE (Clearing collections)
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared collection: ${collection.collectionName}`);
    }

    // Create default Admin
    const hashedPassword = await bcrypt.hash('one23four', 10);
    const admin = new User({
      name: 'System Administrator',
      email: 'admin1234@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });

    await admin.save();
    console.log('--------------------------------------------------');
    console.log('SUCCESS: Database dropped and Admin created!');
    console.log('Email: admin1234@gmail.com');
    console.log('Password: one23four');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedAdmin();
