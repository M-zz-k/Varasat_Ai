# Varasat AI 🏛️
> **Next-Generation AI-powered dormant wealth recovery for Indian families.**  
> Effortlessly discover and claim forgotten family assets—including dormant bank accounts, unclaimed LIC policies, provident funds, and mutual fund shares.

---

## ✨ Interface Modernization & Current Prototype Status

Varasat AI has been upgraded from a basic interface to a high-fidelity, premium light-mode design matching professional financial systems. Key elements of the current prototype include:

### 1. 3D Spherical Card Gallery
- **Fibonacci Spiral Cloud**: Arranges portrait photo cards of Indian individuals evenly in a 3D spherical structure.
- **Anti-Gravity Float**: Realized using independent positional wave noise on each card, making them drift weightlessly in space.
- **Dynamic Mouse Interaction**: The entire sphere tilts and rotates in response to cursor movements, and cards scale up with a golden halo glow on hover.

### 2. Centered Voice Assistant Hub
- Positioned directly in the center of the homepage.
- Supports real-time spoken commands and queries in both **Hindi** and **English** (powered by Groq Whisper).

### 3. Glassmorphic Surface Styling
- Encapsulated in translucent cards (`.glass-premium`) utilizing custom dot-grid backgrounds (`.bg-grid-dots`).
- Includes smooth keyframe pulsing background depth orbs (amber and indigo) and physical shadow systems (`.shadow-3d-gold` / `.shadow-3d-blue`).

---

## 🧭 Application Blueprint & User Journey

```
Ingest Scan/PDF ➔ AI Field Extraction ➔ Inflation Impact Analysis ➔ Journey Tracker Checklist ➔ Succession PDF Generator
```

### Pages & Sub-systems

| Route | Page | Description | Special Aesthetics |
|---|---|---|---|
| `/` | **Home** | Landing portal with 3D Spherical Gallery, centered Voice command hub, and Ecosystem cards. | 3D Perspective preserves, interactive hover tilt. |
| `/upload` | **Document Upload** | Drag-and-drop ingestion for scans, bank statements, or policies with Gemini extraction. | Advanced upload dropzone, confidence indicators, raw JSON edits. |
| `/chat` | **Varasat Mitra** | Multi-lingual guide assisting users with Indian legal succession rules. | Glassmorphic floating prompts, clean message bubbles. |
| `/assets` | **Asset Discovery** | Family-to-institution relationship graph using interactive node networks. | Custom React Flow nodes with amber status glows. |
| `/tracker` | **Claim Tracker** | Milestone roadmap tracing operational claims timelines. | Step timelines, ledger checkboxes, and action shortcuts. |
| `/analytics` | **Analytics** | Compound loss inflation impact simulator powered by Wolfram Language math. | Premium interactive chart panels, custom Recharts graphs. |
| `/documents` | **Document Generator** | Automated generation of required legal text and affidavits. | Glass-premium forms, automated local PDF downloads. |
| `/demo` | **Demo Sandbox** | Simulated prototype walkthrough with mock family claims. | Stage card panels, preloaded demo scenarios. |

---

## 🛠️ Stack & Technologies

- **Frontend**: React + Vite, Three.js, React Three Fiber (R3F), `@react-three/drei`, Tailwind CSS v4, React Flow, Recharts, Zustand.
- **Backend**: Node.js + Express, Multer, PDF-Parse.
- **AI Core**: Google Gemini 2.5 Flash Vision (structured document extraction), Groq Llama 3.3 70B (succession query & claim scoring), Groq Whisper Large v3 (voice recognition).
- **PDF Core**: PDFKit (local generation, no external APIs needed).

---

## 🚀 Quick Start & Development Setup

### 1. Installation
Clone the repository, install dependencies, and set up your local environment file:
```bash
git clone https://github.com/M-zz-k/Varasat_Ai.git
cd Varasat_Ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```
> **Note**: Free-tier developer keys work perfectly. No paid accounts or credit cards are required.

### 3. Execution
Start the services in development mode:
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

---

## 📜 License

MIT License.