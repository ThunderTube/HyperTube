const express = require('express');
const multer = require('multer');
const FileType = require('file-type');
const uuid = require('uuid/v4');
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
    fortyTwoRegister,
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
    .post(
        '/42',
        passport.authenticate('42', { failureRedirect: '/login' }),
        fortyTwoRegister
    )
    // .post('/42/callback', passport.authenticate('42'), fortyTwoCallback)
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

                const UPLOAD_DIRECTORY_PATH = join(
                    __dirname,
                    '../..',
                    'public/uploads'
                );

                await mkdir(UPLOAD_DIRECTORY_PATH, { recursive: true });
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
                    res.status(400).json({
                        error: 'Could not identify the mimetype of the file',
                    });
                    return;
                }
                const { ext, mime } = metadata;
                if (!authorizedMimeTypes.includes(mime)) {
                    // Not supported mimetype
                    res.status(400).json({
                        error: 'Mimetype not supported',
                    });
                    return;
                }

                const fileName = `${uuid()}.${ext}`;

                const pathToFile = join(UPLOAD_DIRECTORY_PATH, fileName);

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
                res.status(400).json({ error: 'Explosion' });
            }
        },
    ];
}

module.exports = router;
