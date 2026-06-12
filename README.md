# Varasat AI 🏛️

> AI-powered dormant wealth recovery for Indian families — unclaimed bank accounts, LIC policies, provident funds, and shares.

---

## What it does

Varasat guides claimants from document upload to legal PDF generation, with an AI chat assistant (Varasat Mitra) available in Hindi and English throughout.

```
Upload document → AI extracts fields → Analyze risk → Track journey → Generate legal PDF
```

---

## Stack

**Frontend** — React + Vite, Tailwind CSS v4, React Router, React Flow, Recharts  
**Backend** — Node.js + Express  
**AI** — Groq (Llama 3.3 70B + Whisper), Google Gemini 2.5 Flash Vision  
**PDF** — pdfkit (local, no API needed)

> No paid APIs. Both Groq and Gemini offer generous free tiers with no credit card.

---

## Quick start

```bash
git clone https://github.com/M-zz-k/Varasat_Ai.git
cd Varasat_Ai
npm install
cp .env.example .env   # add your keys (see below)
npm run dev
```

### Free API keys needed

| Key | Where to get | Free limit |
|---|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | 1,000 req/day · no card |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | 1,500 req/day · no card |

```env
GROQ_API_KEY=
GEMINI_API_KEY=
JWT_SECRET=
PORT=5000
```

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Landing with entry portals |
| `/upload` | Document Upload | Drag-and-drop OCR extraction |
| `/chat` | Varasat Mitra | AI chat guide (Hindi/English) |
| `/assets` | Asset Graph | React Flow family-to-asset map |
| `/tracker` | Journey Tracker | Claim progress roadmap |
| `/analytics` | Analytics | Compound loss calculator |
| `/documents` | Document Generator | Succession affidavits & claim letters |
| `/demo` | Demo Mode | Full sandbox walkthrough |

---

## API endpoints

| Endpoint | Powered by |
|---|---|
| `POST /api/chat` | Groq Llama 3.3 70B |
| `POST /api/chat/voice` | Groq Whisper Large v3 |
| `POST /api/document/analyze` | Gemini 2.5 Flash Vision |
| `POST /api/document/generate-pdf` | pdfkit (local) |
| `POST /api/claim/analyze` | Groq Llama 3.3 70B |
| `POST /api/analytics/impact` | Pure Node.js math |

---

## License

MIT