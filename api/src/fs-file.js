const fs = require('fs');
const { join, extname } = require('path');
const stream = require('stream');
const { promisify } = require('util');

const { transcode } = require('./torrent-file');

const pipeline = promisify(stream.pipeline);

class FSFile {
    constructor(path) {
        this.ppath = join(__dirname, './movies', path);
        this.extension = extname(path).slice(1);
    }

    get path() {
        return this.ppath;
    }

    pipe(writeStream) {
        const readStream = fs.createReadStream(this.ppath);

        return pipeline(this.transcode(readStream), writeStream);
    }

    transcode(inputStream) {
        return transcode(this.extension, inputStream);
    }
}

exports.FSFile = FSFile;
