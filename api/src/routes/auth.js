const express = require('express');
const multer = require('multer');
const FileType = require('file-type');
const { v4: uuid } = require('uuid');
const {
    promises: { writeFile, unlink, mkdir },
} = require('fs');
const { join } = require('path');
const passport = require('passport');

const { isLoggedIn, validCSRF } = require('./utils');
const {
    register,
    login,
    getMe,
    getUser,
    confirmAccount,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    logout,
    OAuthcontroller,
    fortyTwoRegister,
    createUploadPathIfNotExist,
    // fortyTwoCallback,
} = require('../controllers/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads', storage: multer.memoryStorage() });

const IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif'];

router
    .post(
        '/register',
        ...uploadAndVerifyFileTypeMiddleware('profilePicture', IMAGE_MIMETYPES),
        register
    )
    .get(
        '/42',
        passport.authenticate('42', {
            failureRedirect: process.env.FRONT_URI,
        }),
        (req, res, next) => {
            console.log('first 42 called');

            next();
        }
    )
    .get('/42/callback', passport.authenticate('42'), OAuthcontroller)
    .get(
        '/github',
        passport.authenticate('github', {
            failureRedirect: process.env.FRONT_URI,
        }),
        (req, res, next) => {
            console.log('first 42 called');

            next();
        }
    )
    .get('/github/callback', passport.authenticate('github'), OAuthcontroller)
    .get(
        '/facebook',
        passport.authenticate(
            'facebook',
            {
                failureRedirect: process.env.FRONT_URI,
            },
            { scope: 'user_friends' }
        ),
        (req, res, next) => {
            console.log('first 42 called');

            next();
        }
    )
    .get(
        '/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: process.env.FRONT_URI,
        }),
        OAuthcontroller
    )
    .get(
        '/google',
        passport.authenticate('google', {
            scope: ['profile', 'email'],
        }),
        (req, res, next) => {
            console.log('first 42 called');

            next();
        }
    )
    .get('/google/callback', passport.authenticate('google'), OAuthcontroller)
    .get(
        '/reddit',
        passport.authenticate('reddit', { state: true, duration: 'permanent' }),
        (req, res, next) => {
            next();
        }
    )
    .get('/reddit/callback', passport.authenticate('reddit'), OAuthcontroller)
    .post('/login', login)
    .get('/me', isLoggedIn, getMe)
    .get('/user/:id', getUser)
    .get('/confirmaccount/:uuid/:id', confirmAccount)
    .post('/forgotpassword', forgotPassword)
    .put('/resetpassword', resetPassword)
    .put(
        '/updatedetails',
        isLoggedIn,
        validCSRF,
        ...uploadAndVerifyFileTypeMiddleware('profilePicture', IMAGE_MIMETYPES),
        updateDetails
    )
    .put('/updatepassword', isLoggedIn, validCSRF, updatePassword)
    .post('/logout', isLoggedIn, validCSRF, logout);

function uploadAndVerifyFileTypeMiddleware(
    fileProperty,
    authorizedMimeTypes = IMAGE_MIMETYPES,
    optional = true
) {
    return [
        upload.single(fileProperty),
        async (req, res, next) => {
            try {
                if (req.file === undefined && optional === true) {
                    next();
                    return;
                }
                const {
                    file: { buffer },
                } = req;
                const metadata = await FileType.fromBuffer(buffer);
                console.log(metadata);
                if (metadata === undefined) {
                    // Could not identify the mimetype of the file
                    console.error(
                        'Could not identify the mimetype of the file'
                    );
                    res.status(200).json({
                        success: false,
                        error: 'Could not identify the mimetype of the file',
                        translationKey: 'wrong_file_type',
                    });
                    return;
                }
                const { ext, mime } = metadata;
                if (!authorizedMimeTypes.includes(mime)) {
                    // Not supported mimetype
                    res.status(200).json({
                        success: false,
                        error: 'Mimetype not supported',
                        translationKey: 'wrong_file_type',
                    });
                    return;
                }

                const fileName = `${uuid()}.${ext}`;

                const pathToFile = join(
                    await createUploadPathIfNotExist(),
                    fileName
                );

                await writeFile(pathToFile, buffer, null);

                delete req.file.buffer;

                req.file = {
                    ...req.file,
                    mimetype: mime,
                    path: fileName,
                    delete() {
                        return unlink(pathToFile);
                    },
                };

                next();
            } catch (e) {
                console.error(e);
                res.status(200).json({ error: 'Explosion' });
            }
        },
    ];
}

module.exports = router;
