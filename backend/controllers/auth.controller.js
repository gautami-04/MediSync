const User = require('../models/user.model');
const PendingUser = require('../models/pendingUser.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../services/email.service');
const { isStrongPassword, getPasswordRequirementsMessage } = require('../utils/validators');

const OTP_VALIDITY_MS = 10 * 60 * 1000;
const RESET_TOKEN_EXPIRY = '15m';

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const generateResetToken = (id) => {
  return jwt.sign({ id, purpose: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: RESET_TOKEN_EXPIRY,
  });
};

const issueOtpForUser = async (user) => {
  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + OTP_VALIDITY_MS);
  await user.save();
  return sendOtpEmail(user.email, otp);
};

const issueOtpForPendingUser = async (pending) => {
  const otp = generateOtp();
  pending.otp = otp;
  pending.otpExpiresAt = new Date(Date.now() + OTP_VALIDITY_MS);
  await pending.save();
  return sendOtpEmail(pending.email, otp);
};

// Register (create pending user and send OTP)
exports.register = async (req, res) => {
  try {
    let { name, fullName, email, password, role } = req.body;
    name = name || fullName;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: getPasswordRequirementsMessage() });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let pending = await PendingUser.findOne({ email });

    if (pending) {
      pending.name = name;
      pending.password = hashedPassword;
      pending.role = role;
    } else {
      pending = new PendingUser({ name, email, password: hashedPassword, role });
    }

    const delivery = await issueOtpForPendingUser(pending);

    res.status(200).json({
      message: delivery?.fallback
        ? 'Registration OTP generated in server logs (email fallback mode).'
        : 'Registration OTP sent to email.',
      email: pending.email,
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

// Send OTP (supports pending registration or existing user)
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const pending = await PendingUser.findOne({ email });
    if (pending) {
      const delivery = await issueOtpForPendingUser(pending);
      return res.json({
        message: delivery?.fallback
          ? 'OTP generated in server logs (email fallback mode).'
          : 'OTP sent successfully to email.',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const delivery = await issueOtpForUser(user);

    res.json({
      message: delivery?.fallback
        ? 'OTP generated in server logs (email fallback mode).'
        : 'OTP sent successfully to email.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP (handles registration pending and existing user verification)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (String(otp).length !== 6) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    // If there's a pending registration, verify against it and create the real user
    const pending = await PendingUser.findOne({ email });

    if (pending) {
      if (!pending.otp || !pending.otpExpiresAt) {
        return res.status(400).json({ message: 'OTP not requested. Please resend OTP.' });
      }

      if (new Date() > pending.otpExpiresAt) {
        return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
      }

      if (pending.otp !== otp) {
        return res.status(400).json({ message: 'Incorrect OTP' });
      }

      // Create user from pending
      const user = await User.create({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: pending.role,
        isEmailVerified: true,
      });

      await PendingUser.deleteOne({ _id: pending._id });

      return res.json({
        message: 'OTP verified successfully',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    // Fallback: verify for an existing user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP not requested. Please resend OTP.' });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({
      message: 'OTP verified successfully',
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

// Request password reset (send OTP to existing user)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const delivery = await issueOtpForUser(user);

    res.json({
      message: delivery?.fallback
        ? 'Password reset OTP generated in server logs (email fallback mode).'
        : 'Password reset OTP sent to email.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP for password reset and return a short-lived reset token
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP not requested. Please request a password reset.' });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // Clear OTP and issue a short-lived reset token
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const resetToken = generateResetToken(user._id);

    res.json({ message: 'OTP verified for password reset', resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password using reset token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: getPasswordRequirementsMessage() });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (!payload || payload.purpose !== 'reset' || !payload.id) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};