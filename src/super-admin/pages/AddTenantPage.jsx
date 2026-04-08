import { useState } from "react";
import { C } from "../constants";
import { Card, CardHeader } from "../components/SharedUI";

export function AddTenantPage({ onBack }) {
  const [step, setStep] = useState(1);
  const [billingType, setBillingType] = useState("per_job");
  const [termDays, setTermDays] = useState(30);

  const steps = ["Company info", "Billing setup", "API credentials", "Review & create"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize:14, color: C.textMid }}>← Back</button>
        <div>
          <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>Add new tenant</h1>
          <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>Onboard a new factory to the platform</p>
        </div>
      </div>

      {/* Step bar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center" }}>
          {steps.map((s, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: done ? C.teal : active ? C.bg3 : C.bg3,
                    border: `1px solid ${done ? C.teal : active ? C.teal : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize:14, fontFamily: C.mono, fontWeight: 700,
                    color: done ? C.bg0 : active ? C.teal : C.textDim,
                  }}>{done ? "✓" : n}</div>
                  <span style={{ fontSize:14, fontWeight: active ? 700 : 400, color: active ? C.text : C.textDim, whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: done ? C.teal : C.border, margin: "0 12px" }} />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step content */}
      <div className="rsp-grid-form" style={{}}>
        <Card>
          {step === 1 && (
            <div>
              <CardHeader title="Company information" sub="Basic details of the factory" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Company name (Thai)", ph: "บริษัท ไทยแมนูแฟคเจอร์ริ่ง จำกัด" },
                  { label: "Tax ID (13 digits)", ph: "0105561012345" },
                  { label: "Contact person", ph: "คุณชื่อ นามสกุล" },
                  { label: "Contact email", ph: "name@company.co.th" },
                  { label: "Phone number", ph: "02-xxx-xxxx" },
                  { label: "Address", ph: "123 ถ. พระราม 2 แขวง บางมด เขต จอมทอง กรุงเทพฯ 10150" },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                    <input placeholder={f.ph} style={{
                      width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "9px 12px", fontSize:14, color: C.text, boxSizing: "border-box",
                    }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Industry type</label>
                  <select style={{ width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8, padding: "9px 12px", fontSize:14, color: C.text }}>
                    <option>Electronics / Semiconductor</option>
                    <option>Automotive Parts</option>
                    <option>Food & Agriculture</option>
                    <option>Packaging</option>
                    <option>Textiles</option>
                    <option>Other Manufacturing</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <CardHeader title="Billing setup" sub="Configure how this tenant will be billed" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Billing model</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["per_job", "Per job", "Invoice sent immediately after each job is completed. Best for low-volume factories."],
                      ["term", "Term payment", "Accumulate all jobs into one invoice at end of period. Best for high-volume, established clients."],
                    ].map(([val, label, desc]) => (
                      <button key={val} onClick={() => setBillingType(val)} style={{
                        padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: billingType === val ? C.tealBg : C.bg3,
                        border: `1px solid ${billingType === val ? C.teal : C.border}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${billingType === val ? C.teal : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {billingType === val && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal }} />}
                          </div>
                          <span style={{ fontSize:15, fontWeight: 700, color: billingType === val ? C.teal : C.text }}>{label}</span>
                        </div>
                        <p style={{ margin: 0, fontSize:14, color: C.textDim, lineHeight: 1.5 }}>{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {billingType === "term" && (
                  <div>
                    <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment term</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[15, 30, 45, 60].map(d => (
                        <button key={d} onClick={() => setTermDays(d)} style={{
                          flex: 1, padding: "12px 8px", borderRadius: 8, cursor: "pointer",
                          background: termDays === d ? C.tealBg : C.bg3,
                          border: `1px solid ${termDays === d ? C.teal : C.border}`,
                          fontFamily: C.mono, fontSize:18, fontWeight: 800,
                          color: termDays === d ? C.teal : C.textMid,
                        }}>
                          <div>{d}</div>
                          <div style={{ fontSize:12, fontWeight: 400, fontFamily: "inherit", marginTop: 2, color: termDays === d ? C.tealDim : C.textDim }}>days</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Price per job</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" defaultValue={450} style={{
                      background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "10px 14px", fontSize:22, fontWeight: 800, fontFamily: C.mono,
                      color: C.teal, width: 130,
                    }} />
                    <span style={{ fontSize:16, color: C.textDim }}>THB per job</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize:14, color: C.textDim }}>Service breakdown: Declaration ฿300 + AI extraction ฿100 + NSW submission ฿50</div>
                </div>

                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Contract start date</label>
                  <input type="date" defaultValue="2026-04-01" style={{
                    background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                    padding: "9px 12px", fontSize:14, color: C.text, width: 180,
                  }} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <CardHeader title="API credentials" sub="Customs portal credentials for this tenant" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: C.amberBg, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize:14, color: C.amber, fontWeight: 600, marginBottom: 4 }}>Security note</div>
                  <div style={{ fontSize:14, color: C.textMid }}>Credentials are encrypted at rest and never exposed in logs. Stored in environment variables only.</div>
                </div>
                {[
                  { label: "กรมศุลกากร username", ph: "factory_username" },
                  { label: "กรมศุลกากร password", ph: "••••••••", type: "password" },
                  { label: "NSW agent code", ph: "AGT-XXXXX" },
                  { label: "Customs importer/exporter ID", ph: "EXP-1234567" },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.ph} style={{
                      width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "9px 12px", fontSize:14, color: C.text, fontFamily: f.type === "password" ? "inherit" : C.mono, boxSizing: "border-box",
                    }} />
                  </div>
                ))}
                <div style={{ background: C.tealBg, border: `1px solid ${C.teal}44`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize:14, color: C.teal, fontWeight: 600, marginBottom: 4 }}>Test connection</div>
                  <div style={{ fontSize:14, color: C.textMid, marginBottom: 8 }}>Verify credentials before saving by running a dry-run connection test.</div>
                  <button style={{ background: C.tealBg, border: `1px solid ${C.teal}`, borderRadius: 6, padding: "6px 14px", fontSize:14, color: C.teal, cursor: "pointer", fontWeight: 600 }}>Run test</button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <CardHeader title="Review & confirm" sub="Check all details before creating the tenant" />
              <div style={{ padding: "20px" }}>
                {[
                  ["Company", "บริษัท ไทยแมนูแฟคเจอร์ริ่ง จำกัด"],
                  ["Tax ID", "0105561012345"],
                  ["Billing model", billingType === "per_job" ? "Per job" : `Term payment (${termDays} days)`],
                  ["Price per job", "฿450 THB"],
                  ["NSW connection", "Pending test"],
                  ["Customs connection", "Pending test"],
                  ["Contract start", "2026-04-01"],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize:14, color: C.textDim }}>{label}</span>
                    <span style={{ fontSize:14, fontWeight: 600, color: C.text }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, background: C.greenBg, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize:14, color: C.green, fontWeight: 600 }}>Ready to create</div>
                  <div style={{ fontSize:14, color: C.textMid, marginTop: 4 }}>Tenant ID will be auto-generated. Invitation email sent to contact.</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize:14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Onboarding checklist</div>
              {[
                { label: "Company info", done: step > 1 },
                { label: "Billing configuration", done: step > 2 },
                { label: "API credentials", done: step > 3 },
                { label: "System ready", done: false },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: item.done ? C.tealBg : C.bg3,
                    border: `1px solid ${item.done ? C.teal : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize:13, color: C.teal,
                  }}>{item.done ? "✓" : ""}</div>
                  <span style={{ fontSize:14, color: item.done ? C.text : C.textDim }}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "11px", fontSize:14, color: C.textMid, cursor: "pointer",
              }}>← Back</button>
            )}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                flex: 2, background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "11px", fontSize:14, fontWeight: 700, cursor: "pointer",
              }}>Continue →</button>
            ) : (
              <button style={{
                flex: 2, background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "11px", fontSize:14, fontWeight: 700, cursor: "pointer",
              }}>Create tenant</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
