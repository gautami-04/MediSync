const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
	createMedicalRecord,
	getMyMedicalRecords,
	getDoctorPatientRecords,
	updateMedicalRecord,
	deleteMedicalRecord,
} = require('../controllers/medicalRecord.controller');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/', protect, authorizeRoles('doctor'), createMedicalRecord);

// Patient Upload Route
router.post('/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ 
    message: 'File uploaded successfully', 
    filePath: `/uploads/${req.file.filename}` 
  });
});

router.get('/my', protect, authorizeRoles('patient'), getMyMedicalRecords);
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorPatientRecords);
router.patch('/:id', protect, authorizeRoles('doctor'), updateMedicalRecord);
router.delete('/:id', protect, authorizeRoles('doctor', 'admin'), deleteMedicalRecord);

module.exports = router;
