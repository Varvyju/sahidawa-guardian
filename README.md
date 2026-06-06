# SahiDawa Guardian 💊
### Autonomous Medication Safety Agent for Indian Families

> *"My grandmother takes six medicines every day. She cannot read the English name on the strip. She doesn't know what to avoid, what side effects are dangerous, or whether two medicines conflict. She just takes them and hopes. 600 million Indians are exactly like her."*

**SahiDawa Guardian** is not a medicine chatbot. It is a permissioned health agent — built for the Hackhome Inauguration Hackathon, Bengaluru, June 2026.

---

## 🎯 What It Does

| Feature | Description |
|---|---|
| 💊 Medicine Analysis | Identifies any medicine by name or photo, explains in simple language |
| 🌐 Trilingual | English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ) — with voice readout |
| ⚠️ Interaction Checker | Detects dangerous drug combinations (e.g. Warfarin + Aspirin = HIGH RISK) |
| 🔐 Permission Gate | High-risk actions require explicit user approval before agent acts |
| 🕘 Persistent Memory | Remembers every medicine checked across sessions |
| 🛡️ Audit Trail | Every agent action is timestamped and hash-linked — tamper-evident |
| 📴 Offline Fallback | Agent never crashes — degrades gracefully when cloud API unavailable |

---

## 🏗️ Architecture

```
User (Phone/Browser)
        ↓
React Frontend (Vite)
        ↓
FastAPI Backend (Python)
        ↓
┌───────────────────────┐
│  NVIDIA NIM           │  ← Text analysis (Llama 3.3 70B)
│  Gemini 1.5 Flash     │  ← Image/Vision analysis  
│  Offline Safety Pack  │  ← Fallback when APIs unavailable
└───────────────────────┘
```

**Every agent action flows through:**
1. Scoped permission check
2. LLM reasoning (NVIDIA NIM / Gemini)
3. Risk scoring (0-100 safety score)
4. Human approval gate (for high-risk actions)
5. Audit log entry with SHA hash

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- NVIDIA NIM API key (free at [build.nvidia.com](https://build.nvidia.com))
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend
```bash
cd backend
pip install fastapi uvicorn httpx python-multipart pydantic --only-binary=:all:

# Add your API keys in main.py:
# GEMINI_API_KEY = "your_key"
# GROQ_API_KEY = "your_nvidia_or_groq_key"

python main.py
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Test it
Open browser → `http://localhost:5173`
- Type `Warfarin` → click Run guardian check
- See 34/100 red safety score + permission gate
- Switch to हिन्दी tab
- Go to Interactions → add Warfarin + Aspirin → HIGH RISK
- Check Audit Log → see full tamper-evident trail

---

## 🔌 API Endpoints

```
POST /analyze/text     — Analyze medicine by name (NVIDIA NIM)
POST /analyze/image    — Analyze medicine from photo (Gemini Vision)
POST /check/interactions — Check drug-drug interactions
GET  /health           — Health check + model status
```

---

## 🎯 Demo Flow (For Judges)

1. **Type tab** → `Warfarin` + other medicines: `Aspirin` → Run guardian check
2. Shows **34/100 red safety score** + "Approval required"
3. Switch to **हिन्दी** tab → full Hindi explanation
4. Switch to **ಕನ್ನಡ** tab → full Kannada explanation
5. Scroll to **Scoped action gate** → click Approve caregiver alert
6. Open **Audit Log** → shows full timestamped trail with audit hashes
7. **Interactions tab** → Warfarin + Aspirin → HIGH RISK card
8. **Memory tab** → persistent history across sessions

---

## 🏆 Hackathon Tracks

Built for **Hackhome Inauguration Hackathon** — June 6, 2026, Bengaluru

Submitted to: **General Track**

Addresses all judging criteria:
- **Innovation (25%)** — Permission gate + audit trail for health agents
- **Technical Complexity (25%)** — NVIDIA NIM + Gemini Vision + offline fallback
- **Impact (25%)** — 600M Indians, medication errors cause 5.8L deaths/year in India
- **Presentation (25%)** — Live demo, emotional story, trilingual

---

## 🛡️ Agent Design Principles

SahiDawa Guardian follows production agent patterns:

- **Scoped permissions** — agent cannot notify caregiver without explicit user approval
- **Graceful degradation** — offline safety pack activates when cloud APIs fail
- **Immutable audit log** — every action hash-linked, tamper-evident
- **Human in the loop** — all high-risk actions require human authorization
- **Persistent memory** — agent remembers across sessions via localStorage

---

## ⚕️ Disclaimer

SahiDawa Guardian provides patient education only. It does not diagnose, prescribe, or replace a registered clinician. Always consult a doctor or pharmacist before changing medication.

---

## 👨‍💻 Builder

**Varun Namavali** — Data Science Analyst, Bengaluru
Built solo at Hackhome Inauguration Hackathon in ~5 hours.

*Powered by NVIDIA NIM · Google Gemini · FastAPI · React*
