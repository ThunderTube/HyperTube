const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sirv = require('sirv');
const { join } = require('path');
const cors = require('cors');
const passport = require('passport');
const Tokens = require('csrf');
const ms = require('ms');

const connectDB = require('./config/db');
const Mail = require('./email');
const { Movie } = require('./models/Movie');
const setupPassport = require('./config/passport');
const router = require('./routes');
const securityRouter = require('./routes/security');

async function app() {
    // Connect to database
    await connectDB();

    const server = express();
    const assets = sirv(join(__dirname, '../', 'public'), {
        dev: true,
    });

    // Dev logging middleware
    if (process.env.NODE_ENV === 'development') {
        server.use(morgan('dev'));
    }

    const email = new Mail();
    const csrf = new Tokens();

    setupPassport(csrf);

    server
        .use(securityRouter)
        .use(cookieParser(process.env.COOKIE_SECRET))
        .use(express.json())
        .use(express.urlencoded({ extended: false }))
        .use(assets)
        .use(
            cors({
                credentials: true,
                origin: ['http://localhost', process.env.FRONT_URI],
            })
        )
        .use(passport.initialize())
        .use(passport.authenticate(['jwt', 'anonymous'], { session: false }))
        .use((req, res, next) => {
            // This middleware sets the context
            res.locals = {
                email,
                csrf,
                isAuthenticated: req.isAuthenticated(),
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

    setInterval(() => {
        Movie.deleteOldMovies()
            .then(console.log)
            .catch(console.error);
    }, ms('1 hour'));
}

app().catch(console.error);
