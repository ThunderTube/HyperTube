const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const validPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

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
            validPasswordRegex,
            'Please add a valid password [at least 8 characters, 1 uppercase, 1 lowercase and 1 number]',
        ],
    },
    profilePicture: {
        type: String,
        required: [true, 'Please add a profile picture'],
    },
    csrfSecret: {
        type: String,
    },
    confirmationLinkUuid: {
        type: String,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    passwordResets: {
        type: [{ token: String, expiresAt: Date }],
        default() {
            return [];
        },
    },
});

userSchema.methods.getSignedJwtToken = function getSignedJwtToken() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    this.password = await hashPassword(this.password);
    next();
});

// Verify if username and email is unique
userSchema.statics.isUnique = async function isUnique({ email, username }) {
    if ((await this.countDocuments({ email })) !== 0) {
        return 'email';
    }
    if ((await this.countDocuments({ username })) !== 0) {
        return 'username';
    }
    return true;
};

userSchema.statics.verifyJWT = function verifyJWT(rawJwt) {
    return new Promise((resolve, reject) => {
        jwt.verify(rawJwt, process.env.JWT_SECRET, (err, decoded) => {
            if (err !== null) {
                reject(err);
                return;
            }

            resolve(decoded);
        });
    });
};

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) reject(err);
            resolve(hash);
        });
    });
}

exports.User = mongoose.model('User', userSchema);
exports.validPasswordRegex = validPasswordRegex;
exports.hashPassword = hashPassword;
