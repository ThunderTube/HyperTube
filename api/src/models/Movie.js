const mongoose = require('mongoose');

const { MOVIES_ORIGINS } = require('../get-movies');

const TORRENT_STATUSES = {
    LOADING: 'LOADING',
    FIRST_CHUNKS_LOADED: 'FIRST_CHUNKS_LOADED',
    LOADED: 'LOADED',
    NONE: 'NONE',
};

// console.log('last, first', mongoose.Types.ObjectId, mongoose.ObjectId);

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
        type: [mongoose.Types.ObjectId],
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
}) {
    return this.updateOne({ imdbId }, { $addToSet: { watchedBy: userId } });
};

exports.TORRENT_STATUSES = TORRENT_STATUSES;
exports.Movie = mongoose.model('Movie', movieSchema);
