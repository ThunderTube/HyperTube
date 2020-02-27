const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const AnonymousStrategy = require('passport-anonymous');
const FortyTwoStrategy = require('passport-42').Strategy;

const { User } = require('../models/User');

module.exports = async function setupFortyTwoStrategy() {
    passport.use(
        new FortyTwoStrategy(
            {
                clientID: process.env.FORTYTWO_CLIENT_ID,
                clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
                callbackURL: 'http://localhost:3000/api/v1/auth/42/callback',
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
            async function(accessToken, refreshToken, profile, cb) {
                const isUserUnique = await User.isUnique({
                    email: profile.email,
                    username: profile.username,
                });
                if (isUserUnique === true) {
                    console.log('User is unique');
                    const user = new User({
                        username,
                        email,
                        lastName,
                        firstName,
                        password,
                        profilePicture: file.path,
                        confirmationLinkUuid,
                        csrfSecret,
                    });
                }
            }
        )
    );
};

module.exports = function setupPassport() {
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
};
