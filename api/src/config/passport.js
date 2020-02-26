const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const AnonymousStrategy = require('passport-anonymous');
const FortyTwoStrategy = require('passport-42').Strategy;
const stream = require('stream');
const { promisify } = require('util');
const fs = require('fs');
const got = require('got');
const uuid = require('uuid/v4');

const { User } = require('../models/User');

module.exports = function setupPassport(csrf) {
    passport.use(
        new FortyTwoStrategy(
            {
                clientID: process.env.FORTYTWO_CLIENT_ID,
                clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
                callbackURL: 'http://localhost:3000/v1/auth/42/callback',
                profileFields: {
                    id(obj) {
                        return String(obj.id);
                    },
                    username: 'login',
                    email: 'email',
                    lastName: 'last_name',
                    firstName: 'first_name',
                    profilePicture: 'image_url',
                },
            },
            (accessToken, refreshToken, profile, cb) => {
                cb(null, profile);
            }
        )
    );

    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest(req) {
                    if (req && req.signedCookies) {
                        return req.signedCookies['cookie-id'] || null;
                    }
                    return null;
                },
                secretOrKey: process.env.JWT_SECRET,
            },
            async function(payload, done) {
                try {
                    const { id } = payload;

                    const user = await User.findById(id);

                    done(null, user || null);
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );

    passport.use(new AnonymousStrategy());

    passport.serializeUser(function(user, cb) {
        console.log('serialize');

        cb(null, user);
    });

    passport.deserializeUser(function(obj, cb) {
        console.log('deserialize');
        cb(null, obj);
    });
};
