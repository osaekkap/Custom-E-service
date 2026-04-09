import { useState, useEffect } from "react";
import { jobsApi } from "../../api/jobsApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, ROW_HOVER, Card, Btn, Badge, Tag, ApprovalBadge } from "../ui/index.jsx";
import { mapJob } from "../dashboard/DefaultDashboard.jsx";

function ShipmentList({ onNew, onDetail }) {
  const [filter, setFilter] = useState("ALL");
  const [jobs, setJobs] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setJobs(arr.map(mapJob));
    }).catch(err => {
      setError(err.message || "Failed to load shipments");
    }).finally(() => setApiLoading(false));
  }, []);

  const tabs = ["ALL","Export","Import","CLEARED","NSW_PROCESSING","DRAFT"];
  const shown = filter==="ALL" ? jobs : jobs.filter(s=>s.status===filter||s.type===filter);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Shipments</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:error ? "#DC2626" : TEXT3 }}>{apiLoading ? "Loading…" : error ? error : `${shown.length} records`}</p>
        </div>
        <Btn onClick={onNew}>+ New shipment</Btn>
      </div>

      <div className="shipment-tabs" style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding:"5px 13px", borderRadius:20, fontSize:14, fontWeight:600, cursor:"pointer",
            background:filter===t?BLUE:"transparent",
            color:filter===t?"#fff":TEXT2,
            border:`1px solid ${filter===t?BLUE:BORDER}`,
          }}>{t.replace("_"," ")}</button>
        ))}
      </div>

      <Card>
        <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14, minWidth:600 }}>
          <thead>
            <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
              {[
                { label:"Job ID",       cls:"" },
                { label:"Type",         cls:"" },
                { label:"Vessel",       cls:"" },
                { label:"FOB",          cls:"" },
                { label:"Items",        cls:"col-hide-tablet" },
                { label:"ผู้รับผิดชอบ", cls:"col-hide-tablet" },
                { label:"Approval",     cls:"col-hide-tablet" },
                { label:"Status",       cls:"" },
                { label:"Date",         cls:"col-hide-tablet" },
                { label:"",             cls:"" },
              ].map(h => (
                <th key={h.label} className={h.cls} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((s,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
                onMouseLeave={e=>e.currentTarget.style.background=W}
                onClick={() => onDetail(s)}>
                <td style={{ padding:"12px 16px", fontFamily:MONO, fontSize:14, fontWeight:700, color:TEXT, whiteSpace:"nowrap" }}>{s.id}</td>
                <td style={{ padding:"12px 16px" }}><Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"}/></td>
                <td style={{ padding:"12px 16px", color:TEXT2, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.vessel}</td>
                <td style={{ padding:"12px 16px", fontWeight:700, color:TEXT, whiteSpace:"nowrap" }}>{s.fob}</td>
                <td className="col-hide-tablet" style={{ padding:"12px 16px", fontFamily:MONO, color:TEXT2 }}>{s.items||"—"}</td>
                <td className="col-hide-tablet" style={{ padding:"12px 16px" }}>
                  {s.assignedToName
                    ? <span style={{ fontSize:13, color:TEXT, fontWeight:500 }}>{s.assignedToName}</span>
                    : <span style={{ fontSize:13, color:TEXT3 }}>—</span>
                  }
                </td>
                <td className="col-hide-tablet" style={{ padding:"12px 16px" }}><ApprovalBadge status={s.approvalStatus}/></td>
                <td style={{ padding:"12px 16px" }}><Badge status={s.status}/></td>
                <td className="col-hide-tablet" style={{ padding:"12px 16px", color:TEXT3, fontSize:14 }}>{s.date}</td>
                <td style={{ padding:"12px 16px", color:BLUE, fontSize:14, fontWeight:600 }}>→</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
    </div>
  );
}

export default ShipmentList;
