const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { join, extname } = require('path');
const stream = require('stream');
const { promisify } = require('util');

const pipeline = promisify(stream.pipeline);

const SUPPORTED_EXTENSIONS = new Set(['mp4', 'webm']);

function transcode(extension, inputStream) {
    if (SUPPORTED_EXTENSIONS.has(extension)) {
        return inputStream;
    }

    // Transcode the video stream to a WebM stream
    // Cf. https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/274
    return ffmpeg(inputStream)
        .on('start', () => console.log('start transcoding'))
        .on('error', error => console.error('error during transcoding', error))
        .format('webm')
        .withVideoCodec('libvpx')
        .addOptions(['-qmin 0', '-qmax 50', '-crf 5'])
        .withVideoBitrate(1024)
        .withAudioCodec('libvorbis')
        .stream();
}

class TorrentFile {
    constructor(file, basePath) {
        this.file = file;
        this.size = file.length
        this.finishedFSDownloading = false;
        this.fsPath = join(basePath, file.path);
        this.extension = extname(file.path).slice(1);
    }

    get path() {
        return this.file.path;
    }

    pipe(writeStream) {
        let readStream = null;

        if (this.finishedFSDownloading === true) {
            // get the file from the FS
            readStream = fs.createReadStream(this.fsPath);
        } else {
            // use the torrent stream
            readStream = this.file.createReadStream();
        }

        return pipeline(this.transcode(readStream), writeStream);
    }

    transcode(inputStream) {
        return transcode(this.extension, inputStream);
    }

    async finishDownloading() {
        // const { size: fileSize } = await stat(this.fsPath);

        this.finishedFSDownloading = true;
    }
}

exports.TorrentFile = TorrentFile;
exports.transcode = transcode;
