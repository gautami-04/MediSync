const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env in current dir (backend)
dotenv.config();

const User = require('../models/user.model');

const deleteUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/medisync';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const email = 'joeljoymaniamkeril@gmail.com';
    const result = await User.deleteOne({ email: email.toLowerCase() });

    if (result.deletedCount > 0) {
      console.log(`Successfully deleted user with email: ${email}`);
    } else {
      console.log(`No user found with email: ${email}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  }
};

deleteUser();
