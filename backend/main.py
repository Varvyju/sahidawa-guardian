import base64
import hashlib
import json
import os
import re
import time
from datetime import datetime, timezone
from typing import Any

import httpx
import uvicorn
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="SahiDawa Guardian API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
#GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GEMINI_API_KEY="AQ.Ab8RN6Jy4lm8F8_jOAJn6lq2L72TeBWqmczKkHvrYvI-vNVCbw"
GROQ_API_KEY="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"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

AUDIT_LOG: list[dict[str, Any]] = []

SYSTEM_PROMPT = """You are SahiDawa Guardian, a trusted autonomous medication safety agent for Indian families.
When given a medicine name or image, respond only with valid JSON in this exact shape:
{
  "medicine_name": "Full medicine name",
  "generic_name": "Generic or salt name",
  "used_for": "Simple explanation of what condition it treats",
  "how_to_take": "When and how to take it",
  "avoid": ["food, drink, medicine, or activity to avoid"],
  "side_effects": ["common side effect"],
  "warning": "Critical safety warning, or empty string",
  "interaction_alert": "Drug interaction warning if patient mentions other medicines, or empty string",
  "translations": {
    "hindi": {"used_for": "", "how_to_take": "", "warning": ""},
    "kannada": {"used_for": "", "how_to_take": "", "warning": ""}
  },
  "safety_score": 85,
  "emergency": false,
  "requires_permission": false
}
Rules:
- Use simple patient-friendly language.
- Never diagnose or prescribe.
- If the medicine is unknown, set medicine_name to "Unknown Medicine".
- requires_permission must be true for blood thinners, controlled medicines, severe interactions, pregnancy warnings, or safety_score under 50.
- Return JSON only.
"""

INTERACTION_PROMPT = """You are a drug interaction checker for Indian patients.
Given medicine names, respond only with JSON:
{
  "interactions_found": true,
  "pairs": [
    {
      "drug1": "medicine A",
      "drug2": "medicine B",
      "severity": "HIGH",
      "effect": "What can happen in simple language",
      "advice": "What the patient should do"
    }
  ],
  "overall_advice": "Simple recommendation in English",
  "hindi_summary": "Overall advice in Hindi",
  "kannada_summary": "Overall advice in Kannada",
  "requires_caregiver_alert": true
}
"""

MEDICINE_FALLBACKS: dict[str, dict[str, Any]] = {
    "paracetamol": {
        "medicine_name": "Paracetamol 500 mg",
        "generic_name": "Paracetamol / Acetaminophen",
        "used_for": "Used for fever and mild pain.",
        "how_to_take": "Take only as directed on the strip or by a doctor. Do not take extra tablets.",
        "avoid": ["Alcohol", "Taking multiple cold or fever medicines that also contain paracetamol"],
        "side_effects": ["Nausea", "Stomach discomfort", "Rare liver injury with overdose"],
        "warning": "Too much paracetamol can seriously damage the liver.",
        "safety_score": 82,
        "emergency": False,
        "requires_permission": False,
    },
    "metformin": {
        "medicine_name": "Metformin 500 mg",
        "generic_name": "Metformin",
        "used_for": "Used to control blood sugar in type 2 diabetes.",
        "how_to_take": "Usually taken with food to reduce stomach upset. Follow the doctor's dose.",
        "avoid": ["Heavy alcohol use", "Skipping meals", "Using during severe dehydration without medical advice"],
        "side_effects": ["Nausea", "Loose motion", "Metallic taste"],
        "warning": "Seek medical help if there is severe weakness, fast breathing, or dehydration.",
        "safety_score": 74,
        "emergency": False,
        "requires_permission": False,
    },
    "warfarin": {
        "medicine_name": "Warfarin",
        "generic_name": "Warfarin",
        "used_for": "Used as a blood thinner to prevent dangerous clots.",
        "how_to_take": "Take exactly at the same time daily as prescribed. Regular INR blood tests are needed.",
        "avoid": ["Aspirin unless prescribed", "Sudden major diet changes", "Alcohol binges"],
        "side_effects": ["Easy bruising", "Bleeding gums", "Nose bleeding"],
        "warning": "High bleeding risk. Do not combine with painkillers or blood thinners unless a doctor approves.",
        "safety_score": 34,
        "emergency": False,
        "requires_permission": True,
    },
    "aspirin": {
        "medicine_name": "Aspirin",
        "generic_name": "Acetylsalicylic acid",
        "used_for": "Used for pain, fever, or sometimes heart protection when prescribed.",
        "how_to_take": "Take after food if prescribed. Do not start daily aspirin without medical advice.",
        "avoid": ["Warfarin unless prescribed", "Heavy alcohol use", "Using in children with viral fever"],
        "side_effects": ["Acidity", "Stomach pain", "Bleeding"],
        "warning": "Can increase bleeding risk, especially with blood thinners.",
        "safety_score": 56,
        "emergency": False,
        "requires_permission": True,
    },
    "amlodipine": {
        "medicine_name": "Amlodipine",
        "generic_name": "Amlodipine",
        "used_for": "Used to control high blood pressure.",
        "how_to_take": "Take once daily as prescribed, with or without food.",
        "avoid": ["Stopping suddenly without doctor advice", "Missing doses often"],
        "side_effects": ["Ankle swelling", "Headache", "Dizziness"],
        "warning": "Stand up slowly if you feel dizzy.",
        "safety_score": 76,
        "emergency": False,
        "requires_permission": False,
    },
}

TRANSLATIONS = {
    "safe_default": {
        "hindi": {
            "used_for": "यह दवा सामान्य रोगी शिक्षा के लिए समझाई गई है।",
            "how_to_take": "दवा केवल डॉक्टर या पर्चे के अनुसार लें।",
            "warning": "दवा बदलने से पहले डॉक्टर या फार्मासिस्ट से सलाह लें।",
        },
        "kannada": {
            "used_for": "ಈ ಔಷಧಿಯ ಮಾಹಿತಿ ರೋಗಿ ಶಿಕ್ಷಣಕ್ಕಾಗಿ ಮಾತ್ರ.",
            "how_to_take": "ವೈದ್ಯರ ಸೂಚನೆಯಂತೆ ಮಾತ್ರ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಿ.",
            "warning": "ಔಷಧಿ ಬದಲಾಯಿಸುವ ಮೊದಲು ವೈದ್ಯರು ಅಥವಾ ಫಾರ್ಮಸಿಸ್ಟ್ ಅವರನ್ನು ಕೇಳಿ.",
        },
    }
}


def with_translations(data: dict[str, Any]) -> dict[str, Any]:
    copy = {**data}
    copy.setdefault("interaction_alert", "")
    copy["translations"] = {
        "hindi": {
            "used_for": TRANSLATIONS["safe_default"]["hindi"]["used_for"],
            "how_to_take": TRANSLATIONS["safe_default"]["hindi"]["how_to_take"],
            "warning": copy.get("warning") and "चेतावनी: " + TRANSLATIONS["safe_default"]["hindi"]["warning"] or "",
        },
        "kannada": {
            "used_for": TRANSLATIONS["safe_default"]["kannada"]["used_for"],
            "how_to_take": TRANSLATIONS["safe_default"]["kannada"]["how_to_take"],
            "warning": copy.get("warning") and "ಎಚ್ಚರಿಕೆ: " + TRANSLATIONS["safe_default"]["kannada"]["warning"] or "",
        },
    }
    return copy


def fallback_medicine(name: str, other_medicines: str = "") -> dict[str, Any]:
    normalized = name.lower()
    selected = None
    for key, value in MEDICINE_FALLBACKS.items():
        if key in normalized:
            selected = value
            break
    if selected is None:
        selected = {
            "medicine_name": name.strip() or "Unknown Medicine",
            "generic_name": "Unknown",
            "used_for": "I could not verify this medicine from the built-in safety pack.",
            "how_to_take": "Do not take it based only on AI output. Ask a doctor or pharmacist.",
            "avoid": ["Self-medicating unknown medicines", "Mixing with alcohol or other medicines without advice"],
            "side_effects": ["Unknown"],
            "warning": "Unknown medicine. Human verification is required before use.",
            "safety_score": 28,
            "emergency": False,
            "requires_permission": True,
        }
    result = with_translations(selected)
    if other_medicines.strip():
        interaction = deterministic_interactions([result["medicine_name"], *split_medicines(other_medicines)])
        if interaction["interactions_found"]:
            result["interaction_alert"] = interaction["overall_advice"]
            result["safety_score"] = min(result["safety_score"], 42)
            result["requires_permission"] = True
    return result


def split_medicines(raw: str) -> list[str]:
    return [m.strip() for m in re.split(r"[,;\n]+", raw) if m.strip()]


def deterministic_interactions(medicines: list[str]) -> dict[str, Any]:
    lowered = [(m, m.lower()) for m in medicines]
    pairs = []

    def has(token: str) -> str | None:
        for original, low in lowered:
            if token in low:
                return original
        return None

    warfarin = has("warfarin")
    aspirin = has("aspirin")
    ibuprofen = has("ibuprofen")
    metformin = has("metformin")
    alcohol = has("alcohol")

    if warfarin and aspirin:
        pairs.append({
            "drug1": warfarin,
            "drug2": aspirin,
            "severity": "HIGH",
            "effect": "Both can increase bleeding risk. Bleeding can become serious.",
            "advice": "Do not take together unless a doctor specifically prescribed the combination.",
        })
    if warfarin and ibuprofen:
        pairs.append({
            "drug1": warfarin,
            "drug2": ibuprofen,
            "severity": "HIGH",
            "effect": "This combination can increase stomach bleeding risk.",
            "advice": "Ask a doctor or pharmacist before taking this painkiller.",
        })
    if metformin and alcohol:
        pairs.append({
            "drug1": metformin,
            "drug2": alcohol,
            "severity": "MEDIUM",
            "effect": "Alcohol can increase low sugar and rare acid build-up risk.",
            "advice": "Avoid heavy alcohol and ask your doctor what is safe for you.",
        })

    return {
        "interactions_found": bool(pairs),
        "pairs": pairs,
        "overall_advice": "High-risk interaction found. Ask a doctor or pharmacist before taking these together." if pairs else "No high-risk interaction found in the built-in safety pack. Still follow medical advice.",
        "hindi_summary": "खतरनाक मेल मिलने पर डॉक्टर या फार्मासिस्ट से सलाह लें।" if pairs else "बिल्ट-इन सुरक्षा सूची में बड़ा खतरा नहीं मिला।",
        "kannada_summary": "ಅಪಾಯಕಾರಿ ಸಂಯೋಜನೆ ಕಂಡುಬಂದರೆ ವೈದ್ಯರು ಅಥವಾ ಫಾರ್ಮಸಿಸ್ಟ್ ಅವರನ್ನು ಕೇಳಿ." if pairs else "ಬಿಲ್ಟ್-ಇನ್ ಸುರಕ್ಷತಾ ಪಟ್ಟಿಯಲ್ಲಿ ದೊಡ್ಡ ಅಪಾಯ ಕಂಡುಬಂದಿಲ್ಲ.",
        "requires_caregiver_alert": any(p["severity"] == "HIGH" for p in pairs),
    }


def extract_json(raw: str) -> dict[str, Any]:
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    if cleaned.startswith("{"):
        return json.loads(cleaned)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start >= 0 and end > start:
        return json.loads(cleaned[start:end + 1])
    raise ValueError("Model response did not contain JSON")


def audit(action: str, subject: str, risk: str, allowed: bool, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    previous_hash = AUDIT_LOG[-1]["hash"] if AUDIT_LOG else "GENESIS"
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "subject": subject,
        "risk": risk,
        "allowed": allowed,
        "previous_hash": previous_hash,
        "metadata": metadata or {},
    }
    digest_source = json.dumps(entry, sort_keys=True, ensure_ascii=False).encode("utf-8")
    entry["hash"] = hashlib.sha256(digest_source).hexdigest()
    AUDIT_LOG.append(entry)
    return entry


async def call_groq(prompt: str, system: str = SYSTEM_PROMPT) -> dict[str, Any]:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured")
    payload = {
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.15,
        "max_tokens": 1500,
    }
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(GROQ_URL, headers=headers, json=payload)
        response.raise_for_status()
    return extract_json(response.json()["choices"][0]["message"]["content"])


async def call_gemini_vision(image_base64: str, image_mime: str, prompt: str) -> dict[str, Any]:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    payload = {
        "contents": [{"parts": [{"inline_data": {"mime_type": image_mime, "data": image_base64}}, {"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "generationConfig": {"temperature": 0.15, "maxOutputTokens": 1500},
    }
    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload)
        response.raise_for_status()
    return extract_json(response.json()["candidates"][0]["content"]["parts"][0]["text"])


@app.post("/analyze/text")
async def analyze_text(medicine_name: str = Form(...), other_medicines: str = Form("")):
    prompt = f"Medicine to explain: {medicine_name}"
    if other_medicines.strip():
        prompt += f"\nPatient is also taking: {other_medicines}"
    start = time.perf_counter()
    try:
        result = await call_groq(prompt)
        source = "groq"
    except Exception as exc:
        result = fallback_medicine(medicine_name, other_medicines)
        source = "local_safety_pack"
        result["fallback_reason"] = str(exc)

    risk = "high" if result.get("requires_permission") or result.get("safety_score", 100) < 50 else "normal"
    entry = audit("analyze_text", result.get("medicine_name", medicine_name), risk, True, {"source": source})
    result["agent_trace"] = {"source": source, "latency_ms": round((time.perf_counter() - start) * 1000), "audit_hash": entry["hash"]}
    return JSONResponse(content={"success": True, "data": result})


@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...), other_medicines: str = Form("")):
    start = time.perf_counter()
    contents = await file.read()
    image_b64 = base64.b64encode(contents).decode("utf-8")
    mime = file.content_type or "image/jpeg"
    try:
        result = await call_gemini_vision(image_b64, mime, "Identify this medicine from the image and explain it clearly.")
        source = "gemini_vision"
    except Exception as exc:
        result = fallback_medicine("Unknown Medicine", other_medicines)
        source = "local_safety_pack"
        result["fallback_reason"] = str(exc)

    risk = "high" if result.get("requires_permission") or result.get("safety_score", 100) < 50 else "normal"
    entry = audit("analyze_image", result.get("medicine_name", "Unknown Medicine"), risk, True, {"source": source})
    result["agent_trace"] = {"source": source, "latency_ms": round((time.perf_counter() - start) * 1000), "audit_hash": entry["hash"]}
    return JSONResponse(content={"success": True, "data": result})


@app.post("/check/interactions")
async def check_interactions(medicines: list[str]):
    start = time.perf_counter()
    if len(medicines) < 2:
        return JSONResponse(content={"success": False, "error": "Need at least 2 medicines"})
    try:
        result = await call_groq(f"Check interactions between: {', '.join(medicines)}", INTERACTION_PROMPT)
        source = "groq"
    except Exception as exc:
        result = deterministic_interactions(medicines)
        source = "local_safety_pack"
        result["fallback_reason"] = str(exc)

    risk = "high" if result.get("requires_caregiver_alert") else "normal"
    entry = audit("check_interactions", " + ".join(medicines), risk, True, {"source": source})
    result["agent_trace"] = {"source": source, "latency_ms": round((time.perf_counter() - start) * 1000), "audit_hash": entry["hash"]}
    return JSONResponse(content={"success": True, "data": result})


@app.get("/audit")
async def get_audit():
    return {"success": True, "entries": AUDIT_LOG[-100:]}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "SahiDawa Guardian",
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured": bool(GROQ_API_KEY),
        "offline_fallback": True,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
