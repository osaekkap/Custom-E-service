import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn, downloadCSV } from "./ui/index.jsx";

export default function Reports() {
  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Reports</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Export analytics · monthly summary · FOB breakdown</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <SectionHeader title="Monthly jobs" sub="Jan–Mar 2026" />
          <div style={{ padding:"16px 20px" }}>
            {[
              { month:"January 2026",  export:28, import:8, fob:"$3.1M" },
              { month:"February 2026", export:35, import:9, fob:"$3.8M" },
              { month:"March 2026",    export:38, import:11, fob:"$4.2M" },
            ].map((r,i) => (
              <div key={i} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:TEXT }}>{r.month}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:"#16A34A" }}>{r.fob}</span>
                </div>
                <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                  <div style={{ height:8, background:"#2563EB", borderRadius:4, width:`${(r.export/50)*100}%` }}/>
                  <div style={{ height:8, background:"#D97706", borderRadius:4, width:`${(r.import/50)*100}%` }}/>
                </div>
                <div style={{ display:"flex", gap:16 }}>
                  <span style={{ fontSize:13, color:"#2563EB" }}>Export: {r.export}</span>
                  <span style={{ fontSize:13, color:"#D97706" }}>Import: {r.import}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="FOB by destination" sub="March 2026" />
          <div style={{ padding:"16px 20px" }}>
            {[
              { dest:"Korea",   fob:"$2.1M", pct:50, color:"#2563EB" },
              { dest:"Japan",   fob:"$1.1M", pct:26, color:"#7C3AED" },
              { dest:"Ireland", fob:"$0.7M", pct:17, color:"#16A34A" },
              { dest:"Others",  fob:"$0.3M", pct:7,  color:TEXT3 },
            ].map((r,i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:14, color:TEXT }}>{r.dest}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:r.color }}>{r.fob} ({r.pct}%)</span>
                </div>
                <div style={{ height:6, background:BG, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${r.pct}%`, height:"100%", background:r.color, borderRadius:3 }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Export by HS chapter" sub="March 2026 — top product categories" right={
          <Btn variant="secondary" style={{ fontSize:14 }} onClick={() => {
            const data = [
              { chapter:"8542", desc:"Electronic integrated circuits", jobs:"24", fob:"$2.8M", pct:"67%", trend:"↑" },
              { chapter:"8534", desc:"Printed circuits", jobs:"10", fob:"$0.8M", pct:"19%", trend:"→" },
              { chapter:"8524", desc:"Flat panel displays", jobs:"6", fob:"$0.4M", pct:"10%", trend:"↑" },
              { chapter:"3926", desc:"Plastic articles", jobs:"2", fob:"$0.2M", pct:"4%", trend:"↓" },
            ];
            downloadCSV(`export-report-${new Date().toISOString().slice(0,10)}.csv`, data, [
              { label:"HS Chapter", key:"chapter" },
              { label:"Description", key:"desc" },
              { label:"Jobs", key:"jobs" },
              { label:"FOB Value", key:"fob" },
              { label:"% of total", key:"pct" },
              { label:"Trend", key:"trend" },
            ]);
          }}>⬇ Download report</Btn>
        }/>
        <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead>
            <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
              {["HS Chapter","Description","Jobs","FOB value","% of total","Trend"].map(h=>(
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["8542","Electronic integrated circuits","24","$2.8M","67%","↑"],
              ["8534","Printed circuits","10","$0.8M","19%","→"],
              ["8524","Flat panel displays","6","$0.4M","10%","↑"],
              ["3926","Plastic articles","2","$0.2M","4%","↓"],
            ].map((r,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}` }}>
                <td style={{ padding:"11px 16px", fontFamily:MONO, fontWeight:700, color:"#2563EB" }}>{r[0]}</td>
                <td style={{ padding:"11px 16px", color:TEXT }}>{r[1]}</td>
                <td style={{ padding:"11px 16px", fontFamily:MONO, color:TEXT2 }}>{r[2]}</td>
                <td style={{ padding:"11px 16px", fontWeight:700, color:TEXT }}>{r[3]}</td>
                <td style={{ padding:"11px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:50, height:6, background:BG, borderRadius:3, overflow:"hidden" }}>
                      <div style={{ width:r[4], height:"100%", background:BLUE, borderRadius:3 }}/>
                    </div>
                    <span style={{ fontSize:14, color:TEXT2 }}>{r[4]}</span>
                  </div>
                </td>
                <td style={{ padding:"11px 16px", fontSize:16, color:r[5]==="↑"?"#16A34A":r[5]==="↓"?"#DC2626":TEXT3 }}>{r[5]}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
    </div>
  );
}
