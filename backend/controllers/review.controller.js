const Review = require('../models/review.model');

exports.addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    // prevent duplicate review
    const existing = await Review.findOne({
      patient: req.user._id,
      doctor: doctorId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already reviewed this doctor' });
    }

    const review = await Review.create({
      patient: req.user._id,
      doctor: doctorId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email');

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};