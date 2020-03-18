const {
    promises: { readFile },
} = require('fs');

const { Movie } = require('../../api/src/models/Movie');
const connectDB = require('../../api/src/config/db');
const { DUMP_FILE } = require('./constants');

async function cli() {
    try {
        await connectDB();

        console.log('> Start to get all movies from the dump file ...');

        const movies = await readFile(DUMP_FILE);

        console.log('> Received all the movies from the dump file');

        await Movie.collection.drop();
        await Movie.syncIndexes();

        console.log('> Start insert all files into the DB ...');

        await Movie.collection.insertMany(JSON.parse(movies));

        console.log(`> Restored the \`movies\` collection from ${DUMP_FILE}`);

        process.exit(0);
    } catch (e) {
        console.error(e);

        process.exit(255);
    }
}

cli();
