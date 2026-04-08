import { useState } from "react";
import { C, TENANTS } from "../constants";
import { Card, StatusPill } from "../components/SharedUI";

export function TenantListPage({ onSelect, onNew }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? TENANTS : TENANTS.filter(t => t.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>Tenants</h1>
          <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>{filtered.length} factories registered</p>
        </div>
        <button onClick={onNew} style={{
          background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
          padding: "9px 18px", fontSize:14, fontWeight: 700, cursor: "pointer", fontFamily: C.mono,
        }}>+ Add tenant</button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["all", "active", "trial", "suspended"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize:14, fontWeight: 600, cursor: "pointer",
            background: filter === f ? C.teal : "transparent",
            color: filter === f ? C.bg0 : C.textMid,
            border: `1px solid ${filter === f ? C.teal : C.border}`,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Tenant", "Billing", "Jobs (Mar)", "Revenue", "Outstanding", "API", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize:13, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i}
                style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg3}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => onSelect(t)}
              >
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: C.bg3, border: `1px solid ${C.borderHi}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize:12, fontFamily: C.mono, fontWeight: 700, color: C.teal, flexShrink: 0,
                    }}>{t.code}</div>
                    <div>
                      <div style={{ fontSize:15, fontWeight: 600, color: C.text }}>{t.name}</div>
                      <div style={{ fontSize:13, color: C.textDim, marginTop: 1 }}>Tax: {t.taxId}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:14, color: C.text }}>{t.billingType === "per_job" ? "Per job" : `${t.termDays}-day term`}</div>
                  <div style={{ fontSize:13, color: C.textDim, marginTop: 1, fontFamily: C.mono }}>฿{t.pricePerJob}/job</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:18, fontWeight: 800, fontFamily: C.mono, color: C.text }}>{t.stats.jobsMonth}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:15, fontFamily: C.mono, color: C.green, fontWeight: 700 }}>฿{(t.stats.revenue * 35).toLocaleString()}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:15, fontFamily: C.mono, color: t.stats.outstanding > 0 ? C.red : C.textDim, fontWeight: t.stats.outstanding > 0 ? 700 : 400 }}>
                    {t.stats.outstanding > 0 ? `฿${(t.stats.outstanding * 35).toLocaleString()}` : "—"}
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.apiStatus.nsw === "connected" ? C.teal : t.apiStatus.nsw === "pending" ? C.amber : C.red }} />
                      <span style={{ fontSize:13, color: C.textDim }}>NSW</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.apiStatus.customs === "connected" ? C.teal : t.apiStatus.customs === "pending" ? C.amber : C.red }} />
                      <span style={{ fontSize:13, color: C.textDim }}>Customs</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}><StatusPill status={t.status} /></td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize:14, color: C.teal, fontWeight: 600 }}>Details →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
