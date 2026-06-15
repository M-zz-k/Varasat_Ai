const express = require('express');
const router  = express.Router();
const { handleTTS } = require('../controllers/ttsController');

// POST /api/tts  — generate spoken audio for given text + language
router.post('/', handleTTS);

module.exports = router;
