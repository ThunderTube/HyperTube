const { Router } = require('express');

const {
    getVideos,
    getVideoInformations,
    triggerVideoDownloading,
    getDownloadingStatus,
    getVideoStream,
} = require('../controllers/stream');

const router = Router();

router
    .get('/videos/:offset/:limit', getVideos)
    .get('/video/:id', getVideoInformations)
    .get('/video/download/:id/:resolution', triggerVideoDownloading)
    .get('/video/status/:id/:resolution', getDownloadingStatus)
    .get('/video/chunks/:id/:resolution', getVideoStream);

module.exports = router;
