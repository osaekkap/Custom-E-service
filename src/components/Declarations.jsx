import { useState, useEffect } from "react";
import { jobsApi } from "../api/jobsApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, ROW_HOVER, Card, SectionHeader, Btn, Badge, Tag, downloadCSV, printHTML } from "./ui/index.jsx";
import { mapJob } from "./dashboard/DefaultDashboard.jsx";

function Declarations() {
  const [view, setView] = useState("list");
  const [jobs, setJobs] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setJobs(arr.map(mapJob));
    }).catch(err => {
      setError(err.message || "Failed to load declarations");
      setJobs([]);
    });
  }, []);

  const declList = (jobs || []).filter(s => s.status !== "DRAFT");

  const DECL_COLS = [
    { label:"Declaration No.", get: (_,i) => `DEC-2026-0${230+i}` },
    { label:"Type",            key:"type" },
    { label:"Job Ref",         key:"id" },
    { label:"Vessel",          key:"vessel" },
    { label:"FOB Value",       key:"fob" },
    { label:"HS Code",         key:"hs" },
    { label:"Form",            get:() => "A008-1" },
    { label:"Status",          key:"status" },
    { label:"Date",            key:"date" },
    { label:"Consignee",       key:"consignee" },
  ];

  const handleExportCSV = () => {
    const cols = DECL_COLS.map(c => ({
      label: c.label,
      get: (row, i) => c.key ? row[c.key] : c.get(row, i),
    }));
    const dataWithIndex = declList.map((row, i) => ({ ...row, _i: i }));
    downloadCSV(`declarations-${new Date().toISOString().slice(0,10)}.csv`,
      dataWithIndex,
      cols.map(c => ({ label: c.label, get: (row) => c.get(row, row._i) }))
    );
  };

  const handleExportSelected = () => {
    const subset = [...selected].map(i => declList[i]);
    if (subset.length === 0) return alert("Please select at least one declaration");
    const csv = [
      DECL_COLS.map(c => c.label),
      ...subset.map((row, i) => DECL_COLS.map(c => c.key ? (row[c.key]||"") : c.get(row, i))),
    ].map(r => r.map(v => `"${String(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `selected-declarations.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintSelected = () => {
    const indices = [...selected];
    if (indices.length === 0) return alert("Please select at least one declaration");
    const rows = indices.map(i => declList[i]);
    const html = `<h2>Export Declarations — Selected</h2>
      <div className="table-wrapper"><table><thead><tr>${DECL_COLS.map(c=>`<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row,i) => `<tr>${DECL_COLS.map(c=>`<td>${c.key?row[c.key]||'':c.get(row,i)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    printHTML("Print Declarations", html);
  };

  const handlePrintRow = (row, i) => {
    const html = `<h2>Declaration: DEC-2026-0${230+i}</h2>
      <div className="table-wrapper"><table>${DECL_COLS.map(c => `<tr><th style="text-align:left;width:200px">${c.label}</th><td>${c.key?row[c.key]||'':c.get(row,i)}</td></tr>`).join('')}</table></div>`;
    printHTML(`DEC-2026-0${230+i}`, html);
  };

  const handleRowCSV = (row, i) => {
    const cols = DECL_COLS.map(c => ({ label: c.label, get: (r) => c.key ? r[c.key]||'' : c.get(r,i) }));
    downloadCSV(`DEC-2026-0${230+i}.csv`, [row], cols);
  };

  const toggleSelect = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev => prev.size === declList.length ? new Set() : new Set(declList.map((_,i)=>i)));
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Declarations</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:error ? "#DC2626" : TEXT3 }}>{error || "ใบขนสินค้าและเอกสารศุลกากร"}</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["list","cards"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding:"6px 12px", borderRadius:7, fontSize:14, fontWeight:600, cursor:"pointer",
              background:view===v?BLUE:"transparent",
              color:view===v?"#fff":TEXT2,
              border:`1px solid ${view===v?BLUE:BORDER}`,
            }}>{v==="list"?"≡ List":"⊞ Cards"}</button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="dashboard-metrics">
        {[
          { label:"Export declarations",  value: String(declList.filter(s=>s.type==="Export").length), color:"#2563EB" },
          { label:"Import declarations",  value: String(declList.filter(s=>s.type==="Import").length), color:"#D97706" },
          { label:"Pending submission",   value: String(declList.filter(s=>["DRAFT","PREPARING"].includes(s.status)).length), color:"#7C3AED" },
          { label:"Cleared",             value: String(declList.filter(s=>["CLEARED","COMPLETED"].includes(s.status)).length), color:"#16A34A" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:13, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:MONO }}>{jobs===null?"…":s.value}</div>
          </Card>
        ))}
      </div>

      {view === "list" && (
        <Card>
          <SectionHeader title="Declaration list" sub={`${selected.size > 0 ? `${selected.size} selected · ` : ""}Export A008-1 and Import declarations`} right={
            <div style={{ display:"flex", gap:8 }}>
              <Btn variant="secondary" style={{ fontSize:14 }} onClick={handlePrintSelected}>
                🖨 Print selected {selected.size > 0 ? `(${selected.size})` : ""}
              </Btn>
              <Btn variant="secondary" style={{ fontSize:14 }} onClick={handleExportCSV}>
                ⬇ Export CSV
              </Btn>
            </div>
          }/>
          <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                <th style={{ padding:"9px 16px", width:36 }}>
                  <input type="checkbox" checked={selected.size===declList.length && declList.length>0} onChange={toggleAll} style={{ cursor:"pointer" }}/>
                </th>
                {["Declaration no.","Type","Job ref","Vessel","FOB value","HS Code (main)","Form","Status","Date",""].map(h=>(
                  <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {declList.map((s,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer", background: selected.has(i)?"#EFF6FF":W }}
                  onMouseEnter={e=>{ if(!selected.has(i)) e.currentTarget.style.background=ROW_HOVER; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=selected.has(i)?"#EFF6FF":W; }}>
                  <td style={{ padding:"11px 16px" }}>
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} style={{ cursor:"pointer" }}/>
                  </td>
                  <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:14, color:"#7C3AED", fontWeight:700 }}>DEC-2026-0{230+i}</td>
                  <td style={{ padding:"11px 16px" }}><Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"}/></td>
                  <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:14, color:TEXT2, whiteSpace:"nowrap" }}>{s.id}</td>
                  <td style={{ padding:"11px 16px", color:TEXT2, maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.vessel}</td>
                  <td style={{ padding:"11px 16px", fontWeight:700, color:TEXT }}>{s.fob}</td>
                  <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:14, color:"#2563EB" }}>{s.hs}</td>
                  <td style={{ padding:"11px 16px", fontSize:14, color:TEXT2 }}>A008-1</td>
                  <td style={{ padding:"11px 16px" }}><Badge status={s.status}/></td>
                  <td style={{ padding:"11px 16px", color:TEXT3, fontSize:14 }}>{s.date}</td>
                  <td style={{ padding:"11px 16px", display:"flex", gap:6 }}>
                    <Btn variant="ghost" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => handlePrintRow(s, i)}>🖨 Print</Btn>
                    <Btn variant="ghost" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => handleRowCSV(s, i)}>⬇ CSV</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </Card>
      )}

      {view === "cards" && (
        <div className="doc-grid">
          {declList.map((s,i) => (
            <Card key={i} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:14, color:"#7C3AED", fontWeight:700, marginBottom:4 }}>DEC-2026-0{230+i}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"}/>
                    <Badge status={s.status}/>
                  </div>
                </div>
                <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} style={{ cursor:"pointer", marginTop:4 }}/>
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"5px 10px", fontSize:14 }}>
                  <span style={{ color:TEXT3 }}>Job ref</span><span style={{ fontFamily:MONO, color:TEXT2, whiteSpace:"nowrap" }}>{s.id}</span>
                  <span style={{ color:TEXT3 }}>Vessel</span><span style={{ color:TEXT2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.vessel}</span>
                  <span style={{ color:TEXT3 }}>FOB</span><span style={{ fontWeight:700, color:TEXT }}>{s.fob}</span>
                  <span style={{ color:TEXT3 }}>HS Code</span><span style={{ fontFamily:MONO, color:"#2563EB" }}>{s.hs}</span>
                  <span style={{ color:TEXT3 }}>Date</span><span style={{ color:TEXT3 }}>{s.date}</span>
                </div>
              </div>
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${BORDER2}`, display:"flex", gap:8 }}>
                <Btn variant="ghost" style={{ fontSize:13, padding:"3px 10px", flex:1 }} onClick={() => handlePrintRow(s, i)}>🖨 Print</Btn>
                <Btn variant="ghost" style={{ fontSize:13, padding:"3px 10px", flex:1 }} onClick={() => handleRowCSV(s, i)}>⬇ CSV</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Declarations;
