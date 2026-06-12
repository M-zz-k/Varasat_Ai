# 🪙 Varasat — AI-Powered Inheritance Recovery Platform

Varasat helps Indian families discover and recover deceased family members' financial assets through AI guidance, document processing, and legal claim generation.

## Project Structure

```
Varasat_Project/
├── frontend/      # React + Vite + Tailwind CSS
├── backend/       # Node.js + Express + Claude AI
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
npm install
# Add your ANTHROPIC_API_KEY in .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Route                   | Description              |
|--------|-------------------------|--------------------------|
| GET    | /                       | Health check             |
| POST   | /api/chat               | Chat with Varasat Mitra  |
| POST   | /api/document/upload    | Upload documents         |
| POST   | /api/claim/analyze      | Analyze a claim          |

## Environment Variables (backend/.env)

```
ANTHROPIC_API_KEY=your_key_here
PORT=5000
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI**: Anthropic Claude API
- **Documents**: PDFKit, Multer
- **Database**: JSON mock (PostgreSQL-ready structure)
