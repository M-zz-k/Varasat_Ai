const express = require('express');
const router  = express.Router();
const { analyzeClaim, getClaimStatus } = require('../controllers/claimController');

// POST /api/claim/analyze
router.post('/analyze', analyzeClaim);

// GET /api/claim/:claimId
router.get('/:claimId', getClaimStatus);

module.exports = router;
