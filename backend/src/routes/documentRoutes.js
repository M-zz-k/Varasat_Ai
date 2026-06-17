'use strict';

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const router   = express.Router();

const { handleUpload, handleAnalyze, handleGeneratePDF, handleAnalyzeComplex } = require('../controllers/documentController');

// ─── Shared Multer config ─────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../src/uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req,  file, cb) => {
    const stamp  = Date.now();
    const rand   = Math.round(Math.random() * 1e9);
    const safe   = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${stamp}-${rand}-${safe}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload PDF, JPG, or PNG.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/document/upload   — basic file save (original endpoint)
router.post('/upload', upload.single('document'), handleUpload);

// POST /api/document/analyze  — upload + Claude Vision AI extraction
//   Field name expected: "file"
router.post('/analyze', upload.single('file'), handleAnalyze);

// POST /api/document/analyze-complex
router.post('/analyze-complex', upload.single('file'), handleAnalyzeComplex);

// POST /api/document/generate-pdf — AI Document Generation + PDF streaming
router.post('/generate-pdf', express.json(), handleGeneratePDF);

module.exports = router;
