const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const { getMe, updateMe } = require('../controllers/user.controller');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;