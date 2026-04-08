import { useState } from "react";
import { C, JOBS_RECENT, INVOICES } from "../constants";
import { Card, CardHeader, Stat, StatusPill } from "../components/SharedUI";

export function TenantDetailPage({ tenant, onBack }) {
  const [billingType, setBillingType] = useState(tenant.billingType);
  const [termDays, setTermDays] = useState(tenant.termDays || 30);
  const [pricePerJob, setPricePerJob] = useState(tenant.pricePerJob);
  const [status, setStatus] = useState(tenant.status);

  const tenantJobs = JOBS_RECENT.filter(j => j.tenant === tenant.code);
  const tenantInvoices = INVOICES.filter(inv => inv.tenantCode === tenant.code);

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize:14, color: C.textMid }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: C.bg3, border: `1px solid ${C.borderHi}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize:14, fontFamily: C.mono, fontWeight: 700, color: C.teal,
          }}>{tenant.code}</div>
          <div>
            <h1 style={{ margin: 0, fontSize:20, fontWeight: 800, color: C.text }}>{tenant.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <StatusPill status={status} />
              <span style={{ fontSize:13, color: C.textDim, fontFamily: C.mono }}>ID: {tenant.id}</span>
              <span style={{ fontSize:13, color: C.textDim }}>Joined: {tenant.joined}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rsp-grid-2-eq" style={{}}>
        {/* Left: Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Company info */}
          <Card>
            <CardHeader title="Company information" />
            <div style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
              {[
                ["Company name", tenant.name],
                ["Tax ID", tenant.taxId],
                ["Contact person", tenant.contact],
                ["Email", tenant.email],
                ["Users", `${tenant.stats.users} accounts`],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center" }}>
                  <span style={{ fontSize:14, color: C.textDim, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize:14, color: C.text }}>{val}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Billing configuration */}
          <Card>
            <CardHeader title="Billing configuration" sub="Changes apply to next invoice cycle" />
            <div style={{ padding: "16px 20px", display: "grid", gap: 16 }}>
              {/* Billing type toggle */}
              <div>
                <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Billing type</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["per_job", "Per job", "Invoice per job"], ["term", "Term payment", "Bundle by period"]].map(([val, label, sub]) => (
                    <button key={val} onClick={() => setBillingType(val)} style={{
                      flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                      background: billingType === val ? C.tealBg : C.bg3,
                      border: `1px solid ${billingType === val ? C.teal : C.border}`,
                    }}>
                      <div style={{ fontSize:14, fontWeight: 700, color: billingType === val ? C.teal : C.textMid }}>{label}</div>
                      <div style={{ fontSize:13, color: C.textDim, marginTop: 2 }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Term days (conditional) */}
              {billingType === "term" && (
                <div>
                  <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment term</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[15, 30, 45, 60].map(d => (
                      <button key={d} onClick={() => setTermDays(d)} style={{
                        flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer",
                        background: termDays === d ? C.bg3 : "transparent",
                        border: `1px solid ${termDays === d ? C.teal : C.border}`,
                        fontSize:15, fontWeight: 700, fontFamily: C.mono,
                        color: termDays === d ? C.teal : C.textMid,
                      }}>{d}d</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Price per job (THB)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    value={pricePerJob}
                    onChange={e => setPricePerJob(Number(e.target.value))}
                    style={{
                      background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "8px 12px", fontSize:18, fontWeight: 700, fontFamily: C.mono,
                      color: C.teal, width: 120,
                    }}
                  />
                  <span style={{ fontSize:14, color: C.textDim }}>THB / job</span>
                  <span style={{ fontSize:14, color: C.textDim, marginLeft: "auto" }}>
                    Est. monthly: ฿{(pricePerJob * tenant.stats.jobsMonth).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Account status */}
              <div>
                <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Account status</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["active", "trial", "suspended"].map(s => (
                    <button key={s} onClick={() => setStatus(s)} style={{
                      flex: 1, padding: "7px", borderRadius: 8, cursor: "pointer",
                      fontSize:14, fontWeight: 700, textTransform: "capitalize",
                      background: status === s ? (s === "active" ? C.greenBg : s === "trial" ? C.amberBg : C.redBg) : "transparent",
                      border: `1px solid ${status === s ? (s === "active" ? C.green : s === "trial" ? C.amber : C.red) : C.border}`,
                      color: status === s ? (s === "active" ? C.green : s === "trial" ? C.amber : C.red) : C.textDim,
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <button style={{
                background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "10px", fontSize:14, fontWeight: 700, cursor: "pointer",
              }}>Save configuration</button>
            </div>
          </Card>
        </div>

        {/* Right: Stats + history */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stats */}
          <div className="rsp-grid-2-eq" style={{}}>
            {[
              { label: "Jobs this month", value: tenant.stats.jobsMonth, color: C.blue },
              { label: "Total jobs", value: tenant.stats.jobsTotal, color: C.teal },
              { label: "Revenue (Mar)", value: `฿${(tenant.stats.revenue * 35).toLocaleString()}`, color: C.green },
              { label: "Outstanding", value: tenant.stats.outstanding > 0 ? `฿${(tenant.stats.outstanding * 35).toLocaleString()}` : "None", color: tenant.stats.outstanding > 0 ? C.red : C.textMid },
            ].map((s, i) => (
              <Card key={i}>
                <Stat label={s.label} value={s.value} color={s.color} />
              </Card>
            ))}
          </div>

          {/* API connections */}
          <Card>
            <CardHeader title="API connections" />
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "NSW Thailand API", key: "nsw", endpoint: "https://api.nsw.go.th/v2/submit" },
                { name: "กรมศุลกากร Portal", key: "customs", endpoint: "https://e-export.customs.go.th" },
                { name: "BoT Exchange Rate", key: "bot", endpoint: "https://api.bot.or.th/v1/fxrate" },
              ].map((api, i) => {
                const st = tenant.apiStatus[api.key] || "connected";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.bg3, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: st === "connected" ? C.teal : st === "pending" ? C.amber : C.red, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize:14, fontWeight: 600, color: C.text }}>{api.name}</div>
                      <div style={{ fontSize:13, color: C.textDim, fontFamily: C.mono, marginTop: 2 }}>{api.endpoint}</div>
                    </div>
                    <StatusPill status={st} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Invoice history */}
          <Card>
            <CardHeader title="Invoice history" />
            <div>
              {(tenantInvoices.length > 0 ? tenantInvoices : INVOICES.slice(0, 3)).map((inv, i) => (
                <div key={i} style={{
                  padding: "10px 18px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize:14, fontFamily: C.mono, color: C.textMid }}>{inv.id}</div>
                    <div style={{ fontSize:13, color: C.textDim, marginTop: 2 }}>{inv.jobs} jobs · Issued: {inv.issued}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize:15, fontWeight: 700, fontFamily: C.mono, color: inv.status === "paid" ? C.green : inv.status === "overdue" ? C.red : C.amber }}>
                      ฿{(inv.amount * 35).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 4 }}><StatusPill status={inv.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
