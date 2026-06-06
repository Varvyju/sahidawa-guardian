import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const styles = `
*{box-sizing:border-box}body{margin:0;background:#08090d;color:#f6f4ec;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.app{min-height:100vh;display:grid;grid-template-columns:340px 1fr;background:radial-gradient(circle at top left,rgba(255,107,0,.16),transparent 32%),#08090d}.sidebar{border-right:1px solid rgba(255,255,255,.08);padding:24px;display:flex;flex-direction:column;gap:20px;background:rgba(12,13,18,.9)}.brand{display:flex;gap:12px;align-items:center}.mark{width:44px;height:44px;border-radius:12px;background:#ff6b00;color:#fff;display:grid;place-items:center;font-weight:900}.brand h1{font-size:24px;line-height:1;margin:0}.brand p{margin:4px 0 0;color:#9a9aaa;font-size:12px}.pitch{padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:#12131a}.pitch strong{display:block;margin-bottom:8px}.pitch p{margin:0;color:#c8c4b8;font-size:13px;line-height:1.5}.nav{display:flex;flex-direction:column;gap:8px}.nav button{height:42px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:transparent;color:#b8b4aa;font-weight:700;text-align:left;padding:0 14px;cursor:pointer}.nav button.active{background:#ff6b00;color:white;border-color:#ff6b00}.status{margin-top:auto;color:#898897;font-size:12px;line-height:1.6}.main{padding:28px;display:flex;flex-direction:column;gap:18px;max-width:1120px;width:100%}.topline{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.hero h2{font-size:34px;line-height:1.05;margin:0 0 8px}.hero p{margin:0;color:#aaa6a0;max-width:720px;line-height:1.5}.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}.panel{border:1px solid rgba(255,255,255,.08);border-radius:8px;background:#12131a;padding:18px}.panel h3{margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#ff9b56}.field{display:flex;flex-direction:column;gap:7px;margin-bottom:12px}.field label{font-size:12px;color:#aaa6a0;font-weight:700}.field input,.field textarea{width:100%;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:#0b0c11;color:#f6f4ec;padding:12px;font:inherit;outline:none}.field textarea{min-height:76px;resize:vertical}.field input:focus,.field textarea:focus{border-color:#ff6b00}.actions{display:flex;gap:10px;flex-wrap:wrap}.primary,.secondary,.danger{border:0;border-radius:8px;padding:12px 14px;font-weight:800;cursor:pointer}.primary{background:#ff6b00;color:white}.secondary{background:#242631;color:#f6f4ec;border:1px solid rgba(255,255,255,.08)}.danger{background:#3b1518;color:#ffb3b3;border:1px solid rgba(255,85,85,.25)}.primary:disabled{opacity:.5;cursor:not-allowed}.drop{border:1px dashed rgba(255,107,0,.55);border-radius:8px;background:#0b0c11;padding:24px;text-align:center;cursor:pointer;color:#b8b4aa}.preview{width:100%;max-height:210px;object-fit:contain;border-radius:8px;background:#08090d}.result{display:flex;flex-direction:column;gap:12px}.score{height:8px;border-radius:99px;background:#2b2d36;overflow:hidden}.score span{display:block;height:100%;border-radius:99px}.medicine-title{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.medicine-title h3{font-size:24px;text-transform:none;letter-spacing:0;color:#fff;margin:0}.badge{border-radius:99px;padding:5px 9px;font-size:11px;font-weight:900;background:#252833;color:#d9d5cb;white-space:nowrap}.badge.high{background:#43191c;color:#ff9b9b}.badge.ok{background:#133421;color:#8cffb0}.list{margin:0;padding-left:18px;color:#d9d5cb;line-height:1.6}.warning{border:1px solid rgba(255,76,76,.3);background:#2b1114;color:#ffb3b3;border-radius:8px;padding:12px;line-height:1.5}.permission{border:2px solid rgba(255,107,0,.45);background:rgba(255,107,0,.08);border-radius:8px;padding:16px}.permission h3{margin:0 0 8px;color:#fff;text-transform:none;letter-spacing:0}.permission p{margin:0 0 12px;color:#d9d5cb}.log{display:flex;flex-direction:column;gap:8px}.log-row{display:grid;grid-template-columns:82px 1fr 84px;gap:10px;align-items:start;border-bottom:1px solid rgba(255,255,255,.07);padding:10px 0}.log-row:last-child{border-bottom:0}.log-time{color:#898897;font-size:12px}.log-action{font-weight:800;font-size:13px}.log-detail{color:#aaa6a0;font-size:12px;margin-top:3px}.hash{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:#7ea7ff;font-size:11px;text-align:right}.trace{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.trace div{border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px;background:#0b0c11}.trace span{display:block;color:#898897;font-size:11px;text-transform:uppercase;font-weight:900}.trace strong{display:block;margin-top:4px;font-size:13px}.language{display:grid;grid-template-columns:1fr 1fr;gap:10px}.translation{background:#0b0c11;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;line-height:1.6}.empty{color:#898897;text-align:center;padding:30px}.footer-note{font-size:12px;color:#898897;line-height:1.5}.banner{border:1px solid rgba(255,214,10,.25);background:rgba(255,214,10,.08);color:#ffe38a;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5}@media(max-width:900px){.app{grid-template-columns:1fr}.sidebar{position:static;border-right:0;border-bottom:1px solid rgba(255,255,255,.08)}.nav{flex-direction:row;overflow:auto}.nav button{white-space:nowrap}.grid{grid-template-columns:1fr}.topline{flex-direction:column}.trace,.language{grid-template-columns:1fr}}`;

function now() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function scoreColor(score) {
  if (score >= 70) return "#26d66f";
  if (score >= 45) return "#ffd60a";
  return "#ff4d4d";
}

function shortHash(value = "") {
  return value ? value.slice(0, 10) : "local";
}

function speak(text, lang = "en-IN") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function App() {
  const [tab, setTab] = useState("scan");
  const [medicineName, setMedicineName] = useState("Warfarin");
  const [otherMeds, setOtherMeds] = useState("Aspirin");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [interactionMeds, setInteractionMeds] = useState(["Warfarin", "Aspirin"]);
  const [newMed, setNewMed] = useState("");
  const [interactionResult, setInteractionResult] = useState(null);
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem("sahidawa_logs") || "[]"));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("sahidawa_history") || "[]"));
  const [serverHealth, setServerHealth] = useState(null);
  const fileRef = useRef(null);

  const highRisk = result && (result.requires_permission || result.safety_score < 50 || result.emergency);

  useEffect(() => {
    localStorage.setItem("sahidawa_logs", JSON.stringify(logs.slice(-80)));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("sahidawa_history", JSON.stringify(history.slice(0, 30)));
  }, [history]);

  useEffect(() => {
    fetch(`${API_BASE}/health`).then((r) => r.json()).then(setServerHealth).catch(() => setServerHealth(null));
  }, []);

  function addLog(type, action, detail, hash) {
    setLogs((prev) => [...prev, { type, action, detail, hash, time: now() }]);
  }

  function remember(data) {
    setHistory((prev) => [
      { name: data.medicine_name, score: data.safety_score, source: data.agent_trace?.source || "unknown", time: new Date().toISOString() },
      ...prev.filter((item) => item.name !== data.medicine_name),
    ]);
  }

  async function analyzeText() {
    if (!medicineName.trim()) return;
    setLoading(true);
    setResult(null);
    const form = new FormData();
    form.append("medicine_name", medicineName.trim());
    form.append("other_medicines", otherMeds);
    addLog("approve", "Scoped tool requested", `Analyze ${medicineName}`, "");
    try {
      const response = await fetch(`${API_BASE}/analyze/text`, { method: "POST", body: form });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || "Analysis failed");
      setResult(json.data);
      remember(json.data);
      const hash = json.data.agent_trace?.audit_hash;
      addLog(json.data.requires_permission ? "block" : "safe", `Medicine analyzed: ${json.data.medicine_name}`, `Safety score ${json.data.safety_score}/100`, hash);
      if (json.data.requires_permission) addLog("block", "Approval gate opened", "Caregiver notification is blocked until user approves.", hash);
    } catch (error) {
      addLog("block", "Backend unavailable", error.message, "");
      setResult({ medicine_name: "Demo fallback", generic_name: "Local mode", used_for: "Backend was not reachable.", how_to_take: "Start the backend and try again.", avoid: [], side_effects: [], warning: error.message, translations: {}, safety_score: 20, requires_permission: true, agent_trace: { source: "frontend_error", latency_ms: 0, audit_hash: "" } });
    } finally {
      setLoading(false);
    }
  }

  async function analyzeImage() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    form.append("other_medicines", otherMeds);
    addLog("approve", "Vision tool requested", file.name, "");
    try {
      const response = await fetch(`${API_BASE}/analyze/image`, { method: "POST", body: form });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || "Image analysis failed");
      setResult(json.data);
      remember(json.data);
      addLog(json.data.requires_permission ? "block" : "safe", `Image analyzed: ${json.data.medicine_name}`, `Source ${json.data.agent_trace?.source}`, json.data.agent_trace?.audit_hash);
    } catch (error) {
      addLog("block", "Vision analysis failed", error.message, "");
    } finally {
      setLoading(false);
    }
  }

  async function checkInteractions() {
    if (interactionMeds.length < 2) return;
    setLoading(true);
    setInteractionResult(null);
    addLog("approve", "Interaction checker requested", interactionMeds.join(" + "), "");
    try {
      const response = await fetch(`${API_BASE}/check/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interactionMeds),
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || "Interaction check failed");
      setInteractionResult(json.data);
      addLog(json.data.requires_caregiver_alert ? "block" : "safe", json.data.interactions_found ? "Interaction risk found" : "No high-risk interaction found", json.data.overall_advice, json.data.agent_trace?.audit_hash);
    } catch (error) {
      addLog("block", "Interaction check failed", error.message, "");
    } finally {
      setLoading(false);
    }
  }

  function approveCaregiver() {
    addLog("approve", "Caregiver alert approved", `User authorized escalation for ${result.medicine_name}`, result.agent_trace?.audit_hash);
  }

  function denyCaregiver() {
    addLog("block", "Caregiver alert denied", `Agent action blocked for ${result.medicine_name}`, result.agent_trace?.audit_hash);
  }

  function onFileChange(nextFile) {
    if (!nextFile) return;
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }

  const nav = [
    ["scan", "Scan"],
    ["type", "Type"],
    ["interactions", "Interactions"],
    ["memory", "Memory"],
    ["audit", "Audit"],
  ];

  const sourceLabel = useMemo(() => {
    if (!serverHealth) return "Backend not connected";
    const models = [];
    if (serverHealth.gemini_configured) models.push("Gemini Vision");
    if (serverHealth.groq_configured) models.push("Groq");
    models.push("offline safety pack");
    return models.join(" + ");
  }, [serverHealth]);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="mark">SD</div>
            <div>
              <h1>SahiDawa</h1>
              <p>Guardian Agent</p>
            </div>
          </div>
          <div className="pitch">
            <strong>Winning frame</strong>
            <p>A medication-safety agent for Indian families with scoped actions, persistent memory, fallback reasoning, caregiver approval, and tamper-evident audit logs.</p>
          </div>
          <nav className="nav">
            {nav.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}
          </nav>
          <div className="status">
            <div><strong>Runtime:</strong> {sourceLabel}</div>
            <div><strong>Demo path:</strong> Warfarin + Aspirin</div>
            <div><strong>Safety:</strong> education only, no diagnosis</div>
          </div>
        </aside>

        <main className="main">
          <div className="topline">
            <div className="hero">
              <h2>Medicine safety agent that can act, but only with permission.</h2>
              <p>Show the judges the real production pattern: identify risk, check context, request scoped approval, remember the medicine, and record every action in an audit chain.</p>
            </div>
          </div>

          {!serverHealth && <div className="banner">Backend is not connected yet. Start FastAPI on port 8001 for the live demo.</div>}

          {tab === "scan" && (
            <div className="grid">
              <section className="panel">
                <h3>Vision Intake</h3>
                {!preview ? (
                  <div className="drop" onClick={() => fileRef.current?.click()}>
                    Upload or capture a medicine strip, bottle, or box
                    <input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFileChange(e.target.files?.[0])} />
                  </div>
                ) : (
                  <>
                    <img className="preview" src={preview} alt="Uploaded medicine" />
                    <div className="actions" style={{ marginTop: 10 }}>
                      <button className="secondary" onClick={() => { setPreview(""); setFile(null); }}>Change image</button>
                    </div>
                  </>
                )}
                <div className="field" style={{ marginTop: 12 }}>
                  <label>Other medicines the patient takes</label>
                  <input value={otherMeds} onChange={(e) => setOtherMeds(e.target.value)} placeholder="Aspirin, Metformin, Amlodipine" />
                </div>
                <button className="primary" disabled={!file || loading} onClick={analyzeImage}>{loading ? "Analyzing..." : "Analyze image"}</button>
              </section>
              <ResultPanel result={result} highRisk={highRisk} approveCaregiver={approveCaregiver} denyCaregiver={denyCaregiver} addLog={addLog} />
            </div>
          )}

          {tab === "type" && (
            <div className="grid">
              <section className="panel">
                <h3>Typed Medicine</h3>
                <div className="field">
                  <label>Medicine name</label>
                  <input value={medicineName} onChange={(e) => setMedicineName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyzeText()} />
                </div>
                <div className="field">
                  <label>Other medicines or context</label>
                  <textarea value={otherMeds} onChange={(e) => setOtherMeds(e.target.value)} />
                </div>
                <div className="actions">
                  <button className="primary" disabled={loading || !medicineName.trim()} onClick={analyzeText}>{loading ? "Checking..." : "Run guardian check"}</button>
                  <button className="secondary" onClick={() => { setMedicineName("Metformin 500 mg"); setOtherMeds(""); }}>Safe demo</button>
                  <button className="danger" onClick={() => { setMedicineName("Warfarin"); setOtherMeds("Aspirin"); }}>Risk demo</button>
                </div>
              </section>
              <ResultPanel result={result} highRisk={highRisk} approveCaregiver={approveCaregiver} denyCaregiver={denyCaregiver} addLog={addLog} />
            </div>
          )}

          {tab === "interactions" && (
            <div className="grid">
              <section className="panel">
                <h3>Interaction Agent</h3>
                <div className="field">
                  <label>Add medicine</label>
                  <div className="actions">
                    <input value={newMed} onChange={(e) => setNewMed(e.target.value)} onKeyDown={(e) => {
                      if (e.key === "Enter" && newMed.trim()) {
                        setInteractionMeds((prev) => [...prev, newMed.trim()]);
                        setNewMed("");
                      }
                    }} placeholder="Ibuprofen, alcohol, aspirin" />
                    <button className="secondary" onClick={() => { if (newMed.trim()) { setInteractionMeds((prev) => [...prev, newMed.trim()]); setNewMed(""); } }}>Add</button>
                  </div>
                </div>
                <div className="actions">
                  {interactionMeds.map((med) => <button key={med} className="secondary" onClick={() => setInteractionMeds((prev) => prev.filter((m) => m !== med))}>{med} x</button>)}
                </div>
                <div className="actions" style={{ marginTop: 14 }}>
                  <button className="primary" disabled={loading || interactionMeds.length < 2} onClick={checkInteractions}>{loading ? "Checking..." : "Check interactions"}</button>
                  <button className="danger" onClick={() => setInteractionMeds(["Warfarin", "Aspirin"])}>Load winning demo</button>
                </div>
              </section>
              <section className="panel">
                <h3>Interaction Result</h3>
                {!interactionResult ? <div className="empty">Run the checker to see risk scoring and approval triggers.</div> : (
                  <div className="result">
                    <span className={`badge ${interactionResult.requires_caregiver_alert ? "high" : "ok"}`}>{interactionResult.requires_caregiver_alert ? "Caregiver approval required" : "No escalation required"}</span>
                    {interactionResult.pairs?.length ? interactionResult.pairs.map((pair, index) => (
                      <div className="warning" key={`${pair.drug1}-${pair.drug2}-${index}`}>
                        <strong>{pair.severity}: {pair.drug1} + {pair.drug2}</strong>
                        <div>{pair.effect}</div>
                        <div>{pair.advice}</div>
                      </div>
                    )) : <p>No dangerous interaction found in the safety pack.</p>}
                    <p>{interactionResult.overall_advice}</p>
                    <Trace trace={interactionResult.agent_trace} />
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === "memory" && (
            <section className="panel">
              <h3>Persistent Medicine Memory</h3>
              {history.length === 0 ? <div className="empty">No medicines checked yet.</div> : (
                <div className="log">
                  {history.map((item) => (
                    <div className="log-row" key={`${item.name}-${item.time}`}>
                      <div className="log-time">{new Date(item.time).toLocaleTimeString("en-IN")}</div>
                      <div>
                        <div className="log-action">{item.name}</div>
                        <div className="log-detail">Source: {item.source}</div>
                      </div>
                      <div className="hash" style={{ color: scoreColor(item.score) }}>{item.score}/100</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "audit" && (
            <section className="panel">
              <h3>Agent Audit Trail</h3>
              {logs.length === 0 ? <div className="empty">No agent actions yet.</div> : (
                <div className="log">
                  {[...logs].reverse().map((log, index) => (
                    <div className="log-row" key={`${log.time}-${index}`}>
                      <div className="log-time">{log.time}</div>
                      <div>
                        <div className="log-action">{log.action}</div>
                        <div className="log-detail">{log.detail}</div>
                      </div>
                      <div className="hash">{shortHash(log.hash)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <div className="footer-note">SahiDawa Guardian provides patient education and safety escalation only. It does not diagnose, prescribe, or replace a registered clinician.</div>
        </main>
      </div>
    </>
  );
}

function ResultPanel({ result, highRisk, approveCaregiver, denyCaregiver, addLog }) {
  if (!result) {
    return (
      <section className="panel">
        <h3>Guardian Output</h3>
        <div className="empty">Run a scan or typed check. The best demo is Warfarin with Aspirin.</div>
      </section>
    );
  }

  const hindi = result.translations?.hindi;
  const kannada = result.translations?.kannada;

  return (
    <section className="panel result">
      <div className="medicine-title">
        <div>
          <h3>{result.medicine_name}</h3>
          <div className="log-detail">{result.generic_name}</div>
        </div>
        <span className={`badge ${highRisk ? "high" : "ok"}`}>{highRisk ? "Approval required" : "Low risk"}</span>
      </div>
      <div className="score"><span style={{ width: `${result.safety_score}%`, background: scoreColor(result.safety_score) }} /></div>
      <p><strong>Used for:</strong> {result.used_for}</p>
      <p><strong>How to take:</strong> {result.how_to_take}</p>
      {!!result.avoid?.length && <div><strong>Avoid</strong><ul className="list">{result.avoid.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {!!result.side_effects?.length && <div><strong>Side effects</strong><ul className="list">{result.side_effects.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {result.warning && <div className="warning">{result.warning}</div>}
      {result.interaction_alert && <div className="warning">{result.interaction_alert}</div>}
      <div className="actions">
        <button className="secondary" onClick={() => {
          speak(`${result.medicine_name}. ${result.used_for}. ${result.how_to_take}. ${result.warning || ""}`);
          addLog("approve", "Voice readout", result.medicine_name, result.agent_trace?.audit_hash);
        }}>Read aloud</button>
      </div>
      {(hindi || kannada) && (
        <div className="language">
          {hindi && <div className="translation"><strong>Hindi</strong><br />{hindi.used_for}<br />{hindi.how_to_take}<br />{hindi.warning}</div>}
          {kannada && <div className="translation"><strong>Kannada</strong><br />{kannada.used_for}<br />{kannada.how_to_take}<br />{kannada.warning}</div>}
        </div>
      )}
      {highRisk && (
        <div className="permission">
          <h3>Scoped action gate</h3>
          <p>The agent wants to notify a caregiver or pharmacist. It cannot act until the user approves.</p>
          <div className="actions">
            <button className="primary" onClick={approveCaregiver}>Approve caregiver alert</button>
            <button className="danger" onClick={denyCaregiver}>Deny action</button>
          </div>
        </div>
      )}
      <Trace trace={result.agent_trace} />
      {result.fallback_reason && <div className="banner">Model fallback used. The local safety pack kept the demo running.</div>}
    </section>
  );
}

function Trace({ trace }) {
  if (!trace) return null;
  return (
    <div className="trace">
      <div><span>Source</span><strong>{trace.source}</strong></div>
      <div><span>Latency</span><strong>{trace.latency_ms} ms</strong></div>
      <div><span>Audit hash</span><strong>{shortHash(trace.audit_hash)}</strong></div>
    </div>
  );
}
