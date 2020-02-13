const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sirv = require('sirv');
const { join } = require('path');
const cors = require('cors');

const connectDB = require('./config/db');
const Mail = require('./email');
const User = require('./models/User');

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
        .use(async (req, res, next) => {
            // This middleware sets the context

            let isAuthenticated = false;
            let user = null;

            try {
                // const { 'cookie-id': jwt } = req.signedCookies;
                const rawJwt = req.signedCookies['cookie-id'];
                if (rawJwt !== undefined) {
                    const { id } = await User.verifyJWT(rawJwt);

                    user = await User.findById(id);
                    if (user !== null) {
                        isAuthenticated = true;
                    }
                }

                res.locals = {
                    email,

                    isAuthenticated,
                    user,
                };

                next();
            } catch (e) {
                // An error occured, abort the request

                console.error('an error occured', e);
                res.sendStatus(500);
            }
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
