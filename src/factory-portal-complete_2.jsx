import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./stores/AuthContext.jsx";
import LoginScreen from "./LoginScreen.jsx";
import RegisterScreen from "./RegisterScreen.jsx";
import { jobsApi } from "./api/jobsApi.js";

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
        <div style={{ background:"rgba(14,165,233,0.08)", borderRadius:8, padding:"8px 12px", border:"1px solid rgba(14,165,233,0.2)", cursor:"pointer" }}>
          <div style={{ fontSize:9, color:"#0EA5E9", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:3 }}>Active factory</div>
          <div style={{ fontSize:12, color:"#E2E8F0", fontWeight:600 }}>ไทยอิเล็กทรอนิกส์ จำกัด</div>
          <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>T001 · THEL</div>
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
  const pending = SHIPMENTS.filter(s => ["NSW_PROCESSING","CUSTOMS_REVIEW","SUBMITTED"].includes(s.status));
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>Dashboard</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>บริษัท ไทยอิเล็กทรอนิกส์ จำกัด · March 2026</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Jobs this month", value:"42",   sub:"↑ 8 vs last month",   color:"#0EA5E9" },
          { label:"Awaiting clearance", value:"3", sub:"NSW + Customs queue", color:"#F59E0B" },
          { label:"Cleared today",   value:"8",    sub:"All export jobs",      color:"#22C55E" },
          { label:"FOB value (Mar)", value:"$4.2M",sub:"Total exported",       color:"#8B5CF6" },
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
          {SHIPMENTS.slice(0,5).map((s,i) => (
            <div key={i} onClick={() => onNav("shipment_detail", s)} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"11px 20px", borderBottom:i<4?`1px solid ${BORDER2}`:"none",
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
            {pending.length === 0 && <div style={{ padding:"20px", fontSize:12, color:TEXT3, textAlign:"center" }}>All clear</div>}
            {pending.map((s,i) => (
              <div key={i} style={{ padding:"10px 18px", borderBottom:i<pending.length-1?`1px solid ${BORDER2}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:TEXT, fontFamily:MONO }}>{s.id}</span>
                  <Badge status={s.status} />
                </div>
                <div style={{ fontSize:11, color:TEXT3 }}>{s.fob} · {s.date}</div>
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
              <Btn variant="secondary" style={{ fontSize:11 }}>Print A008-1</Btn>
              <Btn variant="secondary" style={{ fontSize:11 }}>Export Netbay CSV</Btn>
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
                <Btn variant="ghost" style={{ fontSize:11, padding:"3px 8px" }}>Download</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NEW SHIPMENT WIZARD ──────────────────────────────────────────
function NewShipment({ onBack }) {
  const [step, setStep] = useState(1);
  const [submitMethod, setSubmitMethod] = useState("nsw");
  const STEPS = ["Upload documents","AI extraction & verify","Review & submit"];

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

            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" onClick={() => setStep(2)} style={{ flex:1, textAlign:"center" }}>← Back</Btn>
              <button style={{
                flex:2, background:BLUE, color:"#fff", border:"none", borderRadius:8,
                padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer",
              }}>Submit to NSW →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NSW TRACKING ─────────────────────────────────────────────────
function NSWTracking() {
  const active = SHIPMENTS.filter(s=>!["COMPLETED","DRAFT"].includes(s.status));

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT }}>NSW Tracking</h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:TEXT3 }}>Real-time submission status</p>
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
          { label:"Export declarations",  value:"38",    color:"#2563EB" },
          { label:"Import declarations",  value:"12",    color:"#D97706" },
          { label:"Pending submission",   value:"3",     color:"#7C3AED" },
          { label:"Cleared this month",   value:"42",    color:"#16A34A" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:MONO }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="Declaration list" sub="Export A008-1 and Import declarations" right={
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="secondary" style={{ fontSize:11 }}>Print selected</Btn>
            <Btn variant="secondary" style={{ fontSize:11 }}>Export CSV</Btn>
          </div>
        }/>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
              {["Declaration no.","Type","Job ref","Vessel","FOB value","HS Code (main)","Form","Status","Date",""].map(h=>(
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIPMENTS.filter(s=>s.status!=="DRAFT").map((s,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background=BG}
                onMouseLeave={e=>e.currentTarget.style.background=W}>
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
                  <Btn variant="ghost" style={{ fontSize:10, padding:"3px 8px" }}>Print</Btn>
                  <Btn variant="ghost" style={{ fontSize:10, padding:"3px 8px" }}>CSV</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── MASTER DATA ──────────────────────────────────────────────────
function MasterData() {
  const [tab, setTab] = useState("hs");

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

      {tab==="hs" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <input placeholder="Search HS code or description..." style={{ border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", fontSize:12, width:320, background:W }}/>
            <Btn>+ Add HS code</Btn>
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
                {HS_MASTER.map((hs,i) => (
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
                      <Btn variant="ghost" style={{ fontSize:10, padding:"3px 8px" }}>Edit</Btn>
                      <Btn variant="danger" style={{ fontSize:10, padding:"3px 8px" }}>Delete</Btn>
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
          <SectionHeader title="Exporter profiles" sub="Used in declaration header" right={<Btn>+ Add</Btn>}/>
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
                <Btn variant="secondary" style={{ fontSize:11 }}>Edit</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab==="privilege" && (
        <Card>
          <SectionHeader title="Privilege codes" sub="BOI, IEAT, Free Zone, etc." right={<Btn>+ Add</Btn>}/>
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
                  <Btn variant="ghost" style={{ fontSize:11 }}>Edit</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab==="customers" && (
        <Card>
          <SectionHeader title="Consignees / customers" sub="Used in shipment Consignee field" right={<Btn>+ Add</Btn>}/>
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
                  <Btn variant="ghost" style={{ fontSize:11 }}>Edit</Btn>
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
                  <Btn variant="ghost" style={{ fontSize:10 }}>Download PDF</Btn>
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
          <Btn variant="secondary" style={{ fontSize:11 }}>Download report</Btn>
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

// ─── SETTINGS ─────────────────────────────────────────────────────
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

      {tab==="company" && (
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
          <Card>
            <SectionHeader title="Company profile" />
            <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
              {[
                ["Company name (Thai)", "บริษัท ไทยอิเล็กทรอนิกส์ จำกัด"],
                ["Tax ID", "0105561000123"],
                ["Address", "123 ถ.พระราม 2 แขวงบางมด เขตจอมทอง กรุงเทพฯ 10150"],
                ["Phone", "02-123-4567"],
                ["Email", "somchai@thaielectronics.co.th"],
              ].map(([l,v],i) => (
                <div key={i}>
                  <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                  <input defaultValue={v} style={{ width:"100%", background:BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:12, color:TEXT, boxSizing:"border-box" }}/>
                </div>
              ))}
              <Btn style={{ alignSelf:"flex-start" }}>Save changes</Btn>
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
                  ["Provider","LogiConnect Co., Ltd."],
                  ["Contact","admin@logiconnect.co.th"],
                  ["Member since","September 2025"],
                  ["Tenant ID","T001 · THEL"],
                ].map(([l,v],i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                    <span style={{ fontSize:11, color:TEXT3 }}>{l}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:TEXT }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab==="users" && (
        <Card>
          <SectionHeader title="Factory users" sub="Manage access for your team" right={<Btn>+ Invite user</Btn>}/>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                {["Name","Email","Role","Last active","Status",""].map(h=>(
                  <th key={h} style={{ padding:"9px 18px", textAlign:"left", fontSize:10, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name:"สมชาย ใจดี",   email:"somchai@thaielectronics.co.th", role:"ADMIN",  last:"Now",       active:true },
                { name:"วิภา สวัสดี",  email:"vipa@thaielectronics.co.th",    role:"USER",   last:"2h ago",    active:true },
                { name:"ธนา มั่งมี",   email:"thana@thaielectronics.co.th",   role:"VIEWER", last:"3 days ago",active:false },
              ].map((u,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}` }}>
                  <td style={{ padding:"13px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"#0EA5E915", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:BLUE }}>
                        {u.name.charAt(0)}
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"13px 18px", color:TEXT2 }}>{u.email}</td>
                  <td style={{ padding:"13px 18px" }}>
                    <Tag label={u.role} color={u.role==="ADMIN"?BLUE:u.role==="USER"?"#7C3AED":TEXT3}/>
                  </td>
                  <td style={{ padding:"13px 18px", color:TEXT3, fontSize:11 }}>{u.last}</td>
                  <td style={{ padding:"13px 18px" }}>
                    <Tag label={u.active?"Active":"Inactive"} color={u.active?"#16A34A":"#DC2626"}/>
                  </td>
                  <td style={{ padding:"13px 18px", display:"flex", gap:6 }}>
                    <Btn variant="ghost" style={{ fontSize:10 }}>Edit role</Btn>
                    {u.role!=="ADMIN" && <Btn variant="danger" style={{ fontSize:10 }}>Remove</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab==="notifications" && (
        <Card style={{ maxWidth:560 }}>
          <SectionHeader title="Email notifications" />
          <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
            {[
              ["Job submitted to NSW",    true ],
              ["NSW approval received",   true ],
              ["Customs cleared",         true ],
              ["Job rejected",            true ],
              ["Invoice issued",          true ],
              ["Monthly summary report",  false],
              ["New user invited",        false],
            ].map(([label, on], i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<6?`1px solid ${BORDER2}`:"none" }}>
                <span style={{ fontSize:13, color:TEXT }}>{label}</span>
                <button style={{
                  width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative",
                  background:on?BLUE:"#E2E8F0", transition:"background 0.15s",
                }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:on?23:3, transition:"left 0.15s" }}/>
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab==="security" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <SectionHeader title="Change password" />
            <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
              {["Current password","New password","Confirm new password"].map((l,i) => (
                <div key={i}>
                  <label style={{ fontSize:11, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                  <input type="password" placeholder="••••••••" style={{ width:"100%", background:BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:12, color:TEXT, boxSizing:"border-box" }}/>
                </div>
              ))}
              <Btn style={{ alignSelf:"flex-start" }}>Update password</Btn>
            </div>
          </Card>
          <Card>
            <SectionHeader title="Session & access" />
            <div style={{ padding:"16px 20px" }}>
              {[
                ["Last login",         "Today 08:30 · Bangkok, TH"],
                ["Session expires",    "In 4 hours"],
                ["IP address",         "101.10.xx.xx"],
                ["ISO 27001",          "Compliant — Audit log active"],
              ].map(([l,v],i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                  <span style={{ fontSize:11, color:TEXT3 }}>{l}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:TEXT }}>{v}</span>
                </div>
              ))}
              <Btn variant="danger" style={{ marginTop:16, width:"100%", textAlign:"center" }}>Sign out all devices</Btn>
            </div>
          </Card>
        </div>
      )}
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
      case "new":           return <NewShipment onBack={() => setScreen("shipments")}/>;
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
