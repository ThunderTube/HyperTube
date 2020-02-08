// const crypto = require('crypto');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Please add an username'],
        match: [
            /[A-zÀ-ú]{2}|^[a-zA-Z0-9-]{3, 20}$/,
            'Please add a valid username [at least 2 letters, number and [-] are accepted]',
        ],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please add an email'],
        match: [
            /^[^\W][A-z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,4}$/,
            'Please add a valid email',
        ],
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name'],
        match: [
            /^[A-zÀ-ú- ]{2,20}$/,
            'Please add a valid last name [at least 2 letters]',
        ],
    },
    firstName: {
        type: String,
        required: [true, 'Please add a first name'],
        match: [
            /^[A-zÀ-ú- ]{2,20}$/,
            'Please add a valid first name [at least 2 letters]',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        match: [
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
            'Please add a valid password [at least 8 characters, 1 uppercase, 1 lowercase and 1 number]',
        ],
    },
    profilPicture: {
        type: String,
        default: 'no-photo.jpg',
    },
    resetPwdToken: String,
    resetPwdExpire: Date,
});

module.exports = mongoose.model('User', userSchema);
