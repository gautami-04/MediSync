const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'medisyncg6@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS;
const NORMALIZED_EMAIL_PASS = String(EMAIL_PASS || '').replace(/\s+/g, '');
const SMTP_TIMEOUT_MS = Number(process.env.OTP_SMTP_TIMEOUT_MS || 8000);
const ALLOW_DEV_OTP_FALLBACK =
	process.env.EMAIL_OTP_DEV_FALLBACK === 'true' ||
	(process.env.EMAIL_OTP_DEV_FALLBACK !== 'false' && process.env.NODE_ENV !== 'production');
const SKIP_EMAIL_SEND_IN_DEV =
	process.env.OTP_SKIP_EMAIL_IN_DEV === 'true' && process.env.NODE_ENV !== 'production';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	connectionTimeout: SMTP_TIMEOUT_MS,
	greetingTimeout: SMTP_TIMEOUT_MS,
	socketTimeout: SMTP_TIMEOUT_MS,
	auth: {
		user: EMAIL_USER,
		pass: NORMALIZED_EMAIL_PASS,
	},
});

const fallbackToConsoleOtp = (to, otp, reason) => {
	console.warn(`[OTP FALLBACK] Email delivery skipped: ${reason}`);
	console.warn(`[OTP FALLBACK] OTP for ${to}: ${otp}`);
	return {
		delivered: false,
		fallback: true,
		reason,
	};
};

const sendOtpEmail = async (to, otp) => {
	if (SKIP_EMAIL_SEND_IN_DEV && ALLOW_DEV_OTP_FALLBACK) {
		return fallbackToConsoleOtp(to, otp, 'OTP_SKIP_EMAIL_IN_DEV is enabled');
	}

	if (!NORMALIZED_EMAIL_PASS) {
		if (ALLOW_DEV_OTP_FALLBACK) {
			return fallbackToConsoleOtp(to, otp, 'EMAIL_PASS is not configured in backend .env');
		}

		throw new Error('EMAIL_PASS is not configured in backend .env');
	}

	const mailOptions = {
		from: `MediSync <${EMAIL_USER}>`,
		to,
		subject: 'Your MediSync OTP Code',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #1f7a5b;">MediSync Email Verification</h2>
				<p>Use the OTP below to verify your account:</p>
				<div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f5132; margin: 16px 0;">
					${otp}
				</div>
				<p>This OTP expires in 10 minutes.</p>
				<p>If you did not request this, please ignore this email.</p>
			</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return {
			delivered: true,
			fallback: false,
		};
	} catch (error) {
		if (ALLOW_DEV_OTP_FALLBACK) {
			return fallbackToConsoleOtp(
				to,
				otp,
				error?.message || 'Failed to authenticate Gmail SMTP credentials'
			);
		}

		throw error;
	}
};

module.exports = {
	sendOtpEmail,
};
