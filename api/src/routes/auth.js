const express = require('express');
const multer = require('multer');
const FileType = require('file-type');
const uuid = require('uuid/v4');
const {
    promises: { writeFile, unlink, mkdir },
} = require('fs');
const { join } = require('path');

const { isLoggedIn } = require('./utils');
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
    .post('/login', login)
    .get('/me', isLoggedIn, getMe) // iscia
    .get('/user/:id', getUser) // iscia
    .get('/confirmaccount/:uuid/:id', confirmAccount)
    .post('/forgotpassword', forgotPassword) // baptiste
    .put('/resetpassword', resetPassword) // baptiste
    .put(
        '/updatedetails',
        isLoggedIn,
        ...uploadAndVerifyFileTypeMiddleware('profilePicture', IMAGE_MIMETYPES),
        updateDetails
    ) // baptiste
    .put('/updatepassword', isLoggedIn, updatePassword) // iscia
    .post('/logout', isLoggedIn, logout);

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
