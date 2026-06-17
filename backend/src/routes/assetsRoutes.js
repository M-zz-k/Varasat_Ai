const express = require('express');
const router  = express.Router();
const { 
  handleGetGraph, 
  handleSaveGraph, 
  handleBuildFromExtraction, 
  handleBuildComplexFromExtraction, 
  handleResolveEntities,
  handleFinalEnhancementData,
  handleExplainMap 
} = require('../controllers/assetsController');

// GET /api/assets/graph
router.get('/graph', handleGetGraph);

// POST /api/assets/graph
router.post('/graph', handleSaveGraph);

// POST /api/assets/build-from-extraction
router.post('/build-from-extraction', handleBuildFromExtraction);

// POST /api/assets/build-complex-from-extraction
router.post('/build-complex-from-extraction', handleBuildComplexFromExtraction);

// POST /api/assets/resolve-entities
router.post('/resolve-entities', handleResolveEntities);

// GET /api/assets/final-enhancement/:familyId
router.get('/final-enhancement/:familyId', handleFinalEnhancementData);

// POST /api/assets/explain-map
router.post('/explain-map', handleExplainMap);

module.exports = router;
