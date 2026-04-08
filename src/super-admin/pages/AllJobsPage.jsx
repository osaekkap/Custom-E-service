import { useState, useCallback } from "react";
import { C, TENANTS } from "../constants";
import { Card, CardHeader, Stat, JobStatusPill, JOB_STATUS_MAP } from "../components/SharedUI";

// ─── HHA Declaration Items (จากข้อมูลจริง HHA000406A — 93 items นำเข้าจากจีน) ──
const HHA_DECL_ITEMS = [
  { hsCode:"39173999", descEn:"EXHAUST HOSE",           descTh:"ท่ออ่อนสำหรับระบายอากาศ",       qty:164,      unit:"C62", price:0.0510, amt:73607.26,  origin:"CN" },
  { hsCode:"39269099", descEn:"COVER",                  descTh:"ฝาครอบทำจากพลาสติก",            qty:89340,    unit:"C62", price:0.0038, amt:58153.53,  origin:"CN" },
  { hsCode:"85015229", descEn:"MOTOR",                  descTh:"มอเตอร์ไฟฟ้า",                  qty:1200,     unit:"C62", price:41.14,  amt:49369.24,  origin:"CN" },
  { hsCode:"85444299", descEn:"WIRE HARNESS",           descTh:"ชุดสายไฟฟ้า",                   qty:3600,     unit:"C62", price:11.93,  amt:42954.49,  origin:"CN" },
  { hsCode:"74111000", descEn:"SUCTION PIPE ASSEMBLY",  descTh:"ท่อทองแดงสำหรับระบบทำความเย็น", qty:1200,     unit:"C62", price:24.07,  amt:28882.73,  origin:"CN" },
  { hsCode:"85322900", descEn:"CAPACITOR",              descTh:"ตัวเก็บประจุ",                  qty:2400,     unit:"C62", price:9.91,   amt:23791.43,  origin:"CN" },
  { hsCode:"39173299", descEn:"HOSE DRAIN ASSY",        descTh:"ท่อน้ำทิ้งแอร์",                qty:3600,     unit:"C62", price:6.02,   amt:21680.24,  origin:"CN" },
  { hsCode:"85312000", descEn:"STICKER KEY PRESS FILM", descTh:"ฟิล์มกดปุ่ม / เมมเบรนสวิตช์",  qty:3600,     unit:"C62", price:4.34,   amt:15633.68,  origin:"CN" },
  { hsCode:"40169999", descEn:"DAMPING RUBBER",         descTh:"ยางกันสั่นสะเทือน",             qty:10200,    unit:"C62", price:1.53,   amt:15631.38,  origin:"CN" },
  { hsCode:"73181590", descEn:"SCREW",                  descTh:"สกรู",                          qty:7940,     unit:"C62", price:0.0102, amt:81.20,     origin:"CN" },
  { hsCode:"39269099", descEn:"STRAPPING BAND",         descTh:"สายรัดบรรจุภัณฑ์",              qty:32473.57, unit:"MTR", price:0.04,   amt:1299.23,   origin:"CN" },
  { hsCode:"39269099", descEn:"CABLE TIE",              descTh:"เคเบิลไทร์",                   qty:19850,    unit:"C62", price:0.0164, amt:527.80,    origin:"CN" },
];

const ALL_JOBS_MOCK = [
  // ── HHA (THAILAND) — Import from China (ข้อมูลจริงจาก HHA000406A) ──
  { id:"JOB-2026-0044", jobNo:"JOB-2026-0044", tenant:"HHA",  tenantName:"HHA (THAILAND)",        type:"Import", mode:"Sea",   vessel:"SITC GUANGXI V.2403S",  container:"SITU3812450", fob:"CNY 434,999",  status:"CUSTOMS_REVIEW",  date:"2026-03-22", consignee:"HHA (THAILAND) CO., LTD.",    port:"Laem Chabang",    decls:1, docs:6,  items:93,  invoice:"HHA000406A", shippingMark:"K8PYD" },
  { id:"JOB-2026-0043", jobNo:"JOB-2026-0043", tenant:"HHA",  tenantName:"HHA (THAILAND)",        type:"Import", mode:"Sea",   vessel:"OOCL DALIAN V.015N",    container:"OOLU2918340", fob:"CNY 286,543",  status:"CLEARED",         date:"2026-03-15", consignee:"HHA (THAILAND) CO., LTD.",    port:"Laem Chabang",    decls:1, docs:8,  items:47,  invoice:"HHA000292", shippingMark:"SITGSHLCNJ18133" },
  { id:"JOB-2026-0042", jobNo:"JOB-2026-0042", tenant:"HHA",  tenantName:"HHA (THAILAND)",        type:"Import", mode:"Sea",   vessel:"COSCO SHIPPING V.1205", container:"CSNU8192034", fob:"CNY 178,200",  status:"COMPLETED",       date:"2026-03-08", consignee:"HHA (THAILAND) CO., LTD.",    port:"Laem Chabang",    decls:1, docs:7,  items:35,  invoice:"HHA000198", shippingMark:"K7PXD" },

  // ── DKSH — Mixed Import/Export ──
  { id:"JOB-2026-0041", jobNo:"JOB-2026-0041", tenant:"DKSH", tenantName:"ดีเคเอสเอช",           type:"Import", mode:"Sea",   vessel:"COSCO SHIPPING V.88",   container:"CSNU5291834", fob:"EUR 67,300",   status:"NSW_PROCESSING",  date:"2026-03-21", consignee:"DKSH (Thailand) Ltd.",        port:"Laem Chabang",    decls:1, docs:5  },
  { id:"JOB-2026-0040", jobNo:"JOB-2026-0040", tenant:"DKSH", tenantName:"ดีเคเอสเอช",           type:"Export", mode:"Air",   vessel:"TG676",                 container:"AWB-0291834", fob:"USD 145,800",  status:"COMPLETED",       date:"2026-03-14", consignee:"Roche Diagnostics GmbH",      port:"Frankfurt, DE",   decls:2, docs:9  },

  // ── THEL — Electronics Export ──
  { id:"JOB-2026-0039", jobNo:"JOB-2026-0039", tenant:"THEL", tenantName:"ไทยอิเล็กทรอนิกส์",   type:"Export", mode:"Sea",   vessel:"MSC AURORA V.124",      container:"MSCU7823410", fob:"USD 128,450",  status:"CLEARED",         date:"2026-03-18", consignee:"Samsung Electronics Korea",   port:"Busan, KR",       decls:2, docs:8  },
  { id:"JOB-2026-0038", jobNo:"JOB-2026-0038", tenant:"THEL", tenantName:"ไทยอิเล็กทรอนิกส์",   type:"Export", mode:"Sea",   vessel:"COSCO PRIDE V.67",      container:"CSNU5012340", fob:"USD 234,100",  status:"SUBMITTED",       date:"2026-03-20", consignee:"Intel Ireland Ltd",           port:"Dublin, IE",      decls:3, docs:12 },
  { id:"JOB-2026-0037", jobNo:"JOB-2026-0037", tenant:"THEL", tenantName:"ไทยอิเล็กทรอนิกส์",   type:"Export", mode:"Air",   vessel:"EK376",                 container:"AWB-0183210", fob:"USD 415,000",  status:"COMPLETED",       date:"2026-03-12", consignee:"Apple Inc. Foxconn Hub",      port:"Taipei, TW",      decls:4, docs:14 },

  // ── SAPT — Auto Parts ──
  { id:"JOB-2026-0036", jobNo:"JOB-2026-0036", tenant:"SAPT", tenantName:"สยามออโต้ พาร์ท",     type:"Export", mode:"Sea",   vessel:"EVER GIVEN V.89",       container:"EISU4561230", fob:"USD 87,200",   status:"NSW_PROCESSING",  date:"2026-03-19", consignee:"Toyota Motor Japan",          port:"Yokohama, JP",    decls:1, docs:5  },
  { id:"JOB-2026-0035", jobNo:"JOB-2026-0035", tenant:"SAPT", tenantName:"สยามออโต้ พาร์ท",     type:"Export", mode:"Air",   vessel:"TG407",                 container:"AWB-0192834", fob:"USD 63,800",   status:"DRAFT",           date:"2026-03-20", consignee:"—",                          port:"—",               decls:0, docs:0  },
  { id:"JOB-2026-0034", jobNo:"JOB-2026-0034", tenant:"SAPT", tenantName:"สยามออโต้ พาร์ท",     type:"Import", mode:"Sea",   vessel:"YANG MING V.98",        container:"YMLU3920183", fob:"USD 77,300",   status:"REJECTED",        date:"2026-03-10", consignee:"Siam Auto Part Warehouse",   port:"Laem Chabang",    decls:1, docs:3  },

  // ── MITR — Commodities ──
  { id:"JOB-2026-0033", jobNo:"JOB-2026-0033", tenant:"MITR", tenantName:"มิตรผล กรุ๊ป",         type:"Export", mode:"Sea",   vessel:"MSC DIANA V.221",       container:"MSCU1928340", fob:"USD 98,000",   status:"COMPLETED",       date:"2026-03-15", consignee:"Cargill Asia Pacific",       port:"Singapore, SG",   decls:2, docs:9  },
  { id:"JOB-2026-0032", jobNo:"JOB-2026-0032", tenant:"MITR", tenantName:"มิตรผล กรุ๊ป",         type:"Import", mode:"Sea",   vessel:"OOCL EUROPE V.32",      container:"OOLU6312870", fob:"USD 45,600",   status:"CUSTOMS_REVIEW",  date:"2026-03-19", consignee:"Mitrphol Warehouse TH",      port:"Laem Chabang",    decls:1, docs:6  },

  // ── TPAK / BKEX ──
  { id:"JOB-2026-0031", jobNo:"JOB-2026-0031", tenant:"TPAK", tenantName:"ไทยแพ็กเกจจิ้ง",       type:"Export", mode:"Sea",   vessel:"MAERSK TITAN V.41",     container:"MSKU8723410", fob:"USD 32,500",   status:"READY",           date:"2026-03-17", consignee:"Costco Wholesale USA",       port:"Los Angeles, US", decls:1, docs:4  },
  { id:"JOB-2026-0030", jobNo:"JOB-2026-0030", tenant:"BKEX", tenantName:"กรุงเทพเอ็กซ์พอร์ต",   type:"Export", mode:"Sea",   vessel:"EVER BLOOM V.15",       container:"EISU1203450", fob:"USD 19,200",   status:"PREPARING",       date:"2026-03-20", consignee:"Hans GmbH München",          port:"Hamburg, DE",     decls:0, docs:3  },
  { id:"JOB-2026-0029", jobNo:"JOB-2026-0029", tenant:"BKEX", tenantName:"กรุงเทพเอ็กซ์พอร์ต",   type:"Export", mode:"Sea",   vessel:"NYK ARGUS V.12",        container:"NYKU2831029", fob:"USD 58,900",   status:"COMPLETED",       date:"2026-03-08", consignee:"Walmart Distribution EU",    port:"Rotterdam, NL",   decls:2, docs:7  },
];

function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }, []);
  const Toast = msg ? (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "12px 20px", borderRadius: 10,
      background: msg.type === "error" ? C.redBg : C.greenBg,
      border: `1px solid ${msg.type === "error" ? C.red : C.green}`,
      color: msg.type === "error" ? C.red : C.green,
      fontSize: 14, fontWeight: 600, boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    }}>{msg.text}</div>
  ) : null;
  return { show, Toast };
}

export function AllJobsPage() {
  const [search,   setSearch]   = useState("");
  const [filterT,  setFilterT]  = useState("ALL");   // tenant
  const [filterS,  setFilterS]  = useState("ALL");   // status
  const [filterM,  setFilterM]  = useState("ALL");   // mode
  const [selected, setSelected] = useState(null);

  const tenantOptions = ["ALL", ...Array.from(new Set(ALL_JOBS_MOCK.map(j => j.tenant)))];
  const statusOptions = ["ALL","DRAFT","PREPARING","READY","SUBMITTED","NSW_PROCESSING","CUSTOMS_REVIEW","CLEARED","COMPLETED","REJECTED"];
  const modeOptions   = ["ALL","Sea","Air"];

  const filtered = ALL_JOBS_MOCK.filter(j => {
    if (filterT !== "ALL" && j.tenant  !== filterT) return false;
    if (filterS !== "ALL" && j.status  !== filterS) return false;
    if (filterM !== "ALL" && j.mode    !== filterM) return false;
    if (search) {
      const q = search.toLowerCase();
      return j.jobNo.toLowerCase().includes(q) ||
             j.vessel.toLowerCase().includes(q) ||
             j.tenantName.toLowerCase().includes(q) ||
             j.consignee.toLowerCase().includes(q);
    }
    return true;
  });

  // Summary counts
  const total     = ALL_JOBS_MOCK.length;
  const active    = ALL_JOBS_MOCK.filter(j => !["COMPLETED","REJECTED","DRAFT"].includes(j.status)).length;
  const completed = ALL_JOBS_MOCK.filter(j => j.status === "COMPLETED").length;
  const rejected  = ALL_JOBS_MOCK.filter(j => j.status === "REJECTED").length;

  const inputStyle = {
    background: C.bg3, border:`1px solid ${C.border}`, borderRadius:10,
    padding:"9px 14px", color:C.text, fontSize:14, outline:"none",
    fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
  };
  const selStyle = { ...inputStyle, cursor:"pointer", paddingRight:28 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Page title */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.text, letterSpacing:"-0.4px" }}>All Jobs</h1>
          <p style={{ margin:"4px 0 0", fontSize:14, color:C.textDim }}>
            ทุก Shipment จากทุก Tenant · อัปเดตล่าสุด {new Date().toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"})}
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="rsp-grid-4">
        {[
          { label:"Total Jobs",      value:total,     color:C.teal,   sub:"ทั้งหมด" },
          { label:"In Progress",     value:active,    color:C.blue,   sub:"กำลังดำเนินการ" },
          { label:"Completed",       value:completed, color:C.green,  sub:"เสร็จสิ้น" },
          { label:"Rejected",        value:rejected,  color:C.red,    sub:"ถูกปฏิเสธ" },
        ].map((k,i) => (
          <Card key={i}>
            <Stat label={k.label} value={k.value} sub={k.sub} color={k.color} />
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <Card>
        <div style={{ padding:"16px 20px", display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>
          <input
            placeholder="🔍  ค้นหา Job No, ชื่อเรือ, บริษัท…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, minWidth:240, flex:"1 1 240px" }}
          />
          <select value={filterT} onChange={e => setFilterT(e.target.value)} style={selStyle}>
            {tenantOptions.map(t => <option key={t} value={t}>{t === "ALL" ? "🏭  ทุก Tenant" : t}</option>)}
          </select>
          <select value={filterS} onChange={e => setFilterS(e.target.value)} style={selStyle}>
            {statusOptions.map(s => <option key={s} value={s}>{s === "ALL" ? "⊙  ทุก Status" : (JOB_STATUS_MAP[s]?.label ?? s)}</option>)}
          </select>
          <select value={filterM} onChange={e => setFilterM(e.target.value)} style={selStyle}>
            {modeOptions.map(m => <option key={m} value={m}>{m === "ALL" ? "🚢  ทุก Mode" : m}</option>)}
          </select>
          {(search || filterT !== "ALL" || filterS !== "ALL" || filterM !== "ALL") && (
            <button onClick={() => { setSearch(""); setFilterT("ALL"); setFilterS("ALL"); setFilterM("ALL"); }}
              style={{ ...inputStyle, cursor:"pointer", color:C.red, border:`1px solid ${C.red}44`, background:C.redBg, fontWeight:700, padding:"9px 16px" }}>
              ✕ ล้าง
            </button>
          )}
          <span style={{ fontSize:13, color:C.textDim, marginLeft:"auto" }}>
            แสดง <b style={{ color:C.text }}>{filtered.length}</b> จาก {total} รายการ
          </span>
        </div>
      </Card>

      {/* Jobs table */}
      <Card>
        <CardHeader
          title="รายการ Shipment ทั้งหมด"
          sub={`${filtered.length} jobs · จาก ${TENANTS.filter(t=>t.status!=="suspended").length} Tenants`}
        />
        <div className="table-wrap">
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead>
              <tr style={{ background:C.bg3, borderBottom:`1px solid ${C.border}` }}>
                {["Job No.","Tenant","Type","Mode","Vessel / AWB","Consignee","FOB Value","Status","Date","Decls","Docs"].map(h => (
                  <th key={h} style={{
                    padding:"10px 16px", textAlign:"left",
                    fontSize:12, fontWeight:700, color:C.textDim,
                    textTransform:"uppercase", letterSpacing:"0.6px", whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{ padding:"40px", textAlign:"center", color:C.textDim, fontSize:14 }}>ไม่พบรายการที่ตรงกับเงื่อนไข</td></tr>
              )}
              {filtered.map((job, i) => {
                const isSelected = selected === job.id;
                return (
                  <tr key={job.id} className="row-hover"
                    onClick={() => setSelected(isSelected ? null : job.id)}
                    style={{
                      borderBottom:`1px solid ${C.border}`,
                      cursor:"pointer",
                      background: isSelected ? C.tealBg : "transparent",
                      transition:"background 0.15s",
                    }}>
                    <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                      <span style={{ fontFamily:C.mono, fontSize:13, color:C.teal, fontWeight:700 }}>{job.jobNo}</span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{job.tenant}</div>
                      <div style={{ fontSize:12, color:C.textDim, marginTop:1 }}>{job.tenantName}</div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{
                        padding:"2px 8px", borderRadius:20, fontSize:12, fontWeight:700,
                        background: job.type==="Export"?"rgba(52,211,153,0.12)":"rgba(96,165,250,0.12)",
                        color: job.type==="Export"?C.green:C.blue,
                        border:`1px solid ${job.type==="Export"?C.green+"44":C.blue+"44"}`,
                      }}>{job.type}</span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:13, color:C.textMid }}>
                        {job.mode === "Sea" ? "🚢" : "✈️"} {job.mode}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{job.vessel}</div>
                      <div style={{ fontSize:12, color:C.textDim, fontFamily:C.mono }}>{job.container}</div>
                    </td>
                    <td style={{ padding:"12px 16px", maxWidth:180 }}>
                      <span style={{ fontSize:13, color:C.textMid, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{job.consignee}</span>
                    </td>
                    <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                      <span style={{ fontFamily:C.mono, fontSize:13, fontWeight:700, color:C.text }}>{job.fob}</span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <JobStatusPill status={job.status} />
                    </td>
                    <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                      <span style={{ fontSize:13, color:C.textDim, fontFamily:C.mono }}>{job.date}</span>
                    </td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      <span style={{
                        fontSize:13, fontWeight:700,
                        color: job.decls > 0 ? C.purple : C.textDim,
                      }}>{job.decls}</span>
                    </td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      <span style={{
                        fontSize:13, fontWeight:700,
                        color: job.docs > 0 ? C.blue : C.textDim,
                      }}>{job.docs}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded row detail */}
        {selected && (() => {
          const job = ALL_JOBS_MOCK.find(j => j.id === selected);
          if (!job) return null;
          const s = JOB_STATUS_MAP[job.status];
          return (<>
            <div style={{
              margin:"0 16px 16px", padding:"20px 24px",
              background:C.bg3, borderRadius:12,
              border:`1px solid ${C.borderHi}`,
              display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16,
            }}>
              {[
                ["Job Number", job.jobNo, C.teal],
                ["Tenant",     `${job.tenant} · ${job.tenantName}`, C.text],
                ["Type",       `${job.type} · ${job.mode}`, C.text],
                ["Vessel",     job.vessel, C.text],
                ["Container",  job.container, C.text],
                ["Consignee",  job.consignee, C.textMid],
                ["FOB Value",  job.fob, C.amber],
                ["Port",       job.port, C.text],
                ["Date",       job.date, C.textMid],
                ["Status",     s?.label, s?.color],
                ...(job.invoice  ? [["Invoice No.",    job.invoice, C.purple]] : []),
                ...(job.items    ? [["Items",          `${job.items} รายการ`, C.blue]] : []),
                ...(job.shippingMark ? [["Shipping Mark", job.shippingMark, C.textMid]] : []),
              ].map(([label, value, color]) => (
                <div key={label}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.textDim, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:14, fontWeight:600, color: color||C.text, fontFamily: label==="Job Number"||label==="Container"||label==="Invoice No."?C.mono:"inherit" }}>{value || "—"}</div>
                </div>
              ))}
            </div>

            {/* Declaration Items สำหรับ HHA jobs */}
            {job.tenant === "HHA" && (
              <div style={{ margin:"0 16px 16px", padding:"16px 20px", background:C.bg2, borderRadius:10, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.teal, marginBottom:12, letterSpacing:"0.3px" }}>
                  Declaration Items — {job.invoice || "N/A"} ({HHA_DECL_ITEMS.length} of {job.items} items shown)
                </div>
                <div className="table-wrap">
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                        {["HS Code","EN Description","TH Description","Qty","Unit","Price (CNY)","Amount (CNY)","Origin"].map(h => (
                          <th key={h} style={{ padding:"6px 10px", textAlign:"left", color:C.textDim, fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HHA_DECL_ITEMS.map((item, i) => (
                        <tr key={i} style={{ borderBottom:`1px solid ${C.border}22` }}>
                          <td style={{ padding:"5px 10px", fontFamily:C.mono, color:C.amber, fontWeight:600 }}>{item.hsCode}</td>
                          <td style={{ padding:"5px 10px", color:C.text }}>{item.descEn}</td>
                          <td style={{ padding:"5px 10px", color:C.textMid }}>{item.descTh}</td>
                          <td style={{ padding:"5px 10px", textAlign:"right", fontFamily:C.mono, color:C.text }}>{item.qty.toLocaleString()}</td>
                          <td style={{ padding:"5px 10px", color:C.textDim }}>{item.unit}</td>
                          <td style={{ padding:"5px 10px", textAlign:"right", fontFamily:C.mono, color:C.textMid }}>{item.price.toFixed(4)}</td>
                          <td style={{ padding:"5px 10px", textAlign:"right", fontFamily:C.mono, fontWeight:600, color:C.teal }}>{item.amt.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                          <td style={{ padding:"5px 10px", color:C.textDim }}>{item.origin}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop:`1px solid ${C.border}` }}>
                        <td colSpan={6} style={{ padding:"6px 10px", textAlign:"right", fontWeight:700, color:C.textMid, fontSize:12 }}>Total Amount:</td>
                        <td style={{ padding:"6px 10px", textAlign:"right", fontFamily:C.mono, fontWeight:800, color:C.teal, fontSize:13 }}>
                          {HHA_DECL_ITEMS.reduce((s,it) => s+it.amt, 0).toLocaleString(undefined,{minimumFractionDigits:2})}
                        </td>
                        <td style={{ padding:"6px 10px", color:C.textDim }}>CNY</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>);
        })()}
      </Card>
    </div>
  );
}
