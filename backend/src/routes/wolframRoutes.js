'use strict';

const express = require('express');
const router = express.Router();
const { handleAnalyze } = require('../controllers/wolframController');

// Unified Endpoint for the Core Financial Intelligence Engine
router.post('/analyze', handleAnalyze);

module.exports = router;
