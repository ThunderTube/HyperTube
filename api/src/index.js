const express = require('express');
const morgan = require('morgan');
const sirv = require('sirv');
const { join } = require('path');

const connectDB = require('./config/db');

const router = require('./routes');

async function app() {
    // Connect to database
    await connectDB();

    const server = express();
    const assets = sirv(join(__dirname, '../', 'public'));

    // Body parser
    server.use(express.json()).use(assets);

    // Dev logging middleware
    if (process.env.NODE_ENV === 'development') {
        server.use(morgan('dev'));
    }

    server.use('/api/v1', router);

    server.listen(process.env.PORT, err => {
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
