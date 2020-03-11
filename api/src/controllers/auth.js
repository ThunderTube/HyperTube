const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const ms = require('ms');
const got = require('got');
const foid = require('foid');
const { extname, join } = require('path');
const {
    promises: { mkdir, unlink },
} = require('fs');
const send = require('@polka/send-type');

const { pipeline } = require('../utils');
const { User, validPasswordRegex, hashPassword } = require('../models/User');

const YEAR_IN_MILLISECONDES = ms('1 year');
const UPLOAD_DIRECTORY_PATH = join(__dirname, '../..', 'public/uploads');

function createRegisterMail(req, username, uuid, id) {
    return `Bonjour ${username}, pour activer votre compte
    : ${process.env.FRONT_URI}/confirmaccount/${uuid}/${id}`;
}

function createCookie(res, token) {
    res.cookie('cookie-id', token, {
        httpOnly: true,
        expires: new Date(Date.now() + YEAR_IN_MILLISECONDES),
        signed: true,
    });

    return res;
}

function trimObject(obj) {
    return Object.entries(obj)
        .map(([key, value]) => [key, value.trim()])
        .reduce((agg, [key, value]) => {
            agg[key] = value;

            return agg;
        }, {});
}
1;
function sanitizeUserDocument(doc) {
    const {
        isConfirmed,
        password,
        confirmationLinkUuid,
        csrfSecret,
        ...props
    } = doc.toObject();

    return props;
}

async function isUserOAuth(provider, property, value) {
    const count = await User.countDocuments({
        [property]: value,
        OAuthProvider: provider,
    });
    return count > 0;
}

async function createUploadPathIfNotExist() {
    await mkdir(UPLOAD_DIRECTORY_PATH, { recursive: true });

    return UPLOAD_DIRECTORY_PATH;
}

function createUsernameIfNotExist(username, firstName, lastName) {
    if (username === undefined) {
        if (firstName === undefined && lastName === undefined) {
            return foid(4);
        }

        if (firstName === undefined || lastName === undefined) {
            return firstName || lastName;
        }

        return firstName.concat(lastName);
    }

    return username;
}

/**
 * Verify if username and email are unique.
 * If it's unique user is save in DB.
 * Otherwise we verify if user had already an OAuth account.
 * In this case we logged in the user.
 * Or we check what fiseld is duplicate,
 * and we return to the front the specified error.
 * */

exports.OAuthcontroller = async (req, res) => {
    try {
        const { user: passportUser } = req;

        const { csrf } = res.locals;

        let username = createUsernameIfNotExist(
            passportUser.username,
            passportUser.firstName,
            passportUser.lastName
        );

        const isUserUnique = await User.isUnique({
            email: passportUser.email,
            username,
        });

        if (isUserUnique === true) {
            const {
                email,
                lastName,
                firstName,
                password,
                profilePicture,
                provider,
            } = passportUser;

            let filename;
            if (profilePicture !== undefined) {
                const fileExtension = extname(profilePicture).slice(1);
                filename = `${uuid()}.${fileExtension}`;

                await createUploadPathIfNotExist();

                // We fetch the file and save it locally
                await pipeline(
                    got.stream(profilePicture),
                    fs.createWriteStream(
                        join(__dirname, '../../public/uploads', filename)
                    )
                );
            } else {
                filename = 'default-user.jpg';
            }

            const csrfSecret = await csrf.secret();

            const user = new User({
                username,
                email,
                lastName,
                firstName,
                password,
                profilePicture: filename,
                isConfirmed: true,
                csrfSecret,
                OAuthProvider: provider,
            });
            await user.save();

            const csrfToken = csrf.create(csrfSecret);
            const token = user.getSignedJwtToken();
            console.log(csrfToken);
            createCookie(res, token).redirect(
                `http://localhost:3000/?token=${encodeURIComponent(csrfToken)}`
            );
        } else {
            const duplicateField = isUserUnique;
            const { provider } = req.user;

            const userRegisteredUsingOAuth = await isUserOAuth(
                provider,
                duplicateField,
                passportUser[duplicateField] || username
            );

            if (userRegisteredUsingOAuth) {
                username = req.user.username || username;
                const user = await User.findOne({ username });

                const token = user.getSignedJwtToken();
                const csrfToken = csrf.create(user.csrfSecret);

                console.log(csrfToken);
                createCookie(res, token).redirect(
                    `http://localhost:3000/?token=${encodeURIComponent(
                        csrfToken
                    )}`
                );
            } else {
                if (duplicateField === 'username') {
                    res.status(400).redirect(
                        `${process.env.FRONT_URI}/oauth-error/?error=username`
                    ); // Error for username already taken
                }
                if (duplicateField === 'email') {
                    res.status(400).redirect(
                        `${process.env.FRONT_URI}/oauth-error/?error=email`
                    ); // Error for email already taken
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
        const {
            file,
            body: { password },
        } = req;
        const { username, email, lastName, firstName } = trimObject(req.body);
        const { csrf, email: emailSender } = res.locals;
        if (file === undefined) {
            send(res, 200, {
                success: false,
                error: 'Invalid file',
                translationKey: 'wrong_file_type',
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
            password: await hashPassword(password),
            profilePicture: file.path,
            confirmationLinkUuid,
            csrfSecret,
        });

        try {
            await user.validate();
        } catch (e) {
            const msg = Object.values(e.errors).map(val => val.message);
            send(res, 200, {
                success: false,
                error: msg,
                translationKey: 'missing_user_inputs',
            });
            return;
        }

        const isUserUnique = await User.isUnique({
            email,
            username,
        });

        if (isUserUnique === true) {
            await user.save();

            emailSender.send({
                to: user.email,
                subject: 'Welcome to ThunderTube',
                text: createRegisterMail(
                    req,
                    user.username,
                    user.confirmationLinkUuid,
                    user._id
                ),
            });

            send(res, 200, { success: true });
            return;
        }

        if (isUserUnique === 'username') {
            send(res, 200, {
                success: false,
                error: 'Username taken',
                translationKey: 'username_taken',
            });
            return;
        }

        if (isUserUnique === 'email') {
            send(res, 200, {
                success: false,
                error: 'Email taken',
                translationKey: 'email_taken',
            });
        }
    } catch (e) {
        console.error(e);

        send(res, 500, {
            success: false,
            error: 'An error occured during registering',
        });
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
        res.status(200).json({
            success: false,
            error: 'Wrong confirmation link',
            translationKey: 'wrong_confirmation_link',
        });
    }
};

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = async (req, res) => {
    try {
        const {
            body: { username, password },
        } = req;
        const { csrf } = res.locals;

        const user = await User.findOne({
            username,
            isConfirmed: true,
            OAuthProvider: undefined,
        });
        if (user === null) {
            // Could not find a user with this username
            res.status(200).json({
                success: false,
                error: 'No user found',
                translationKey: 'no_user_found',
            });
            return;
        }

        if (!(await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                success: false,
                error: 'Invalid password',
                translationKey: 'invalid_password',
            });

            return;
        }
        const cookieToken = user.getSignedJwtToken();
        const csrfToken = csrf.create(user.csrfSecret);

        createCookie(res, cookieToken).json({
            success: true,
            user: sanitizeUserDocument(user),
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
    try {
        const { user } = req;

        send(res, 200, {
            success: true,
            user: sanitizeUserDocument(user),
        });
    } catch (e) {
        console.error(e);
        send(res, 500, {
            error: 'Could not get you',
        });
    }
};

// @desc Get an user by id
// @route GET /user/:id
// @access Private
exports.getUser = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;
        if (typeof id !== 'string' || id.length !== 24) {
            send(res, 400, {
                success: false,
                error: 'The ID is not correct',
                translationKey: 'incorrect_id',
            });
            return;
        }

        const user = await User.findById(id);
        if (user === null) {
            send(res, 404, {
                success: false,
                user: 'No user found with this ID',
                translationKey: 'invalid_user',
            });
            return;
        }

        send(res, 200, {
            success: true,
            ...sanitizeUserDocument(user),
        });
    } catch (e) {
        console.error(e);
        send(res, 500, {
            error: 'An error occured while trying to get the user',
        });
    }
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
            res.status(200).json({
                success: false,
                error: 'Unknown account',
                translationKey: 'unknown_account',
            });
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
        const link = `${process.env.FRONT_URI}/password-reset/${guid}`;

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
            res.status(200).json({
                success: false,
                error: 'Invalid password',
                translationKey: 'invalid_password',
            });
            return;
        }

        const user = await User.findOne({ username });
        if (user === null) {
            res.status(200).json({
                success: false,
                error: 'Invalid username',
                translationKey: 'invalid_username',
            });
            return;
        }

        if (!isLinkValid(user, token)) {
            res.status(200).json({
                success: false,
                error: 'Invalid link',
                translationKey: 'invalid_link',
            });
            return;
        }

        user.password = await hashPassword(password);
        user.isConfirmed = true;

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
    try {
        const {
            user,
            body: { email, username, firstName, lastName },
            file: profilePicture,
        } = req;
        const {
            locals: {
                user: { profilePicture: previousUserProfilePicture },
            },
        } = res;

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
            console.log('key', value);
            if (value) {
                if (key === 'profilePicture') {
                    try {
                        await unlink(
                            join(
                                `${UPLOAD_DIRECTORY_PATH}/${previousUserProfilePicture}`
                            )
                        );
                    } catch (e) {
                        console.error(e);
                    }
                }

                user[key] = value;
            }
        }

        // save the modifications
        try {
            await user.save();
        } catch (e) {
            console.error('e in catch', e);

            // There is a duplicate field
            if (e.code === 11000) {
                const duplicateField = e.errmsg.includes('username')
                    ? 'username'
                    : 'email';

                send(res, 200, {
                    success: false,
                    error: `This ${duplicateField} is already used`,
                    translationKey: 'duplicate_field',
                });
                return;
            }
            console.log('error ', e.errors);
            const msg = e.errors;
            send(res, 200, {
                success: false,
                error: msg,
                translationKey: 'wrong_email_format',
            });
            return;
        }

        res.status(200).json({ success: true });
    } catch (e) {
        console.error(e);

        send(res, 500, {
            success: false,
            error: 'An error occured',
        });
    }
};

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = async (req, res) => {
    try {
        const {
            user,
            body: { password },
        } = req;
        if (!validPasswordRegex.test(password)) {
            send(res, 200, {
                success: false,
                error:
                    'Please add a valid password [at least 8 characters, 1 uppercase, 1 lowercase and 1 number]',
                translationKey: 'invalid_password',
            });
            return;
        }

        user.password = await hashPassword(password);

        await user.save();

        send(res, 200, { success: true });
    } catch (e) {
        const msg = e.errors.password.message;

        send(res, 200, { success: false, error: msg });
    }
};

// @desc Logout user
// @route POST /api/v1/auth/logout
// @access Private
exports.logout = async (req, res) => {
    res.clearCookie('connect.sid');
    res.clearCookie('cookie-id').json({ success: true });
};

function hashSha512ToHex(text) {
    return crypto
        .createHmac('sha512', process.env.HMAC_SECRET)
        .update(text)
        .digest('hex');
}

exports.createUploadPathIfNotExist = createUploadPathIfNotExist;
