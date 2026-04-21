const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Register
exports.register = async (req, res) => {
  try {
    let { name, fullName, email, password } = req.body;
    name = name || fullName;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role, 
  token: generateToken(user._id),
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mock OTP Verification
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Accept any 6-digit OTP for development/testing purposes
    if (otp && otp.length === 6) {
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'OTP verified successfully',
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid OTP format' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};