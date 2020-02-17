const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sirv = require('sirv');
const { join } = require('path');
const cors = require('cors');
const passport = require('passport');

const connectDB = require('./config/db');
const Mail = require('./email');
const User = require('./models/User');
const setupPassport = require('./config/passport');
const router = require('./routes');

async function app() {
    // Connect to database
    await connectDB();

    const server = express();
    const assets = sirv(join(__dirname, '../', 'public'));

    // Dev logging middleware
    if (process.env.NODE_ENV === 'development') {
        server.use(morgan('dev'));
    }

    const email = new Mail();

    setupPassport();

    server
        .use(express.json())
        .use(assets)
        .use(
            cors({
                credentials: true,
                origin: true,
            })
        )
        .use(cookieParser(process.env.COOKIE_SECRET))
        .use(passport.initialize())
        .use(passport.authenticate(['jwt', 'anonymous'], { session: false }))
        .use((req, res, next) => {
            // This middleware sets the context

            res.locals = {
                email,
                isAuthenticated: req.isAuthenticated(),
                authorizations: User.isConfirmed === true ? ['user'] : [],
                user: req.user || null,
            };

            next();
        })
        .use('/api/v1', router)
        .listen(process.env.PORT, err => {
            if (err) {
                console.error('something bad happened', err);
                return;
            }
            console.log(
                `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
            );
        });
}

app().catch(console.error);
