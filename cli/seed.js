const { getMovies } = require('../api/src/get-movies');
const connectDB = require('../api/src/config/db');
const { Movie } = require('../api/src/models/Movie');

async function cli() {
    try {
        await connectDB();

        console.log('> Start to scrap all the movies ...');

        const movies = await getMovies();

        console.log('> Scraped all the movies');

        // Drop the collection efficiently (data + indexes) and then recreate the indexes.
        await Movie.collection.drop();
        await Movie.syncIndexes();

        console.log('> Start to insert all the movies into the DB ...');

        await Movie.collection.insertMany(movies);

        console.log('> Saved the movies to MongoDB');

        process.exit(0);
    } catch (e) {
        console.error(e);

        process.exit(255);
    }
}

cli();
