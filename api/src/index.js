const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sirv = require('sirv');
const { join } = require('path');
const cors = require('cors');
const passport = require('passport');
const Tokens = require('csrf');
const session = require('express-session');

const connectDB = require('./config/db');
const Mail = require('./email');
const { User } = require('./models/User');
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
    const csrf = new Tokens();

    setupPassport(csrf);

    server
        .use(cookieParser(process.env.COOKIE_SECRET))
        .use(express.json())
        .use(express.urlencoded({ extended: false }))
        .use(assets)
        .use(
            cors({
                credentials: true,
                origin: ['http://localhost', 'http://localhost:3000'],
            })
        )
        .use(
            session({
                secret: 'test',
                saveUninitialized: false,
                resave: false,
            })
        )
        .use(passport.initialize())
        .use(passport.session())
        .use(passport.authenticate(['jwt', 'anonymous']))
        .use((req, res, next) => {
            // This middleware sets the context
            res.locals = {
                email,
                csrf,
                isAuthenticated: req.isAuthenticated(),
                authorizations: User.isConfirmed === true ? ['user'] : [],
                user: req.user || null,
            };

            next();
        })
        .use('/v1', router)
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
