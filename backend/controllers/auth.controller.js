const User = require('../models/user.model');
const PendingUser = require('../models/pendingUser.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../services/email.service');

const OTP_VALIDITY_MS = 10 * 60 * 1000;
const PASSWORD_RESET_OTP_VERIFIED_VALIDITY_MS = 10 * 60 * 1000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const issueOtpForRecord = async (record) => {
  const otp = generateOtp();
  record.otp = otp;
  record.otpExpiresAt = new Date(Date.now() + OTP_VALIDITY_MS);
  await record.save();
  return sendOtpEmail(record.email, otp);
};

// Register
exports.register = async (req, res) => {
  try {
    let { name, fullName, email, password, role } = req.body;
    name = name || fullName;
    email = String(email || '').trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pendingUser = await PendingUser.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const delivery = await issueOtpForRecord(pendingUser);

    res.status(201).json({
      message: delivery?.fallback
        ? 'Registration started. OTP generated in server logs (email fallback mode).'
        : 'Registration started. OTP sent to email.',
      email: pendingUser.email,
      ...(delivery?.fallback && !IS_PRODUCTION && delivery?.otp
        ? { devOtp: delivery.otp }
        : {}),
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

// Send OTP (new or resend)
exports.sendOtp = async (req, res) => {
  try {
    const { purpose = 'registration' } = req.body;
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (purpose === 'registration') {
      const pendingUser = await PendingUser.findOne({ email });

      if (pendingUser) {
        const delivery = await issueOtpForRecord(pendingUser);

        return res.json({
          message: delivery?.fallback
            ? 'OTP generated in server logs (email fallback mode).'
            : 'OTP sent successfully to email.',
          ...(delivery?.fallback && !IS_PRODUCTION && delivery?.otp
            ? { devOtp: delivery.otp }
            : {}),
        });
      }

      const existingUnverifiedUser = await User.findOne({ email, isEmailVerified: false });
      if (!existingUnverifiedUser) {
        return res.status(404).json({ message: 'No pending registration found for this email.' });
      }

      const delivery = await issueOtpForRecord(existingUnverifiedUser);

      return res.json({
        message: delivery?.fallback
          ? 'OTP generated in server logs (email fallback mode).'
          : 'OTP sent successfully to email.',
        ...(delivery?.fallback && !IS_PRODUCTION && delivery?.otp
          ? { devOtp: delivery.otp }
          : {}),
      });
    }

    if (purpose === 'reset-password') {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const delivery = await issueOtpForRecord(user);

      return res.json({
        message: delivery?.fallback
          ? 'OTP generated in server logs (email fallback mode).'
          : 'OTP sent successfully to email.',
        ...(delivery?.fallback && !IS_PRODUCTION && delivery?.otp
          ? { devOtp: delivery.otp }
          : {}),
      });
    }

    return res.status(400).json({ message: 'Invalid OTP purpose.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { otp, purpose = 'registration' } = req.body;
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (String(otp).length !== 6) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    if (purpose === 'registration') {
      const pendingUser = await PendingUser.findOne({ email });

      if (pendingUser) {
        if (!pendingUser.otp || !pendingUser.otpExpiresAt) {
          return res.status(400).json({ message: 'OTP not requested. Please resend OTP.' });
        }

        if (new Date() > pendingUser.otpExpiresAt) {
          return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
        }

        if (pendingUser.otp !== otp) {
          return res.status(400).json({ message: 'Incorrect OTP' });
        }

        const alreadyCreatedUser = await User.findOne({ email: pendingUser.email });
        if (alreadyCreatedUser) {
          await PendingUser.deleteOne({ _id: pendingUser._id });
          return res.status(400).json({ message: 'User already exists. Please login.' });
        }

        const user = await User.create({
          name: pendingUser.name,
          email: pendingUser.email,
          password: pendingUser.password,
          role: pendingUser.role,
          isEmailVerified: true,
          otp: null,
          otpExpiresAt: null,
        });

        await PendingUser.deleteOne({ _id: pendingUser._id });

        return res.json({
          message: 'OTP verified successfully',
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      }

      const existingUnverifiedUser = await User.findOne({ email, isEmailVerified: false });

      if (!existingUnverifiedUser) {
        return res.status(404).json({ message: 'Pending registration not found' });
      }

      if (!existingUnverifiedUser.otp || !existingUnverifiedUser.otpExpiresAt) {
        return res.status(400).json({ message: 'OTP not requested. Please resend OTP.' });
      }

      if (new Date() > existingUnverifiedUser.otpExpiresAt) {
        return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
      }

      if (existingUnverifiedUser.otp !== otp) {
        return res.status(400).json({ message: 'Incorrect OTP' });
      }

      existingUnverifiedUser.isEmailVerified = true;
      existingUnverifiedUser.otp = null;
      existingUnverifiedUser.otpExpiresAt = null;
      await existingUnverifiedUser.save();

      return res.json({
        message: 'OTP verified successfully',
        _id: existingUnverifiedUser._id,
        name: existingUnverifiedUser.name,
        email: existingUnverifiedUser.email,
        role: existingUnverifiedUser.role,
        token: generateToken(existingUnverifiedUser._id),
      });
    }

    if (purpose === 'reset-password') {
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

      user.otp = null;
      user.otpExpiresAt = null;
      user.passwordResetOtpVerifiedUntil = new Date(
        Date.now() + PASSWORD_RESET_OTP_VERIFIED_VALIDITY_MS
      );
      await user.save();

      return res.json({
        message: 'OTP verified successfully. You can now reset your password.',
      });
    }

    return res.status(400).json({ message: 'Invalid OTP purpose.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password after successful OTP verification
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Email, new password and confirm password are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (
      !user.passwordResetOtpVerifiedUntil ||
      new Date() > user.passwordResetOtpVerifiedUntil
    ) {
      return res.status(400).json({
        message: 'Password reset session expired. Please verify OTP again.',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtpVerifiedUntil = null;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};