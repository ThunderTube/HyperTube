const {
    promises: { writeFile },
} = require('fs');

const { Movie } = require('../../api/src/models/Movie');
const connectDB = require('../../api/src/config/db');
const { DUMP_FILE } = require('./constants');

async function cli() {
    try {
        await connectDB();

        console.log('> Start to get all movies ...');

        const movies = await Movie.find({});

        console.log('> Received all the movies from the DB');

        console.log('> Start to write them to the dump file ...');

        await writeFile(DUMP_FILE, JSON.stringify(movies));

        console.log(`> Dumped the \`movies\` collection into ${DUMP_FILE}`);

        process.exit(0);
    } catch (e) {
        console.error(e);

        process.exit(255);
    }
}

cli();
