const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const { getMe, updateMe, uploadProfilePicture } = require('../controllers/user.controller');
const upload = require('../middleware/upload.middleware');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;