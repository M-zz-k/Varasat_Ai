require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173'] 
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
const chatRoutes      = require('./src/routes/chatRoutes');
const documentRoutes  = require('./src/routes/documentRoutes');
const claimRoutes     = require('./src/routes/claimRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const assetsRoutes    = require('./src/routes/assetsRoutes');
const wolframRoutes   = require('./src/routes/wolframRoutes');
const ttsRoutes       = require('./src/routes/ttsRoutes');

app.use('/api/chat',      chatRoutes);
app.use('/api/document',  documentRoutes);
app.use('/api/claim',     claimRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assets',    assetsRoutes);
app.use('/api/wolfram',   wolframRoutes);
app.use('/api/tts',       ttsRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Varasat AI Backend' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅ Varasat backend running on http://localhost:${PORT}`);
  console.log(`🔑 Groq API: ${process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' ? '✅ Configured' : '❌ NOT SET — running in offline mode'}`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? '✅ Configured' : '⚠️  Not set — document OCR will use mock data'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`   Run this to fix it: npx kill-port ${PORT}`);
    console.error(`   Or close the other terminal running the backend.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
