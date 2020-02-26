const send = require('@polka/send-type');
const srt2vtt = require('srt-to-vtt');
const { extname } = require('path');

const { Movie, TORRENT_STATUSES } = require('../models/Movie');
const {
    getSubtitles,
    streamSubtitleForMovieAndLangcode,
} = require('../get-movies');
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

    return movie => {
        const { watchedBy, ...props } = movie.toObject();

        return {
            ...props,
            watched: watchedBy.some(objectId => objectId.toString() === userId),
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
        send(res, 500);
    }
}

async function searchVideos(req, res) {
    try {
        const {
            params: { offset, limit },
            body: { query, genre, year },
            user,
        } = req;
        if (typeof query !== 'string') {
            send(res, 400);
            return;
        }

        let sortBy = { title: 1 };

        let conditions = { $text: { $search: query } };
        if (!(query || genre || year)) {
            // No one field has been filled

            conditions = {};
            sortBy = { peersAndSeedsCount: -1, rating: -1 };
        } else {
            if (typeof genre === 'string' && genre !== '') {
                conditions.genres = genre;
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

        const movies = await Movie.find(conditions)
            .sort(sortBy) // sort the entries by the title, ascending
            .skip(Number(offset))
            .limit(Number(limit));

        send(res, 200, movies.map(hasWatchedTheMovie(user)));
    } catch (e) {
        console.error(e);
        send(res, 500);
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

        send(res, 200, {
            ...hasWatchedTheMovie(user)(movie),
            subtitles: await getSubtitles(movie.imdbId),
        });
    } catch (e) {
        console.error(e);
        send(res, 500);
    }
}

async function triggerVideoDownloading(req, res) {
    const {
        params: { id, resolution },
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
        res.end('Not found');
        return;
    }

    const {
        torrents: [torrent],
    } = movie;
    const { fsPath, status } = torrent;
    const fsPathExtension = fsPath && extname(fsPath).slice(1);
    const mime =
        fsPath &&
        MIME.get(fsPathExtension === 'mp4' ? fsPathExtension : 'webm');

    if (fsPath !== undefined && status === TORRENT_STATUSES.LOADED) {
        // Load the movie from the local file system.
        send(res, 200, {
            status: TORRENT_STATUSES.LOADED,
            mime,
        });
        return;
    }
    if (status === TORRENT_STATUSES.FIRST_CHUNKS_LOADED) {
        // Can launch polling.
        send(res, 200, { status: TORRENT_STATUSES.FIRST_CHUNKS_LOADED, mime });
        return;
    }
    if (status === TORRENT_STATUSES.LOADING) {
        send(res, 200, { status: TORRENT_STATUSES.LOADING });
        return;
    }

    await Movie.lock({
        imdbId: id,
        resolution,
    });

    // Lock the torrent.
    // Start downloading the movie.

    const { emitter, file } = await streamTorrent(torrent);

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
        status: TORRENT_STATUSES.LOADING,
        mime: MIME.get(file.extension),
    });
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
        send(res, 500);
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
        });

        await file.pipe(res);
    } catch (e) {
        if (e.code === 'ERR_STREAM_PREMATURE_CLOSE') {
            return;
        }

        console.error(e);
        send(res, 500);
    }
}

async function getSubtitleForVideoAndLangcode(req, res) {
    const {
        params: { id, langcode },
    } = req;

    try {
        const srtSubtitleStream = await streamSubtitleForMovieAndLangcode(
            id,
            langcode
        );
        if (srtSubtitleStream === null) {
            send(res, 400);
            return;
        }

        res.set('Content-Type', 'text/vtt');

        await pipeline(srtSubtitleStream, srt2vtt(), res);

        console.log('streamed successfully the subtitle');
    } catch (e) {
        console.error(e);
        send(res, 500);
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

        movie.comments.push({
            userId,
            comment,
        });

        await movie.save();

        send(res, 200, {
            success: true,
            message: 'The comment has been saved successfully',
        });
    } catch (e) {
        console.error(e);
        send(res, 500, {
            error: 'An error occured during comment saving',
        });
    }
}

async function getMovieComments(req, res) {
    try {
        const {
            params: { id: imdbId },
        } = req;

        const movie = await Movie.findOne({ imdbId }).sort({ createdAt: -1 });
        if (movie === null) {
            send(res, 404, {
                error: 'Could not get comments for this movie',
            });
            return;
        }

        send(res, 200, {
            imdbId,
            comments: movie.toObject().comments,
        });
    } catch (e) {
        console.error(e);
        send(res, 500, {
            error: 'An error occured during comments getting',
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
};
