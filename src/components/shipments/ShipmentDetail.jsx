import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../stores/AuthContext.jsx";
import { usePermissions } from "../../hooks/usePermissions.js";
import { jobsApi } from "../../api/jobsApi.js";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, ROW_HOVER, Card, SectionHeader, Btn, Badge, Tag, ApprovalBadge, downloadCSV, printHTML } from "../ui/index.jsx";

function ShipmentDetail({ job, onBack }) {
  const perms = usePermissions();
  const auth = useContext(AuthContext);
  const [tab, setTab] = useState("overview");
  const tabs = ["overview","items","timeline","documents"];

  // B1: Assignment
  const [staffList, setStaffList] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [currentAssigned, setCurrentAssigned] = useState(job.assignedToName || null);
  const [currentAssignedId, setCurrentAssignedId] = useState(job.assignedToId || "");

  // B2: Approval
  const [approval, setApproval] = useState(job.approvalStatus || "NONE");
  const [approvalNote, setApprovalNote] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    if (perms.canAssignJobs) {
      jobsApi.listStaff().then(data => {
        const arr = data?.data ?? (Array.isArray(data) ? data : []);
        setStaffList(arr);
      }).catch(() => {});
    }
  }, [perms.canAssignJobs]);

  const handleAssign = async (profileId) => {
    if (!job._id || assignLoading) return;
    setAssignLoading(true);
    try {
      await jobsApi.assign(job._id, profileId);
      const staff = staffList.find(s => s.id === profileId || s.profileId === profileId);
      setCurrentAssigned(staff?.fullName || staff?.email || "Assigned");
      setCurrentAssignedId(profileId);
    } catch (e) { alert("Assign failed: " + (e?.response?.data?.message || e.message)); }
    setAssignLoading(false);
  };

  const handleRequestApproval = async () => {
    if (!job._id || approvalLoading) return;
    setApprovalLoading(true);
    try {
      await jobsApi.requestApproval(job._id, approvalNote);
      setApproval("PENDING");
      setApprovalNote("");
    } catch (e) { alert("Request failed: " + (e?.response?.data?.message || e.message)); }
    setApprovalLoading(false);
  };

  const handleApprove = async () => {
    if (!job._id || approvalLoading) return;
    setApprovalLoading(true);
    try {
      await jobsApi.approve(job._id, approvalNote);
      setApproval("APPROVED");
      setApprovalNote("");
    } catch (e) { alert("Approve failed: " + (e?.response?.data?.message || e.message)); }
    setApprovalLoading(false);
  };

  const handleReject = async () => {
    if (!job._id || approvalLoading) return;
    setApprovalLoading(true);
    try {
      await jobsApi.reject(job._id, approvalNote);
      setApproval("REJECTED");
      setApprovalNote("");
    } catch (e) { alert("Reject failed: " + (e?.response?.data?.message || e.message)); }
    setApprovalLoading(false);
  };

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
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:TEXT, fontFamily:MONO }}>{job.id}</h1>
            <Tag label={job.type} color={job.type==="Export"?"#2563EB":"#D97706"} />
            <Badge status={job.status} />
          </div>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>{job.vessel} · {job.fob} · {job.date}</p>
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
            fontSize:15, cursor:"pointer", textTransform:"capitalize",
          }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid-2">
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
                  <span style={{ fontSize:14, color:TEXT3, fontWeight:600 }}>{l}</span>
                  <span style={{ fontSize:14, color:TEXT, fontFamily: l.includes("number")||l.includes("reference")||l.includes("Container")?MONO:"inherit" }}>{v}</span>
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
                  <span style={{ fontSize:14, color:TEXT3, fontWeight:600 }}>{l}</span>
                  <span style={{ fontSize:14, color:TEXT, fontFamily: l.includes("no.")||l.includes("HS")||l.includes("tax")?MONO:"inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:"12px 20px", borderTop:`1px solid ${BORDER2}`, display:"flex", gap:8 }}>
              <Btn variant="secondary" style={{ fontSize:14 }} onClick={() => {
                const html = `<h2>Export Declaration A008-1 — ${job.id}</h2>
                  <div className="table-wrapper"><table>
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
                  </table></div>`;
                printHTML(`A008-1 — ${job.id}`, html);
              }}>🖨 Print A008-1</Btn>
              <Btn variant="secondary" style={{ fontSize:14 }} onClick={() => {
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

          {/* ── B1: Job Assignment Panel ──────────────────────────── */}
          {perms.canAssignJobs && (
            <Card style={{ gridColumn:"1 / -1" }}>
              <SectionHeader title="ผู้รับผิดชอบ (Job Assignment)" right={<ApprovalBadge status={approval}/>} />
              <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14, color:TEXT3, fontWeight:600 }}>มอบหมายให้:</span>
                  <select
                    value={currentAssignedId}
                    onChange={e => handleAssign(e.target.value)}
                    disabled={assignLoading}
                    style={{
                      padding:"6px 12px", borderRadius:6, border:`1px solid ${BORDER}`,
                      fontSize:14, color:TEXT, background:W, cursor:"pointer", minWidth:200,
                    }}
                  >
                    <option value="">— เลือกเจ้าหน้าที่ —</option>
                    {staffList.map(s => (
                      <option key={s.id || s.profileId} value={s.id || s.profileId}>
                        {s.fullName || s.email}
                      </option>
                    ))}
                  </select>
                  {assignLoading && <span style={{ fontSize:13, color:TEXT3 }}>กำลังบันทึก…</span>}
                </div>
                {currentAssigned && (
                  <span style={{ fontSize:14, color:"#16A34A", fontWeight:600 }}>
                    ✓ มอบหมายแล้ว: {currentAssigned}
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* ── B2: Approval Workflow Panel ────────────────────────── */}
          <Card style={{ gridColumn:"1 / -1" }}>
            <SectionHeader title="Approval Workflow" right={<ApprovalBadge status={approval}/>} />
            <div style={{ padding:"16px 20px" }}>
              {approval === "NONE" && perms.canRequestApproval && (
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <input
                    value={approvalNote} onChange={e => setApprovalNote(e.target.value)}
                    placeholder="หมายเหตุ (optional)"
                    style={{ flex:1, padding:"8px 12px", borderRadius:6, border:`1px solid ${BORDER}`, fontSize:14 }}
                  />
                  <Btn onClick={handleRequestApproval} disabled={approvalLoading}>
                    {approvalLoading ? "กำลังส่ง…" : "ขออนุมัติ"}
                  </Btn>
                </div>
              )}
              {approval === "PENDING" && (
                <div>
                  <div style={{ padding:"12px 16px", background:"#FFFBEB", borderRadius:8, border:"1px solid #FDE68A", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>⏳</span>
                    <span style={{ fontSize:14, fontWeight:600, color:"#92400E" }}>รออนุมัติจากผู้บริหาร</span>
                  </div>
                  {perms.canApproveJobs && (
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <input
                        value={approvalNote} onChange={e => setApprovalNote(e.target.value)}
                        placeholder="หมายเหตุ (optional)"
                        style={{ flex:1, padding:"8px 12px", borderRadius:6, border:`1px solid ${BORDER}`, fontSize:14 }}
                      />
                      <Btn onClick={handleApprove} disabled={approvalLoading}>
                        {approvalLoading ? "…" : "✓ อนุมัติ"}
                      </Btn>
                      <Btn variant="danger" onClick={handleReject} disabled={approvalLoading}>
                        {approvalLoading ? "…" : "✕ ปฏิเสธ"}
                      </Btn>
                    </div>
                  )}
                </div>
              )}
              {approval === "APPROVED" && (
                <div style={{ padding:"12px 16px", background:"#F0FDF4", borderRadius:8, border:"1px solid #BBF7D0", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>✅</span>
                  <span style={{ fontSize:14, fontWeight:600, color:"#166534" }}>อนุมัติแล้ว — พร้อมส่ง NSW</span>
                </div>
              )}
              {approval === "REJECTED" && (
                <div>
                  <div style={{ padding:"12px 16px", background:"#FEF2F2", borderRadius:8, border:"1px solid #FECACA", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>❌</span>
                    <span style={{ fontSize:14, fontWeight:600, color:"#991B1B" }}>ถูกปฏิเสธ{job.approvalNote ? ` — ${job.approvalNote}` : ""}</span>
                  </div>
                  {perms.canRequestApproval && (
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <input
                        value={approvalNote} onChange={e => setApprovalNote(e.target.value)}
                        placeholder="หมายเหตุสำหรับขออนุมัติใหม่"
                        style={{ flex:1, padding:"8px 12px", borderRadius:6, border:`1px solid ${BORDER}`, fontSize:14 }}
                      />
                      <Btn onClick={handleRequestApproval} disabled={approvalLoading}>
                        {approvalLoading ? "กำลังส่ง…" : "ขออนุมัติอีกครั้ง"}
                      </Btn>
                    </div>
                  )}
                </div>
              )}
              {approval === "NONE" && !perms.canRequestApproval && (
                <span style={{ fontSize:14, color:TEXT3 }}>ยังไม่มีการขออนุมัติ</span>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "items" && (
        <Card>
          <SectionHeader title={`Items (${ITEMS.length})`} sub="Extracted by AI · verified" />
          <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                {["#","Description","Thai desc.","HS Code","Qty","Unit","FOB/unit","Total","Origin",""].map(h=>(
                  <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((it,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, background:it.ok?W:"#FFFBEB" }}>
                  <td style={{ padding:"10px 14px", color:TEXT3 }}>{it.seq}</td>
                  <td style={{ padding:"10px 14px", fontWeight:500, color:TEXT, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.desc}</td>
                  <td style={{ padding:"10px 14px", color:TEXT2, fontSize:14 }}>{it.thDesc}</td>
                  <td style={{ padding:"10px 14px", fontFamily:MONO, fontSize:14, color:"#2563EB", fontWeight:600 }}>{it.hs}</td>
                  <td style={{ padding:"10px 14px", fontFamily:MONO, color:TEXT2 }}>{it.qty.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:TEXT2 }}>{it.unit}</td>
                  <td style={{ padding:"10px 14px", color:TEXT2 }}>{it.fob}</td>
                  <td style={{ padding:"10px 14px", fontWeight:600, color:TEXT }}>{it.total}</td>
                  <td style={{ padding:"10px 14px" }}><Tag label={it.origin} color="#16A34A"/></td>
                  <td style={{ padding:"10px 14px" }}>
                    {it.ok
                      ? <span style={{ fontSize:13, color:"#16A34A", fontWeight:700 }}>✓ AI</span>
                      : <span style={{ fontSize:13, color:"#D97706", fontWeight:700 }}>Manual</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
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
                    fontSize:12, color:"#fff", fontWeight:700,
                  }}>{t.done?"✓":""}</div>
                  {i<TL.length-1 && <div style={{ width:2, flex:1, minHeight:16, background:t.done?"#BBF7D0":"#E2E8F0", margin:"2px 0" }}/>}
                </div>
                <div style={{ paddingBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:2 }}>
                    <span style={{ fontSize:15, fontWeight:600, color:TEXT }}>{t.step}</span>
                    <span style={{ fontSize:14, color:TEXT3, fontFamily:MONO }}>{t.time}</span>
                    <span style={{ fontSize:13, color:TEXT3 }}>by {t.by}</span>
                  </div>
                  <div style={{ fontSize:14, color:TEXT3 }}>{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "documents" && (
        <div className="doc-grid">
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
              <div style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:4 }}>{doc.name}</div>
              <div style={{ fontSize:13, fontFamily:MONO, color:TEXT3, marginBottom:4 }}>{doc.file}</div>
              <div style={{ fontSize:13, color:TEXT3, marginBottom:8 }}>{doc.size} · {doc.uploaded}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <Tag label={doc.type} color={doc.type==="source"?BLUE:doc.type==="generated"?"#7C3AED":"#16A34A"} />
                <Btn variant="ghost" style={{ fontSize:14, padding:"3px 8px" }} onClick={() => {
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

export default ShipmentDetail;
