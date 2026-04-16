const User = require('../models/user.model');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};