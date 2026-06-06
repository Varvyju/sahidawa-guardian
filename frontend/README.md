# SahiDawa Guardian

SahiDawa Guardian is a hackathon demo for a production-style health agent: it explains medicines, checks risky combinations, remembers checked medicines, and blocks sensitive actions behind explicit user approval.

## Winning Demo

1. Start backend on port `8000`.
2. Start frontend with `npm run dev`.
3. Open the Type tab.
4. Use `Warfarin` as the medicine and `Aspirin` as context.
5. Show the high-risk warning, approval gate, memory, and audit trail.

## Why It Fits The Hackathon

- Real work: identifies medication risk and prepares caregiver escalation.
- Agent safety: scoped permission gate before external action.
- Production pattern: memory, trace source, latency, fallback mode, audit hash.
- Impact: Indian families can understand medicines in simple English, Hindi, and Kannada.

## Environment Variables

Set keys in the terminal, never in source code:

```powershell
$env:GEMINI_API_KEY="..."
$env:GROQ_API_KEY="..."
```

The backend has an offline safety pack, so the demo still runs if model APIs fail.
