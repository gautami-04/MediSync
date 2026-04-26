const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'medisyncg6@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS;
const NORMALIZED_EMAIL_PASS = String(EMAIL_PASS || '').replace(/\s+/g, '');
const SMTP_TIMEOUT_MS = Number(process.env.OTP_SMTP_TIMEOUT_MS || 10000);

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

/**
 * Sends a real OTP email. No fallback or bypass allowed.
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendOtpEmail = async (to, otp) => {
	if (!NORMALIZED_EMAIL_PASS) {
		throw new Error('CRITICAL: EMAIL_PASS is not configured in backend .env. Email delivery is required for security.');
	}

	const mailOptions = {
		from: `MediSync Verification <${EMAIL_USER}>`,
		to,
		subject: 'Your MediSync Verification Code',
		html: `
			<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
				<div style="text-align: center; margin-bottom: 30px;">
					<h1 style="color: #30A46C; margin: 0; font-size: 28px;">MediSync</h1>
					<p style="color: #666; margin-top: 5px;">Secure Health Portal</p>
				</div>
				<div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
					<p style="color: #333; font-size: 16px; margin-bottom: 20px;">Use the following code to verify your account or authorize your request:</p>
					<div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #30A46C; margin: 20px 0; padding: 15px; border: 2px dashed #30A46C; border-radius: 8px; display: inline-block; background-color: #eaf6ef;">
						${otp}
					</div>
					<p style="color: #888; font-size: 14px; margin-top: 20px;">This code will expire in <strong>5 minutes</strong>.</p>
				</div>
				<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #999; font-size: 12px; text-align: center;">
					<p>If you did not request this code, please ignore this email or contact support if you suspect unauthorized access.</p>
					<p>&copy; ${new Date().getFullYear()} MediSync Healthcare Platform. All rights reserved.</p>
				</div>
			</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return { delivered: true };
	} catch (error) {
		console.error(`[CRITICAL] OTP Email Delivery Failed to ${to}:`, error.message);
		throw new Error(`Failed to deliver verification email. Please try again later.`);
	}
};

module.exports = {
	sendOtpEmail,
};
