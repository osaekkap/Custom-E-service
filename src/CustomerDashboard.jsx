import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './stores/AuthContext.jsx';
import { jobsApi } from './api/jobsApi.js';

const BLUE    = "var(--primary)";
const BG      = "var(--bg-main)";
const BORDER  = "var(--border-main)";
const TEXT    = "var(--text-main)";
const TEXT2   = "var(--text-muted)";
const TEXT3   = "var(--text-light)";
const GREEN   = "var(--success)";
const RED     = "var(--danger)";
const ORANGE  = "var(--warning)";
const W       = "#fff";
const MONO    = "'JetBrains Mono','Fira Code',monospace";

const STATUS_ORDER = ["DRAFT","PREPARING","READY","GENERATING","READY_TO_SUBMIT","SUBMITTING","SUBMITTED","NSW_PROCESSING","CUSTOMS_REVIEW","CLEARED","COMPLETED"];
const PIPELINE_STEPS = ["สร้าง Job","เตรียมเอกสาร","ยื่น NSW","ศุลกากรตรวจ","Cleared"];

function stepIndex(status) {
  if (["DRAFT","PREPARING"].includes(status)) return 0;
  if (["READY","GENERATING","READY_TO_SUBMIT"].includes(status)) return 1;
  if (["SUBMITTING","SUBMITTED","NSW_PROCESSING"].includes(status)) return 2;
  if (status === "CUSTOMS_REVIEW") return 3;
  if (["CLEARED","COMPLETED"].includes(status)) return 4;
  return 0;
}

export default function CustomerDashboard() {
  const auth = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setJobs(arr);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter(j => !["COMPLETED","REJECTED"].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === "COMPLETED");
  const draftJobs = jobs.filter(j => j.status === "DRAFT");
  const pendingApproval = jobs.filter(j => j.approvalStatus === "PENDING");
  const totalFob = jobs.reduce((sum, j) => sum + (Number(j.totalFobUsd) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: 40 }}>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Shipments ทั้งหมด", value: loading ? "…" : jobs.length, color: BLUE, icon: "📦" },
          { label: "กำลังดำเนินการ",     value: loading ? "…" : activeJobs.length, color: ORANGE, icon: "⏳" },
          { label: "เสร็จสมบูรณ์",       value: loading ? "…" : completedJobs.length, color: GREEN, icon: "✅" },
          { label: "มูลค่ารวม (FOB)",    value: loading ? "…" : `$${totalFob.toLocaleString()}`, color: "#7C3AED", icon: "💰" },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: W, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px",
            borderLeft: `4px solid ${kpi.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: TEXT3, fontWeight: 600, marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: TEXT }}>{kpi.value}</div>
              </div>
              <span style={{ fontSize: 28 }}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Center */}
      {(draftJobs.length > 0 || pendingApproval.length > 0) && (
        <section>
          <h2 style={{ fontSize: 18, marginBottom: 16, fontWeight: 700, color: TEXT }}>Action Center</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {draftJobs.length > 0 && (
              <div style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, borderLeft: `4px solid ${ORANGE}` }}>
                <h3 style={{ fontSize: 16, color: ORANGE, margin: "0 0 8px", fontWeight: 700 }}>Draft รอดำเนินการ</h3>
                <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>{draftJobs.length} job ยังเป็น Draft — กรุณาอัปโหลดเอกสารเพื่อดำเนินการต่อ</p>
                <div style={{ marginTop: 12 }}>
                  {draftJobs.slice(0, 3).map(j => (
                    <div key={j.id} style={{ fontSize: 14, color: TEXT, fontFamily: MONO, padding: "4px 0" }}>
                      {j.jobNo} — {j.vesselName || "—"}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pendingApproval.length > 0 && (
              <div style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, borderLeft: `4px solid #D97706` }}>
                <h3 style={{ fontSize: 16, color: "#D97706", margin: "0 0 8px", fontWeight: 700 }}>รออนุมัติ</h3>
                <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>{pendingApproval.length} job รอการอนุมัติจากผู้บริหาร</p>
                <div style={{ marginTop: 12 }}>
                  {pendingApproval.slice(0, 3).map(j => (
                    <div key={j.id} style={{ fontSize: 14, color: TEXT, fontFamily: MONO, padding: "4px 0" }}>
                      {j.jobNo}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Active Shipments Pipeline */}
      <section>
        <h2 style={{ fontSize: 18, marginBottom: 16, fontWeight: 700, color: TEXT }}>Active Shipments Tracking</h2>
        {loading && <p style={{ color: TEXT3, fontSize: 14 }}>กำลังโหลด…</p>}
        {!loading && activeJobs.length === 0 && (
          <div style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 15, color: TEXT2 }}>ยังไม่มี shipment ที่กำลังดำเนินการ</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {activeJobs.slice(0, 5).map(job => {
            const si = stepIndex(job.status);
            return (
              <div key={job.id} style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9FAFB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, color: TEXT, fontSize: 15 }}>{job.jobNo}</span>
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700,
                      background: job.type === "EXPORT" ? "#EFF6FF" : "#FFFBEB",
                      color: job.type === "EXPORT" ? BLUE : ORANGE,
                      border: `1px solid ${job.type === "EXPORT" ? "#BFDBFE" : "#FDE68A"}`,
                    }}>{job.type}</span>
                    <span style={{ fontSize: 13, color: TEXT3 }}>{job.vesselName || "—"}</span>
                  </div>
                  <span style={{ fontSize: 13, color: TEXT3 }}>
                    {job.totalFobUsd ? `USD ${Number(job.totalFobUsd).toLocaleString()}` : "—"}
                    {job.assignedTo?.fullName && ` · ${job.assignedTo.fullName}`}
                  </span>
                </div>
                <div style={{ padding: "16px 24px", display: "flex", gap: 0 }}>
                  {PIPELINE_STEPS.map((step, idx) => {
                    const done = idx <= si;
                    const current = idx === si;
                    return (
                      <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                          {idx > 0 && <div style={{ flex: 1, height: 2, background: done ? "#22C55E" : BORDER }} />}
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            background: done ? "#22C55E" : current ? "#0EA5E9" : "#F1F5F9",
                            border: `2px solid ${done ? "#22C55E" : current ? "#0EA5E9" : BORDER}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: done || current ? "#fff" : TEXT3,
                          }}>{done ? "✓" : current ? "●" : ""}</div>
                          {idx < PIPELINE_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "#22C55E" : BORDER }} />}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: current ? BLUE : done ? "#16A34A" : TEXT3, marginTop: 6, textAlign: "center" }}>
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Completed */}
      {completedJobs.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, marginBottom: 16, fontWeight: 700, color: TEXT }}>เสร็จสมบูรณ์ล่าสุด</h2>
          <div style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: `1px solid ${BORDER}` }}>
                  {["Job No.", "Type", "Vessel", "FOB", "วันที่"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: TEXT3, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedJobs.slice(0, 5).map((j, i) => (
                  <tr key={j.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                    <td style={{ padding: "10px 16px", fontFamily: MONO, fontWeight: 700, color: TEXT }}>{j.jobNo}</td>
                    <td style={{ padding: "10px 16px", color: TEXT2 }}>{j.type}</td>
                    <td style={{ padding: "10px 16px", color: TEXT2 }}>{j.vesselName || "—"}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 600, color: TEXT }}>{j.totalFobUsd ? `USD ${Number(j.totalFobUsd).toLocaleString()}` : "—"}</td>
                    <td style={{ padding: "10px 16px", color: TEXT3 }}>{j.createdAt?.substring(0, 10) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}
