require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');

const seedDoctors = require('./doctor.seeder');
const seedAll = require('./fullSeeder');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Mongo Connected");

  await seedDoctors();   // ✅ FIRST
  await seedAll();       // ✅ THEN

  process.exit();
});