const { createReadStream } = require('fs');
const { join } = require('path');

const send = require('@polka/send-type');
const got = require('got');
const { extname } = require('path');
const mongoose = require('mongoose');

const { Movie, TORRENT_STATUSES } = require('../models/Movie');
const { User } = require('../models/User');
const { downloadSubtitles, NORMALIZED_GENDERS } = require('../get-movies');
const { streamTorrent } = require('../stream');
const { FSFile } = require('../file');
const { pipeline } = require('../utils');

const STATE = {
    files: new Map(),
};

const MIME = new Map([
    ['mp4', 'video/mp4'],
    ['webm', 'video/webm'],
]);

function toFilesMapKey(id, resolution) {
    return `${id}|${resolution}`;
}

function hasWatchedTheMovie({ _id }) {
    const userId = _id.toString();

    return (movie) => {
        const { _id, watchedBy, ...props } = movie.toObject();

        return {
            ...props,
            id: _id,
            watched: watchedBy.some(
                ({ userId: watcherId }) => watcherId.toString() === userId
            ),
        };
    };
}

async function getVideos(req, res) {
    const {
        params: { offset, limit },
        user,
    } = req;
    if (
        offset === undefined ||
        limit === undefined ||
        offset < 0 ||
        limit < 0
    ) {
        send(res, 400);
        return;
    }

    try {
        const movies = await Movie.find()
            .sort({ peersAndSeedsCount: -1, rating: -1 })
            .skip(Number(offset))
            .limit(Number(limit));

        send(res, 200, movies.map(hasWatchedTheMovie(user)));
    } catch (e) {
        console.error(e);
        send(res, 418);
    }
}

async function searchVideos(req, res) {
    try {
        const {
            params: { offset: offsetString, limit: limitString },
            body: { query, genre, year },
            user,
        } = req;
        const offset = Number(offsetString);
        const limit = Number(limitString);
        if (typeof query !== 'string') {
            send(res, 400);
            return;
        }

        let sortBy = { title: 1 };

        let conditions = {};
        if (!(query || genre || year)) {
            // No one field has been filled

            conditions = {};
            sortBy = { peersAndSeedsCount: -1, rating: -1 };
        } else {
            if (typeof query === 'string' && query !== '') {
                conditions.$text = { $search: query };
            }
            if (typeof genre === 'string' && genre !== '') {
                conditions.genres = NORMALIZED_GENDERS.get(genre);
            }
            const yearToNumber = Number(year);
            if (
                typeof year === 'string' &&
                year !== '' &&
                yearToNumber > 1850 &&
                yearToNumber <= 2020
            ) {
                conditions.year = yearToNumber;
            }
        }

        const moviesMoreOne = await Movie.find(conditions)
            .sort(sortBy) // sort the entries by the title, ascending
            .skip(offset)
            .limit(limit + 1);

        const hasMore = moviesMoreOne.length === limit + 1;
        const movies =
            moviesMoreOne.length > limit
                ? moviesMoreOne.slice(0, -1)
                : moviesMoreOne;

        send(res, 200, {
            data: movies.map(hasWatchedTheMovie(user)),
            hasMore,
        });
    } catch (e) {
        console.error(e);
        send(res, 418);
    }
}

async function getVideoInformations(req, res) {
    try {
        const {
            params: { id: imdbId },
            user,
        } = req;

        const movie = await Movie.findOne({ imdbId });
        if (!movie) {
            send(res, 404);
            return;
        }

        send(res, 200, hasWatchedTheMovie(user)(movie));
    } catch (e) {
        console.error(e);
        send(res, 418);
    }
}

async function triggerVideoDownloading(req, res) {
    try {
        const {
            params: { id, resolution },
            user: { favoriteLanguage = 'en' },
        } = req;
        if (!(id && resolution)) {
            send(res, 400);
            return;
        }

        const movie = await Movie.findOne(
            {
                imdbId: id,
                torrents: { $elemMatch: { resolution } },
            },
            {
                torrents: { $elemMatch: { resolution } },
            }
        );
        if (!movie) {
            send(res, 404, {
                error: 'Could not find this movie',
            });
            return;
        }

        let { subtitles } = movie;
        if (!(Array.isArray(movie.subtitles) && movie.subtitles.length === 0)) {
            // Download subtitles

            console.log('save subtitles');

            subtitles = await downloadSubtitles(id);

            await Movie.updateOne(
                { imdbId: id },
                {
                    $push: {
                        subtitles,
                    },
                }
            );
        }

        const {
            torrents: [torrent],
        } = movie;
        const { fsPath, status } = torrent;
        const fsPathExtension = fsPath && extname(fsPath).slice(1);
        const mime =
            fsPath &&
            MIME.get(fsPathExtension === 'mp4' ? fsPathExtension : 'webm');
        const willNeedTranscoding =
            fsPath && !['mp4', 'webm'].includes(fsPathExtension);

        if (fsPath !== undefined && status === TORRENT_STATUSES.LOADED) {
            // Load the movie from the local file system.
            send(res, 200, {
                status: TORRENT_STATUSES.LOADED,
                mime,
                willNeedTranscoding,
            });
            return;
        }
        if (status === TORRENT_STATUSES.FIRST_CHUNKS_LOADED) {
            // Can launch polling.
            send(res, 200, {
                status: TORRENT_STATUSES.FIRST_CHUNKS_LOADED,
                mime,
                willNeedTranscoding,
            });
            return;
        }
        if (status === TORRENT_STATUSES.LOADING) {
            send(res, 200, {
                status: TORRENT_STATUSES.LOADING,
                willNeedTranscoding,
            });
            return;
        }

        await Movie.lock({
            imdbId: id,
            resolution,
        });

        // Lock the torrent.
        // Start downloading the movie.

        const {
            emitter,
            file,
            willNeedTranscoding: streamWillNeedTranscoding,
        } = await streamTorrent(torrent);

        STATE.files.set(toFilesMapKey(id, resolution), file);

        emitter.on('launch', async () => {
            console.log('launch streaming');

            try {
                await Movie.loadedFirstChunks({
                    imdbId: id,
                    resolution,
                    path: file.path,
                });
            } catch (e) {
                console.error(e);
            }
        });

        emitter.on('end', async () => {
            try {
                await Movie.finishedUploading({
                    imdbId: id,
                    resolution,
                });
            } catch (e) {
                console.error(e);
            }
        });

        send(res, 200, {
            subtitles: subtitles.filter(
                ({ langcode }) =>
                    langcode === 'en' || langcode === favoriteLanguage
            ),
            status: TORRENT_STATUSES.LOADING,
            mime: MIME.get(file.extension),
            willNeedTranscoding: streamWillNeedTranscoding,
        });
    } catch (e) {
        console.error(e);

        send(res, 418, {
            error: 'An error occured, please retry',
        });
    }
}

async function getDownloadingStatus(req, res) {
    const {
        params: { id, resolution },
    } = req;
    if (!id) {
        send(res, 400);
        return;
    }

    try {
        const status = await Movie.getTorrentStatus({
            imdbId: id,
            resolution,
        });

        send(res, status === undefined ? 404 : 200, status);
    } catch (e) {
        console.error(e);
        send(res, 418);
    }
}

async function getMovieStream(id, resolution) {
    try {
        const torrentFile = STATE.files.get(toFilesMapKey(id, resolution));
        if (torrentFile !== undefined) {
            console.info('use torrent stream');
            return torrentFile;
        }

        const fsPath = await Movie.getTorrentFSPath({ imdbId: id, resolution });
        if (fsPath === undefined) return undefined;

        console.info('use file stream');
        return new FSFile(fsPath);
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

async function getVideoStream(req, res) {
    const {
        params: { id, resolution },
        user,
    } = req;

    try {
        const file = await getMovieStream(id, resolution);
        if (file === undefined) {
            send(res, 404);
            return;
        }

        // save that the user has watched this movie
        await Movie.addUserToWatchedBySet({
            imdbId: id,
            userId: user._id,
            resolution,
        });

        await file.pipe(res);
    } catch (e) {
        if (e.code === 'ERR_STREAM_PREMATURE_CLOSE') {
            return;
        }

        console.error(e);
        send(res, 418);
    }
}

async function getSubtitleForVideoAndLangcode(req, res) {
    const {
        params: { id, langcode },
    } = req;

    try {
        const movie = await Movie.findOne({
            imdbId: id,
            subtitles: {
                $elemMatch: {
                    langcode,
                },
            },
        });
        if (movie === null) {
            send(res, 404);
            return;
        }

        res.set('Content-Type', 'text/vtt');

        await pipeline(
            createReadStream(
                join(__dirname, '../../public', `${id}-${langcode}.vtt`)
            ),
            res
        );

        console.log('streamed successfully the subtitle');
    } catch (e) {
        console.error(e);

        send(res, 418);
    }
}

async function commentMovie(req, res) {
    try {
        const {
            body: { comment },
            params: { id: imdbId },
            user: { _id: userId },
        } = req;
        if (!(typeof comment === 'string' && comment.length > 0)) {
            send(res, 400, {
                error: 'The comment is not valid',
            });
            return;
        }

        const movie = await Movie.findOne({ imdbId });
        if (movie === null) {
            send(res, 404, {
                error: 'This movie does not exist',
            });
            return;
        }

        await Movie.updateOne(
            {
                imdbId,
            },
            {
                $push: {
                    comments: {
                        _id: mongoose.Types.ObjectId(),
                        userId,
                        comment,
                        createdAt: new Date(),
                    },
                },
            }
        );

        send(res, 200, {
            success: true,
            message: 'The comment has been saved successfully',
        });
    } catch (e) {
        console.error(e);
        send(res, 418, {
            error: 'An error occured during comment saving',
        });
    }
}

async function getCommentsWritersInformations(writers) {
    const writersWithInformations = await Promise.all(
        writers.map((userId) => User.findById(userId))
    );

    return new Map(
        writersWithInformations
            .filter(Boolean)
            .map((writer) => [writer._id.toString(), writer])
    );
}

async function getMovieComments(req, res) {
    try {
        const {
            params: { id: imdbId },
        } = req;

        const commentsDocuments = await Movie.aggregate([
            {
                $match: { imdbId },
            },
            { $unwind: '$comments' },
            {
                $sort: {
                    'comments.createdAt': 1,
                },
            },
        ]);
        if (commentsDocuments === null) {
            send(res, 404, {
                error: 'Could not get comments for this movie',
            });
            return;
        }

        const commentsWithoutWritersInformations = commentsDocuments.map(
            ({ comments }) => comments
        );

        const commentsWritersIds = [
            ...new Set(
                commentsWithoutWritersInformations.map(({ userId }) =>
                    userId.toString()
                )
            ),
        ];
        const commentsWritersInformations = await getCommentsWritersInformations(
            commentsWritersIds
        );

        send(res, 200, {
            imdbId,
            comments: commentsWithoutWritersInformations
                .map(({ _id, comment, createdAt, userId }) => {
                    // Add the writer's informations inside its comment.
                    // If we were with SQL we would not have used such a thing xD.

                    const writerInformations = commentsWritersInformations.get(
                        userId.toString()
                    );
                    if (writerInformations === undefined) return undefined;
                    const { username, profilePicture } = writerInformations;

                    return {
                        id: _id,
                        userId,
                        comment,
                        username,
                        profilePicture,
                        createdAt,
                    };
                })
                .filter(Boolean),
        });
    } catch (e) {
        console.error(e);
        send(res, 418, {
            error: 'An error occured during comments getting',
        });
    }
}

async function streamMoviePosterToClient(req, res) {
    try {
        const {
            params: { id },
        } = req;

        const movie = await Movie.findOne(
            {
                imdbId: id,
            },
            {
                image: 1,
            }
        );
        if (movie === null) {
            throw new Error('Could not get this movie');
        }
        const { image } = movie;

        try {
            const buffer = await got(image).buffer();

            send(res, 200, buffer);
        } catch (e) {
            console.error(e);
        }
    } catch (e) {
        console.error(e);
        send(res, 418, {
            error: 'An error occured during image pipelining',
        });
    }
}

module.exports = {
    getVideos,
    searchVideos,
    getVideoInformations,
    triggerVideoDownloading,
    getDownloadingStatus,
    getVideoStream,
    getSubtitleForVideoAndLangcode,
    commentMovie,
    getMovieComments,
    streamMoviePosterToClient,
};
