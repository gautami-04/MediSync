// Payment routes: create payments and fetch authenticated user's payments.
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { createPayment, getMyPayments } = require('../controllers/payment.controller');

router.get('/my', protect, getMyPayments);
router.post('/', protect, createPayment);
module.exports = router;
