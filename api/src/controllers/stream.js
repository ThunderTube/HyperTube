const send = require('@polka/send-type');

const { Movie, TORRENT_STATUSES } = require('../models/Movie');
const { getSubtitles } = require('../get-movies');
const { streamTorrent } = require('../stream');
const { FSFile } = require('../file');

const STATE = {
    files: new Map(),
};

function toFilesMapKey(id, resolution) {
    return `${id}|${resolution}`;
}

async function getVideos(req, res) {
    const {
        params: { offset, limit },
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
            .skip(Number(offset))
            .limit(Number(limit));

        send(res, 200, movies);
    } catch (e) {
        console.error(e);
        send(res, 500);
    }
}

async function getVideoInformations(req, res) {
    try {
        const movie = await Movie.findOne({ imdbId: req.params.id });
        if (!movie) {
            send(res, 404);
            return;
        }

        send(res, 200, {
            ...movie.toObject(),
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
    console.log('triggerVideoDownloading', id, resolution);
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

    if (fsPath !== undefined && status === TORRENT_STATUSES.LOADED) {
        // Load the movie from the local file system.
        send(res, 200, TORRENT_STATUSES.LOADED);
        return;
    }
    if (status === TORRENT_STATUSES.FIRST_CHUNKS_LOADED) {
        // Can launch polling.
        send(res, 200, TORRENT_STATUSES.FIRST_CHUNKS_LOADED);
        return;
    }
    if (status === TORRENT_STATUSES.LOADING) {
        send(res, 200, TORRENT_STATUSES.LOADING);
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

    send(res, 200, TORRENT_STATUSES.LOADING);
}

async function getDownloadingStatus(req, res) {
    const {
        params: { id, resolution },
    } = req;
    console.log('getDownloadingStatus', id, resolution);
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
    } = req;

    try {
        const file = await getMovieStream(id, resolution);
        if (file === undefined) {
            send(res, 404);
            return;
        }

        await file.pipe(res);
    } catch (e) {
        if (e.code === 'ERR_STREAM_PREMATURE_CLOSE') {
            return;
        }

        console.error(e);
        send(res, 500);
    }
}

module.exports = {
    getVideos,
    getVideoInformations,
    triggerVideoDownloading,
    getDownloadingStatus,
    getVideoStream,
};
