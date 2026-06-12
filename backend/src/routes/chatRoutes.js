const express = require('express');
const router  = express.Router();
const { handleChat, handleClearSession } = require('../controllers/chatController');

// POST /api/chat        — send a message, get an AI reply
router.post('/', handleChat);

// POST /api/chat/clear  — wipe session history (start fresh)
router.post('/clear', handleClearSession);

module.exports = router;
