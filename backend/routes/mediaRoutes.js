const express = require('express');
const { uploadMedia, addTextMedia, listMedia } = require('../controllers/mediaController');
const router = express.Router();

router.post('/upload', uploadMedia);
router.post('/text', addTextMedia);
router.get('/', listMedia);

module.exports = router;
