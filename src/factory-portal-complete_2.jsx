import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./stores/AuthContext.jsx";
import LoginScreen from "./LoginScreen.jsx";
import RegisterScreen from "./RegisterScreen.jsx";
import { jobsApi } from "./api/jobsApi.js";
import { customerApi } from "./api/customerApi.js";
import { auditApi } from "./api/auditApi.js";
import client from "./api/client.js";

// ─── Constants ────────────────────────────────────────────────────
const STATUS = {
  DRAFT:          { label:"Draft",           color:"#64748B", bg:"#F1F5F9", border:"#CBD5E1" },
  PREPARING:      { label:"Preparing",       color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
  READY:          { label:"Ready",           color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE" },
  SUBMITTED:      { label:"Submitted",       color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE" },
  NSW_PROCESSING: { label:"NSW Processing",  color:"#0284C7", bg:"#F0F9FF", border:"#BAE6FD" },
  CUSTOMS_REVIEW: { label:"Customs Review",  color:"#EA580C", bg:"#FFF7ED", border:"#FED7AA" },
  CLEARED:        { label:"Cleared",         color:"#16A34A", bg:"#F0FDF4", border:"#BBF7D0" },
  COMPLETED:      { label:"Completed",       color:"#15803D", bg:"#DCFCE7", border:"#86EFAC" },
  REJECTED:       { label:"Rejected",        color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
};

const SHIPMENTS = [
  { id:"SH-2026-0234", type:"Export", vessel:"MSC AURORA V.124",    container:"MSCU7823410", hs:"8542.31.10", fob:"USD 128,450", status:"CLEARED",         date:"2026-03-18", items:14, nsw:"NSW-TH-2026-039180", consignee:"Samsung Electronics Korea", pod:"Busan, KR" },
  { id:"SH-2026-0235", type:"Export", vessel:"EVER GIVEN V.89",     container:"EISU4561230", hs:"8708.10.90", fob:"USD 87,200",  status:"NSW_PROCESSING",  date:"2026-03-19", items:8,  nsw:"NSW-TH-2026-039201", consignee:"Toyota Motor Thailand",     pod:"Yokohama, JP" },
  { id:"SH-2026-0236", type:"Import", vessel:"OOCL EUROPE V.32",    container:"OOLU6312870", hs:"8473.30.90", fob:"USD 45,600",  status:"CUSTOMS_REVIEW",  date:"2026-03-19", items:22, nsw:"NSW-TH-2026-039215", consignee:"ไทยอิเล็กทรอนิกส์",        pod:"Laem Chabang, TH" },
  { id:"SH-2026-0237", type:"Export", vessel:"COSCO PRIDE V.67",    container:"CSNU5012340", hs:"8542.31.10", fob:"USD 234,100", status:"SUBMITTED",       date:"2026-03-20", items:31, nsw:"NSW-TH-2026-039228", consignee:"Intel Ireland Ltd",          pod:"Dublin, IE" },
  { id:"SH-2026-0238", type:"Export", vessel:"MAERSK TITAN V.41",   container:"MSKU8723410", hs:"8542.90.10", fob:"USD 63,800",  status:"DRAFT",           date:"2026-03-20", items:0,  nsw:null,                 consignee:"—",                         pod:"—" },
  { id:"SH-2026-0239", type:"Import", vessel:"EVER BLOOM V.15",     container:"EISU1203450", hs:"8424.89.90", fob:"USD 19,200",  status:"PREPARING",       date:"2026-03-20", items:6,  nsw:null,                 consignee:"ไทยอิเล็กทรอนิกส์",        pod:"Laem Chabang, TH" },
];

const HS_MASTER = [
  { code:"8542.31.10", desc:"Electronic integrated circuits — processors/controllers", thDesc:"วงจรรวมไมโครคอนโทรลเลอร์", unit:"pcs", dutyRate:"0%", origin:"TH" },
  { code:"8542.90.10", desc:"Electronic integrated circuits — other parts", thDesc:"วงจรรวมชนิดอื่นๆ", unit:"pcs", dutyRate:"0%", origin:"TH" },
  { code:"8534.00.10", desc:"Printed circuits — single-sided", thDesc:"แผงวงจรพิมพ์ชนิดด้านเดียว", unit:"pcs", dutyRate:"0%", origin:"TH" },
  { code:"8473.30.90", desc:"Computer parts — other", thDesc:"ชิ้นส่วนคอมพิวเตอร์ชนิดอื่น", unit:"pcs", dutyRate:"0%", origin:"TH" },
  { code:"8708.10.90", desc:"Bumpers and parts thereof for vehicles", thDesc:"กันชนและส่วนประกอบ", unit:"pcs", dutyRate:"5%", origin:"TH" },
  { code:"3926.90.99", desc:"Other articles of plastic — other", thDesc:"ของทำด้วยพลาสติกอื่นๆ", unit:"pcs", dutyRate:"10%", origin:"TH" },
];

const INVOICES_FACTORY = [
  { id:"INV-2026-0085", jobs:42, amount:"฿661,500", status:"paid",    issued:"2026-02-28", due:"2026-03-05", period:"Feb 2026" },
  { id:"INV-2026-0089", jobs:5,  amount:"฿78,750",  status:"pending", issued:"2026-03-20", due:"2026-03-25", period:"Mar 2026 (partial)" },
];

// ─── Shared helpers ───────────────────────────────────────────────
const W = "#FFFFFF";
const BG = "#F8FAFC";
const BORDER = "#E2E8F0";
const BORDER2 = "#F1F5F9";
const TEXT  = "#0F172A";
const TEXT2 = "#475569";
const TEXT3 = "#94A3B8";
const BLUE  = "#0EA5E9";
const MONO  = "'JetBrains Mono','Courier New',monospace";

// ─── Utilities ────────────────────────────────────────────────────
function downloadCSV(filename, data, columns) {
  const headers = columns.map(c => c.label);
  const rows = data.map(row => columns.map(c => {
    const v = c.key !== undefined ? row[c.key] : c.get(row);
    return `"${String(v ?? '').replace(/"/g, '""')}"`;
  }));
  const csv = [headers.map(h => `"${h}"`), ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function printHTML(title, html) {
  const win = window.open('', '_blank', 'width=800,height=600');
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:20px}table{border-collapse:collapse;width:100%}
    td,th{border:1px solid #ccc;padding:8px;font-size:12px}th{background:#f5f5f5;font-weight:bold}
    h2{font-size:16px}@media print{.no-print{display:none}}</style></head>
    <body>${html}<div class="no-print" style="margin-top:20px">
    <button onclick="window.print()">Print</button></div></body></html>`);
  win.document.close();
}

function Badge({ status }) {
  const s = STATUS[status] || STATUS.DRAFT;
  return (
    <span style={{
      display:"inline-block", padding:"2px 9px", borderRadius:20,
      fontSize:10, fontWeight:700, letterSpacing:"0.4px",
      color:s.color, background:s.bg, border:`1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:12, ...style }}>{children}</div>;
}

function SectionHeader({ title, sub, right }) {
  return (
    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:TEXT3, marginTop:2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Btn({ children, variant="primary", onClick, style={} }) {
  const base = { border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer", ...style };
  const styles = {
    primary:   { background:BLUE,   color:"#fff" },
    secondary: { background:"none", color:TEXT2,  border:`1px solid ${BORDER}` },
    ghost:     { background:"none", color:BLUE },
    danger:    { background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA" },
  };
  return <button onClick={onClick} style={{ ...base, ...styles[variant] }}>{children}</button>;
}

function Tag({ label, color="#0EA5E9" }) {
  return (
    <span style={{
      display:"inline-block", padding:"1px 8px", borderRadius:4,
      fontSize:10, fontWeight:700, background:`${color}15`, color, border:`1px solid ${color}33`,
    }}>{label}</span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",    label:"Dashboard",      icon:"▦" },
  { id:"shipments",    label:"Shipments",       icon:"≡", badge:2 },
  { id:"new",          label:"New Shipment",    icon:"+" },
  { id:"nsw",          label:"NSW Tracking",    icon:"⊙" },
  { id:"declarations", label:"Declarations",    icon:"◫" },
  { id:"master",       label:"Master Data",     icon:"⊞" },
  { id:"billing",      label:"Billing",         icon:"◧" },
  { id:"reports",      label:"Reports",         icon:"⌗" },
  { id:"settings",     label:"Settings",        icon:"⚙" },
];

function Sidebar({ active, onNav }) {
  const auth = useContext(AuthContext);
  const userEmail = auth?.user?.email || "";
  const customer = auth?.user?.customer;
  const companyName = customer?.companyNameTh || customer?.companyNameEn || "—";
  const tenantId = customer ? `${customer.code}` : "—";

  return (
    <div style={{ width:220, background:"#0B1929", minHeight:"100vh", display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh" }}>
      <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#0EA5E9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#fff", flexShrink:0 }}>⚓</div>
          <div>
            <div style={{ color:"#F1F5F9", fontSize:11, fontWeight:700, letterSpacing:"1px", fontFamily:MONO }}>CUSTOMS-EDOC</div>
            <div style={{ color:"#475569", fontSize:10 }}>Factory Portal</div>
          </div>
        </div>
      </div>

      <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ background:"rgba(14,165,233,0.08)", borderRadius:8, padding:"8px 12px", border:"1px solid rgba(14,165,233,0.2)", cursor:"pointer" }} onClick={() => onNav("settings")}>
          <div style={{ fontSize:9, color:"#0EA5E9", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:3 }}>Active factory</div>
          <div style={{ fontSize:12, color:"#E2E8F0", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{companyName}</div>
          <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{tenantId}</div>
        </div>
      </div>

      <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
        {NAV.map(item => {
          const on = active === item.id || (active === "shipment_detail" && item.id === "shipments");
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display:"flex", alignItems:"center", gap:9,
              width:"100%", padding:"8px 11px", borderRadius:7, marginBottom:2,
              background: on ? "rgba(14,165,233,0.12)" : "transparent",
              border: `1px solid ${on ? "rgba(14,165,233,0.25)" : "transparent"}`,
              color: on ? "#38BDF8" : "#64748B",
              cursor:"pointer", textAlign:"left", fontSize:12,
              fontWeight: on ? 600 : 400,
            }}>
              <span style={{ fontSize:13, width:16, textAlign:"center" }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background:"#EF4444", color:"#fff", borderRadius:10, padding:"1px 5px", fontSize:9, fontWeight:700 }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize:10, color:"#64748B", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{userEmail}</div>
        <button onClick={auth?.logout} style={{
          width:"100%", padding:"6px 10px", borderRadius:6, border:"1px solid rgba(239,68,68,0.3)",
          background:"rgba(239,68,68,0.08)", color:"#EF4444", fontSize:11, fontWeight:600, cursor:"pointer",
        }}>Sign out</button>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:8 }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:"#22C55E" }}/>
          <span style={{ fontSize:10, color:"#334155" }}>NSW · Customs · BoT</span>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function Dashboard({ onNav }) {
  const auth = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const companyName = auth?.user?.customer?.companyNameTh || auth?.user?.customer?.companyNameEn || "บริษัท";

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setJobs(arr);
    }).catch(() => {});
  }, []);

  // derive stats from real jobs (fallback to 0 if no data)
  const thisMonth = new Date().toISOString().substring(0,7);
  const monthJobs = jobs.filter(j => (j.createdAt||"").startsWith(thisMonth));
  const pending = jobs.filter(j => ["NSW_PROCESSING","CUSTOMS_REVIEW","SUBMITTED"].includes(j.status));
  const cleared = jobs.filter(j => ["CLEARED","COMPLETED"].includes(j.status));
  const pendingUi = (jobs.length > 0 ? pending : SHIPMENTS.filter(s => ["NSW_PROCESSING","CUSTOMS_REVIEW","SUBMITTED"].includes(s.status)));
  const recentUi = jobs.length > 0 ? jobs.slice(0,5).map(mapJob) : SHIPMENTS.slice(0,5);

  const mon = new Date().toLocaleString("th-TH",{month:"long", year:"numeric"});

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Dashboard</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>{companyName} · {mon}</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Jobs this month",    value: jobs.length>0 ? String(monthJobs.length) : "—", sub:"ทั้งหมดในเดือนนี้",   color:"#0EA5E9" },
          { label:"Awaiting clearance", value: jobs.length>0 ? String(pending.length) : "—",   sub:"NSW + Customs queue", color:"#F59E0B" },
          { label:"Cleared / Done",     value: jobs.length>0 ? String(cleared.length) : "—",   sub:"All export jobs",     color:"#22C55E" },
          { label:"Total jobs",         value: jobs.length>0 ? String(jobs.length) : "—",       sub:"ทั้งหมดในระบบ",       color:"#8B5CF6" },
        ].map((k,i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:10, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>{k.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:k.color, fontFamily:MONO, marginBottom:4 }}>{k.value}</div>
            <div style={{ fontSize:11, color:TEXT3 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
        <Card>
          <SectionHeader title="Recent shipments" right={<Btn variant="ghost" onClick={() => onNav("shipments")} style={{ fontSize:11 }}>View all →</Btn>} />
          {recentUi.length === 0 && <div style={{ padding:"20px", fontSize:12, color:TEXT3, textAlign:"center" }}>ยังไม่มี shipment</div>}
          {recentUi.map((s,i) => (
            <div key={i} onClick={() => onNav("shipment_detail", s)} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"11px 20px", borderBottom:i<recentUi.length-1?`1px solid ${BORDER2}`:"none",
              cursor:"pointer",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=BG}
            onMouseLeave={e=>e.currentTarget.style.background=W}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:TEXT, fontFamily:MONO }}>{s.id}</span>
                  <Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"} />
                </div>
                <div style={{ fontSize:11, color:TEXT3 }}>{s.vessel} · {s.fob}</div>
              </div>
              <Badge status={s.status} />
            </div>
          ))}
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card>
            <SectionHeader title="Jobs awaiting clearance" />
            {pendingUi.length === 0 && <div style={{ padding:"20px", fontSize:12, color:TEXT3, textAlign:"center" }}>All clear ✓</div>}
            {pendingUi.slice(0,5).map((s,i) => (
              <div key={i} style={{ padding:"10px 18px", borderBottom:i<Math.min(pendingUi.length,5)-1?`1px solid ${BORDER2}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:TEXT, fontFamily:MONO }}>{s.id || s.jobNo}</span>
                  <Badge status={s.status} />
                </div>
                <div style={{ fontSize:11, color:TEXT3 }}>{s.fob} · {s.date || s.createdAt?.substring(0,10)}</div>
              </div>
            ))}
          </Card>

          <Card>
            <SectionHeader title="Billing summary" />
            <div style={{ padding:"14px 18px" }}>
              {[
                { label:"Jobs this month", value:"42 jobs",   color:TEXT  },
                { label:"Rate per job",    value:"฿450 / job",color:TEXT2 },
                { label:"Est. this month", value:"฿18,900",   color:"#16A34A" },
                { label:"Outstanding",     value:"฿78,750",   color:"#DC2626" },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                  <span style={{ fontSize:12, color:TEXT3 }}>{r.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:r.color }}>{r.value}</span>
                </div>
              ))}
              <Btn variant="secondary" onClick={() => onNav("billing")} style={{ width:"100%", marginTop:12, textAlign:"center" }}>View invoices</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── SHIPMENT LIST ────────────────────────────────────────────────
function mapJob(job) {
  return {
    id: job.jobNo,
    _id: job.id,
    type: job.type === "EXPORT" ? "Export" : "Import",
    vessel: job.vesselName || "—",
    container: job.containerNo || "—",
    hs: "—",
    fob: job.totalFobUsd ? `USD ${Number(job.totalFobUsd).toLocaleString()}` : "—",
    status: job.status,
    date: job.createdAt?.substring(0, 10) || "—",
    items: job._count?.declarations ?? 0,
    nsw: job.nswRefNo || null,
    consignee: job.consigneeNameEn || "—",
    pod: job.portOfDischarge || job.portOfLoading || "—",
    _raw: job,
  };
}

function ShipmentList({ onNew, onDetail }) {
  const [filter, setFilter] = useState("ALL");
  const [jobs, setJobs] = useState(SHIPMENTS);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    jobsApi.list().then(data => {
      if (data?.data?.length > 0) setJobs(data.data.map(mapJob));
      else if (Array.isArray(data) && data.length > 0) setJobs(data.map(mapJob));
    }).catch(() => {/* fallback to mock data */}).finally(() => setApiLoading(false));
  }, []);

  const tabs = ["ALL","Export","Import","CLEARED","NSW_PROCESSING","DRAFT"];
  const shown = filter==="ALL" ? jobs : jobs.filter(s=>s.status===filter||s.type===filter);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Shipments</h1>
          <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>{apiLoading ? "Loading…" : `${shown.length} records`}</p>
        </div>
        <Btn onClick={onNew}>+ New shipment</Btn>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding:"5px 13px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer",
            background:filter===t?BLUE:"transparent",
            color:filter===t?"#fff":TEXT2,
            border:`1px solid ${filter===t?BLUE:BORDER}`,
          }}>{t.replace("_"," ")}</button>
        ))}
      </div>

      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
              {["Job ID","Type","Vessel","Container","HS Code","FOB","Items","Status","Date",""].map(h => (
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((s,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background=BG}
                onMouseLeave={e=>e.currentTarget.style.background=W}
                onClick={() => onDetail(s)}>
                <td style={{ padding:"12px 16px", fontFamily:MONO, fontSize:11, fontWeight:700, color:TEXT }}>{s.id}</td>
                <td style={{ padding:"12px 16px" }}><Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"}/></td>
                <td style={{ padding:"12px 16px", color:TEXT2, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.vessel}</td>
                <td style={{ padding:"12px 16px", fontFamily:MONO, fontSize:11, color:TEXT2 }}>{s.container}</td>
                <td style={{ padding:"12px 16px", fontFamily:MONO, fontSize:11, color:"#2563EB", fontWeight:600 }}>{s.hs}</td>
                <td style={{ padding:"12px 16px", fontWeight:700, color:TEXT }}>{s.fob}</td>
                <td style={{ padding:"12px 16px", fontFamily:MONO, color:TEXT2 }}>{s.items||"—"}</td>
                <td style={{ padding:"12px 16px" }}><Badge status={s.status}/></td>
                <td style={{ padding:"12px 16px", color:TEXT3, fontSize:11 }}>{s.date}</td>
                <td style={{ padding:"12px 16px", color:BLUE, fontSize:11, fontWeight:600 }}>→</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── SHIPMENT DETAIL ──────────────────────────────────────────────
function ShipmentDetail({ job, onBack }) {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview","items","timeline","documents"];

  const ITEMS = [
    { seq:1, desc:"Semiconductor IC Controller", thDesc:"วงจรรวมไมโครคอนโทรลเลอร์", hs:"8542.31.10", qty:2000, unit:"pcs", fob:"USD 24.50", total:"USD 49,000", origin:"TH", ok:true },
    { seq:2, desc:"PCB Assembly Board",          thDesc:"แผงวงจรพิมพ์",              hs:"8534.00.10", qty:500,  unit:"pcs", fob:"USD 85.00", total:"USD 42,500", origin:"TH", ok:true },
    { seq:3, desc:"LCD Display Module 7-inch",   thDesc:"จอแสดงผลแอลซีดี",          hs:"8524.12.90", qty:300,  unit:"pcs", fob:"USD 45.20", total:"USD 13,560", origin:"TH", ok:true },
    { seq:4, desc:"Power Supply Unit 12V",       thDesc:"แหล่งจ่ายไฟ 12V",          hs:"8504.40.90", qty:150,  unit:"pcs", fob:"USD 18.00", total:"USD 2,700",  origin:"TH", ok:false },
    { seq:5, desc:"Enclosure Housing ABS",       thDesc:"กล่องพลาสติก ABS",         hs:"3926.90.99", qty:200,  unit:"pcs", fob:"USD 12.50", total:"USD 2,500",  origin:"TH", ok:true },
  ];

  const TL = [
    { step:"Job created",           done:true,   time:"Mar 18, 08:30", by:"Somchai K.", detail:"Job SH-2026-0234 created" },
    { step:"Documents uploaded",    done:true,   time:"Mar 18, 08:45", by:"Somchai K.", detail:"Invoice + Packing List + Booking" },
    { step:"AI extraction",         done:true,   time:"Mar 18, 08:47", by:"AI (Gemini)",detail:"14 items extracted · 13 HS matched" },
    { step:"HS code verified",      done:true,   time:"Mar 18, 09:12", by:"Somchai K.", detail:"1 manual entry — Power Supply" },
    { step:"Declaration generated", done:true,   time:"Mar 18, 09:28", by:"System",     detail:"A008-1 ref: DEC-2026-0234" },
    { step:"Submitted to NSW",      done:true,   time:"Mar 18, 10:02", by:"System",     detail:"NSW-TH-2026-039180" },
    { step:"NSW approved",          done:true,   time:"Mar 18, 14:30", by:"NSW System", detail:"Reference confirmed" },
    { step:"Customs cleared",       done:true,   time:"Mar 18, 16:45", by:"กรมศุลกากร",detail:"Ref: CUST-2026-039180-A" },
    { step:"Completed",             done:true,   time:"Mar 19, 08:00", by:"System",     detail:"Job closed · Billing item created" },
  ];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <Btn variant="secondary" onClick={onBack}>← Back</Btn>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:TEXT, fontFamily:MONO }}>{job.id}</h1>
            <Tag label={job.type} color={job.type==="Export"?"#2563EB":"#D97706"} />
            <Badge status={job.status} />
          </div>
          <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>{job.vessel} · {job.fob} · {job.date}</p>
        </div>
        {job.status !== "COMPLETED" && job.status !== "CLEARED" && (
          <Btn>Continue →</Btn>
        )}
      </div>

      {/* Tab nav */}
      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:20 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:"10px 18px", background:"none", border:"none",
            borderBottom:`2px solid ${tab===t?BLUE:"transparent"}`,
            color:tab===t?BLUE:TEXT2, fontWeight:tab===t?700:400,
            fontSize:13, cursor:"pointer", textTransform:"capitalize",
          }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <SectionHeader title="Shipment details" />
            <div style={{ padding:"16px 20px", display:"grid", gap:10 }}>
              {[
                ["Job number",    job.id],
                ["Type",          job.type],
                ["Vessel",        job.vessel],
                ["Container",     job.container],
                ["Consignee",     job.consignee],
                ["Port of discharge", job.pod],
                ["FOB value",     job.fob],
                ["NSW reference", job.nsw || "—"],
              ].map(([l,v],i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"150px 1fr", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:TEXT3, fontWeight:600 }}>{l}</span>
                  <span style={{ fontSize:12, color:TEXT, fontFamily: l.includes("number")||l.includes("reference")||l.includes("Container")?MONO:"inherit" }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionHeader title="Declaration info" />
            <div style={{ padding:"16px 20px", display:"grid", gap:10 }}>
              {[
                ["Declaration no.", "DEC-2026-0234"],
                ["Form",           "A008-1 Export"],
                ["HS Code (main)", job.hs],
                ["Items",          `${job.items} items`],
                ["Exchange rate",  "35.75 THB/USD"],
                ["FOB (THB)",      "฿4,592,094"],
                ["Privilege code", "IEAT Zone 3"],
                ["Exporter tax ID","0105561000123"],
              ].map(([l,v],i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"150px 1fr", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:TEXT3, fontWeight:600 }}>{l}</span>
                  <span style={{ fontSize:12, color:TEXT, fontFamily: l.includes("no.")||l.includes("HS")||l.includes("tax")?MONO:"inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:"12px 20px", borderTop:`1px solid ${BORDER2}`, display:"flex", gap:8 }}>
              <Btn variant="secondary" style={{ fontSize:11 }} onClick={() => {
                const html = `<h2>Export Declaration A008-1 — ${job.id}</h2>
                  <table>
                    <tr><th style="text-align:left;width:200px">Job Number</th><td>${job.id}</td></tr>
                    <tr><th style="text-align:left">Type</th><td>${job.type}</td></tr>
                    <tr><th style="text-align:left">Vessel</th><td>${job.vessel}</td></tr>
                    <tr><th style="text-align:left">Container</th><td>${job.container||'—'}</td></tr>
                    <tr><th style="text-align:left">Consignee</th><td>${job.consignee||'—'}</td></tr>
                    <tr><th style="text-align:left">Port of Discharge</th><td>${job.pod||'—'}</td></tr>
                    <tr><th style="text-align:left">FOB Value</th><td>${job.fob}</td></tr>
                    <tr><th style="text-align:left">NSW Reference</th><td>${job.nsw||'—'}</td></tr>
                    <tr><th style="text-align:left">Declaration No.</th><td>DEC-2026-0234</td></tr>
                    <tr><th style="text-align:left">Form</th><td>A008-1 Export</td></tr>
                    <tr><th style="text-align:left">Date</th><td>${job.date||'—'}</td></tr>
                  </table>`;
                printHTML(`A008-1 — ${job.id}`, html);
              }}>🖨 Print A008-1</Btn>
              <Btn variant="secondary" style={{ fontSize:11 }} onClick={() => {
                const cols = [
                  { label:"Job Number", get: r => r.id },
                  { label:"Type", get: r => r.type },
                  { label:"Vessel", get: r => r.vessel||'' },
                  { label:"Container", get: r => r.container||'' },
                  { label:"Consignee", get: r => r.consignee||'' },
                  { label:"FOB", get: r => r.fob||'' },
                  { label:"HS Code", get: r => r.hs||'' },
                  { label:"Status", get: r => r.status||'' },
                  { label:"Date", get: r => r.date||'' },
                  { label:"NSW Ref", get: r => r.nsw||'' },
                ];
                downloadCSV(`NETBAY-${job.id}.csv`, [job], cols);
              }}>⬇ Export Netbay CSV</Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "items" && (
        <Card>
          <SectionHeader title={`Items (${ITEMS.length})`} sub="Extracted by AI · verified" />
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                {["#","Description","Thai desc.","HS Code","Qty","Unit","FOB/unit","Total","Origin",""].map(h=>(
                  <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((it,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, background:it.ok?W:"#FFFBEB" }}>
                  <td style={{ padding:"10px 14px", color:TEXT3 }}>{it.seq}</td>
                  <td style={{ padding:"10px 14px", fontWeight:500, color:TEXT, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.desc}</td>
                  <td style={{ padding:"10px 14px", color:TEXT2, fontSize:11 }}>{it.thDesc}</td>
                  <td style={{ padding:"10px 14px", fontFamily:MONO, fontSize:11, color:"#2563EB", fontWeight:600 }}>{it.hs}</td>
                  <td style={{ padding:"10px 14px", fontFamily:MONO, color:TEXT2 }}>{it.qty.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:TEXT2 }}>{it.unit}</td>
                  <td style={{ padding:"10px 14px", color:TEXT2 }}>{it.fob}</td>
                  <td style={{ padding:"10px 14px", fontWeight:600, color:TEXT }}>{it.total}</td>
                  <td style={{ padding:"10px 14px" }}><Tag label={it.origin} color="#16A34A"/></td>
                  <td style={{ padding:"10px 14px" }}>
                    {it.ok
                      ? <span style={{ fontSize:10, color:"#16A34A", fontWeight:700 }}>✓ AI</span>
                      : <span style={{ fontSize:10, color:"#D97706", fontWeight:700 }}>Manual</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "timeline" && (
        <Card>
          <SectionHeader title="Job timeline" sub="Complete audit trail" />
          <div style={{ padding:"20px 24px" }}>
            {TL.map((t,i) => (
              <div key={i} style={{ display:"flex", gap:14, marginBottom: i<TL.length-1?0:0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:18 }}>
                  <div style={{
                    width:18, height:18, borderRadius:"50%", flexShrink:0,
                    background:t.done?"#22C55E":"#E2E8F0",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, color:"#fff", fontWeight:700,
                  }}>{t.done?"✓":""}</div>
                  {i<TL.length-1 && <div style={{ width:2, flex:1, minHeight:16, background:t.done?"#BBF7D0":"#E2E8F0", margin:"2px 0" }}/>}
                </div>
                <div style={{ paddingBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{t.step}</span>
                    <span style={{ fontSize:11, color:TEXT3, fontFamily:MONO }}>{t.time}</span>
                    <span style={{ fontSize:10, color:TEXT3 }}>by {t.by}</span>
                  </div>
                  <div style={{ fontSize:11, color:TEXT3 }}>{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "documents" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            { name:"Commercial Invoice",   file:"INV-SH-2026-0234.pdf",    size:"245 KB", uploaded:"Mar 18, 08:45", type:"source" },
            { name:"Packing List",         file:"PL-SH-2026-0234.xlsx",    size:"88 KB",  uploaded:"Mar 18, 08:45", type:"source" },
            { name:"Booking Confirmation", file:"BOOK-MSC-AURORA-124.pdf", size:"312 KB", uploaded:"Mar 18, 08:46", type:"source" },
            { name:"Export Declaration A008-1", file:"DEC-2026-0234.pdf",  size:"156 KB", uploaded:"Mar 18, 09:28", type:"generated" },
            { name:"Netbay CSV Export",    file:"NETBAY-SH-2026-0234.csv", size:"12 KB",  uploaded:"Mar 18, 09:30", type:"generated" },
            { name:"Customs Receipt",      file:"CUST-2026-039180-A.pdf",  size:"98 KB",  uploaded:"Mar 18, 16:45", type:"official" },
          ].map((doc,i) => (
            <Card key={i} style={{ padding:"16px" }}>
              <div style={{ fontSize:24, marginBottom:10 }}>
                {doc.file.endsWith(".pdf")?"📄":doc.file.endsWith(".xlsx")?"📊":doc.file.endsWith(".csv")?"📋":"📎"}
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:TEXT, marginBottom:4 }}>{doc.name}</div>
              <div style={{ fontSize:10, fontFamily:MONO, color:TEXT3, marginBottom:4 }}>{doc.file}</div>
              <div style={{ fontSize:10, color:TEXT3, marginBottom:8 }}>{doc.size} · {doc.uploaded}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <Tag label={doc.type} color={doc.type==="source"?BLUE:doc.type==="generated"?"#7C3AED":"#16A34A"} />
                <Btn variant="ghost" style={{ fontSize:11, padding:"3px 8px" }} onClick={() => {
                  // In production this would be a signed URL from Supabase Storage
                  // For now, show the filename in an alert since there's no real file
                  alert(`ไฟล์ "${doc.file}" จะถูกดาวน์โหลดจาก Storage\n(ต้องเชื่อมต่อ Supabase Storage จริง)`);
                }}>⬇ Download</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NEW SHIPMENT WIZARD ──────────────────────────────────────────
function NewShipment({ onBack, onCreated }) {
  const [step, setStep] = useState(1);
  const [submitMethod, setSubmitMethod] = useState("nsw");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [form, setForm] = useState({
    type: "EXPORT",
    vesselName: "MSC AURORA V.124",
    containerNo: "MSCU7823410",
    portOfLoading: "Laem Chabang (THLCH)",
    portOfDischarge: "Busan, Korea",
    etd: "2026-03-25",
    consigneeNameEn: "Samsung Electronics Korea",
    currency: "USD",
  });
  const STEPS = ["Upload documents","AI extraction & verify","Review & submit"];

  const handleCreateJob = async () => {
    setSubmitting(true);
    setSubmitErr("");
    try {
      const job = await jobsApi.create({
        type: form.type,
        vesselName: form.vesselName || undefined,
        containerNo: form.containerNo || undefined,
        portOfLoading: form.portOfLoading || undefined,
        portOfDischarge: form.portOfDischarge || undefined,
        etd: form.etd || undefined,
        consigneeNameEn: form.consigneeNameEn || undefined,
        currency: form.currency || "USD",
      });
      if (onCreated) onCreated(job);
      else onBack();
    } catch(e) {
      const msg = e?.response?.data?.message;
      setSubmitErr(Array.isArray(msg) ? msg.join(", ") : (msg || "เกิดข้อผิดพลาด"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <Btn variant="secondary" onClick={onBack}>← Back</Btn>
        <div>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>New export shipment</h1>
          <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>ยื่นใบขนสินค้าขาออก · Export declaration wizard</p>
        </div>
      </div>

      {/* Steps */}
      <Card style={{ marginBottom:22, padding:"16px 24px" }}>
        <div style={{ display:"flex", alignItems:"center" }}>
          {STEPS.map((s,i) => {
            const n=i+1, done=step>n, active=step===n;
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap" }}>
                  <div style={{
                    width:26, height:26, borderRadius:"50%",
                    background:done?"#22C55E":active?BLUE:"#F1F5F9",
                    border:`2px solid ${done?"#22C55E":active?BLUE:BORDER}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color:done||active?"#fff":TEXT3,
                  }}>{done?"✓":n}</div>
                  <span style={{ fontSize:12, fontWeight:active?700:400, color:active?TEXT:TEXT3 }}>{s}</span>
                </div>
                {i<STEPS.length-1 && <div style={{ flex:1, height:1, background:done?"#BBF7D0":BORDER, margin:"0 14px" }}/>}
              </div>
            );
          })}
        </div>
      </Card>

      {step===1 && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:16 }}>
            {[
              { title:"Commercial Invoice",    accept:"PDF, XLSX, CSV", required:true  },
              { title:"Packing List",          accept:"PDF, XLSX, CSV", required:true  },
              { title:"Booking Confirmation",  accept:"PDF",            required:false },
            ].map((doc,i) => (
              <Card key={i} style={{ padding:"24px 18px", textAlign:"center", cursor:"pointer", border:`2px dashed ${BORDER}`, background:BG }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=BLUE}
                onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
                <div style={{ fontSize:28, marginBottom:10 }}>📄</div>
                <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:4 }}>
                  {doc.title} {doc.required && <span style={{ color:"#DC2626" }}>*</span>}
                </div>
                <div style={{ fontSize:11, color:TEXT3, marginBottom:14 }}>{doc.accept} · Max 20 MB</div>
                <Btn variant="secondary" style={{ fontSize:11 }}>Choose file</Btn>
              </Card>
            ))}
          </div>

          <Card style={{ padding:"14px 18px", marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:TEXT, marginBottom:10 }}>AI extraction settings</div>
            <div style={{ display:"flex", gap:24 }}>
              {[
                { label:"Extraction mode",   value:"DECLARATION_PREP" },
                { label:"AI provider",       value:"Gemini Flash 2.0" },
                { label:"Fallback",          value:"GLM-4V → OpenRouter" },
                { label:"Thai translation",  value:"Auto-enabled" },
              ].map((r,i) => (
                <div key={i}>
                  <div style={{ fontSize:10, color:TEXT3, fontWeight:600, marginBottom:2 }}>{r.label}</div>
                  <div style={{ fontSize:11, color:TEXT, fontWeight:500 }}>{r.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <Btn onClick={() => setStep(2)}>Extract with AI →</Btn>
          </div>
        </div>
      )}

      {step===2 && (
        <div>
          {/* AI status bar */}
          <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"12px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E" }}/>
            <span style={{ fontSize:12, fontWeight:700, color:"#15803D" }}>AI Extraction complete</span>
            <span style={{ fontSize:11, color:"#16A34A" }}>Gemini Flash · 14 items · 13 HS matched · 1 missing</span>
            <div style={{ marginLeft:"auto", background:"#FEF3C7", border:"1px solid #FDE68A", borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700, color:"#D97706" }}>1 item needs HS code</div>
          </div>

          {/* Header fields */}
          <Card style={{ padding:"16px 20px", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:TEXT, marginBottom:12 }}>Shipment header</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {[
                { label:"Shipper", val:"บริษัท ไทยอิเล็กทรอนิกส์ จำกัด" },
                { label:"Consignee", val:"Samsung Electronics Korea" },
                { label:"Vessel", val:"MSC AURORA V.124" },
                { label:"Container", val:"MSCU7823410" },
                { label:"Port of Loading", val:"Laem Chabang (THLCH)" },
                { label:"Port of Discharge", val:"Busan, Korea" },
                { label:"ETD", val:"2026-03-25" },
                { label:"Exchange Rate", val:"35.75 THB/USD" },
              ].map((f,i) => (
                <div key={i}>
                  <label style={{ fontSize:10, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase" }}>{f.label}</label>
                  <input defaultValue={f.val} style={{ width:"100%", background:BG, border:`1px solid ${BORDER}`, borderRadius:7, padding:"7px 10px", fontSize:11, color:TEXT, boxSizing:"border-box" }}/>
                </div>
              ))}
            </div>
          </Card>

          {/* Items table */}
          <Card style={{ marginBottom:14 }}>
            <SectionHeader title="Extracted items" sub="Review and confirm HS codes" />
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["#","Description","Thai description","HS Code","Qty","Unit","FOB/unit","Status"].map(h=>(
                    <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [1,"Semiconductor IC Controller","วงจรรวมไมโครคอนโทรลเลอร์","8542.31.10","2,000","pcs","$24.50",true],
                  [2,"PCB Assembly Board","แผงวงจรพิมพ์","8534.00.10","500","pcs","$85.00",true],
                  [3,"LCD Display 7-inch","จอแสดงผลแอลซีดี","8524.12.90","300","pcs","$45.20",true],
                  [4,"Power Supply Unit 12V","แหล่งจ่ายไฟ 12V",null,"150","pcs","$18.00",false],
                  [5,"Enclosure Housing ABS","กล่องพลาสติก ABS","3926.90.99","200","pcs","$12.50",true],
                ].map((row,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, background:row[7]?W:"#FFFBEB" }}>
                    <td style={{ padding:"9px 14px", color:TEXT3 }}>{row[0]}</td>
                    <td style={{ padding:"9px 14px", fontWeight:500, color:TEXT }}>{row[1]}</td>
                    <td style={{ padding:"9px 14px", color:TEXT2, fontSize:11 }}>{row[2]}</td>
                    <td style={{ padding:"9px 14px" }}>
                      {row[3]
                        ? <span style={{ fontFamily:MONO, fontSize:11, color:"#2563EB", fontWeight:600 }}>{row[3]}</span>
                        : <input placeholder="Enter HS code" style={{ border:`1px solid #FCD34D`, borderRadius:6, padding:"4px 8px", fontSize:11, width:110, background:"#FFFBEB" }}/>
                      }
                    </td>
                    <td style={{ padding:"9px 14px", fontFamily:MONO, color:TEXT2 }}>{row[4]}</td>
                    <td style={{ padding:"9px 14px", color:TEXT2 }}>{row[5]}</td>
                    <td style={{ padding:"9px 14px", color:TEXT2 }}>{row[6]}</td>
                    <td style={{ padding:"9px 14px" }}>
                      <span style={{
                        padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700,
                        background:row[7]?"#F0FDF4":"#FEF3C7",
                        color:row[7]?"#16A34A":"#D97706",
                        border:`1px solid ${row[7]?"#BBF7D0":"#FDE68A"}`,
                      }}>{row[7]?"AI Match":"Missing"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
            <Btn onClick={() => setStep(3)}>Generate declaration →</Btn>
          </div>
        </div>
      )}

      {step===3 && (
        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16 }}>
          <Card>
            <SectionHeader title="ใบขนสินค้าขาออก A008-1" sub="Review before submission" />
            <div style={{ padding:"16px 20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                ["ผู้ส่งออก (Exporter)","บริษัท ไทยอิเล็กทรอนิกส์ จำกัด"],
                ["เลขประจำตัวผู้เสียภาษี","0105561000123"],
                ["ผู้รับของ (Consignee)","Samsung Electronics Korea"],
                ["ท่าบรรทุก (POL)","Laem Chabang (THLCH)"],
                ["ท่าปลายทาง (POD)","Busan, Korea (KRPUS)"],
                ["ยานพาหนะ","MSC AURORA V.124"],
                ["วันที่ออกเรือ (ETD)","2026-03-25"],
                ["Incoterms","FOB"],
                ["อัตราแลกเปลี่ยน","35.75 THB/USD"],
                ["สิทธิพิเศษ (Privilege)","IEAT Zone 3"],
              ].map(([l,v],i) => (
                <div key={i}>
                  <label style={{ fontSize:10, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase" }}>{l}</label>
                  <input defaultValue={v} style={{ width:"100%", background:BG, border:`1px solid ${BORDER}`, borderRadius:7, padding:"7px 10px", fontSize:11, color:TEXT, boxSizing:"border-box" }}/>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Card>
              <SectionHeader title="Submission method" />
              <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { id:"nsw",      icon:"⊙", title:"Submit via NSW Thailand", desc:"National Single Window — Recommended", color:BLUE },
                  { id:"customs",  icon:"⊡", title:"Playwright automation",   desc:"Direct to กรมศุลกากร portal",          color:"#7C3AED" },
                  { id:"csv",      icon:"⬇", title:"Export Netbay CSV",       desc:"Manual upload by factory",             color:"#16A34A" },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setSubmitMethod(opt.id)} style={{
                    display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px",
                    borderRadius:8, cursor:"pointer", textAlign:"left", width:"100%",
                    background:submitMethod===opt.id?`${opt.color}08`:W,
                    border:`${submitMethod===opt.id?2:1}px solid ${submitMethod===opt.id?opt.color:BORDER}`,
                  }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:`${opt.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{opt.icon}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>{opt.title}</div>
                      <div style={{ fontSize:10, color:TEXT3, marginTop:2 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#15803D", marginBottom:6 }}>✓ Ready to submit</div>
              <div style={{ fontSize:11, color:"#16A34A", lineHeight:1.6 }}>
                14 items · 13 AI matched · 1 manual<br/>
                BoT rate: 35.75 THB/USD<br/>
                Total FOB: ฿4,592,094
              </div>
            </div>

            {submitErr && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:12, color:"#DC2626" }}>{submitErr}</div>}
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" onClick={() => setStep(2)} style={{ flex:1, textAlign:"center" }}>← Back</Btn>
              <button onClick={handleCreateJob} disabled={submitting} style={{
                flex:2, background:submitting?"#94A3B8":BLUE, color:"#fff", border:"none", borderRadius:8,
                padding:"11px", fontSize:13, fontWeight:700, cursor:submitting?"not-allowed":"pointer",
              }}>{submitting ? "กำลังสร้าง job…" : "สร้าง Job & Submit to NSW →"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NSW TRACKING ─────────────────────────────────────────────────
function NSWTracking() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setAllJobs(arr.length > 0 ? arr.map(mapJob) : SHIPMENTS);
    }).catch(() => setAllJobs(SHIPMENTS)).finally(() => setLoading(false));
  }, []);

  const active = allJobs.filter(s=>!["COMPLETED","DRAFT"].includes(s.status));

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>NSW Tracking</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>{loading ? "Loading…" : `${active.length} jobs in progress`}</p>
      </div>

      <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:10, padding:"12px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:20 }}>
        {[
          { dot:"#22C55E", label:"NSW API", val:"Connected" },
          { dot:"#22C55E", label:"กรมศุลกากร", val:"Online" },
          { dot:"#0EA5E9", label:"BoT Rate", val:"35.75 THB/USD" },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:s.dot }}/>
            <span style={{ fontSize:12, color:TEXT2 }}>{s.label}: <strong>{s.val}</strong></span>
            {i<2 && <span style={{ color:BORDER, marginLeft:12 }}>|</span>}
          </div>
        ))}
        <span style={{ marginLeft:"auto", fontSize:11, color:TEXT3 }}>Last sync: 3 min ago</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {active.map((job,ji) => {
          const steps = [
            { label:"Job created",        done:true  },
            { label:"AI extraction",      done:true  },
            { label:"Declaration ready",  done:job.status!=="PREPARING" },
            { label:"NSW submitted",      done:["NSW_PROCESSING","CUSTOMS_REVIEW","CLEARED","COMPLETED"].includes(job.status) },
            { label:"NSW approved",       done:["CUSTOMS_REVIEW","CLEARED","COMPLETED"].includes(job.status), active:job.status==="NSW_PROCESSING" },
            { label:"Customs cleared",    done:["CLEARED","COMPLETED"].includes(job.status), active:job.status==="CUSTOMS_REVIEW" },
          ];
          return (
            <Card key={ji}>
              <div style={{ padding:"12px 20px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:BG }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontFamily:MONO, fontWeight:700, color:TEXT, fontSize:13 }}>{job.id}</span>
                  <Tag label={job.type} color={job.type==="Export"?"#2563EB":"#D97706"}/>
                  <span style={{ fontSize:12, color:TEXT3 }}>{job.vessel} · {job.fob}</span>
                </div>
                <Badge status={job.status}/>
              </div>
              <div style={{ padding:"16px 24px", display:"flex", gap:0 }}>
                {steps.map((s,si) => (
                  <div key={si} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                      {si>0 && <div style={{ flex:1, height:2, background:steps[si-1].done?"#22C55E":BORDER }}/>}
                      <div style={{
                        width:22, height:22, borderRadius:"50%", flexShrink:0,
                        background:s.done?"#22C55E":s.active?"#0EA5E9":"#F1F5F9",
                        border:`2px solid ${s.done?"#22C55E":s.active?"#0EA5E9":BORDER}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:10, fontWeight:700, color:s.done||s.active?"#fff":TEXT3,
                      }}>{s.done?"✓":s.active?"●":""}</div>
                      {si<steps.length-1 && <div style={{ flex:1, height:2, background:s.done?"#22C55E":BORDER }}/>}
                    </div>
                    <div style={{ fontSize:9, fontWeight:600, color:s.active?BLUE:s.done?"#16A34A":TEXT3, marginTop:6, textAlign:"center", maxWidth:70 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {job.nsw && (
                <div style={{ padding:"8px 24px 14px", display:"flex", gap:20 }}>
                  <span style={{ fontSize:11, color:TEXT3 }}>NSW ref: <span style={{ fontFamily:MONO, color:"#2563EB" }}>{job.nsw}</span></span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── DECLARATIONS ─────────────────────────────────────────────────
function Declarations() {
  const [view, setView] = useState("list");
  const [jobs, setJobs] = useState(null);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setJobs(arr.length > 0 ? arr.map(mapJob) : SHIPMENTS);
    }).catch(() => setJobs(SHIPMENTS));
  }, []);

  const declList = (jobs || SHIPMENTS).filter(s => s.status !== "DRAFT");

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
      <table><thead><tr>${DECL_COLS.map(c=>`<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row,i) => `<tr>${DECL_COLS.map(c=>`<td>${c.key?row[c.key]||'':c.get(row,i)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    printHTML("Print Declarations", html);
  };

  const handlePrintRow = (row, i) => {
    const html = `<h2>Declaration: DEC-2026-0${230+i}</h2>
      <table>${DECL_COLS.map(c => `<tr><th style="text-align:left;width:200px">${c.label}</th><td>${c.key?row[c.key]||'':c.get(row,i)}</td></tr>`).join('')}</table>`;
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
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Declarations</h1>
          <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>ใบขนสินค้าและเอกสารศุลกากร</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["list","cards"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding:"6px 12px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer",
              background:view===v?BLUE:"transparent",
              color:view===v?"#fff":TEXT2,
              border:`1px solid ${view===v?BLUE:BORDER}`,
            }}>{v==="list"?"≡ List":"⊞ Cards"}</button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { label:"Export declarations",  value: String(declList.filter(s=>s.type==="Export").length), color:"#2563EB" },
          { label:"Import declarations",  value: String(declList.filter(s=>s.type==="Import").length), color:"#D97706" },
          { label:"Pending submission",   value: String(declList.filter(s=>["DRAFT","PREPARING"].includes(s.status)).length), color:"#7C3AED" },
          { label:"Cleared",             value: String(declList.filter(s=>["CLEARED","COMPLETED"].includes(s.status)).length), color:"#16A34A" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:MONO }}>{jobs===null?"…":s.value}</div>
          </Card>
        ))}
      </div>

      {view === "list" && (
        <Card>
          <SectionHeader title="Declaration list" sub={`${selected.size > 0 ? `${selected.size} selected · ` : ""}Export A008-1 and Import declarations`} right={
            <div style={{ display:"flex", gap:8 }}>
              <Btn variant="secondary" style={{ fontSize:11 }} onClick={handlePrintSelected}>
                🖨 Print selected {selected.size > 0 ? `(${selected.size})` : ""}
              </Btn>
              <Btn variant="secondary" style={{ fontSize:11 }} onClick={handleExportCSV}>
                ⬇ Export CSV
              </Btn>
            </div>
          }/>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                <th style={{ padding:"9px 16px", width:36 }}>
                  <input type="checkbox" checked={selected.size===declList.length && declList.length>0} onChange={toggleAll} style={{ cursor:"pointer" }}/>
                </th>
                {["Declaration no.","Type","Job ref","Vessel","FOB value","HS Code (main)","Form","Status","Date",""].map(h=>(
                  <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {declList.map((s,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer", background: selected.has(i)?"#EFF6FF":W }}
                  onMouseEnter={e=>{ if(!selected.has(i)) e.currentTarget.style.background=BG; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=selected.has(i)?"#EFF6FF":W; }}>
                  <td style={{ padding:"11px 16px" }}>
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} style={{ cursor:"pointer" }}/>
                  </td>
                  <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:11, color:"#7C3AED", fontWeight:700 }}>DEC-2026-0{230+i}</td>
                  <td style={{ padding:"11px 16px" }}><Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"}/></td>
                  <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:11, color:TEXT2 }}>{s.id}</td>
                  <td style={{ padding:"11px 16px", color:TEXT2, maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.vessel}</td>
                  <td style={{ padding:"11px 16px", fontWeight:700, color:TEXT }}>{s.fob}</td>
                  <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:11, color:"#2563EB" }}>{s.hs}</td>
                  <td style={{ padding:"11px 16px", fontSize:11, color:TEXT2 }}>A008-1</td>
                  <td style={{ padding:"11px 16px" }}><Badge status={s.status}/></td>
                  <td style={{ padding:"11px 16px", color:TEXT3, fontSize:11 }}>{s.date}</td>
                  <td style={{ padding:"11px 16px", display:"flex", gap:6 }}>
                    <Btn variant="ghost" style={{ fontSize:10, padding:"3px 8px" }} onClick={() => handlePrintRow(s, i)}>🖨 Print</Btn>
                    <Btn variant="ghost" style={{ fontSize:10, padding:"3px 8px" }} onClick={() => handleRowCSV(s, i)}>⬇ CSV</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {view === "cards" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {declList.map((s,i) => (
            <Card key={i} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:11, color:"#7C3AED", fontWeight:700, marginBottom:4 }}>DEC-2026-0{230+i}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"}/>
                    <Badge status={s.status}/>
                  </div>
                </div>
                <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} style={{ cursor:"pointer", marginTop:4 }}/>
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"5px 10px", fontSize:11 }}>
                  <span style={{ color:TEXT3 }}>Job ref</span><span style={{ fontFamily:MONO, color:TEXT2 }}>{s.id}</span>
                  <span style={{ color:TEXT3 }}>Vessel</span><span style={{ color:TEXT2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.vessel}</span>
                  <span style={{ color:TEXT3 }}>FOB</span><span style={{ fontWeight:700, color:TEXT }}>{s.fob}</span>
                  <span style={{ color:TEXT3 }}>HS Code</span><span style={{ fontFamily:MONO, color:"#2563EB" }}>{s.hs}</span>
                  <span style={{ color:TEXT3 }}>Date</span><span style={{ color:TEXT3 }}>{s.date}</span>
                </div>
              </div>
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${BORDER2}`, display:"flex", gap:8 }}>
                <Btn variant="ghost" style={{ fontSize:10, padding:"3px 10px", flex:1 }} onClick={() => handlePrintRow(s, i)}>🖨 Print</Btn>
                <Btn variant="ghost" style={{ fontSize:10, padding:"3px 10px", flex:1 }} onClick={() => handleRowCSV(s, i)}>⬇ CSV</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MASTER DATA ──────────────────────────────────────────────────
function MasterData() {
  const [tab, setTab] = useState("hs");
  const [hsList, setHsList] = useState(HS_MASTER);
  const [hsModal, setHsModal] = useState(null); // null | "add" | { edit: hs }
  const [hsForm, setHsForm] = useState({ code:"", desc:"", thDesc:"", unit:"pcs", dutyRate:"0%", origin:"TH" });

  const openAdd = () => { setHsForm({ code:"", desc:"", thDesc:"", unit:"pcs", dutyRate:"0%", origin:"TH" }); setHsModal("add"); };
  const openEdit = (hs) => { setHsForm({ ...hs }); setHsModal({ edit: hs }); };
  const closeHsModal = () => setHsModal(null);

  const saveHs = () => {
    if (!hsForm.code || !hsForm.desc) return alert("กรุณากรอก HS Code และ Description");
    if (hsModal === "add") {
      setHsList(prev => [...prev, { ...hsForm }]);
    } else {
      setHsList(prev => prev.map(h => h.code === hsModal.edit.code ? { ...hsForm } : h));
    }
    closeHsModal();
  };

  const deleteHs = (code) => {
    if (!window.confirm(`ลบ HS Code ${code} ใช่หรือไม่?`)) return;
    setHsList(prev => prev.filter(h => h.code !== code));
  };

  const FIELD = (label, key, opts) => (
    <div key={key}>
      <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      <input value={hsForm[key]} onChange={e => setHsForm(f => ({...f, [key]: e.target.value}))}
        style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 12px", fontSize:12, background:BG, boxSizing:"border-box" }}
        {...(opts||{})} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Master Data</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>HS codes · Exporters · Privilege codes · Customers</p>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:18 }}>
        {[
          ["hs","HS Codes"],["exporters","Exporters"],["privilege","Privilege codes"],["customers","Customers"],
        ].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 18px", background:"none", border:"none",
            borderBottom:`2px solid ${tab===id?BLUE:"transparent"}`,
            color:tab===id?BLUE:TEXT2, fontWeight:tab===id?700:400, fontSize:13, cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {/* HS Modal */}
      {hsModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:480, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:800, color:TEXT }}>
              {hsModal === "add" ? "+ Add HS Code" : `Edit HS Code: ${hsModal.edit.code}`}
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {FIELD("HS Code *", "code", hsModal !== "add" ? { readOnly:true, style:{ background:"#F1F5F9", cursor:"not-allowed" } } : {})}
              {FIELD("Description (EN) *", "desc")}
              {FIELD("Thai Description", "thDesc")}
              {FIELD("Unit", "unit")}
              {FIELD("Duty Rate", "dutyRate", { placeholder:"0%" })}
              {FIELD("Origin", "origin", { placeholder:"TH" })}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={closeHsModal}>Cancel</Btn>
              <Btn onClick={saveHs}>{hsModal === "add" ? "Add HS Code" : "Save changes"}</Btn>
            </div>
          </div>
        </div>
      )}

      {tab==="hs" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <input placeholder="Search HS code or description..." style={{ border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", fontSize:12, width:320, background:W }}/>
            <Btn onClick={openAdd}>+ Add HS code</Btn>
          </div>
          <Card>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["HS Code","Description (EN)","Thai description","Unit","Duty rate","Origin",""].map(h=>(
                    <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hsList.map((hs,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background=BG}
                    onMouseLeave={e=>e.currentTarget.style.background=W}>
                    <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:12, color:"#2563EB", fontWeight:700 }}>{hs.code}</td>
                    <td style={{ padding:"11px 16px", color:TEXT, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{hs.desc}</td>
                    <td style={{ padding:"11px 16px", color:TEXT2, fontSize:11 }}>{hs.thDesc}</td>
                    <td style={{ padding:"11px 16px", color:TEXT2 }}>{hs.unit}</td>
                    <td style={{ padding:"11px 16px" }}>
                      <Tag label={hs.dutyRate} color={hs.dutyRate==="0%"?"#16A34A":"#DC2626"}/>
                    </td>
                    <td style={{ padding:"11px 16px" }}><Tag label={hs.origin} color="#16A34A"/></td>
                    <td style={{ padding:"11px 16px", display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ fontSize:10, padding:"3px 8px" }} onClick={() => openEdit(hs)}>Edit</Btn>
                      <Btn variant="danger" style={{ fontSize:10, padding:"3px 8px" }} onClick={() => deleteHs(hs.code)}>Delete</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab==="exporters" && (
        <Card>
          <SectionHeader title="Exporter profiles" sub="Used in declaration header" right={<Btn onClick={() => alert("เพิ่ม Exporter — เชื่อมต่อ API จริงใน production")}>+ Add</Btn>}/>
          {[
            { name:"บริษัท ไทยอิเล็กทรอนิกส์ จำกัด", taxId:"0105561000123", address:"123 ถ.พระราม 2 บางมด จอมทอง กรุงเทพฯ", tel:"02-123-4567", default:true },
          ].map((e,i) => (
            <div key={i} style={{ padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:TEXT }}>{e.name}</span>
                  {e.default && <Tag label="Default" color="#16A34A"/>}
                </div>
                <div style={{ fontSize:11, color:TEXT3, marginBottom:2 }}>Tax ID: <span style={{ fontFamily:MONO }}>{e.taxId}</span></div>
                <div style={{ fontSize:11, color:TEXT3, marginBottom:2 }}>{e.address}</div>
                <div style={{ fontSize:11, color:TEXT3 }}>{e.tel}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="secondary" style={{ fontSize:11 }} onClick={() => alert(`แก้ไข: ${e.name}`)}>Edit</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab==="privilege" && (
        <Card>
          <SectionHeader title="Privilege codes" sub="BOI, IEAT, Free Zone, etc." right={<Btn onClick={() => alert("เพิ่ม Privilege code — เชื่อมต่อ API จริงใน production")}>+ Add</Btn>}/>
          <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { code:"IEAT-Z3", name:"IEAT Zone 3", type:"IEAT", taxBenefit:"Full exemption", active:true },
              { code:"BOI-T1",  name:"BOI Tier 1 Electronics", type:"BOI", taxBenefit:"8-year exemption", active:true },
              { code:"FZ-EEC",  name:"EEC Free Zone", type:"FreeZone", taxBenefit:"Full exemption", active:false },
            ].map((p,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:BG, borderRadius:8, border:`1px solid ${BORDER}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:"#7C3AED" }}>{p.code}</span>
                      <span style={{ fontSize:12, color:TEXT }}>{p.name}</span>
                      <Tag label={p.type} color="#7C3AED"/>
                    </div>
                    <div style={{ fontSize:11, color:TEXT3 }}>{p.taxBenefit}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Tag label={p.active?"Active":"Inactive"} color={p.active?"#16A34A":"#DC2626"}/>
                  <Btn variant="ghost" style={{ fontSize:11 }} onClick={() => alert(`แก้ไข: ${p.code}`)}>Edit</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab==="customers" && (
        <Card>
          <SectionHeader title="Consignees / customers" sub="Used in shipment Consignee field" right={<Btn onClick={() => alert("เพิ่ม Consignee — เชื่อมต่อ API จริงใน production")}>+ Add</Btn>}/>
          <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { name:"Samsung Electronics Co., Ltd.", country:"Korea", code:"KR", jobs:18 },
              { name:"Toyota Motor Corporation",      country:"Japan", code:"JP", jobs:12 },
              { name:"Intel Corporation Ireland",     country:"Ireland", code:"IE", jobs:7 },
            ].map((c,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:BG, borderRadius:8, border:`1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:TEXT, marginBottom:2 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:TEXT3 }}>{c.country} · {c.jobs} shipments</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Tag label={c.code} color={BLUE}/>
                  <Btn variant="ghost" style={{ fontSize:11 }} onClick={() => alert(`แก้ไข: ${c.name}`)}>Edit</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── BILLING (FACTORY VIEW) ───────────────────────────────────────
function Billing() {
  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Billing</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>Service invoices from LogiConnect Co., Ltd.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Billing type",     value:"Per job",     color:BLUE  },
          { label:"Rate per job",     value:"฿450",        color:TEXT  },
          { label:"Outstanding",      value:"฿78,750",     color:"#DC2626" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:10, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:MONO }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <SectionHeader title="Invoice history" />
          {INVOICES_FACTORY.map((inv,i) => (
            <div key={i} style={{ padding:"14px 20px", borderBottom:i<INVOICES_FACTORY.length-1?`1px solid ${BORDER2}`:"none", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:TEXT, marginBottom:4 }}>{inv.id}</div>
                <div style={{ fontSize:11, color:TEXT3 }}>{inv.period} · {inv.jobs} jobs</div>
                <div style={{ fontSize:11, color:TEXT3 }}>Issued: {inv.issued} · Due: {inv.due}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:16, fontWeight:800, fontFamily:MONO, color:inv.status==="paid"?"#16A34A":"#DC2626", marginBottom:6 }}>{inv.amount}</div>
                <Tag label={inv.status} color={inv.status==="paid"?"#16A34A":"#DC2626"}/>
                <div style={{ marginTop:8 }}>
                  <Btn variant="ghost" style={{ fontSize:10 }} onClick={() => {
                    const html = `<h2>Invoice ${inv.id}</h2>
                      <table>
                        <tr><th style="text-align:left;width:160px">Invoice No.</th><td>${inv.id}</td></tr>
                        <tr><th style="text-align:left">Period</th><td>${inv.period}</td></tr>
                        <tr><th style="text-align:left">Jobs</th><td>${inv.jobs} jobs</td></tr>
                        <tr><th style="text-align:left">Amount</th><td><strong>${inv.amount}</strong></td></tr>
                        <tr><th style="text-align:left">Status</th><td>${inv.status.toUpperCase()}</td></tr>
                        <tr><th style="text-align:left">Issued</th><td>${inv.issued}</td></tr>
                        <tr><th style="text-align:left">Due</th><td>${inv.due}</td></tr>
                      </table>
                      <p style="margin-top:20px;font-size:11px;color:#666">LogiConnect Co., Ltd. · Service invoice</p>`;
                    printHTML(`Invoice ${inv.id}`, html);
                  }}>⬇ Download PDF</Btn>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <SectionHeader title="Unbilled jobs this month" sub="Will be invoiced on Mar 25" />
          <div style={{ padding:"14px 20px" }}>
            {SHIPMENTS.filter(s=>["CLEARED","COMPLETED"].includes(s.status)).slice(0,3).map((s,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER2}` }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:11, color:TEXT, fontWeight:600 }}>{s.id}</div>
                  <div style={{ fontSize:10, color:TEXT3, marginTop:2 }}>{s.date} · {s.fob}</div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:TEXT }}>฿450</span>
              </div>
            ))}
            <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:TEXT3 }}>Estimated invoice (5 jobs)</span>
              <span style={{ fontSize:14, fontWeight:800, color:TEXT }}>฿2,250</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────
function Reports() {
  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Reports</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>Export analytics · monthly summary · FOB breakdown</p>
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
                  <span style={{ fontSize:12, fontWeight:600, color:TEXT }}>{r.month}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#16A34A" }}>{r.fob}</span>
                </div>
                <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                  <div style={{ height:8, background:"#2563EB", borderRadius:4, width:`${(r.export/50)*100}%` }}/>
                  <div style={{ height:8, background:"#D97706", borderRadius:4, width:`${(r.import/50)*100}%` }}/>
                </div>
                <div style={{ display:"flex", gap:16 }}>
                  <span style={{ fontSize:10, color:"#2563EB" }}>Export: {r.export}</span>
                  <span style={{ fontSize:10, color:"#D97706" }}>Import: {r.import}</span>
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
                  <span style={{ fontSize:12, color:TEXT }}>{r.dest}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:r.color }}>{r.fob} ({r.pct}%)</span>
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
          <Btn variant="secondary" style={{ fontSize:11 }} onClick={() => {
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
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
              {["HS Chapter","Description","Jobs","FOB value","% of total","Trend"].map(h=>(
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
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
                    <span style={{ fontSize:11, color:TEXT2 }}>{r[4]}</span>
                  </div>
                </td>
                <td style={{ padding:"11px 16px", fontSize:14, color:r[5]==="↑"?"#16A34A":r[5]==="↓"?"#DC2626":TEXT3 }}>{r[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── ACTION LABELS ────────────────────────────────────────────────
const ACTION_LABELS = {
  LOGIN:               { label:"เข้าสู่ระบบ",       icon:"🔐", color:"#0EA5E9" },
  REGISTER_B2B:        { label:"สมัครใช้งาน B2B",   icon:"🏢", color:"#7C3AED" },
  REGISTER_USER:       { label:"สร้างผู้ใช้",        icon:"👤", color:"#7C3AED" },
  CREATE_JOB:          { label:"สร้าง Shipment",     icon:"📦", color:"#16A34A" },
  UPDATE_JOB:          { label:"แก้ไข Shipment",     icon:"✏️", color:"#D97706" },
  UPDATE_JOB_STATUS:   { label:"เปลี่ยนสถานะ Job",   icon:"🔄", color:"#D97706" },
  DELETE_JOB:          { label:"ลบ Shipment",        icon:"🗑️", color:"#DC2626" },
  CREATE_DECLARATION:  { label:"สร้างใบขนสินค้า",   icon:"📄", color:"#16A34A" },
  SUBMIT_DECLARATION:  { label:"ยื่นใบขนฯ NSW",      icon:"🚀", color:"#0EA5E9" },
  UPDATE_DECLARATION:  { label:"แก้ไขใบขนสินค้า",   icon:"✏️", color:"#D97706" },
  UPLOAD_DOCUMENT:     { label:"อัปโหลดเอกสาร",     icon:"📎", color:"#16A34A" },
  REFRESH_DOCUMENT:    { label:"รีเฟรช URL เอกสาร", icon:"🔗", color:"#64748B" },
  UPDATE_COMPANY:      { label:"แก้ไขข้อมูลบริษัท", icon:"🏭", color:"#7C3AED" },
  INVITE_USER:         { label:"เชิญผู้ใช้",         icon:"📧", color:"#16A34A" },
  UPDATE_USER_ROLE:    { label:"เปลี่ยน Role",       icon:"🔑", color:"#D97706" },
  REMOVE_USER:         { label:"ลบผู้ใช้",           icon:"🚫", color:"#DC2626" },
};

function AuditActionBadge({ action, status }) {
  const meta = ACTION_LABELS[action] || { label: action, icon:"⚡", color:"#64748B" };
  const failed = status === "FAILED";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700,
      background: failed?"#FEF2F2":`${meta.color}12`,
      color: failed?"#DC2626":meta.color,
      border:`1px solid ${failed?"#FECACA":`${meta.color}30`}`,
    }}>
      {meta.icon} {meta.label}
      {failed && <span style={{ marginLeft:2, fontSize:9 }}>✗</span>}
    </span>
  );
}

function SettingsSecurity() {
  const auth = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState(false);

  useEffect(() => {
    auditApi.list({ limit: 200 }).then(data => {
      setLogs(data?.data ?? (Array.isArray(data) ? data : []));
      setTotal(data?.total ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const FILTERS = ["ALL","LOGIN","JOB","DECLARATION","USER","COMPANY"];
  const shown = filter === "ALL" ? logs : logs.filter(l => {
    if (filter === "LOGIN")       return l.action === "LOGIN";
    if (filter === "JOB")         return l.entityType === "JOB";
    if (filter === "DECLARATION") return l.entityType === "DECLARATION";
    if (filter === "USER")        return l.entityType === "USER";
    if (filter === "COMPANY")     return l.entityType === "CUSTOMER";
    return true;
  });

  // Last login entry
  const lastLogin = logs.find(l => l.action === "LOGIN" && l.status !== "FAILED");
  const lastLoginTime = lastLogin
    ? new Date(lastLogin.createdAt).toLocaleString("th-TH", { dateStyle:"medium", timeStyle:"short" })
    : "—";
  const lastIp = lastLogin?.ipAddress || "—";

  const handleChangePassword = async () => {
    setPwErr(""); setPwOk(false);
    if (!pwForm.current) return setPwErr("กรุณากรอกรหัสผ่านปัจจุบัน");
    if (pwForm.next.length < 8) return setPwErr("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัว");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwForm.next)) return setPwErr("ต้องมีตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข");
    if (pwForm.next !== pwForm.confirm) return setPwErr("รหัสผ่านไม่ตรงกัน");
    try {
      await client.post("/auth/change-password", { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwOk(true);
      setPwForm({ current:"", next:"", confirm:"" });
    } catch(e) {
      setPwErr(e?.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Session info + Change password */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <SectionHeader title="เปลี่ยนรหัสผ่าน" />
          <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
            {[["รหัสผ่านปัจจุบัน","current"],["รหัสผ่านใหม่","next"],["ยืนยันรหัสผ่านใหม่","confirm"]].map(([l,k]) => (
              <div key={k}>
                <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                <input type="password" placeholder="••••••••" value={pwForm[k]}
                  onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{ width:"100%", background:BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:12, color:TEXT, boxSizing:"border-box" }}/>
              </div>
            ))}
            {pwErr && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:12, color:"#DC2626" }}>{pwErr}</div>}
            {pwOk  && <div style={{ padding:"8px 12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, fontSize:12, color:"#16A34A" }}>✓ เปลี่ยนรหัสผ่านสำเร็จ</div>}
            <Btn onClick={handleChangePassword} style={{ alignSelf:"flex-start" }}>Update password</Btn>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Session & access" />
          <div style={{ padding:"16px 20px" }}>
            {[
              ["Last login",    lastLoginTime],
              ["IP address",    lastIp],
              ["Session",       "JWT · 8h validity"],
              ["ISO 27001",     "Compliant — Audit log active ✓"],
            ].map(([l,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                <span style={{ fontSize:11, color:TEXT3 }}>{l}</span>
                <span style={{ fontSize:11, fontWeight:600, color: l==="ISO 27001"?"#16A34A":TEXT }}>{v}</span>
              </div>
            ))}
            <Btn variant="danger" onClick={auth?.logout} style={{ marginTop:16, width:"100%", textAlign:"center" }}>Sign out</Btn>
          </div>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <SectionHeader
          title="Audit Log — ประวัติการใช้งาน"
          sub={loading ? "Loading…" : `${total} รายการทั้งหมด · แสดง ${shown.length} รายการล่าสุด`}
          right={
            <div style={{ display:"flex", gap:6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding:"4px 10px", borderRadius:20, fontSize:10, fontWeight:600, cursor:"pointer",
                  background: filter===f ? BLUE : "transparent",
                  color: filter===f ? "#fff" : TEXT2,
                  border:`1px solid ${filter===f ? BLUE : BORDER}`,
                }}>{f}</button>
              ))}
            </div>
          }
        />
        {loading && <div style={{ padding:"24px", textAlign:"center", fontSize:12, color:TEXT3 }}>Loading audit logs…</div>}
        {!loading && shown.length === 0 && <div style={{ padding:"24px", textAlign:"center", fontSize:12, color:TEXT3 }}>ยังไม่มีประวัติการใช้งาน</div>}
        {shown.length > 0 && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["วันเวลา","Action","ผู้ใช้","IP Address","Status"].map(h => (
                    <th key={h} style={{ padding:"8px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((log, i) => {
                  const dt = new Date(log.createdAt).toLocaleString("th-TH", { dateStyle:"short", timeStyle:"medium" });
                  const failed = log.status === "FAILED" || (log.detail && log.detail.error);
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, background: failed?"#FFFBEB":W }}
                      onMouseEnter={e=>e.currentTarget.style.background=BG}
                      onMouseLeave={e=>e.currentTarget.style.background=failed?"#FFFBEB":W}>
                      <td style={{ padding:"10px 16px", fontFamily:MONO, fontSize:10, color:TEXT3, whiteSpace:"nowrap" }}>{dt}</td>
                      <td style={{ padding:"10px 16px" }}>
                        <AuditActionBadge action={log.action} status={log.status} />
                        {log.entityId && <span style={{ marginLeft:6, fontSize:10, color:TEXT3, fontFamily:MONO }}>{log.entityId.substring(0,8)}…</span>}
                      </td>
                      <td style={{ padding:"10px 16px", fontSize:11, color:TEXT2 }}>
                        {log.actorEmail || "—"}
                      </td>
                      <td style={{ padding:"10px 16px", fontFamily:MONO, fontSize:10, color:TEXT2 }}>
                        {log.ipAddress || "—"}
                      </td>
                      <td style={{ padding:"10px 16px" }}>
                        <span style={{
                          padding:"2px 7px", borderRadius:20, fontSize:9, fontWeight:700,
                          background: failed?"#FEF2F2":"#F0FDF4",
                          color: failed?"#DC2626":"#16A34A",
                          border:`1px solid ${failed?"#FECACA":"#BBF7D0"}`,
                        }}>{failed?"FAILED":"SUCCESS"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────
function SettingsCompany() {
  const auth = useContext(AuthContext);
  const cust = auth?.user?.customer;
  const [form, setForm] = useState({
    companyNameTh: cust?.companyNameTh || "",
    companyNameEn: cust?.companyNameEn || "",
    taxId:         cust?.taxId || "",
    address:       cust?.address || "",
    phone:         cust?.phone || "",
    email:         auth?.user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Load full customer profile
  useEffect(() => {
    customerApi.getMy().then(data => {
      setForm(f => ({
        ...f,
        companyNameTh: data.companyNameTh || f.companyNameTh,
        companyNameEn: data.companyNameEn || f.companyNameEn,
        taxId:         data.taxId || f.taxId,
        address:       data.address || f.address,
        phone:         data.phone || f.phone,
        email:         data.email || f.email,
      }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setErrMsg("");
    try {
      await customerApi.updateMy({
        companyNameTh: form.companyNameTh || undefined,
        companyNameEn: form.companyNameEn || undefined,
        address:       form.address || undefined,
        phone:         form.phone || undefined,
        email:         form.email || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      const m = e?.response?.data?.message;
      setErrMsg(Array.isArray(m) ? m.join(", ") : (m || "Save failed"));
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
      <Card>
        <SectionHeader title="Company profile" />
        <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
          {[
            ["ชื่อบริษัท (ภาษาไทย)", "companyNameTh"],
            ["Company Name (English)", "companyNameEn"],
            ["เลขประจำตัวผู้เสียภาษี (Tax ID)", "taxId", true],
            ["ที่อยู่", "address"],
            ["เบอร์โทร", "phone"],
            ["อีเมลบริษัท", "email"],
          ].map(([l, k, readonly]) => (
            <div key={k}>
              <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
              <input
                value={form[k]}
                readOnly={readonly}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ width:"100%", background: readonly?"#F1F5F9":BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:12, color: readonly?TEXT3:TEXT, boxSizing:"border-box", cursor: readonly?"not-allowed":"text" }}
              />
            </div>
          ))}
          {errMsg && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:12, color:"#DC2626" }}>{errMsg}</div>}
          {saved  && <div style={{ padding:"8px 12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, fontSize:12, color:"#16A34A" }}>✓ บันทึกสำเร็จ</div>}
          <Btn onClick={handleSave} style={{ alignSelf:"flex-start" }}>{saving ? "Saving…" : "Save changes"}</Btn>
        </div>
      </Card>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <SectionHeader title="Service plan" />
          <div style={{ padding:"16px 20px" }}>
            <div style={{ background:BG, borderRadius:8, padding:"14px", border:`1px solid ${BORDER}`, marginBottom:12 }}>
              <div style={{ fontSize:10, color:TEXT3, marginBottom:4, textTransform:"uppercase", fontWeight:600 }}>Current plan</div>
              <div style={{ fontSize:16, fontWeight:800, color:TEXT }}>Standard</div>
              <div style={{ fontSize:11, color:TEXT3, marginTop:4 }}>฿450 per job · Per-job billing</div>
            </div>
            {[
              ["Status", cust?.status || "ACTIVE"],
              ["Customer code", cust?.code || "—"],
              ["Tax ID", form.taxId || "—"],
              ["T&C version", cust?.tcVersion || "—"],
            ].map(([l,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                <span style={{ fontSize:11, color:TEXT3 }}>{l}</span>
                <span style={{ fontSize:11, fontWeight:600, color: l==="Status"&&v==="TRIAL"?"#D97706":TEXT }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email:"", fullName:"", role:"USER" });
  const [inviting, setInviting] = useState(false);
  const [inviteErr, setInviteErr] = useState("");
  const [editModal, setEditModal] = useState(null); // { user, role }
  const [editRole, setEditRole] = useState("USER");
  const [savingRole, setSavingRole] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    customerApi.listUsers().then(data => {
      setUsers(Array.isArray(data) ? data : (data?.data ?? []));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleInvite = async () => {
    setInviteErr("");
    if (!inviteForm.email) return setInviteErr("กรุณากรอกอีเมล");
    setInviting(true);
    try {
      await customerApi.inviteUser({ ...inviteForm, password: Math.random().toString(36).slice(-10) + "A1!" });
      setInviteModal(false);
      setInviteForm({ email:"", fullName:"", role:"USER" });
      loadUsers();
    } catch(e) {
      const m = e?.response?.data?.message;
      setInviteErr(Array.isArray(m) ? m.join(", ") : (m || "Invite failed"));
    } finally { setInviting(false); }
  };

  const openEditRole = (u) => { setEditModal(u); setEditRole(u.role || "USER"); };

  const handleUpdateRole = async () => {
    setSavingRole(true);
    try {
      await customerApi.updateUserRole(editModal.profileId || editModal.id, editRole);
      setEditModal(null);
      loadUsers();
    } catch(e) {
      alert(e?.response?.data?.message || "Update failed");
    } finally { setSavingRole(false); }
  };

  return (
    <>
      {/* Invite Modal */}
      {inviteModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:420, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:800, color:TEXT }}>+ Invite User</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["Email *","email","email"],["Full Name","fullName","text"]].map(([l,k,t]) => (
                <div key={k}>
                  <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                  <input type={t} value={inviteForm[k]} onChange={e => setInviteForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:12, background:BG, boxSizing:"border-box" }}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(f=>({...f,role:e.target.value}))}
                  style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:12, background:BG, boxSizing:"border-box" }}>
                  <option value="USER">User</option>
                  <option value="TENANT_ADMIN">Tenant Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              {inviteErr && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:12, color:"#DC2626" }}>{inviteErr}</div>}
              <p style={{ fontSize:11, color:TEXT3, margin:0 }}>ระบบจะสร้างรหัสผ่านชั่วคราวให้อัตโนมัติ</p>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={() => { setInviteModal(false); setInviteErr(""); }}>Cancel</Btn>
              <Btn onClick={handleInvite}>{inviting ? "Inviting…" : "Send invite"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:360, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:800, color:TEXT }}>Edit Role</h3>
            <p style={{ fontSize:13, color:TEXT2, margin:"0 0 16px" }}>{editModal.profile?.email || editModal.email || "—"}</p>
            <div>
              <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)}
                style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:13, background:BG }}>
                <option value="USER">User</option>
                <option value="TENANT_ADMIN">Tenant Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={() => setEditModal(null)}>Cancel</Btn>
              <Btn onClick={handleUpdateRole}>{savingRole ? "Saving…" : "Save"}</Btn>
            </div>
          </div>
        </div>
      )}

      <Card>
        <SectionHeader title="Organisation users" sub="Manage access for your team" right={<Btn onClick={() => setInviteModal(true)}>+ Invite user</Btn>}/>
        {loading && <div style={{ padding:"20px", textAlign:"center", fontSize:12, color:TEXT3 }}>Loading users…</div>}
        {!loading && users.length === 0 && <div style={{ padding:"20px", textAlign:"center", fontSize:12, color:TEXT3 }}>ยังไม่มีผู้ใช้ในระบบ</div>}
        {users.length > 0 && (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                {["Name","Email","Role","Status",""].map(h=>(
                  <th key={h} style={{ padding:"9px 18px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u,i) => {
                const name = u.profile?.fullName || u.fullName || "—";
                const email = u.profile?.email || u.email || "—";
                const role = u.role || "USER";
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}` }}>
                    <td style={{ padding:"13px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"#0EA5E915", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:BLUE }}>
                          {name.charAt(0)}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"13px 18px", color:TEXT2 }}>{email}</td>
                    <td style={{ padding:"13px 18px" }}>
                      <Tag label={role} color={role==="TENANT_ADMIN"?BLUE:role==="USER"?"#7C3AED":TEXT3}/>
                    </td>
                    <td style={{ padding:"13px 18px" }}>
                      <Tag label="Active" color="#16A34A"/>
                    </td>
                    <td style={{ padding:"13px 18px", display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ fontSize:10 }} onClick={() => openEditRole(u)}>Edit role</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

function SettingsNotifications() {
  const ITEMS = [
    ["Job submitted to NSW",   true ],
    ["NSW approval received",  true ],
    ["Customs cleared",        true ],
    ["Job rejected",           true ],
    ["Invoice issued",         true ],
    ["Monthly summary report", false],
    ["New user invited",       false],
  ];
  const [notifs, setNotifs] = useState(ITEMS.map(([,v]) => v));
  const toggle = (i) => setNotifs(n => n.map((v, idx) => idx===i ? !v : v));

  return (
    <Card style={{ maxWidth:560 }}>
      <SectionHeader title="Email notifications" />
      <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
        {ITEMS.map(([label], i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<ITEMS.length-1?`1px solid ${BORDER2}`:"none" }}>
            <span style={{ fontSize:13, color:TEXT }}>{label}</span>
            <button onClick={() => toggle(i)} style={{
              width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative",
              background:notifs[i]?BLUE:"#E2E8F0", transition:"background 0.15s",
            }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:notifs[i]?23:3, transition:"left 0.15s" }}/>
            </button>
          </div>
        ))}
        <Btn style={{ alignSelf:"flex-start" }} onClick={() => alert("Notification settings saved ✓")}>Save preferences</Btn>
      </div>
    </Card>
  );
}

function Settings() {
  const [tab, setTab] = useState("company");

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Settings</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>Account · notifications · users · security</p>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:18 }}>
        {[["company","Company"],["users","Users"],["notifications","Notifications"],["security","Security"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 18px", background:"none", border:"none",
            borderBottom:`2px solid ${tab===id?BLUE:"transparent"}`,
            color:tab===id?BLUE:TEXT2, fontWeight:tab===id?700:400, fontSize:13, cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {tab==="company"       && <SettingsCompany />}
      {tab==="users"         && <SettingsUsers />}
      {tab==="notifications" && <SettingsNotifications />}

      {tab==="security" && <SettingsSecurity />}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  const auth = useContext(AuthContext);
  const [screen, setScreen] = useState("dashboard");
  const [detailJob, setDetailJob] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Show register / login screen if not authenticated
  if (!auth?.token) {
    if (showRegister) return <RegisterScreen onBack={() => setShowRegister(false)} />;
    return <LoginScreen onRegister={() => setShowRegister(true)} />;
  }

  const handleNav = (id, data) => {
    if (id === "shipment_detail" && data) {
      setDetailJob(data);
      setScreen("shipment_detail");
    } else {
      setDetailJob(null);
      setScreen(id);
    }
  };

  const content = () => {
    switch(screen) {
      case "dashboard":     return <Dashboard onNav={handleNav}/>;
      case "shipments":     return <ShipmentList onNew={() => handleNav("new")} onDetail={job => handleNav("shipment_detail",job)}/>;
      case "shipment_detail": return <ShipmentDetail job={detailJob} onBack={() => setScreen("shipments")}/>;
      case "new":           return <NewShipment onBack={() => setScreen("shipments")} onCreated={() => { setScreen("shipments"); }}/>;
      case "nsw":           return <NSWTracking/>;
      case "declarations":  return <Declarations/>;
      case "master":        return <MasterData/>;
      case "billing":       return <Billing/>;
      case "reports":       return <Reports/>;
      case "settings":      return <Settings/>;
      default: return null;
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:BG, fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
      <Sidebar active={screen} onNav={handleNav}/>
      <main style={{ flex:1, padding:"26px 30px", overflowY:"auto", minHeight:"100vh" }}>
        {content()}
      </main>
    </div>
  );
}
