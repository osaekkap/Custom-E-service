import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { reportsApi } from "../api/reportsApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn, downloadCSV } from "./ui/index.jsx";

const PIE_COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#D97706", "#DC2626", "#0EA5E9", "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B"];

export default function Reports() {
  const [monthly, setMonthly] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      reportsApi.monthlySummary({ months }).catch(() => []),
      reportsApi.topDestinations({ months }).catch(() => []),
    ]).then(([m, d]) => {
      setMonthly(Array.isArray(m) ? m : []);
      setDestinations(Array.isArray(d) ? d : []);
    }).catch(err => setError(err.message || "Failed to load reports"))
      .finally(() => setLoading(false));
  }, [months]);

  const totalExport = monthly.reduce((s, m) => s + (m.exportCount || 0), 0);
  const totalImport = monthly.reduce((s, m) => s + (m.importCount || 0), 0);
  const totalFob = monthly.reduce((s, m) => s + Number(m.totalFobUsd || 0), 0);

  const fmtUsd = (v) => `$${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtMonth = (m) => {
    if (!m) return "";
    const d = new Date(m + "-01");
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Reports</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Reports</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:error ? "#DC2626" : TEXT3 }}>
            {error || "Export analytics · monthly summary · FOB breakdown"}
          </p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[3, 6, 12].map(n => (
            <button key={n} onClick={() => setMonths(n)} style={{
              padding:"5px 13px", borderRadius:20, fontSize:14, fontWeight:600, cursor:"pointer",
              background: months === n ? BLUE : "transparent",
              color: months === n ? "#fff" : TEXT2,
              border: `1px solid ${months === n ? BLUE : BORDER}`,
            }}>{n}M</button>
          ))}
        </div>
      </div>

      {/* KPI Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label: "Export jobs", value: String(totalExport), color: "#2563EB" },
          { label: "Import jobs", value: String(totalImport), color: "#D97706" },
          { label: "Total FOB (USD)", value: fmtUsd(totalFob), color: "#16A34A" },
        ].map((s, i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:13, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:MONO }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Monthly Jobs Bar Chart */}
        <Card>
          <SectionHeader title="Monthly jobs" sub={`Last ${months} months`} />
          <div style={{ padding:"16px 20px" }}>
            {monthly.length === 0 ? (
              <div style={{ textAlign:"center", color:TEXT3, fontSize:14, padding:"30px 0" }}>ยังไม่มีข้อมูล</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthly.map(m => ({ ...m, name: fmtMonth(m.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: TEXT3 }} />
                  <YAxis tick={{ fontSize: 12, fill: TEXT3 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="exportCount" name="Export" fill="#2563EB" radius={[4,4,0,0]} />
                  <Bar dataKey="importCount" name="Import" fill="#D97706" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Top Destinations Pie Chart */}
        <Card>
          <SectionHeader title="FOB by destination" sub={`Last ${months} months — top 10`} />
          <div style={{ padding:"16px 20px" }}>
            {destinations.length === 0 ? (
              <div style={{ textAlign:"center", color:TEXT3, fontSize:14, padding:"30px 0" }}>ยังไม่มีข้อมูล</div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={destinations} dataKey="fobUsd" nameKey="destination" cx="50%" cy="50%" outerRadius={80} label={false}>
                      {destinations.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmtUsd(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                  {destinations.map((d, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:PIE_COLORS[i % PIE_COLORS.length], flexShrink:0 }} />
                      <span style={{ fontSize:13, color:TEXT, flex:1 }}>{d.destination}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:TEXT2, fontFamily:MONO }}>{fmtUsd(d.fobUsd)}</span>
                      <span style={{ fontSize:12, color:TEXT3 }}>({d.percentage || 0}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Monthly Detail Table */}
      <Card>
        <SectionHeader title="Monthly detail" sub={`Last ${months} months`} right={
          <Btn variant="secondary" style={{ fontSize:14 }} onClick={() => {
            if (monthly.length === 0) return;
            downloadCSV(`monthly-report-${new Date().toISOString().slice(0,10)}.csv`, monthly, [
              { label:"Month", get: (r) => r.month },
              { label:"Export", get: (r) => r.exportCount },
              { label:"Import", get: (r) => r.importCount },
              { label:"FOB (USD)", get: (r) => r.totalFobUsd },
              { label:"FOB (THB)", get: (r) => r.totalFobThb },
            ]);
          }}>Download CSV</Btn>
        }/>
        <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead>
            <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
              {["Month","Export","Import","Total Jobs","FOB (USD)","FOB (THB)"].map(h => (
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthly.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:"30px 16px", textAlign:"center", color:TEXT3 }}>ยังไม่มีข้อมูล</td></tr>
            ) : monthly.map((r, i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}` }}>
                <td style={{ padding:"11px 16px", fontWeight:600, color:TEXT }}>{fmtMonth(r.month)}</td>
                <td style={{ padding:"11px 16px", color:"#2563EB", fontFamily:MONO }}>{r.exportCount}</td>
                <td style={{ padding:"11px 16px", color:"#D97706", fontFamily:MONO }}>{r.importCount}</td>
                <td style={{ padding:"11px 16px", fontFamily:MONO, fontWeight:700, color:TEXT }}>{(r.exportCount || 0) + (r.importCount || 0)}</td>
                <td style={{ padding:"11px 16px", fontFamily:MONO, fontWeight:700, color:"#16A34A" }}>{fmtUsd(r.totalFobUsd)}</td>
                <td style={{ padding:"11px 16px", fontFamily:MONO, color:TEXT2 }}>฿{Number(r.totalFobThb || 0).toLocaleString("th-TH")}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
    </div>
  );
}
