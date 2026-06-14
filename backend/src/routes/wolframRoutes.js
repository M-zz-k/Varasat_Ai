'use strict';

const express = require('express');
const router = express.Router();
const wolframController = require('../controllers/wolframController');

// Define Wolfram analysis route
router.post('/analyze', wolframController.analyzeAssets);

module.exports = router;
