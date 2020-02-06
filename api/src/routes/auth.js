const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    logout,
} = require('../controllers/auth');

const router = express.Router();

router
    .post('/register', register)
    .post('login', login)
    .get('/me', getMe)
    .post('/forgotpassword', forgotPassword)
    .put('/resetpassword', resetPassword)
    .put('/updatedetails', updateDetails)
    .put('/updatepassword', updatePassword)
    .get('/logout', logout);

module.exports = router;
