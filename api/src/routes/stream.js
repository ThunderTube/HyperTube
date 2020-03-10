const { Router } = require('express');

const {
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
} = require('../controllers/stream');
const { POSSIBLE_GENRES } = require('../get-movies');

const router = Router();

router
    .get('/genres', (_req, res) => res.json(POSSIBLE_GENRES))
    .get('/videos/:offset/:limit', getVideos)
    .post('/videos/search/:offset/:limit', searchVideos)
    .get('/video/:id', getVideoInformations)
    .post('/video/:id/comment', commentMovie)
    .get('/video/:id/comments', getMovieComments)
    .get('/video/download/:id/:resolution', triggerVideoDownloading)
    .get('/video/status/:id/:resolution', getDownloadingStatus)
    .get('/video/chunks/:id/:resolution', getVideoStream)
    .get('/subtitles/:id-:langcode.vtt', getSubtitleForVideoAndLangcode)
    .get('/poster/:id', streamMoviePosterToClient);

module.exports = router;
