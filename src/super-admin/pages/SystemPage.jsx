import { C } from "../constants";
import { Card, CardHeader, StatusPill } from "../components/SharedUI";

export function SystemPage() {
  const apis = [
    { name: "NSW Thailand API", endpoint: "https://api.nsw.go.th/v2/", latency: "142ms", uptime: "99.9%", status: "connected", requests: "1,234" },
    { name: "กรมศุลกากร Portal", endpoint: "https://e-export.customs.go.th", latency: "380ms", uptime: "99.5%", status: "connected", requests: "892" },
    { name: "BoT Exchange Rate", endpoint: "https://api.bot.or.th/v1/", latency: "95ms", uptime: "100%", status: "connected", requests: "240" },
    { name: "Gemini Flash AI", endpoint: "https://generativelanguage.googleapis.com", latency: "1,240ms", uptime: "99.8%", status: "connected", requests: "4,510" },
    { name: "Supabase DB", endpoint: "supabase.co · PostgreSQL", latency: "18ms", uptime: "100%", status: "connected", requests: "—" },
  ];

  const logs = [
    { time: "10:42:31", level: "INFO", tenant: "THEL", msg: "Job SH-2026-0238 cleared by กรมศุลกากร" },
    { time: "10:38:12", level: "INFO", tenant: "SAPT", msg: "NSW submission NSW-TH-2026-039205 acknowledged" },
    { time: "10:22:04", level: "WARN", tenant: "MITR", msg: "Customs portal session timeout — retrying (1/3)" },
    { time: "10:21:58", level: "INFO", tenant: "MITR", msg: "Playwright session re-authenticated successfully" },
    { time: "09:55:18", level: "INFO", tenant: "THEL", msg: "AI extraction complete: 14 items, 2 HS codes flagged" },
    { time: "09:30:00", level: "INFO", tenant: "SYS", msg: "BoT exchange rate updated: USD 35.75 THB" },
    { time: "08:00:00", level: "INFO", tenant: "SYS", msg: "Daily backup completed — Supabase snapshot OK" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>System monitor</h1>
        <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>API health · connections · audit log</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="API connections" sub="Real-time status" />
        <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Service", "Endpoint", "Latency", "Uptime", "Req (24h)", "Status"].map(h => (
                <th key={h} style={{ padding: "9px 18px", textAlign: "left", fontSize:13, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apis.map((api, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 18px", fontSize:15, fontWeight: 600, color: C.text }}>{api.name}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: C.textDim }}>{api.endpoint}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: Number(api.latency) > 500 ? C.amber : C.green }}>{api.latency}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: C.teal }}>{api.uptime}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: C.text }}>{api.requests}</td>
                <td style={{ padding: "12px 18px" }}><StatusPill status={api.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Audit log" sub="Last 24 hours" />
        <div style={{ padding: "4px 0" }}>
          {logs.map((log, i) => (
            <div key={i} style={{
              padding: "8px 18px", borderBottom: i < logs.length - 1 ? `1px solid ${C.border}` : "none",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontFamily: C.mono, fontSize:14, color: C.textDim, width: 72, flexShrink: 0 }}>{log.time}</span>
              <span style={{
                fontSize:12, fontWeight: 700, padding: "2px 6px", borderRadius: 4, width: 36, textAlign: "center",
                background: log.level === "WARN" ? C.amberBg : C.tealBg,
                color: log.level === "WARN" ? C.amber : C.teal,
                border: `1px solid ${log.level === "WARN" ? C.amber + "44" : C.teal + "44"}`,
              }}>{log.level}</span>
              <span style={{
                fontSize:12, fontWeight: 700, padding: "2px 6px", borderRadius: 4, fontFamily: C.mono,
                background: C.bg3, color: C.textMid, border: `1px solid ${C.border}`,
              }}>{log.tenant}</span>
              <span style={{ fontSize:14, color: C.textMid }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
