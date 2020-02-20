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
        const { csrf } = res.locals;

        const csrfSecret = await csrf.secret();

        const { username, email, lastName, firstName, password } = req.body;

        const user = new User({
            username,
            email,
            lastName,
            firstName,
            password,
            profilePicture: req.file.path,
            confirmationLinkUuid,
            csrfSecret,
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
            const csrfToken = csrf.create(csrfSecret);

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
            }).json({ success: true, csrfToken });
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
        const { csrf } = res.locals;

        const user = await User.findOne({ username }).lean();
        if (user === null) {
            // Could not find a user with this username
            res.status(401).json({
                success: false,
                error: 'No user found',
            });
            return;
        }

        if (!(await bcrypt.compare(password, user.password))) {
            res.status(400).json({
                success: false,
                error: 'Invalid password',
            });

            return;
        }
        const csrfToken = csrf.create(user.csrfSecret);

        res.json({ success: true, user, csrfToken });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

// @desc Get current logged in user
// @route GET /api/v1/auth/me
// @access Private
exports.getMe = async (req, res) => {
    const {
        isConfirmed,
        password,
        confirmationLinkUuid,
        csrfSecret,
        ...props
    } = req.user;

    res.json({ success: true, user: props });
};

// @desc Get an user by id
// @route GET /user/:id
// @access Private
exports.getUser = async (req, res) => {
    const user = req.user;
    const {
        isConfirmed,
        password,
        confirmationLinkUuid,
        csrfSecret,
        ...props
    } = user._doc;

    res.json({ success: true, props });
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
    const {
        user,
        body: { email, username, firstName, lastName },
        file: profilePicture,
    } = req;

    const availableProperties = [
        ['email', email],
        ['username', username],
        ['firstName', firstName],
        ['lastName', lastName],
        [
            'profilePicture',
            profilePicture ? profilePicture.path : profilePicture,
        ],
    ];

    for (const [key, value] of availableProperties) {
        console.log(value);

        if (value) {
            user[key] = value;
        }
    }

    // save the modifications
    try {
        await user.save();
    } catch (e) {
        let msg = Object.values(e.errors).map(val => val.message);
        res.status(400).json({ success: false, error: msg });
        return;
    }

    res.status(200).json({ success: true });
};

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = async (req, res) => {
    try {
        const user = req.user;

        user.password = req.body.password;
        await user.save();
        res.json({ success: true });
    } catch (e) {
        let msg = Object.values(e.errors).map(val => val.message);
        res.status(400).json({ success: false, error: msg });
        return;
    }
};

// @desc Logout user
// @route POST /api/v1/auth/logout
// @access Private
exports.logout = async (req, res) => {
    res.clearCookie('cookie-id').json({ success: true });
};
