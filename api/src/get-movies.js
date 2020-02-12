const got = require('got');
const popcorn = require('popcorn-api');
const Joi = require('@hapi/joi');
const OS = require('opensubtitles-api');
const languages = require('@cospired/i18n-iso-languages');

const MOVIES_ORIGINS = {
    POPCORN_TIME: 'POPCORN_TIME',
    YTS: 'YTS',
};

const OPENSUBTITLES_URL_PROPERTY = 'url';

const NORMALIZED_GENDERS = new Map([
    ['comedy', 'comedy'],
    ['thriller', 'thriller'],
    ['drama', 'drama'],
    ['mystery', 'mystery'],
    ['crime', 'crime'],
    ['animation', 'animation'],
    ['family', 'family'],
    ['music', 'music'],
    ['adventure', 'adventure'],
    ['action', 'action'],
    ['war', 'war'],
    ['history', 'history'],
    ['science-fiction', 'science-fiction'],
    ['musical', 'musical'],
    ['superhero', 'superhero'],
    ['horror', 'horror'],
    ['fantasy', 'fantasy'],
    ['romance', 'romance'],
    ['western', 'western'],
    ['anime', 'anime'],
    ['holiday', 'holiday'],
    ['documentary', 'documentary'],
    ['short', 'short'],
    ['suspense', 'suspense'],
    ['tv-movie', 'tv-movie'],

    ['Action', 'action'],
    ['Adventure', 'adventure'],
    ['Animation', 'animation'],
    ['Sci-Fi', 'science-fiction'],
    ['Comedy', 'comedy'],
    ['Crime', 'crime'],
    ['Drama', 'drama'],
    ['Film-Noir', 'film-noir'],
    ['Romance', 'romance'],
    ['Thriller', 'thriller'],
    ['Horror', 'horror'],
    ['History', 'history'],
    ['Mystery', 'mystery'],
    ['Music', 'music'],
    ['Documentary', 'documentary'],
    ['Sport', 'sport'],
    ['War', 'war'],
    ['Fantasy', 'fantasy'],
    ['Musical', 'musical'],
    ['Family', 'family'],
    ['Biography', 'biography'],
    ['Western', 'western'],
    ['News', 'news'],
    ['Reality-TV', 'reality-tv'],
    ['Talk-Show', 'talk-show'],
]);

const POSSIBLE_GENRES = [...new Set([...NORMALIZED_GENDERS.values()])];

/**
 * return the genres formatted or null if at least one genre is unknown
 * @param {string[]} genres
 */
function formatGenres(genres) {
    const formattedGenres = [];

    for (const genre of genres) {
        const formattedGenre = NORMALIZED_GENDERS.get(genre);
        if (formattedGenre === undefined) return null;

        formattedGenres.push(formattedGenre);
    }

    return formattedGenres;
}

function formatMovieFromYTS({
    imdb_code: imdbId,
    title,
    year,
    runtime,
    genres,
    summary,
    language,
    medium_cover_image: image,
    torrents,
}) {
    if (!Array.isArray(torrents) || torrents.length === 0) {
        return null;
    }
    const formattedGenres = formatGenres(genres);
    if (formattedGenres === null) return null;

    return {
        imdbId,
        origin: MOVIES_ORIGINS.YTS,
        title,
        description: summary,
        language: language === 'English' ? 'en' : language,
        year,
        genres: formattedGenres,
        image,
        runtime,
        torrents: torrents.map(
            ({ hash, quality, seeds, peers, size_bytes: size }) => ({
                resolution: quality,
                url: `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(
                    title
                )}`,
                seeds,
                peers,
                size,
            })
        ),
    };
}

async function fetchMoviesFromYTS(prevMovies = [], page = 1) {
    const LIMIT = 50;

    const { status, status_message: statusMessage, data } = await got(
        'https://yts.lt/api/v2/list_movies.json',
        {
            searchParams: {
                page,
                limit: LIMIT,
            },
        }
    ).json();

    if (status !== 'ok') {
        throw new Error(`Bad response : ${statusMessage}`);
    }

    const {
        limit,
        movies,
        movies: { length: moviesCount },
    } = data;

    prevMovies.push(...movies);

    if (moviesCount < limit) {
        return prevMovies.map(formatMovieFromYTS);
    }

    return fetchMoviesFromYTS(prevMovies, page + 1);
}

function formatMovieFromPopcornTime({
    imdbID,
    title,
    year,
    synopsis,
    runtime,
    genres,
    images,
    images: { poster } = {},
    torrents,
}) {
    const { en: englishTorrents } = torrents;
    const finalTorrentsArray = [];

    if (englishTorrents === undefined) {
        console.error('Could not find english torrents for', imdbID);
        return null;
    }
    if (poster === undefined) {
        console.error('Could not get the poster for', imdbID, images);
    }
    const formattedGenres = formatGenres(genres);
    if (formattedGenres === null) return null;

    const entries = Object.entries(englishTorrents);

    entries.forEach(([resolution, { url, seeds, peers, size }]) => {
        finalTorrentsArray.push({
            resolution,
            url,
            seeds,
            peers,
            size,
        });
    });

    if (finalTorrentsArray.length === 0) {
        return null;
    }

    return {
        imdbId: imdbID,
        origin: MOVIES_ORIGINS.POPCORN_TIME,
        title,
        description: synopsis,
        language: 'en',
        year,
        genres: formattedGenres,
        image: poster,
        rating: null,
        runtime: Number(runtime),
        torrents: finalTorrentsArray,
    };
}

async function fetchMoviesFromPopcornTime() {
    const pagesCount = await popcorn.movies.pages();
    const pages = [];

    for (let page = 1; page <= pagesCount; page += 1) {
        pages.push(
            popcorn.movies.search({
                page,
            })
        );
    }

    const chunks = await Promise.all(pages);

    return chunks.flat().map(formatMovieFromPopcornTime);
}

function removeDuplicates(movies) {
    const moviesWithoutDuplicates = [];
    const foundIds = new Set();

    movies.forEach(movie => {
        if (foundIds.has(movie.imdbId)) return;

        moviesWithoutDuplicates.push(movie);

        foundIds.add(movie.imdbId);
    });

    return moviesWithoutDuplicates;
}

function toTMDBImage(path) {
    if (!path) return null;

    return `https://image.tmdb.org/t/p/w500${path}`;
}

function setPeersAndSeedsCount(torrents) {
    let count = 0;

    for (const { seeds, peers } of torrents) {
        count += seeds + peers;
    }

    return count;
}

async function completeMovieInformations(movie) {
    try {
        const [
            { vote_average: rating, poster_path: posterPath },
            { cast, crew },
        ] = await Promise.all(
            ['', '/credits'].map(url =>
                got(
                    `https://api.themoviedb.org/3/movie/${movie.imdbId}${url}`,
                    {
                        searchParams: {
                            api_key: process.env.TMDB_API_KEY,
                        },
                    }
                ).json()
            )
        );

        const image =
            movie.image && movie.image.startsWith('http')
                ? movie.image
                : toTMDBImage(posterPath);

        if (image === null) {
            console.error(
                'Could not get a picture for this movie',
                movie.imdbId
            );
            return null;
        }

        return {
            ...movie,
            rating,
            cast: cast.map(
                ({ character, name, profile_path: profilePath }) => ({
                    character,
                    name,
                    profile: profilePath && toTMDBImage(profilePath),
                })
            ),
            crew: crew.map(({ name, job }) => ({ name, job })),
            image,
            peersAndSeedsCount: setPeersAndSeedsCount(movie.torrents),
        };
    } catch (e) {
        if (e.response && e.response.statusCode === 404) {
            console.error(`Could not find ${movie.imdbId} on IMDB`);
            return null;
        }

        console.error(e, movie.imdbId, movie.origin);
        return null;
    }
}

async function completeMoviesInformations(movies) {
    const MAX_CHUNK_LENGTH = 100;
    const chunks = [];
    const finalMovies = [];

    let min = 0;

    for (
        let index = 0;
        index < Math.trunc(movies.length / MAX_CHUNK_LENGTH);
        index += 1
    ) {
        chunks.push(movies.slice(min, min + MAX_CHUNK_LENGTH));
        min += MAX_CHUNK_LENGTH;
    }

    await chunks.reduce(
        (agg, chunk) =>
            agg.then(async () => {
                const completedMovies = await Promise.all(
                    chunk.map(completeMovieInformations)
                );

                finalMovies.push(
                    ...completedMovies.filter(movie => movie !== null)
                );
            }),
        Promise.resolve()
    );

    return finalMovies;
}

function checkDBEntriesIntegrity(movies) {
    const schema = Joi.array()
        .items(
            Joi.object({
                imdbId: Joi.string().required(),
                origin: Object.values(MOVIES_ORIGINS), // OR `Popcorn`
                title: Joi.string().required(),
                description: Joi.string()
                    .allow('')
                    .required(),
                language: 'en',
                year: [null, Joi.number()],
                genres: Joi.array()
                    .items(Joi.string().valid(...POSSIBLE_GENRES))
                    .required(),
                crew: Joi.array()
                    .items(
                        Joi.object({
                            name: Joi.string().required(),
                            job: Joi.string().required(),
                        })
                    )
                    .required(),
                cast: Joi.array()
                    .items(
                        Joi.object({
                            character: Joi.string()
                                .allow('')
                                .required(),
                            name: Joi.string().required(),
                            profile: [null, Joi.string()],
                        })
                    )
                    .required(),
                image: Joi.string()
                    .uri()
                    .required(), // poster_path
                rating: Joi.number()
                    .min(0)
                    .max(10)
                    .required(), // vote_average
                runtime: Joi.number()
                    .integer()
                    .min(0)
                    .required(), // movie duration
                peersAndSeedsCount: Joi.number()
                    .integer()
                    .min(0)
                    .required(),
                torrents: Joi.array()
                    .items(
                        Joi.object({
                            resolution: Joi.string().required(),
                            url: Joi.string().required(),
                            seeds: Joi.number()
                                .integer()
                                .min(0)
                                .required(),
                            peers: Joi.number()
                                .integer()
                                .min(0)
                                .required(),
                            size: Joi.number()
                                .integer()
                                .min(0),
                        })
                    )
                    .min(1)
                    .required(),
            })
        )
        .min(0)
        .required();

    const { error } = schema.validate(movies);
    if (error !== undefined) {
        throw new Error(error);
    }
}

/**
 * `getMovies` fetches movies from two data providers.
 *
 * Procedure :
 * 1. Launch the bot fetchers
 * 2. Remove possible duplicates
 * 3. Return the movies
 */
async function getMovies() {
    const FETCHERS = [fetchMoviesFromPopcornTime, fetchMoviesFromYTS];

    const results = await Promise.all(FETCHERS.map(fn => fn()));
    const baseMovies = removeDuplicates(
        results.flat().filter(movie => movie !== null)
    );

    const movies = await completeMoviesInformations(baseMovies);

    checkDBEntriesIntegrity(movies);

    return movies;
}

async function getSubtitles(id) {
    const OpenSubtitles = new OS({
        useragent: 'TemporaryUserAgent',
        ssl: true,
    });

    const subtitles = await OpenSubtitles.search({
        imdbid: id,
    });

    return Object.values(subtitles)
        .filter(({ [OPENSUBTITLES_URL_PROPERTY]: url }) => url !== undefined)
        .map(({ langcode, lang, encoding, score }) => ({
            url: `/api/v1/stream/subtitles/${id}-${langcode}.vtt`,
            langcode,
            lang,
            encoding,
            score,
        }));
}

async function streamSubtitleForMovieAndLangcode(id, langcode) {
    const OpenSubtitles = new OS({
        useragent: 'TemporaryUserAgent',
        ssl: true,
    });

    const { [langcode]: subtitle } = await OpenSubtitles.search({
        imdbid: id,
        sublanguageid: languages.alpha2ToAlpha3B(langcode),
    });
    if (subtitle === undefined) {
        return null;
    }

    console.log('subtitle', subtitle);

    const { [OPENSUBTITLES_URL_PROPERTY]: url } = subtitle;
    if (url === undefined) {
        return null;
    }

    return got.stream(url);
}

exports.MOVIES_ORIGINS = MOVIES_ORIGINS;
exports.POSSIBLE_GENRES = POSSIBLE_GENRES;
exports.getMovies = getMovies;
exports.getSubtitles = getSubtitles;
exports.streamSubtitleForMovieAndLangcode = streamSubtitleForMovieAndLangcode;
