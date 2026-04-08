import { C, TENANTS, INVOICES, JOBS_RECENT, fmt } from "../constants";
import { Card, CardHeader, Stat, StatusPill } from "../components/SharedUI";

export function OverviewPage({ onNav }) {
  const totalRevMonth = TENANTS.reduce((a, t) => a + t.stats.revenue, 0);
  const totalOutstanding = TENANTS.reduce((a, t) => a + t.stats.outstanding, 0);
  const totalJobs = TENANTS.reduce((a, t) => a + t.stats.jobsMonth, 0);
  const activeCount = TENANTS.filter(t => t.status === "active").length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>System Overview</h1>
        <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim, fontFamily: C.mono }}>March 2026 · All tenants</p>
      </div>

      {/* KPI row */}
      <div className="rsp-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Active tenants", value: activeCount, sub: `${TENANTS.length} total registered`, color: C.teal },
          { label: "Jobs this month", value: totalJobs, sub: "Across all factories", color: C.blue },
          { label: "Revenue (Mar)", value: fmt.thb(totalRevMonth * 35), sub: "≈ " + fmt.thb(totalRevMonth * 35) + " THB", color: C.green },
          { label: "Outstanding", value: fmt.thb(totalOutstanding * 35), sub: "2 overdue invoices", color: C.red },
        ].map((k, i) => (
          <Card key={i}>
            <Stat label={k.label} value={k.value} sub={k.sub} color={k.color} />
          </Card>
        ))}
      </div>

      <div className="rsp-grid-2" style={{ marginBottom: 16 }}>
        {/* Tenant summary table */}
        <Card>
          <CardHeader title="Tenant summary" sub="All registered factories" action={
            <button onClick={() => onNav("tenants")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize:14, color: C.textMid, cursor: "pointer" }}>View all →</button>
          } />
          <div>
            {TENANTS.map((t, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "32px 1fr 80px 80px 70px",
                alignItems: "center", gap: 8,
                padding: "10px 20px", borderBottom: i < TENANTS.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: C.bg3, border: `1px solid ${C.borderHi}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize:12, fontFamily: C.mono, fontWeight: 700, color: C.teal,
                }}>{t.code}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div style={{ fontSize:13, color: C.textDim, marginTop: 1 }}>{t.stats.jobsMonth} jobs · {t.billingType === "per_job" ? "Per job" : `${t.termDays}-day term`}</div>
                </div>
                <div style={{ fontSize:14, fontFamily: C.mono, color: C.green, textAlign: "right" }}>฿{(t.stats.revenue * 35).toLocaleString()}</div>
                <div style={{ textAlign: "right" }}><StatusPill status={t.status} /></div>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.apiStatus.nsw === "connected" ? C.teal : C.red }} title="NSW" />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.apiStatus.customs === "connected" ? C.teal : t.apiStatus.customs === "pending" ? C.amber : C.red }} title="Customs" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Billing alerts */}
          <Card>
            <CardHeader title="Billing alerts" />
            <div style={{ padding: "4px 0" }}>
              {INVOICES.filter(v => v.status !== "paid").map((inv, i) => (
                <div key={i} style={{
                  padding: "10px 18px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize:14, fontFamily: C.mono, color: C.textMid }}>{inv.id}</div>
                    <div style={{ fontSize:14, color: C.text, fontWeight: 500, marginTop: 2 }}>{inv.tenantName}</div>
                    <div style={{ fontSize:13, color: C.textDim, marginTop: 1 }}>Due: {inv.due}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize:15, fontWeight: 700, fontFamily: C.mono, color: inv.status === "overdue" ? C.red : C.amber }}>฿{(inv.amount * 35).toLocaleString()}</div>
                    <div style={{ marginTop: 4 }}><StatusPill status={inv.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent jobs */}
          <Card>
            <CardHeader title="Recent jobs" sub="All tenants" />
            <div>
              {JOBS_RECENT.slice(0, 4).map((j, i) => (
                <div key={i} style={{
                  padding: "8px 18px", borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: C.mono, fontSize:14, color: C.textMid }}>{j.id}</span>
                      <span style={{
                        fontSize:12, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                        background: j.type === "Export" ? C.blueBg : C.amberBg,
                        color: j.type === "Export" ? C.blue : C.amber,
                        border: `1px solid ${j.type === "Export" ? C.blue + "44" : C.amber + "44"}`,
                      }}>{j.type}</span>
                    </div>
                    <div style={{ fontSize:13, color: C.textDim, marginTop: 2 }}>{j.tenant} · {j.time}</div>
                  </div>
                  <StatusPill status={j.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
