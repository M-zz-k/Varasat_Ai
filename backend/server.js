require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
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

app.use('/api/chat',      chatRoutes);
app.use('/api/document',  documentRoutes);
app.use('/api/claim',     claimRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assets',    assetsRoutes);

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
app.listen(PORT, () => {
  console.log(`✅ Varasat backend running on http://localhost:${PORT}`);
});
