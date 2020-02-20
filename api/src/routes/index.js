const express = require('express');

const authRouter = require('./auth');
const streamRouter = require('./stream');
const { isLoggedIn } = require('./utils');

const router = express.Router();

// Put all the router parts there.
// Like that all the paths will be prefixed with `/api/v1`.
router
    .get('/', (_req, res) => {
        res.end('Yo !');
    })
    .use('/auth', authRouter)
    .use('/stream', isLoggedIn, streamRouter);

module.exports = router;
