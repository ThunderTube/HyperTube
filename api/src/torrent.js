const torrentStream = require('torrent-stream');
const { join, extname } = require('path');
const EventEmitter = require('events');

const { TorrentFile } = require('./file');

function lastContinuousElement(elements) {
    const sortedElements = [...elements].sort((a, b) => a - b);
    let last = 0;

    for (let i = 0; i < sortedElements.length; i += 1) {
        const chunk = sortedElements[i];
        last = chunk;

        if (!sortedElements.includes(chunk + 1)) return last;
    }
    return last;
}

class Torrent {
    constructor(magnetUrn) {
        this.engine = torrentStream(magnetUrn, {
            path: join(__dirname, '../movies'),
            trackers: [
                'udp://open.demonii.com:1337/announce',
                'udp://tracker.openbittorrent.com:80',
                'udp://tracker.coppersurfer.tk:6969',
                'udp://glotorrents.pw:6969/announce',
                'udp://tracker.opentrackr.org:1337/announce',
                'udp://torrent.gresille.org:80/announce',
                'udp://p4p.arenabg.com:1337',
                'udp://tracker.leechers-paradise.org:6969',
            ],
        });

        this.AUTHORIZED_EXTENSIONS = ['.mp4', '.mkv', '.webm'];
        this.file = null;
    }

    get willNeedTranscoding() {
        const ext = extname(this.file.path).slice(1);

        return !['webm', 'mp4'].includes(ext);
    }

    get extension() {
        if (this.file === null) return null;

        const ext = extname(this.file.path).slice(1);

        return ext === 'mp4' ? ext : 'webm';
    }

    download() {
        const loadedChunks = new Map();
        const emitter = new EventEmitter();
        let piecesCount = 0;
        let permittedDownloading = false;

        return new Promise((resolve, reject) => {
            this.engine.on('ready', () => {
                const file = this.engine.files.find(({ name }) =>
                    this.AUTHORIZED_EXTENSIONS.some(ext => name.endsWith(ext))
                );
                if (file === undefined) {
                    reject(new Error('Could not get a film for this torrent'));
                    return;
                }

                // Select the file in order to request its downloading
                file.select();

                this.file = new TorrentFile(file, this.engine.path);

                resolve({
                    emitter,
                    file: this.file,
                    willNeedTranscoding: this.willNeedTranscoding,
                });
            });

            this.engine.on('torrent', ({ pieces }) => {
                piecesCount = pieces.length;
                console.log('pieces length = ', pieces.length);
            });

            this.engine.on('download', (index, buffer) => {
                loadedChunks.set(index, buffer.length);

                const lastEl = lastContinuousElement([...loadedChunks.keys()]);
                const loadedBytes = [...loadedChunks.entries()]
                    .sort(([a], [b]) => a - b)
                    .reduce((bytesCount, [i, bytesLength]) => {
                        if (i > lastEl) return bytesCount;

                        return bytesCount + bytesLength;
                    }, 0);

                const percent = (100 * lastEl) / piecesCount;

                const MIN_FILE_BYTES_DOWNLOADED_PERCENT = 2;

                if (
                    loadedBytes >=
                        (this.file.size / 100) *
                            MIN_FILE_BYTES_DOWNLOADED_PERCENT &&
                    !permittedDownloading
                ) {
                    emitter.emit('launch');
                    permittedDownloading = true;
                }

                console.log(
                    'downloading ...',
                    percent,
                    `loaded ${loadedBytes} bytes`
                );
            });

            this.engine.on('idle', () => {
                this.file.finishDownloading();
                emitter.emit('end');
            });
        });
    }

    destroy() {
        this.engine.destroy();
    }
}

module.exports.Torrent = Torrent;
