const User = require('../models/User');

const YEAR_IN_MILLISECONDES = 3.154e10;

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = async (req, res) => {
    try {
        const {
            username,
            email,
            lastName,
            firstName,
            password,
            profilPicture,
        } = req.body;

        const user = new User({
            username,
            email,
            lastName,
            firstName,
            password,
            profilPicture,
        });
        try {
            await user.validate();
        } catch (e) {
            let msg = Object.values(e.errors).map(val => val.message);
            // .toString();
            res.status(400).json({ success: false, error: msg });
            return;
        }
        const isUserUnique = await User.isUnique({ email, username });

        if (isUserUnique === true) {
            await user.save();
            const token = user.getSignedJwtToken();

            res.cookie('cookie-id', token, {
                httpOnly: true,
                expires: new Date(Date.now() + YEAR_IN_MILLISECONDES),
                signed: true,
            }).json({ success: true });
        } else if (isUserUnique === 'username') {
            res.status(400).json({ success: false, error: 'Username taken' });
        } else if (isUserUnique === 'email') {
            res.status(400).json({ success: false, error: 'Email taken' });
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = async (req, res) => {
    res.status(200).json({ success: true });
};

// @desc Get current logged in user
// @route GET /api/v1/auth/me
// @access Private
exports.getMe = async (req, res) => {
    res.status(200).json({ success: true });
};

// @desc Forgot password
// @route POST /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = async (req, res) => {
    res.status(200).json({ success: true });
};

// @desc Reset password
// @route PUT /api/v1/auth/resetpassword
// @access Private
exports.resetPassword = async (req, res) => {
    res.status(200).json({ success: true });
};

// @desc Update user's details
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = async (req, res) => {
    res.status(200).json({ success: true });
};

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = async (req, res) => {
    res.status(200).json({ success: true });
};

// @desc Logout user
// @route GET /api/v1/auth/logout
// @access Private
exports.logout = async (req, res) => {
    res.clearCookie('cookie-id').json({ success: true });
};
