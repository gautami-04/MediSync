const mongoose = require('mongoose');
require('dotenv').config({path:'backend/.env'});

const schema = new mongoose.Schema({email:String, otp:String});
const PendingUser = mongoose.model('PendingUser', schema, 'pendingusers');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const users = await PendingUser.find({email: { $in: ['jovabsabu@gmail.com', 'jovabsabu2006@gmail.com'] }});
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
