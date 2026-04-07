import { useState } from "react";
import client from "../api/client.js";
import { jobsApi } from "../api/jobsApi.js";
import ManualDeclarationForm from "./ManualDeclarationForm.jsx";
import { W, BG, BORDER, BORDER2, TEXT, TEXT2, TEXT3, BLUE, MONO, Card, SectionHeader, Btn } from "./ui/index.jsx";

function NewShipment({ onBack, onCreated }) {
  const [manualMode, setManualMode] = useState(false);
  const [step, setStep] = useState(1);
  const [submitMethod, setSubmitMethod] = useState("nsw");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractErr, setExtractErr] = useState("");
  const [extracted, setExtracted] = useState(null); // AI result
  const [uploadedFiles, setUploadedFiles] = useState({ invoice: null, packingList: null, booking: null });
  const [privilegeFlags, setPrivilegeFlags] = useState([]);
  const [form, setForm] = useState({
    type: "EXPORT",
    vesselName: "",
    containerNo: "",
    portOfLoading: "",
    portOfDischarge: "",
    etd: "",
    consigneeNameEn: "",
    currency: "USD",
  });
  const STEPS = ["Upload documents","AI extraction & verify","Review & submit"];

  // Populate form from extracted AI data
  const applyExtracted = (data) => {
    setForm(f => ({
      ...f,
      vesselName: data.vessel || f.vesselName,
      containerNo: data.containerNo || f.containerNo,
      portOfLoading: data.portOfLoading || f.portOfLoading,
      portOfDischarge: data.portOfDischarge || f.portOfDischarge,
      etd: data.etd || f.etd,
      consigneeNameEn: data.consignee || f.consigneeNameEn,
      currency: data.currency || f.currency,
    }));
  };

  const handleFileSelect = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    setUploadedFiles(prev => ({ ...prev, [field]: file }));
    setExtractErr("");
  };

  const handleExtract = async () => {
    if (!uploadedFiles.invoice) {
      setExtractErr("กรุณาอัปโหลด Commercial Invoice ก่อน");
      return;
    }
    setExtracting(true);
    setExtractErr("");
    try {
      const fd = new FormData();
      fd.append("invoice", uploadedFiles.invoice);
      if (uploadedFiles.packingList) fd.append("packingList", uploadedFiles.packingList);
      if (uploadedFiles.booking) fd.append("booking", uploadedFiles.booking);
      const resp = await client.post("/ai/extract-invoice", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const data = resp.data;
      setExtracted(data);
      applyExtracted(data);
      setStep(2);
    } catch(e) {
      const msg = e?.response?.data?.message;
      setExtractErr(Array.isArray(msg) ? msg.join(", ") : (msg || "AI extraction failed"));
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateJob = async () => {
    setSubmitting(true);
    setSubmitErr("");
    try {
      const job = await jobsApi.create({
        type: form.type,
        privilegeFlags: privilegeFlags.length > 0 ? privilegeFlags : undefined,
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

  // ─── Manual mode: render ManualDeclarationForm ──────────
  if (manualMode) {
    return (
      <ManualDeclarationForm
        onBack={() => setManualMode(false)}
        onCreated={(jobId) => { if (onCreated) onCreated(jobId); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <Btn variant="secondary" onClick={onBack}>← Back</Btn>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>New export shipment</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>ยื่นใบขนสินค้าขาออก · Export declaration wizard</p>
        </div>
      </div>

      {/* Mode selector: AI vs Manual */}
      <Card style={{ marginBottom:16, padding:"14px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:14, fontWeight:600, color:TEXT }}>เลือกวิธีกรอกข้อมูล</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setManualMode(false)} style={{
              padding:"7px 16px", borderRadius:7, fontSize:13, fontWeight:600, cursor:"pointer",
              background: !manualMode ? "#EFF6FF" : "#fff",
              border: `1.5px solid ${!manualMode ? BLUE : BORDER}`,
              color: !manualMode ? BLUE : TEXT2, transition:"all 0.15s",
            }}>
              🤖 Extract with AI
            </button>
            <button onClick={() => setManualMode(true)} style={{
              padding:"7px 16px", borderRadius:7, fontSize:13, fontWeight:600, cursor:"pointer",
              background: manualMode ? "#EFF6FF" : "#fff",
              border: `1.5px solid ${manualMode ? BLUE : BORDER}`,
              color: manualMode ? BLUE : TEXT2, transition:"all 0.15s",
            }}>
              ✏️ กรอกข้อมูลเอง
            </button>
          </div>
        </div>
      </Card>

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
                    fontSize:14, fontWeight:700, color:done||active?"#fff":TEXT3,
                  }}>{done?"✓":n}</div>
                  <span style={{ fontSize:14, fontWeight:active?700:400, color:active?TEXT:TEXT3 }}>{s}</span>
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
              { title:"Commercial Invoice",   field:"invoice",      accept:".pdf,.xlsx,.xls,.csv", required:true  },
              { title:"Packing List",         field:"packingList",  accept:".pdf,.xlsx,.xls,.csv", required:false },
              { title:"Booking Confirmation", field:"booking",      accept:".pdf",                 required:false },
            ].map((doc) => {
              const file = uploadedFiles[doc.field];
              const hasFile = !!file;
              return (
                <label key={doc.field} htmlFor={`upload-${doc.field}`} style={{ cursor:"pointer" }}>
                  <input
                    id={`upload-${doc.field}`}
                    type="file"
                    accept={doc.accept}
                    style={{ display:"none" }}
                    onChange={handleFileSelect(doc.field)}
                  />
                  <Card style={{
                    padding:"24px 18px", textAlign:"center",
                    border:`2px dashed ${hasFile ? "#22C55E" : BORDER}`,
                    background: hasFile ? "#F0FDF4" : BG,
                    transition:"all 0.2s",
                  }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{hasFile ? "✅" : "📄"}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:TEXT, marginBottom:4 }}>
                      {doc.title} {doc.required && <span style={{ color:"#DC2626" }}>*</span>}
                    </div>
                    {hasFile ? (
                      <div style={{ fontSize:14, color:"#16A34A", fontWeight:600, marginBottom:8 }}>
                        {file.name}<br/>
                        <span style={{ fontWeight:400, color:TEXT3 }}>({(file.size/1024).toFixed(0)} KB)</span>
                      </div>
                    ) : (
                      <div style={{ fontSize:14, color:TEXT3, marginBottom:14 }}>
                        {doc.accept.replace(/\./g,"").toUpperCase().split(",").join(", ")} · Max 20 MB
                      </div>
                    )}
                    <div style={{
                      display:"inline-block", padding:"6px 16px", borderRadius:7,
                      border:`1px solid ${hasFile?"#22C55E":BORDER}`,
                      background:hasFile?"#DCFCE7":W,
                      fontSize:14, fontWeight:600, color:hasFile?"#16A34A":TEXT2,
                    }}>
                      {hasFile ? "Change file" : "Choose file"}
                    </div>
                  </Card>
                </label>
              );
            })}
          </div>

          {/* Privilege Flags */}
          {(() => {
            const FLAGS = [
              { key:"BOI",      label:"BOI",      desc:"คณะกรรมการส่งเสริมการลงทุน" },
              { key:"IEAT",     label:"กนอ.",      desc:"การนิคมอุตสาหกรรม (IEAT)" },
              { key:"FZ",       label:"FZ",        desc:"เขตปลอดอากร" },
              { key:"29BIS",    label:"29BIS",     desc:"มาตรา 29 ทวิ" },
              { key:"REEXPORT", label:"Re-Export", desc:"ส่งกลับออกไป" },
              { key:"REIMPORT", label:"Re-Import", desc:"นำกลับเข้ามา" },
            ];
            const toggle = (key) =>
              setPrivilegeFlags(prev =>
                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
              );
            return (
              <Card style={{ padding:"16px 18px", marginBottom:16, border:`1px solid ${privilegeFlags.length > 0 ? "#FCD34D" : BORDER}`, background: privilegeFlags.length > 0 ? "#FFFBEB" : BG }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:16 }}>🏷️</span>
                  <div style={{ fontSize:14, fontWeight:700, color:TEXT }}>สิทธิประโยชน์ (Privilege Flags)</div>
                  {privilegeFlags.length > 0 && (
                    <span style={{ marginLeft:"auto", fontSize:12, fontWeight:600, color:"#92400E", background:"#FEF3C7", border:"1px solid #FCD34D", borderRadius:20, padding:"2px 10px" }}>
                      เลือกแล้ว {privilegeFlags.length} รายการ
                    </span>
                  )}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {FLAGS.map(f => {
                    const active = privilegeFlags.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => toggle(f.key)}
                        style={{
                          display:"flex", flexDirection:"column", alignItems:"flex-start",
                          padding:"8px 14px", borderRadius:9, cursor:"pointer",
                          border:`1.5px solid ${active ? "#F59E0B" : BORDER}`,
                          background: active ? "#FEF3C7" : W,
                          transition:"all 0.15s",
                          minWidth:120,
                        }}
                      >
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                          <div style={{
                            width:14, height:14, borderRadius:4, flexShrink:0,
                            border:`1.5px solid ${active ? "#F59E0B" : BORDER}`,
                            background: active ? "#F59E0B" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                          }}>
                            {active && <span style={{ color:"#fff", fontSize:10, fontWeight:900, lineHeight:1 }}>✓</span>}
                          </div>
                          <span style={{ fontSize:13, fontWeight:700, color: active ? "#92400E" : TEXT }}>{f.label}</span>
                        </div>
                        <span style={{ fontSize:11, color: active ? "#B45309" : TEXT3, paddingLeft:20 }}>{f.desc}</span>
                      </button>
                    );
                  })}
                </div>
                {privilegeFlags.length === 0 && (
                  <div style={{ marginTop:10, fontSize:12, color:TEXT3 }}>คลิกเลือกสิทธิประโยชน์ที่ใช้กับ shipment นี้ (ถ้าไม่มีสิทธิ์ ข้ามได้)</div>
                )}
              </Card>
            );
          })()}

          <Card style={{ padding:"14px 18px", marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, color:TEXT, marginBottom:10 }}>AI extraction settings</div>
            <div style={{ display:"flex", gap:24 }}>
              {[
                { label:"AI Provider",    value:"Claude Opus 4.6 (Anthropic)" },
                { label:"Task",          value:"Export Declaration Prep" },
                { label:"HS Code match", value:"Auto — from invoice text" },
                { label:"Language",      value:"EN + TH auto-detect" },
              ].map((r,i) => (
                <div key={i}>
                  <div style={{ fontSize:13, color:TEXT3, fontWeight:600, marginBottom:2 }}>{r.label}</div>
                  <div style={{ fontSize:14, color:TEXT, fontWeight:500 }}>{r.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {extractErr && (
            <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:8, background:"#FEF2F2", border:"1px solid #FECACA", fontSize:14, color:"#DC2626" }}>
              {extractErr}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <Btn
              onClick={handleExtract}
              disabled={extracting || !uploadedFiles.invoice}
              style={{ opacity: (!uploadedFiles.invoice) ? 0.5 : 1, minWidth:180 }}
            >
              {extracting ? (
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ display:"inline-block", width:14, height:14, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                  กำลัง Extract…
                </span>
              ) : "Extract with AI →"}
            </Btn>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {step===2 && extracted && (
        <div>
          {/* AI status bar */}
          {(() => {
            const items = extracted.items || [];
            const matched = items.filter(it => it.hsCode).length;
            const missing = items.length - matched;
            const confColor = extracted.confidence === "high" ? "#15803D" : extracted.confidence === "medium" ? "#D97706" : "#DC2626";
            const confBg = extracted.confidence === "high" ? "#F0FDF4" : extracted.confidence === "medium" ? "#FFFBEB" : "#FEF2F2";
            const confBorder = extracted.confidence === "high" ? "#BBF7D0" : extracted.confidence === "medium" ? "#FDE68A" : "#FECACA";
            return (
              <div style={{ background:confBg, border:`1px solid ${confBorder}`, borderRadius:10, padding:"12px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:confColor }}/>
                <span style={{ fontSize:14, fontWeight:700, color:confColor }}>AI Extraction complete</span>
                <span style={{ fontSize:14, color:confColor }}>Claude Opus 4.6 · {items.length} items · {matched} HS matched{missing > 0 ? ` · ${missing} missing` : ""}</span>
                {missing > 0 && (
                  <div style={{ marginLeft:"auto", background:"#FEF3C7", border:"1px solid #FDE68A", borderRadius:20, padding:"2px 10px", fontSize:13, fontWeight:700, color:"#D97706" }}>
                    {missing} item{missing>1?"s":""} need HS code
                  </div>
                )}
              </div>
            );
          })()}

          {/* Header fields — editable, pre-filled from AI */}
          <Card style={{ padding:"16px 20px", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:12 }}>Shipment header <span style={{ fontSize:13, fontWeight:400, color:TEXT3 }}>— แก้ไขได้</span></div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {[
                { label:"Shipper",            key:"shipper",         val: extracted.shipper || "" },
                { label:"Consignee",          key:"consigneeNameEn", val: form.consigneeNameEn },
                { label:"Vessel",             key:"vesselName",      val: form.vesselName },
                { label:"Container No.",      key:"containerNo",     val: form.containerNo },
                { label:"Port of Loading",    key:"portOfLoading",   val: form.portOfLoading },
                { label:"Port of Discharge",  key:"portOfDischarge", val: form.portOfDischarge },
                { label:"ETD",                key:"etd",             val: form.etd },
                { label:"Currency",           key:"currency",        val: form.currency },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize:13, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase" }}>{f.label}</label>
                  <input
                    value={f.val}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width:"100%", background:"#FFFFFF", border:`1px solid ${BORDER}`, borderRadius:7, padding:"7px 10px", fontSize:14, color:TEXT, boxSizing:"border-box" }}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Items table — real AI data */}
          <Card style={{ marginBottom:14 }}>
            <SectionHeader title={`Extracted items (${(extracted.items||[]).length})`} sub="Review and fill missing HS codes" />
            <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["#","Description","Thai","HS Code","Qty","Unit","FOB","Status"].map(h=>(
                    <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(extracted.items||[]).map((item, i) => {
                  const hasHs = !!(item.hsCode);
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, background: hasHs ? W : "#FFFBEB" }}>
                      <td style={{ padding:"9px 14px", color:TEXT3 }}>{item.seqNo ?? i+1}</td>
                      <td style={{ padding:"9px 14px", fontWeight:500, color:TEXT, maxWidth:200 }}>{item.descriptionEn}</td>
                      <td style={{ padding:"9px 14px", color:TEXT2, fontSize:14, maxWidth:160 }}>{item.descriptionTh || "—"}</td>
                      <td style={{ padding:"9px 14px" }}>
                        {hasHs
                          ? <span style={{ fontFamily:MONO, fontSize:14, color:BLUE, fontWeight:600 }}>{item.hsCode}</span>
                          : <input
                              placeholder="กรอก HS code"
                              defaultValue=""
                              onChange={e => {
                                const val = e.target.value;
                                setExtracted(prev => ({
                                  ...prev,
                                  items: prev.items.map((it, idx) => idx === i ? { ...it, hsCode: val || null } : it),
                                }));
                              }}
                              style={{ border:`1px solid #FCD34D`, borderRadius:6, padding:"4px 8px", fontSize:14, width:110, background:"#FFFBEB" }}
                            />
                        }
                      </td>
                      <td style={{ padding:"9px 14px", fontFamily:MONO, color:TEXT2 }}>{item.quantity?.toLocaleString()}</td>
                      <td style={{ padding:"9px 14px", color:TEXT2 }}>{item.quantityUnit}</td>
                      <td style={{ padding:"9px 14px", color:TEXT2 }}>{item.fobForeign != null ? `${form.currency || "USD"} ${Number(item.fobForeign).toLocaleString(undefined,{minimumFractionDigits:2})}` : "—"}</td>
                      <td style={{ padding:"9px 14px" }}>
                        <span style={{
                          padding:"2px 8px", borderRadius:6, fontSize:13, fontWeight:700,
                          background: hasHs ? "#F0FDF4" : "#FEF3C7",
                          color: hasHs ? "#16A34A" : "#D97706",
                          border:`1px solid ${hasHs?"#BBF7D0":"#FDE68A"}`,
                        }}>{hasHs ? "✓ AI Match" : "Missing"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </Card>

          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
            <Btn onClick={() => setStep(3)}>Generate declaration →</Btn>
          </div>
        </div>
      )}

      {step===3 && (() => {
        const items = extracted?.items || [];
        const totalFobForeign = items.reduce((s, it) => s + (Number(it.fobForeign) || 0), 0);
        const exRate = Number(extracted?.exchangeRate) || 1;
        const totalFobThb = totalFobForeign * exRate;
        const cur = extracted?.currency || "USD";
        const hsMatchCount = items.filter(it=>it.hsCode).length;

        /* ─── box style helpers ─── */
        const boxWrap = (num, label, value, extra={}) => (
          <div style={{ border:"1px solid #CBD5E1", padding:"12px 16px", minHeight:64, boxSizing:"border-box", background:"#fff", ...extra }}>
            <div style={{ fontSize:15, color:"#64748B", lineHeight:1.4, marginBottom:5 }}>
              {num && <span style={{ fontWeight:800, color:"#1E3A5F", marginRight:5, fontSize:16 }}>{num}.</span>}{label}
            </div>
            <div style={{ fontSize:19, fontWeight:700, color:"#0F172A", whiteSpace:"pre-wrap", wordBreak:"break-word", lineHeight:1.4 }}>{value || <span style={{color:"#CBD5E1"}}>—</span>}</div>
          </div>
        );
        const thCell = (content, style={}) => (
          <th style={{ border:"1px solid #CBD5E1", padding:"12px 14px", fontSize:16, fontWeight:700, color:"#334155", background:"#F1F5F9", verticalAlign:"bottom", whiteSpace:"pre-wrap", lineHeight:1.4, ...style }}>{content}</th>
        );
        const tdCell = (content, style={}) => (
          <td style={{ border:"1px solid #E2E8F0", padding:"10px 14px", fontSize:17, verticalAlign:"top", color:"#1E293B", lineHeight:1.4, ...style }}>{content}</td>
        );

        return (
          <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>

            {/* ── LEFT: กศก.101/1 Document Preview ── */}
            <div style={{ flex:1, minWidth:0, background:"#fff", border:"1px solid #CBD5E1", borderRadius:12, overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>

              {/* Document Title Bar */}
              <div style={{ background:"linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)", color:"#fff", padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, letterSpacing:.3 }}>ใบขนสินค้าขาออก · กศก. 101/1</div>
                  <div style={{ fontSize:16, color:"#93C5FD", marginTop:4 }}>Thai Customs Export Declaration — PREVIEW</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:15, color:"#BFDBFE" }}>ตามประมวลฯ ข้อ ๓ ๐๑ ๐๑ ๐๔</div>
                  <div style={{ display:"inline-block", marginTop:6, background:"rgba(250,204,21,0.2)", border:"1px solid #FCD34D", borderRadius:8, padding:"6px 18px", fontSize:16, fontWeight:800, color:"#FCD34D", letterSpacing:.5 }}>DRAFT — ยังไม่ได้ยื่น</div>
                </div>
              </div>

              <div style={{ padding:"20px 24px" }}>

                {/* ── SECTION A: Header boxes 1–7 ── */}
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:0, marginBottom:0 }}>
                  {boxWrap(1, "ผู้ส่งออก (Exporter) / ชื่อ ที่อยู่ โทรศัพท์", extracted?.shipper, { gridRow:"span 2" })}
                  {boxWrap(2, "เลขประจำตัวผู้เสียภาษีอากร (TIN)", form.exporterTaxId || "")}
                  {boxWrap(4, "เลขที่ใบขนสินค้าฯ (Declaration No.)", "— (ออกโดยระบบ)")}
                  {boxWrap(3, "ประเภทใบขนฯ (Declaration Type)", "ไม่ใช้สิทธิประโยชน์")}
                  {boxWrap(5, "ชื่อและเลขที่บัตรผ่านพิธีการ", form.agentName || "")}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr", gap:0 }}>
                  {boxWrap(7, "ตัวแทนออกของ (Customs Broker)", form.brokerTaxId || "")}
                  {boxWrap("", "ผู้รับของ (Consignee)", extracted?.consignee)}
                  {boxWrap(6, "สั่งการตรวจ", "— (ระบบ)")}
                </div>

                {/* ── SECTION B: Transport & financial boxes 8–18 ── */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:0, marginTop:0 }}>
                  {boxWrap(8, "อากรขาออก (บาท)", "0.00")}
                  {boxWrap(9, "เงินประกัน (บาท)", "0.00")}
                  {boxWrap(10, "ชื่อยานพาหนะ", extracted?.vessel || form.vesselName)}
                  {boxWrap(11, "ส่งออกโดยทาง", "เรือ (Sea)")}
                  {boxWrap(12, "วันที่ส่งออก (ETD)", extracted?.etd || form.etd)}
                  {boxWrap(13, "เลขที่ชำระภาษี/ประกัน", "—")}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr", gap:0 }}>
                  {boxWrap(14, "ท่าบรรทุก (Port of Loading)", extracted?.portOfLoading || form.portOfLoading)}
                  {boxWrap(15, "ประเทศที่ขาย (Sold to)", form.soldToCountryCode || "")}
                  {boxWrap(16, "ประเทศปลายทาง (Destination)", extracted?.portOfDischarge || form.portOfDischarge)}
                  {boxWrap(17, "จำนวนหีบห่อ (Packages)", String(items.length))}
                  {boxWrap(18, "อัตราแลกเปลี่ยน", `1 ${cur} = ${exRate} THB`)}
                  {boxWrap("", "Incoterms", "FOB")}
                </div>

                {/* ── SECTION C: Goods Item Table ── */}
                <div style={{ marginTop:16, fontSize:18, fontWeight:700, color:"#1E3A5F", padding:"12px 18px", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:"10px 10px 0 0", display:"flex", alignItems:"center", gap:10 }}>
                  <span>รายละเอียดสินค้า (Goods Items)</span>
                  <span style={{ background:"#2563EB", color:"#fff", borderRadius:14, padding:"4px 14px", fontSize:16, fontWeight:700 }}>{items.length} รายการ</span>
                </div>
                <div style={{ overflowX:"auto", borderRadius:"0 0 10px 10px", border:"1px solid #CBD5E1", borderTop:"none" }}>
                  <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr>
                        {thCell("#", { width:44, textAlign:"center" })}
                        {thCell("Description\nชนิดของ", { minWidth:170 })}
                        {thCell("ชื่อไทย", { minWidth:120 })}
                        {thCell("HS Code\nพิกัดศุลกากร", { width:110 })}
                        {thCell("น้ำหนัก\n(kg)", { width:85, textAlign:"right" })}
                        {thCell("ปริมาณ\nQTY", { width:90, textAlign:"right" })}
                        {thCell("หน่วย", { width:60, textAlign:"center" })}
                        {thCell(`FOB\n${cur}`, { width:115, textAlign:"right" })}
                        {thCell("FOB\n(บาท)", { width:125, textAlign:"right" })}
                        {thCell("อัตรา\nอากร", { width:65, textAlign:"center" })}
                        {thCell("อากร\nขาออก", { width:85, textAlign:"right" })}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => {
                        const fobThb = (Number(it.fobForeign)||0) * exRate;
                        return (
                          <tr key={idx} onMouseEnter={e=>e.currentTarget.style.background="#F0F9FF"} onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?"#fff":"#F8FAFC"} style={{ background: idx%2===0 ? "#fff" : "#F8FAFC", transition:"background .15s" }}>
                            {tdCell(it.seqNo, { textAlign:"center", fontWeight:800, color:"#1E3A5F", fontSize:18 })}
                            {tdCell(it.descriptionEn, { fontWeight:600 })}
                            {tdCell(it.descriptionTh || "—", { color: it.descriptionTh ? "#1E293B" : "#CBD5E1" })}
                            {tdCell(
                              it.hsCode
                                ? <span style={{ color:"#2563EB", fontWeight:700, fontSize:17 }}>{it.hsCode}</span>
                                : <span style={{ color:"#EF4444", fontStyle:"italic", fontSize:16 }}>ไม่พบ</span>
                            )}
                            {tdCell(it.netWeightKg || "—", { textAlign:"right", color: it.netWeightKg ? "#1E293B" : "#CBD5E1" })}
                            {tdCell((it.quantity||"").toLocaleString(), { textAlign:"right", fontWeight:700 })}
                            {tdCell(it.quantityUnit, { textAlign:"center", fontSize:16, color:"#64748B" })}
                            {tdCell((Number(it.fobForeign)||0).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}), { textAlign:"right", fontWeight:700 })}
                            {tdCell(fobThb.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}), { textAlign:"right", fontWeight:700 })}
                            {tdCell("0%", { textAlign:"center", color:"#94A3B8" })}
                            {tdCell("0.00", { textAlign:"right", color:"#94A3B8" })}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:"#EFF6FF" }}>
                        <td colSpan={7} style={{ border:"1px solid #CBD5E1", padding:"14px 18px", textAlign:"right", fontSize:18, fontWeight:800, color:"#1E3A5F" }}>
                          รวม / Total ({items.length} รายการ)
                        </td>
                        <td style={{ border:"1px solid #CBD5E1", padding:"14px 18px", textAlign:"right", fontSize:19, fontWeight:800, color:"#2563EB" }}>
                          {totalFobForeign.toLocaleString("en",{minimumFractionDigits:2})}
                        </td>
                        <td style={{ border:"1px solid #CBD5E1", padding:"14px 18px", textAlign:"right", fontSize:19, fontWeight:800, color:"#2563EB" }}>
                          {totalFobThb.toLocaleString("en",{minimumFractionDigits:2})}
                        </td>
                        <td colSpan={2} style={{ border:"1px solid #CBD5E1", padding:"14px 18px" }}></td>
                      </tr>
                    </tfoot>
                  </table></div>
                </div>

                {/* ── SECTION D: Summary Box 35-36 & Declaration ── */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, marginTop:0 }}>
                  {boxWrap(35, "รวม FOB (บาท) / Total FOB THB",
                    <span style={{ fontSize:22, color:"#2563EB", fontWeight:800 }}>{"฿ " + totalFobThb.toLocaleString("en",{minimumFractionDigits:2})}</span>)}
                  {boxWrap(36, "รวมค่าภาษีอากรทั้งสิ้น / Total Duties (บาท)",
                    <span style={{ fontSize:22, fontWeight:800 }}>฿ 0.00</span>)}
                  <div style={{ border:"1px solid #CBD5E1", padding:"14px 18px", fontSize:16, color:"#475569", lineHeight:1.7, background:"#fff" }}>
                    <div style={{ fontWeight:800, marginBottom:6, color:"#334155", fontSize:17 }}>37. คำรับรอง / Declaration</div>
                    <div>ข้าพเจ้าขอรับรองว่ารายการที่แสดงข้างต้นนี้เป็นความจริงทุกประการ</div>
                    <div style={{ marginTop:12, borderTop:"1px dashed #CBD5E1", paddingTop:10 }}>
                      ลายมือชื่อ _______________________ (ผู้ส่งออก/ผู้รับมอบ)
                    </div>
                    <div style={{ marginTop:6, fontSize:16, color:"#64748B" }}>38. วันที่ยื่น: {new Date().toLocaleDateString("th-TH",{year:"numeric",month:"long",day:"numeric"})}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Submission Panel ── */}
            <div style={{ width:340, flexShrink:0, display:"flex", flexDirection:"column", gap:16 }}>

              {/* Summary card */}
              <div style={{ background:"linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", border:"1px solid #86EFAC", borderRadius:14, padding:"22px 24px", boxShadow:"0 2px 8px rgba(34,197,94,0.1)" }}>
                <div style={{ fontSize:20, fontWeight:800, color:"#15803D", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:99, background:"#22C55E", color:"#fff", fontSize:19 }}>✓</span>
                  พร้อมยื่น
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    ["จำนวนรายการ", `${items.length} รายการ`],
                    ["HS Code match", `${hsMatchCount}/${items.length} รายการ`],
                    ["สกุลเงิน", cur],
                    ["อัตราแลกเปลี่ยน", `${exRate} THB/${cur}`],
                    ["Total FOB " + cur, totalFobForeign.toLocaleString("en",{minimumFractionDigits:2})],
                    ["Total FOB (บาท)", "฿ " + totalFobThb.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2})],
                  ].map(([l,v],i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:17, lineHeight:1.5 }}>
                      <span style={{ color:"#4B5563" }}>{l}</span>
                      <span style={{ fontWeight:700, color:"#111827" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission method */}
              <Card>
                <div style={{ padding:"18px 20px 8px", fontSize:19, fontWeight:800, color:TEXT }}>วิธียื่น (Submission)</div>
                <div style={{ padding:"8px 18px 18px", display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { id:"nsw",     icon:"🌐", title:"NSW Thailand", desc:"National Single Window", color:BLUE },
                    { id:"customs", icon:"🤖", title:"Playwright Automation", desc:"กรมศุลกากร portal", color:"#7C3AED" },
                    { id:"csv",     icon:"📥", title:"Export CSV", desc:"Netbay manual upload", color:"#16A34A" },
                  ].map(opt=>(
                    <button key={opt.id} onClick={()=>setSubmitMethod(opt.id)} style={{
                      display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                      borderRadius:12, cursor:"pointer", textAlign:"left", width:"100%",
                      background:submitMethod===opt.id?`${opt.color}0D`:"#fff",
                      border:`${submitMethod===opt.id?2:1}px solid ${submitMethod===opt.id?opt.color:BORDER}`,
                      transition:"all .15s",
                    }}>
                      <span style={{ fontSize:26 }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontSize:18, fontWeight:700, color:TEXT }}>{opt.title}</div>
                        <div style={{ fontSize:15, color:TEXT3, marginTop:2 }}>{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {submitErr && (
                <div style={{ padding:"14px 18px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12, fontSize:17, color:"#DC2626" }}>{submitErr}</div>
              )}

              <Btn variant="secondary" onClick={()=>setStep(2)} style={{ width:"100%", textAlign:"center", padding:"14px", fontSize:18 }}>← แก้ไข</Btn>
              <button onClick={handleCreateJob} disabled={submitting} style={{
                width:"100%", background:submitting?"#94A3B8":"linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color:"#fff", border:"none",
                borderRadius:12, padding:"16px", fontSize:19, fontWeight:800, cursor:submitting?"not-allowed":"pointer",
                boxShadow: submitting ? "none" : "0 4px 16px rgba(37,99,235,0.3)", transition:"all .15s",
              }}>{submitting ? "กำลังสร้าง job…" : "สร้าง Job & ยื่น NSW →"}</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default NewShipment;
