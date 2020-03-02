const passport = require('passport');
const AnonymousStrategy = require('passport-anonymous');
const JwtStrategy = require('passport-jwt').Strategy;
const FortyTwoStrategy = require('passport-42').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const stream = require('stream');
const { promisify } = require('util');
const fs = require('fs');
const got = require('got');
const { v4: uuid } = require('uuid');

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
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: 'http://localhost:3000/v1/auth/facebook/callback',
                profileFields: ['id', 'first_name', 'last_name', 'picture'],
            },
            (accessToken, refreshToken, profile, cb) => {
                // console.log('profile =', profile);
                const { provider, name, id } = profile;
                const profilePicture = `https://graph.facebook.com/${id}/picture?type=large`;

                console.log('profile picture = ', profilePicture);

                cb(null, {
                    provider,
                    profilePicture,
                    firstName: name.givenName,
                    lastName: name.familyName,
                });
            }
        )
    );
    passport.use(
        new GithubStrategy(
            {
                clientID: process.env.GITHUB_APP_ID,
                clientSecret: process.env.GITHUB_APP_SECRET,
                callbackURL: 'http://localhost:3000/v1/auth/github/callback',
            },
            (accessToken, refreshToken, profile, cb) => {
                const { username, displayName, photos, provider } = profile;

                // console.log('profile:', profile);

                cb(null, {
                    username: username,
                    firstName: displayName,
                    profilePicture: photos[0].value,
                    provider,
                });
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
