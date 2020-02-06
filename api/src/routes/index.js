const express = require('express');

const authRouter = require('./auth');

const router = express.Router();

// Put all the router parts there.
// Like that all the paths will be prefixed with `/api/v1`.
router
    .get('/', (_req, res) => {
        res.end('Yo !');
    })
    .use('/auth', authRouter);

module.exports = router;
