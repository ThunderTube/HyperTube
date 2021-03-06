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
            return [true, 'Please add a last name [at least 1 letters]'];
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
        default: 'en',
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
    OAuthID: {
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

// Verify if username and email are unique or if a user had an Oauth account
userSchema.statics.isUnique = async function isUnique({
    email,
    username,
    OAuthID,
    OAuthProvider,
}) {
    const selectors = {
        $or: [],
    };

    if (username) {
        selectors['$or'].push({ username });
    }

    if (email) {
        selectors['$or'].push({ email });
    }

    if (OAuthID !== undefined && OAuthProvider !== undefined) {
        selectors['$or'].push({
            OAuthID: OAuthID,
            OAuthProvider: OAuthProvider,
        });
    }
    console.log(' => ', username, email, OAuthProvider, OAuthID);

    const firstMatchingUser = await this.findOne(selectors);
    if (firstMatchingUser === null) {
        return true;
    }

    if (firstMatchingUser.email === email && email !== undefined) {
        return 'email';
    }

    if (firstMatchingUser.username === username && username !== undefined) {
        return 'username';
    }

    return 'oauth';
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
