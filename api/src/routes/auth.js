const express = require('express');
const multer = require('multer');
const FileType = require('file-type');
const uuid = require('uuid/v4');
const {
    promises: { writeFile, unlink },
} = require('fs');
const { join } = require('path');

const { isLoggedIn } = require('./utils');
const {
    register,
    login,
    getMe,
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
        ...uploadAndVerifyFileTypeMiddleware('profile', IMAGE_MIMETYPES),
        register
    )
    .post('login', login)
    .get('/me', isLoggedIn, getMe)
    .get('/confirmaccount/:uuid/:id', confirmAccount)
    .post('/forgotpassword', forgotPassword)
    .put('/resetpassword', resetPassword)
    .put('/updatedetails', isLoggedIn, updateDetails)
    .put('/updatepassword', isLoggedIn, updatePassword)
    .post('/logout', isLoggedIn, logout);

function uploadAndVerifyFileTypeMiddleware(
    fileProperty,
    authorizedMimeTypes = IMAGE_MIMETYPES
) {
    return [
        upload.single(fileProperty),
        async (req, res, next) => {
            try {
                const {
                    file: { buffer },
                } = req;

                const metadata = await FileType.fromBuffer(buffer);
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

                const fileName = `uploads/${uuid()}.${ext}`;

                const pathToFile = join(__dirname, '../..', fileName);

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
