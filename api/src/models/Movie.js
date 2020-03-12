const { promisify } = require('util');
const { join } = require('path');

const mongoose = require('mongoose');
const ms = require('ms');
const rimraf = require('rimraf');

const rmRf = promisify(rimraf);

const { MOVIES_DIRECTORY } = require('../torrent');
const { MOVIES_ORIGINS } = require('../get-movies');

const TORRENT_STATUSES = {
    LOADING: 'LOADING',
    FIRST_CHUNKS_LOADED: 'FIRST_CHUNKS_LOADED',
    LOADED: 'LOADED',
    NONE: 'NONE',
};

const DELETE_MOVIES_EACH = ms('30 days');

const movieSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    imdbId: {
        type: String,
        index: true,
        unique: true,
    },
    origin: {
        type: String,
        enum: Object.values(MOVIES_ORIGINS),
    },
    title: String,
    description: String,
    language: {
        type: String,
        enum: ['en'],
    },
    year: Number,
    genres: [String],
    crew: [
        {
            name: String,
            job: String,
        },
    ],
    cast: [
        {
            character: String,
            name: String,
            profile: String,
        },
    ],
    image: String,
    rating: {
        type: Number,
        min: 0,
        max: 10,
    },
    runtime: {
        type: Number,
        min: 0,
    },
    peersAndSeedsCount: {
        type: Number,
        default: 0,
        index: true,
    },
    torrents: [
        {
            resolution: String,
            url: String,
            seeds: {
                type: Number,
                min: 0,
            },
            peers: {
                type: Number,
                min: 0,
            },
            size: {
                type: Number,
                min: 0,
            },
            fsPath: String,
            status: {
                type: String,
                enum: Object.values(TORRENT_STATUSES),
                default() {
                    return TORRENT_STATUSES.NONE;
                },
            },
        },
    ],
    watchedBy: {
        type: [
            {
                userId: {
                    type: mongoose.Types.ObjectId,
                    required: true,
                },
                watchedOn: {
                    type: Date,
                    default() {
                        return new Date();
                    },
                },
                resolution: {
                    type: String,
                    required: true,
                },
            },
        ],
        default() {
            return [];
        },
    },
    comments: {
        type: [
            {
                userId: {
                    type: mongoose.Types.ObjectId,
                    required: true,
                },
                comment: {
                    type: String,
                    required: true,
                    max: 255,
                },
                createdAt: {
                    type: Date,
                    default() {
                        return new Date();
                    },
                },
            },
        ],
        default() {
            return [];
        },
    },
    subtitles: {
        type: [
            {
                langcode: {
                    type: String,
                    required: true,
                },
                lang: {
                    type: String,
                    required: true,
                },
                encoding: {
                    type: String,
                    required: true,
                },
                score: {
                    type: Number,
                    required: true,
                },
            },
        ],
        default() {
            return [];
        },
    },
});

// Create a text index to speed up searchs by `title` field.
movieSchema.index({ title: 'text' });

movieSchema.statics.getTorrentStatus = async function getTorrentStatus({
    imdbId,
    resolution,
}) {
    const {
        torrents: [{ status }],
    } = await this.findOne(
        {
            imdbId,
            torrents: { $elemMatch: { resolution } },
        },
        {
            'torrents.$': 1,
        }
    );

    return status;
};

movieSchema.statics.lock = function lock({ imdbId, resolution }) {
    return this.updateOne(
        {
            imdbId,
            torrents: { $elemMatch: { resolution } },
        },
        { $set: { 'torrents.$.status': TORRENT_STATUSES.LOADING } }
    );
};

movieSchema.statics.loadedFirstChunks = function loadedFirstChunks({
    imdbId,
    resolution,
    path,
}) {
    return this.updateOne(
        {
            imdbId,
            torrents: { $elemMatch: { resolution } },
        },
        {
            $set: {
                'torrents.$.status': TORRENT_STATUSES.FIRST_CHUNKS_LOADED,
                'torrents.$.fsPath': path,
            },
        }
    );
};

movieSchema.statics.getTorrentFSPath = async function getTorrentFSPath({
    imdbId,
    resolution,
}) {
    const {
        torrents: [{ fsPath }],
    } = await this.findOne(
        {
            imdbId,
            torrents: { $elemMatch: { resolution } },
        },
        {
            'torrents.$': 1,
        }
    );

    return fsPath;
};

movieSchema.statics.finishedUploading = function finishedUploading({
    imdbId,
    resolution,
}) {
    return this.updateOne(
        {
            imdbId,
            torrents: { $elemMatch: { resolution } },
        },
        {
            $set: {
                'torrents.$.status': TORRENT_STATUSES.LOADED,
            },
        }
    );
};

movieSchema.statics.addUserToWatchedBySet = function addUserToWatchedBySet({
    imdbId,
    userId,
    resolution,
}) {
    return this.updateOne(
        { imdbId },
        {
            $push: {
                watchedBy: { userId, resolution },
            },
        }
    );
};

async function getMoviesToDelete() {
    const today = new Date();
    const limitDate = new Date(today.getTime() - DELETE_MOVIES_EACH);

    const moviesToDelete = await this.find(
        {
            'watchedBy.watchedOn': {
                $lt: limitDate,
            },
        },
        {
            _id: 1,
            torrents: 1,
        }
    );

    return moviesToDelete.map(movie => movie.toObject());
}

movieSchema.statics.deleteOldMovies = async function deleteOldMovies() {
    const oldMovies = await getMoviesToDelete.apply(this);
    const downloadedOldTorrents = oldMovies
        .map(({ _id, torrents }) =>
            torrents
                .map(torrent => ({ _id, ...torrent }))
                .filter(
                    ({ status, fsPath }) =>
                        (status === TORRENT_STATUSES.LOADED ||
                            status === TORRENT_STATUSES.FIRST_CHUNKS_LOADED) &&
                        typeof fsPath === 'string' &&
                        fsPath.length > 0
                )
        )
        .flat();

    if (downloadedOldTorrents.length === 0) {
        return;
    }

    const updateDocumentsPromise = this.updateMany(
        {
            $or: downloadedOldTorrents.map(({ _id, resolution }) => ({
                _id,
                torrents: {
                    $elemMatch: {
                        resolution,
                    },
                },
            })),
        },
        {
            $unset: {
                'torrents.$[].fsPath': '',
            },
            $set: {
                'torrents.$[].status': 'NONE',
            },
        }
    );

    const removeMoviesDirectoriesPromises = downloadedOldTorrents
        .map(({ fsPath }) => join(MOVIES_DIRECTORY, fsPath))
        .map(movieFilePath => rmRf(movieFilePath));

    return Promise.all([
        updateDocumentsPromise,
        ...removeMoviesDirectoriesPromises,
    ]);
};

exports.TORRENT_STATUSES = TORRENT_STATUSES;
exports.Movie = mongoose.model('Movie', movieSchema);
