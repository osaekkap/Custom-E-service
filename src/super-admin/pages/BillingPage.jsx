import { useState } from "react";
import { C, INVOICES, fmt } from "../constants";
import { Card, Stat, StatusPill } from "../components/SharedUI";

export function BillingPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? INVOICES : INVOICES.filter(inv => inv.status === filter);
  const totalPending = INVOICES.filter(i => i.status === "pending").reduce((a, i) => a + i.amount, 0);
  const totalOverdue = INVOICES.filter(i => i.status === "overdue").reduce((a, i) => a + i.amount, 0);
  const totalPaid = INVOICES.filter(i => i.status === "paid").reduce((a, i) => a + i.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>Billing</h1>
        <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>All invoices across tenants</p>
      </div>

      {/* Summary */}
      <div className="rsp-grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: "Pending collection", value: fmt.thb(totalPending * 35), color: C.amber },
          { label: "Overdue", value: fmt.thb(totalOverdue * 35), color: C.red },
          { label: "Paid this month", value: fmt.thb(totalPaid * 35), color: C.green },
        ].map((s, i) => (
          <Card key={i}><Stat label={s.label} value={s.value} color={s.color} /></Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["all", "pending", "overdue", "paid"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize:14, fontWeight: 600, cursor: "pointer",
            background: filter === f ? C.teal : "transparent",
            color: filter === f ? C.bg0 : C.textMid,
            border: `1px solid ${filter === f ? C.teal : C.border}`,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      <Card>
        <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Invoice", "Tenant", "Jobs", "Amount", "Issued", "Due date", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize:13, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg3}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize:14, color: C.textMid }}>{inv.id}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontWeight: 600, color: C.text }}>{inv.tenantName}</td>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize:15, color: C.text }}>{inv.jobs}</td>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize:15, fontWeight: 700, color: inv.status === "paid" ? C.green : inv.status === "overdue" ? C.red : C.amber }}>฿{(inv.amount * 35).toLocaleString()}</td>
                <td style={{ padding: "12px 18px", fontSize:14, color: C.textDim }}>{inv.issued}</td>
                <td style={{ padding: "12px 18px", fontSize:14, color: inv.status === "overdue" ? C.red : C.textDim }}>{inv.due}</td>
                <td style={{ padding: "12px 18px" }}><StatusPill status={inv.status} /></td>
                <td style={{ padding: "12px 18px" }}>
                  {inv.status !== "paid" && (
                    <button style={{
                      background: "none", border: `1px solid ${C.teal}`, borderRadius: 6,
                      padding: "4px 10px", fontSize:13, color: C.teal, cursor: "pointer", fontWeight: 600,
                    }}>Send reminder</button>
                  )}
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
