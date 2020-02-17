const User = require('../models/User');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const AnonymousStrategy = require('passport-anonymous');

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
                    console.log('payload =', payload);

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
