const express = require('express');
const router  = express.Router();
const { handleGetGraph, handleSaveGraph, handleBuildFromExtraction } = require('../controllers/assetsController');

// GET /api/assets/graph
router.get('/graph', handleGetGraph);

// POST /api/assets/graph
router.post('/graph', handleSaveGraph);

// POST /api/assets/build-from-extraction
router.post('/build-from-extraction', handleBuildFromExtraction);

module.exports = router;
