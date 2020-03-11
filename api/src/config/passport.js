const passport = require('passport');
const AnonymousStrategy = require('passport-anonymous');
const JwtStrategy = require('passport-jwt').Strategy;
const FortyTwoStrategy = require('passport-42').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const RedditStrategy = require('passport-reddit').Strategy;
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
                callbackURL: `${process.env.BACK_URI}/v1/auth/42/callback`,
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
                try {
                    // console.log('profile =', profile);
                    cb(null, profile);
                } catch (e) {
                    cb(e, null);
                }
            }
        )
    );
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: `${process.env.BACK_URI}/v1/auth/facebook/callback`,
                profileFields: ['id', 'first_name', 'last_name', 'picture'],
            },
            (accessToken, refreshToken, profile, cb) => {
                try {
                    const { provider, name, id } = profile;
                    const profilePicture = `https://graph.facebook.com/${id}/picture?type=large`;

                    cb(null, {
                        provider,
                        profilePicture,
                        firstName: name.givenName,
                        lastName: name.familyName,
                    });
                } catch (e) {
                    cb(e, null);
                }
            }
        )
    );
    passport.use(
        new GithubStrategy(
            {
                clientID: process.env.GITHUB_APP_ID,
                clientSecret: process.env.GITHUB_APP_SECRET,
                callbackURL: `${process.env.BACK_URI}/v1/auth/github/callback`,
            },
            (accessToken, refreshToken, profile, cb) => {
                try {
                    const {
                        id,
                        username,
                        displayName,
                        photos,
                        provider,
                    } = profile;

                    cb(null, {
                        id,
                        username,
                        firstName: displayName,
                        profilePicture: photos[0].value,
                        provider,
                    });
                } catch (e) {
                    cb(e, null);
                }
            }
        )
    );
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_APP_ID,
                clientSecret: process.env.GOOGLE_APP_SECRET,
                callbackURL: `${process.env.BACK_URI}/v1/auth/google/callback`,
            },
            (accessToken, refreshToken, profile, cb) => {
                try {
                    const { id, name, photos, provider } = profile;

                    cb(null, {
                        id,
                        firstName: name.givenName,
                        lastName: name.familyName,
                        profilePicture: photos[0].value,
                        provider,
                    });
                } catch (e) {
                    cb(e, null);
                }
            }
        )
    );
    passport.use(
        new RedditStrategy(
            {
                clientID: process.env.REDDIT_APP_ID,
                clientSecret: process.env.REDDIT_APP_SECRET,
                callbackURL: `${process.env.BACK_URI}/v1/auth/reddit/callback`,
            },
            (accessToken, refreshToken, profile, cb) => {
                try {
                    const { provider, name, id } = profile;
                    cb(null, {
                        id,
                        username: name,
                        provider,
                    });
                } catch (e) {
                    cb(e, null);
                }
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
        cb(null, user);
    });

    passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
    });
};
