const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const stream = require('stream');
const fs = require('fs');
const ms = require('ms');
const got = require('got');
const { extname, join } = require('path');

const { pipeline } = require('../utils');
const { User, validPasswordRegex } = require('../models/User');

const YEAR_IN_MILLISECONDES = 3.154e10;

function createRegisterMail(req, username, uuid, id) {
    return `Bonjour ${username}, pour activer votre compte
    : ${req.protocol}://${req.hostname}:${process.env.PORT}${req.baseUrl}/confirmaccount/${uuid}/${id}`;
}

function createCookie(res, token) {
    res.cookie('cookie-id', token, {
        httpOnly: true,
        expires: new Date(Date.now() + YEAR_IN_MILLISECONDES),
        signed: true,
    });

    return res;
}

async function isUserOAuth(property, value) {
    const count = await User.countDocuments({
        [property]: value,
        registeredUsingOAuth: true,
    });
    console.log('count = ', count);
    return count > 0;
}

function trimObject(obj) {
    return Object.entries(obj)
        .map(([key, value]) => [key, value.trim()])
        .reduce((agg, [key, value]) => {
            agg[key] = value;

            return agg;
        }, {});
}

/** Verify if username and email are unique.
 *  If it's unique user is save in DB.
 *  Otherwise we verify if user had already an OAuth account.
 *  In this case we logged in the user.
 *  Or we chech what field is duplicate,
 *  and we return to the front the specified error.
 *  */

exports.controllerFortyTwo = async (req, res) => {
    try {
        const { user: passportUser } = req;

        const { csrf } = res.locals;
        const isUserUnique = await User.isUnique({
            email: passportUser.email,
            username: passportUser.username,
        });

        const csrfSecret = await csrf.secret();

        if (isUserUnique === true) {
            const {
                username,
                email,
                lastName,
                firstName,
                password,
                profilePicture,
            } = passportUser;

            const fileExtension = extname(profilePicture).slice(1);
            const filename = `${uuid()}.${fileExtension}`;

            // We fetch the file and save it locally
            await pipeline(
                got.stream(profilePicture),
                fs.createWriteStream(
                    join(__dirname, '../../public/uploads', filename)
                )
            );

            const user = new User({
                username,
                email,
                lastName,
                firstName,
                password,
                profilePicture: filename,
                isConfirmed: true,
                csrfSecret,
                oAuth: true,
            });
            await user.save();

            const csrfToken = csrf.create(csrfSecret);
            const token = user.getSignedJwtToken();

            createCookie(res, token).redirect(
                `http://localhost:3000/?token=${encodeURIComponent(csrfToken)}`
            );
        } else {
            const duplicateField = isUserUnique;

            const userRegisteredUsingOAuth = await isUserOAuth(
                duplicateField,
                passportUser[duplicateField]
            );
            if (userRegisteredUsingOAuth > 0) {
                const username = req.user.username;
                const user = await User.findOne({ username });

                const token = user.getSignedJwtToken();
                const csrfToken = csrf.create(csrfSecret);

                createCookie(res, token).redirect(
                    `http://localhost:3000/?token=${encodeURIComponent(
                        csrfToken
                    )}`
                );
            } else {
                if (duplicateField === 'username') {
                    res.status(400).redirect('/?error=username'); // Error for email already taken
                }
                if (duplicateField === 'email') {
                    res.status(400).redirect('/?error=email'); // Error for username already taken
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
};

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = async (req, res) => {
    try {
        const { file } = req;
        const { username, email, lastName, firstName, password } = trimObject(
            req.body
        );
        const { csrf } = res.locals;
        if (file === undefined) {
            res.status(400).json({
                error: 'Invalid file',
            });
            return;
        }

        const confirmationLinkUuid = uuid();
        const csrfSecret = await csrf.secret();

        const user = new User({
            username,
            email,
            lastName,
            firstName,
            password,
            profilePicture: file.path,
            confirmationLinkUuid,
            csrfSecret,
        });

        try {
            await user.validate();
        } catch (e) {
            const msg = Object.values(e.errors).map(val => val.message);
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

            createCookie(res, token).json({ success: true, csrfToken });
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

// @desc Register user with 42 strategy
// @route GET /api/v1/auth/42
// @access Public
exports.fortyTwoRegister = async (req, res) => {
    res.json({ success: true });
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

        const user = await User.findOne({ username });
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
        const cookieToken = user.getSignedJwtToken();
        const csrfToken = csrf.create(user.csrfSecret);

        createCookie(res, cookieToken).json({
            success: true,
            user: user.toObject(),
            csrfToken,
        });
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
    const { user } = req;
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
    const LINK_VALIDITY_DURATION = ms('15 minutes');

    /**
     * 1. generate a token
     * 2. send an email containing this token
     * 3. the user has to click on the link
     * 4. the user is redirected to the frontend with the token in a query param
     * 5. the front makes a request to effectively reset the password
     */
    try {
        const {
            body: { username },
        } = req;
        const {
            locals: { email },
        } = res;

        const user = await User.findOne({ username });
        if (user === null) {
            res.status(400).json({ error: ['Unknown account'] });
            return;
        }

        const guid = uuid();
        const hashedGuid = hashSha512ToHex(guid);

        user.passwordResets = [
            ...user.passwordResets.filter(
                ({ expiresAt }) => expiresAt.getTime() > new Date().getTime()
            ),
            {
                token: hashedGuid,
                expiresAt: new Date(Date.now() + LINK_VALIDITY_DURATION),
            },
        ];
        await user.save();

        // send a link with the plain guid
        const link = `${process.env.FRONT_URI}/password-reset?token=${guid}`;

        email.send({
            to: user.email,
            text: `
Bonjour,
Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe.

${link}
`,
            subject: 'Remise à zéro du mot de passe',
        });

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

// @desc Reset password
// @route PUT /api/v1/auth/resetpassword
// @access Private
exports.resetPassword = async (req, res) => {
    try {
        const {
            body: { username, password, token },
        } = req;
        if (!validPasswordRegex.test(password)) {
            res.status(400).json({ error: ['Invalid password/username'] });
            return;
        }

        const user = await User.findOne({ username });
        if (user === null) {
            res.status(400).json({ error: ['Invalid password/username'] });
            return;
        }

        if (!isLinkValid(user, token)) {
            res.status(400).json({ error: ['Invalid link'] });
            return;
        }

        user.password = password;
        await user.save();

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

function isLinkValid(user, token) {
    const hashedGuid = hashSha512ToHex(token);
    let index = 0;

    for (const { token, expiresAt } of user.passwordResets) {
        if (expiresAt.getTime() < new Date().getTime()) continue;

        if (token === hashedGuid) {
            // A link can be used only once
            user.passwordResets.splice(index, 1);
            return true;
        }

        index++;
    }

    return false;
}

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
        const msg = Object.values(e.errors).map(val => val.message);
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
        const { user } = req;

        user.password = req.body.password;
        await user.save();
        res.json({ success: true });
    } catch (e) {
        const msg = Object.values(e.errors).map(val => val.message);
        res.status(400).json({ success: false, error: msg });
    }
};

// @desc Logout user
// @route POST /api/v1/auth/logout
// @access Private
exports.logout = async (req, res) => {
    res.clearCookie('cookie-id').json({ success: true });
};

function hashSha512ToHex(text) {
    return crypto
        .createHmac('sha512', process.env.HMAC_SECRET)
        .update(text)
        .digest('hex');
}
