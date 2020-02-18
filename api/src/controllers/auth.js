const User = require('../models/User');
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');

const YEAR_IN_MILLISECONDES = 3.154e10;

const confirmationLinkUuid = uuid();

function createRegisterMail(req, username, uuid, id) {
    return `Bonjour ${username}, pour activer votre compte
    : ${req.protocol}://${req.hostname}:${process.env.PORT}${req.baseUrl}/confirmaccount/${uuid}/${id}`;
}

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = async (req, res) => {
    try {
        console.log(req.file);

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
            profilPicture: req.file.path,
            confirmationLinkUuid,
        });

        try {
            await user.validate();
        } catch (e) {
            let msg = Object.values(e.errors).map(val => val.message);
            res.status(400).json({ success: false, error: msg });
            return;
        }

        const isUserUnique = await User.isUnique({
            email,
            username,
        });

        if (isUserUnique === true) {
            await user.save();
            const token = user.getSignedJwtToken();

            res.locals.email.send({
                to: user.email,
                subject: 'coucou',
                text: createRegisterMail(
                    req,
                    user.username,
                    user.confirmationLinkUuid,
                    user._id
                ),
            });

            res.cookie('cookie-id', token, {
                httpOnly: true,
                expires: new Date(Date.now() + YEAR_IN_MILLISECONDES),
                signed: true,
            }).json({ success: true });
        } else if (isUserUnique === 'username') {
            res.status(400).json({
                success: false,
                error: 'Username taken',
            });
        } else if (isUserUnique === 'email') {
            res.status(400).json({
                success: false,
                error: 'Email taken',
            });
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

// @desc Get confirm user
// @route GET /api/v1/auth/confirmAccount/:uuid/:id
// @access Public
exports.confirmAccount = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user !== null && user.confirmationLinkUuid === req.params.uuid) {
        user.isConfirmed = true;
        user.confirmationLinkUuid = null;
        await user.save();
        res.json({ success: true });
    } else {
        res.status(400).json({
            success: false,
            error: 'Wrong confirmation link',
        });
    }
};

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).lean();
        if (user === null) {
            // Could not find a user with this username
            res.status(401).json({
                success: false,
                error: 'No user found',
            });
            return;
        }

        if (await bcrypt.compare(password, user.password)) {
            res.status(400).json({
                success: false,
                error: 'Invalid password',
            });

            return;
        }

        res.json({ success: true, user, csrf: '' });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
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
// @route POST /api/v1/auth/logout
// @access Private
exports.logout = async (req, res) => {
    res.clearCookie('cookie-id').json({ success: true });
};
