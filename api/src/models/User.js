const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const validPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required() {
            if (this.OAuthProvider) {
                return false;
            }
            return [true, 'Please add an username'];
        },
        match: [
            /[A-zÀ-ú]{2}|^[a-zA-Z0-9-]{2,255}$/,
            'Please add a valid username [at least 2 letters, number and [-] are accepted]',
        ],
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        required() {
            if (this.OAuthProvider) {
                return false;
            }
            return [true, 'Please add an email'];
        },
        match: [
            /^[^\W][A-z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,4}$/,
            'Please add a valid email',
        ],
    },
    lastName: {
        type: String,
        required() {
            if (this.OAuthProvider) {
                return false;
            }
            return [true, 'Please add a last name [at least 2 letters]'];
        },
        match: [
            /^[A-zÀ-ú- ]{1,255}$/,
            'Please add a valid last name [at least 1 letter]',
        ],
    },
    firstName: {
        type: String,
        required() {
            if (this.OAuthProvider) {
                return false;
            }
            return [true, 'Please add a first name [at least 1 letters]'];
        },
        match: [
            /^[A-zÀ-ú- ]{1,255}$/,
            'Please add a valid first name [at least 1 letters]',
        ],
    },
    password: {
        type: String,
        required() {
            if (this.OAuthProvider) {
                return false;
            }
            return [true, 'Please add a password'];
        },
        match: [
            validPasswordRegex,
            'Please add a valid password [at least 8 characters, 1 uppercase, 1 lowercase and 1 number]',
        ],
    },
    favoriteLanguage: {
        type: String,
        enum: ['en', 'fr'],
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
    OAuthProvider: {
        type: String,
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

// Verify if username and email is unique
userSchema.statics.isUnique = async function isUnique({ email, username }) {
    if (email !== undefined && (await this.countDocuments({ email })) !== 0) {
        return 'email';
    }
    if (
        username !== undefined &&
        (await this.countDocuments({ username })) !== 0
    ) {
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
    return bcrypt.hash(password, 10);
}

exports.User = mongoose.model('User', userSchema);
exports.validPasswordRegex = validPasswordRegex;
exports.hashPassword = hashPassword;
