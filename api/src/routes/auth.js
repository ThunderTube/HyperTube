const express = require('express');
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

router
    .post('/register', register)
    .post('login', login)
    .get('/me', isLoggedIn, getMe)
    .get('/confirmaccount/:uuid/:id', confirmAccount)
    .post('/forgotpassword', forgotPassword)
    .put('/resetpassword', resetPassword)
    .put('/updatedetails', isLoggedIn, updateDetails)
    .put('/updatepassword', isLoggedIn, updatePassword)
    .post('/logout', isLoggedIn, logout);

module.exports = router;
