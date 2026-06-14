'use strict';

const express = require('express');
const router = express.Router();
const { handleFullAnalysis } = require('../controllers/wolframController');

// Unified Endpoint for the Major Wolfram Engine Expansion
router.post('/full-analysis', handleFullAnalysis);

module.exports = router;
