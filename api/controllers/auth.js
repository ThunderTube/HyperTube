const User = require('../models/User');

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, lastName, firstName, password } = req.body;

    const user = await User.create({
      username,
      email,
      lastName,
      firstName,
      password
    });

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = async (req, res, next) => {
  res.status(200).json({ success: true });
};

// @desc Get current logged in user
// @route GET /api/v1/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
  res.status(200).json({ success: true });
};

// @desc Forgot password
// @route POST /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = async (req, res, next) => {
  res.status(200).json({ success: true });
};

// @desc Reset password
// @route PUT /api/v1/auth/resetpassword
// @access Private
exports.resetPassword = async (req, res, next) => {
  res.status(200).json({ success: true });
};

// @desc Update user's details
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = async (req, res, next) => {
  res.status(200).json({ success: true });
};

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = async (req, res, next) => {
  res.status(200).json({ success: true });
};

// @desc Logout user
// @route GET /api/v1/auth/logout
// @access Private
exports.logout = async (req, res, next) => {
  res.status(200).json({ success: true });
};
