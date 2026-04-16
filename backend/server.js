const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // 👈 ADD THIS

dotenv.config();

// 👇 CONNECT TO DATABASE
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});