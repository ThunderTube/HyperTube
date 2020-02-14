const express = require('express');
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

router
    .post('/register', register)
    .post('login', login)
    .get('/me', getMe)
    .get('/confirmaccount/:uuid/:id', confirmAccount)
    .post('/forgotpassword', forgotPassword)
    .put('/resetpassword', resetPassword)
    .put('/updatedetails', updateDetails)
    .put('/updatepassword', updatePassword)
    .post('/logout', logout);

module.exports = router;
