const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../services/email.service');

const OTP_VALIDITY_MS = 10 * 60 * 1000;

// TEMP STORAGE (Replace with Redis/DB in production)
const pendingUsers = {};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

//
// ================= REGISTER =================
//
exports.register = async (req, res) => {
  try {
    let { name, fullName, email, password, role } = req.body;
    name = name || fullName;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = String(generateOtp()).trim();

    // Store TEMP (not DB)
    pendingUsers[email] = {
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiresAt: Date.now() + OTP_VALIDITY_MS,
    };

    // Send OTP (non-blocking)
    sendOtpEmail(email, otp).catch(err => {
      console.error("Email failed:", err.message);
    });

    console.log("OTP GENERATED:", otp);

    res.status(200).json({
      message: 'OTP sent to email',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// ================= RESEND OTP =================
//
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const pending = pendingUsers[email];

    if (!pending) {
      return res.status(404).json({ message: 'No pending registration found' });
    }

    // ✅ Do NOT overwrite OTP if still valid
    if (Date.now() < pending.otpExpiresAt) {
      sendOtpEmail(email, pending.otp).catch(err => {
        console.error("Email resend failed:", err.message);
      });

      return res.json({ message: 'OTP resent (same OTP)' });
    }

    // Generate new OTP only if expired
    const newOtp = String(generateOtp()).trim();

    pending.otp = newOtp;
    pending.otpExpiresAt = Date.now() + OTP_VALIDITY_MS;

    sendOtpEmail(email, newOtp).catch(err => {
      console.error("Email resend failed:", err.message);
    });

    console.log("NEW OTP:", newOtp);

    res.json({ message: 'New OTP sent' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// ================= VERIFY OTP =================
//
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    const pending = pendingUsers[email];

    if (!pending) {
      return res.status(400).json({ message: 'No registration found' });
    }

    if (Date.now() > pending.otpExpiresAt) {
      delete pendingUsers[email];
      return res.status(400).json({ message: 'OTP expired' });
    }

    // ✅ SAFE OTP COMPARISON
    const storedOtp = String(pending.otp).trim();
    const enteredOtp = String(otp).trim();

    console.log("==== OTP DEBUG ====");
    console.log("Stored OTP:", storedOtp);
    console.log("Entered OTP:", enteredOtp);

    if (storedOtp !== enteredOtp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // ✅ CREATE USER ONLY AFTER OTP VERIFIED
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      isEmailVerified: true,
    });

    // Cleanup
    delete pendingUsers[email];

    res.json({
      message: 'User registered successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

//
// ================= LOGIN =================
//
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {

      if (!user.isEmailVerified) {
        return res.status(403).json({
          message: 'Please verify your email OTP before login.',
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });

    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};