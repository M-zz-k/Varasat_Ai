# Varasat AI 🏛️

> **Next-Generation AI-powered dormant wealth recovery for Indian families.**  
> Automatically discover, analyze, and claim forgotten assets—including dormant savings accounts, unclaimed insurance policies (LIC), provident funds (EPFO), and mutual fund shares.

---

## 🌟 Vision & Key Capabilities

Every year, thousands of crores in Indian assets go unclaimed because heirs are unaware of their family members' historical investments or are intimidated by complex institutional bureaucracy. Varasat AI bridges this gap with an intuitive, secure, and visually stunning solution.

*   **3D Fibonacci Card Gallery**: An interactive, weightless tag cloud built using **Three.js** and **React Three Fiber**. Arrange 30+ photo cards in a responsive sphere that drifts via positional wave noise, responds dynamically to cursor movements, and scales with a golden halo glow on hover.
*   **Centered Voice Assistant Command Hub**: A direct, zero-clicks audio interaction console (powered by Groq Whisper) that answers complex legal succession queries in both **Hindi** and **English**.
*   **HDFC/ICICI-Inspired Premium Aesthetics**: A cohesive design featuring custom dot-grid backgrounds (`.bg-grid-dots`), glassmorphic containers (`.glass-premium`), and glowing depth orbs.
*   **Automated Document Generation**: Instantly draft legally compliant succession documents (Affidavits, Indemnity Bonds, and Claim Letters) and download them locally as PDFs.

---

## 🗺️ The Varasat Journey

The platform provides a step-by-step pipeline ensuring families are guided from document discovery to final recovery:

```
Ingest Scan/PDF ➔ AI Field Extraction ➔ Inflation Loss Analytics ➔ Stage Journey Tracker ➔ Succession PDF Generator
```

---

## 🧭 Application Blueprint & Portals

The prototype features discrete frontend routes optimized for specific phases of the recovery process:

| Route | Portal / Page | Functional Scope | Aesthetic Elements |
|---|---|---|---|
| `/` | **Home Portal** | Main dashboard hub featuring the Three.js card gallery and centered voice command input. | Responsive 3D perspective grids, cursor tracking. |
| `/upload` | **Document Upload** | Drag-and-drop ingestion interface for bank statements, certificates, and policies. | Glassmorphic dropzone, interactive confidence indicators, editable tables. |
| `/chat` | **Varasat Mitra** | Conversational legal assistant detailing succession processes (Hindu Succession Act, etc.). | Pulsing chat indicators, English/Hindi language selectors. |
| `/assets` | **Asset Discovery** | Relation graph connecting deceased relatives to claims and institutions using React Flow. | Color-coded status paths, amber glows. |
| `/tracker` | **Claim Tracker** | Milestone roadmap tracing institutional audits and timeline logs. | Vertical milestone pipelines with custom status indicators. |
| `/analytics` | **Analytics** | Loss calculator computing the compound impact of inflation on delayed asset releases. | Premium Recharts containers, custom math indicators. |
| `/documents` | **Document Generator** | Selection portal for generating formal legal PDFs. | Sleek dropdown select matrices, loading spin overlays. |
| `/demo` | **Demo Sandbox** | Simulated sandbox showing a pre-loaded claim recovery path for testing. | Layered workflow card columns. |
| `/login` | **Bank Partner Login** | Entrance gate for financial partners to verify incoming claims. | Glass-premium login card, smooth OTP step transitions. |

---

## 🛠️ Stack & Technologies

*   **Frontend**: React + Vite, Three.js, React Three Fiber (R3F), `@react-three/drei`, Tailwind CSS v4, React Flow, Recharts, Zustand.
*   **Backend**: Node.js + Express, Multer, PDF-Parse.
*   **AI Engine**:
    *   *Structured Document Extraction*: Google Gemini 2.5 Flash Vision.
    *   *Succession Analysis & Chat*: Groq Llama 3.3 70B.
    *   *Voice Command Input*: Groq Whisper Large v3.
*   **PDF Generation**: PDFKit (runs locally in Node, eliminating external print costs).

---

## 🚀 Quick Start & Development Setup

### 1. Prerequisite Installations
Ensure you have **Node.js** (v18+) and **npm** installed. Clone the repository and install all dependencies:
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

### 2. Configure Environment Keys
Create a `.env` file in the `/backend` folder:
```env
PORT=5000
JWT_SECRET=your_secret_key_here
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```
> **No Credit Card Required**: Free developer accounts from [Groq Console](https://console.groq.com) and [Google AI Studio](https://aistudio.google.com) provide generous rate limits that fully support the application in development and sandbox testing.

### 3. Run the Servers
Launch both servers in development mode:
```bash
# Start backend (run from /backend directory)
npm run dev

# Start frontend (run from /frontend directory)
npm run dev
```
By default, the backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## 🧪 Testing the Prototype

1.  **Demo Mode**: Open the dashboard and click **Try Demo Mode**. Use the preloaded dataset for **Ramesh Kumar** to experience the full claim workflow.
2.  **Mock Document Upload**: In the upload screen, drag a sample statement or receipt. If you don't have a document, click **Load Mock Document** to test the Gemini extraction pipeline.
3.  **Claim Tracking**: Navigate to the Journey Tracker and enter `CLM-1718091234` to view progress status logs.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.