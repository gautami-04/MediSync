const Appointment = require('../models/appointment.model');
const Payment = require('../models/payment.model');

const generateReferenceId = () => {
	const stamp = Date.now().toString().slice(-7);
	const random = Math.floor(100 + Math.random() * 900);
	return `MC-${stamp}${random}`;
};

exports.createPayment = async (req, res) => {
	try {
		const {
			amount,
			method = 'card',
			status = 'pending',
			appointmentId,
			doctorName,
			specialty,
			notes,
		} = req.body;

		if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
			return res.status(400).json({ message: 'A valid amount is required' });
		}

		const payload = {
			patient: req.user._id,
			amount: Number(amount),
			method,
			status,
			notes: notes || '',
			referenceId: generateReferenceId(),
			paidAt: status === 'paid' ? new Date() : null,
		};

		if (appointmentId) {
			const appointment = await Appointment.findById(appointmentId).populate('doctor', 'name');

			if (!appointment) {
				return res.status(404).json({ message: 'Appointment not found' });
			}

			if (String(appointment.patient) !== String(req.user._id)) {
				return res.status(403).json({ message: 'Cannot create payment for this appointment' });
			}

			payload.appointment = appointment._id;
			payload.doctorName = doctorName || appointment.doctor?.name || '';
			payload.specialty = specialty || '';
		} else {
			payload.doctorName = doctorName || '';
			payload.specialty = specialty || '';
		}

		const payment = await Payment.create(payload);
		return res.status(201).json(payment);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getMyPayments = async (req, res) => {
	try {
		const payments = await Payment.find({ patient: req.user._id })
			.sort({ createdAt: -1 })
			.populate('appointment', 'date time status');

		return res.status(200).json(payments);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
