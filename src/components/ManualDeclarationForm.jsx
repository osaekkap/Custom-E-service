import { useState, useMemo, useCallback, useEffect } from "react";
import {
  COUNTRIES, CURRENCIES, UNITS, PORTS, TRANSPORT_MODES,
  PACKAGE_TYPES, CUSTOMS_PORTS, CARGO_TYPES, INCOTERMS,
  NATURE_OF_TRANSACTION, PRIVILEGE_TYPES,
} from "../data/masterCodes.js";
import { jobsApi } from "../api/jobsApi.js";
import { declarationsApi } from "../api/declarationsApi.js";
import { masterApi } from "../api/masterApi.js";
import { HsCodeAutocomplete } from "./ui/index.jsx";

// ─── Design tokens (same as factory-portal) ─────────────────────
const W      = "var(--bg-card)";
const BG     = "var(--bg-main)";
const BORDER = "var(--border-main)";
const BORDER2= "var(--border-light)";
const TEXT   = "var(--text-main)";
const TEXT2  = "var(--text-muted)";
const TEXT3  = "var(--text-light)";
const BLUE   = "var(--primary)";

// ─── Shared UI ──────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:8, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", ...style }}>{children}</div>;
}
function Btn({ children, variant="primary", onClick, style={}, disabled }) {
  const base = { border:"none", borderRadius:8, padding:"8px 16px", fontSize:14, fontWeight:600, cursor: disabled?"not-allowed":"pointer", transition:"all 0.15s", opacity: disabled?0.5:1, ...style };
  const styles = {
    primary:   { background:BLUE, color:"#fff" },
    secondary: { background:"none", color:TEXT2, border:`1px solid ${BORDER}` },
    ghost:     { background:"none", color:BLUE },
    danger:    { background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA" },
  };
  return <button onClick={disabled?undefined:onClick} style={{ ...base, ...styles[variant] }}>{children}</button>;
}

// ─── Field helpers ──────────────────────────────────────────────
const inputStyle = { width:"100%", background:"#fff", border:`1px solid ${BORDER}`, borderRadius:7, padding:"7px 10px", fontSize:14, color:TEXT, boxSizing:"border-box" };
const selectStyle = { ...inputStyle, appearance:"auto" };
const labelStyle = { fontSize:13, fontWeight:600, color:TEXT2, marginBottom:3, display:"block" };
const reqMark = <span style={{ color:"#DC2626", marginLeft:2 }}>*</span>;

function Field({ label, required, children, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={labelStyle}>{label}{required && reqMark}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, maxLength, readOnly }) {
  return <input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} readOnly={readOnly} style={{ ...inputStyle, background: readOnly?"#F3F4F6":"#fff" }} />;
}

function NumberInput({ value, onChange, placeholder, step="any", min }) {
  return <input type="number" value={value??""}  onChange={e=>onChange(e.target.value===""?null:Number(e.target.value))} placeholder={placeholder} step={step} min={min} style={inputStyle} />;
}

function SelectInput({ value, onChange, options, placeholder, showCode }) {
  return (
    <select value={value||""} onChange={e=>onChange(e.target.value)} style={selectStyle}>
      <option value="">{placeholder || "— เลือก —"}</option>
      {options.map(o => (
        <option key={o.code} value={o.code}>
          {showCode ? `${o.code} — ` : ""}{o.nameTh || o.name}
        </option>
      ))}
    </select>
  );
}

function DateInput({ value, onChange }) {
  return <input type="date" value={value||""} onChange={e=>onChange(e.target.value)} style={inputStyle} />;
}

// ─── Section header ─────────────────────────────────────────────
function SectionTitle({ number, title, icon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 20px", borderBottom:`1px solid ${BORDER2}` }}>
      <div style={{ width:28, height:28, borderRadius:"50%", background:BLUE, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{number}</div>
      <div style={{ fontSize:15, fontWeight:700, color:TEXT }}>{icon} {title}</div>
    </div>
  );
}

// ─── Empty line item ────────────────────────────────────────────
function emptyItem(seqNo) {
  return {
    seqNo,
    productCode: "", hsCode: "", descriptionEn: "", descriptionTh: "", brandName: "",
    originCountry: "", quantity: null, quantityUnit: "C62", netWeightKg: null,
    fobForeign: null, fobCurrency: "USD", statisticsCode: "", dutyRate: null,
    privilegeCode: "", privilegeFlags: [], natureOfTransaction: "1",
    packageQty: null, packageType: "CT",
    // privilege doc fields
    licenseNumber: "", licenseExpiry: "", privilegeFiles: [],
  };
}

// ═══════════════════════════════════════════════════════════════
// PDF PREVIEW — กศก.101/1 layout (client-side)
// ═══════════════════════════════════════════════════════════════
function DeclarationPdfPreview({ doc, exporter, agent, invoice, shipment, items, totals }) {
  const cellStyle = { border:"1px solid #000", padding:"4px 6px", fontSize:11, verticalAlign:"top" };
  const headerCell = { ...cellStyle, background:"#F3F4F6", fontWeight:700, textAlign:"center", fontSize:10 };
  const portName = (code) => CUSTOMS_PORTS.find(p => p.code === code)?.nameTh || code;
  const countryName = (code) => COUNTRIES.find(c => c.code === code)?.nameTh || code;
  const currName = (code) => CURRENCIES.find(c => c.code === code)?.name || code;

  return (
    <div style={{ background:"#fff", border:"1px solid #999", padding:28, fontFamily:"'Sarabun','TH Sarabun New',sans-serif", fontSize:12, lineHeight:1.4, maxWidth:800, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:12 }}>
        <div style={{ fontSize:16, fontWeight:700 }}>ใบขนสินค้าขาออก</div>
        <div style={{ fontSize:13 }}>EXPORT ENTRY (กศก.101/1)</div>
        <div style={{ fontSize:11, color:"#666", marginTop:4 }}>CustomsExportDeclaration v4.00</div>
      </div>

      {/* Section A: Document + Exporter */}
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:8 }}>
        <tbody>
          <tr>
            <td style={headerCell} colSpan={4}>ส่วนที่ 1 — Document Control / ข้อมูลเอกสาร</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, width:"25%" }}><b>ด่านศุลกากร:</b><br/>{portName(doc.releasePort)}</td>
            <td style={{ ...cellStyle, width:"25%" }}><b>ท่าเรือรับสินค้า:</b><br/>{portName(doc.loadingPort)}</td>
            <td style={{ ...cellStyle, width:"25%" }}><b>ประเทศปลายทาง:</b><br/>{countryName(doc.destinationCountry)}</td>
            <td style={{ ...cellStyle, width:"25%" }}><b>สกุลเงิน:</b><br/>{currName(doc.currency)} (อัตรา: {doc.exchangeRate || "-"})</td>
          </tr>
          <tr>
            <td style={cellStyle}><b>วิธีขนส่ง:</b><br/>{TRANSPORT_MODES.find(t=>t.code===doc.transportMode)?.nameTh || doc.transportMode}</td>
            <td style={cellStyle}><b>ชื่อยานพาหนะ:</b><br/>{doc.vesselName || "-"}</td>
            <td style={cellStyle}><b>วันเรือออก:</b><br/>{doc.departureDate || "-"}</td>
            <td style={cellStyle}><b>B/L:</b><br/>M: {doc.masterBl || "-"} / H: {doc.houseBl || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Section B: Exporter + Agent */}
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:8 }}>
        <tbody>
          <tr>
            <td style={headerCell} colSpan={4}>ส่วนที่ 2 — Exporter & Agent / ผู้ส่งออก & ตัวแทน</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, width:"25%" }}><b>เลขผู้เสียภาษี:</b><br/>{exporter.taxId || "-"}</td>
            <td style={{ ...cellStyle, width:"25%" }}><b>สาขา:</b><br/>{exporter.branch || "00000"}</td>
            <td style={{ ...cellStyle, width:"50%" }} colSpan={2}><b>ชื่อผู้ส่งออก:</b><br/>{exporter.nameTh || "-"} ({exporter.nameEn || "-"})</td>
          </tr>
          <tr>
            <td style={cellStyle} colSpan={2}><b>ที่อยู่:</b><br/>{exporter.address || "-"}</td>
            <td style={cellStyle}><b>บัตรผ่านพิธีการ:</b><br/>{agent.cardNo || "-"}</td>
            <td style={cellStyle}><b>ชื่อผู้ผ่านพิธีการ:</b><br/>{agent.agentName || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Section C: Invoice */}
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:8 }}>
        <tbody>
          <tr>
            <td style={headerCell} colSpan={4}>ส่วนที่ 3 — Invoice & Consignee / ใบกำกับสินค้า</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, width:"25%" }}><b>เลขที่ Invoice:</b><br/>{invoice.invoiceNo || "-"}</td>
            <td style={{ ...cellStyle, width:"25%" }}><b>วันที่:</b><br/>{invoice.invoiceDate || "-"}</td>
            <td style={{ ...cellStyle, width:"25%" }}><b>Incoterms:</b><br/>{invoice.incoterms || "-"}</td>
            <td style={{ ...cellStyle, width:"25%" }}><b>ผู้ซื้อ:</b><br/>{invoice.consigneeName || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Section D: Shipment Summary */}
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:8 }}>
        <tbody>
          <tr>
            <td style={headerCell} colSpan={4}>ส่วนที่ 4 — Shipment Summary / สรุปการจัดส่ง</td>
          </tr>
          <tr>
            <td style={cellStyle}><b>Shipping Marks:</b><br/>{shipment.shippingMarks || "N/M"}</td>
            <td style={cellStyle}><b>จำนวนหีบห่อ:</b><br/>{shipment.totalPackages ?? totals.totalPkgs} {shipment.packageUnit}</td>
            <td style={cellStyle}><b>น้ำหนักสุทธิ:</b><br/>{totals.totalNetKg} KGM</td>
            <td style={cellStyle}><b>FOB รวม:</b><br/>{doc.currency} {totals.totalFob.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Section E: Line Items */}
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr>
            <td style={headerCell} colSpan={8}>ส่วนที่ 5 — Line Items / รายการสินค้า ({items.length} รายการ)</td>
          </tr>
          <tr>
            <th style={{ ...headerCell, width:30 }}>ลำดับ</th>
            <th style={{ ...headerCell, width:80 }}>HS Code</th>
            <th style={headerCell}>รายละเอียดสินค้า</th>
            <th style={{ ...headerCell, width:60 }}>จำนวน</th>
            <th style={{ ...headerCell, width:45 }}>หน่วย</th>
            <th style={{ ...headerCell, width:65 }}>น.น.สุทธิ</th>
            <th style={{ ...headerCell, width:80 }}>FOB</th>
            <th style={{ ...headerCell, width:50 }}>สิทธิ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td style={{ ...cellStyle, textAlign:"center" }}>{it.seqNo}</td>
              <td style={{ ...cellStyle, fontFamily:"monospace", fontSize:10 }}>{it.hsCode}</td>
              <td style={cellStyle}>{it.descriptionEn}{it.brandName ? ` [${it.brandName}]` : ""}</td>
              <td style={{ ...cellStyle, textAlign:"right" }}>{it.quantity ?? "-"}</td>
              <td style={{ ...cellStyle, textAlign:"center" }}>{it.quantityUnit}</td>
              <td style={{ ...cellStyle, textAlign:"right" }}>{it.netWeightKg ?? "-"}</td>
              <td style={{ ...cellStyle, textAlign:"right" }}>{it.fobForeign?.toLocaleString() ?? "-"}</td>
              <td style={{ ...cellStyle, textAlign:"center", fontSize:9 }}>{it.privilegeFlags?.join(",") || "-"}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ ...cellStyle, fontWeight:700, textAlign:"right" }}>รวม</td>
            <td style={{ ...cellStyle, textAlign:"right", fontWeight:700 }}></td>
            <td style={cellStyle}></td>
            <td style={{ ...cellStyle, textAlign:"right", fontWeight:700 }}>{totals.totalNetKg}</td>
            <td style={{ ...cellStyle, textAlign:"right", fontWeight:700 }}>{totals.totalFob.toLocaleString()}</td>
            <td style={cellStyle}></td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop:16, display:"flex", justifyContent:"space-between", fontSize:11, color:"#666" }}>
        <div>ลงชื่อ ________________________ ผู้ส่งออก</div>
        <div>ลงชื่อ ________________________ ผู้ผ่านพิธีการ</div>
      </div>
      <div style={{ marginTop:8, textAlign:"center", fontSize:10, color:"#999" }}>
        * เอกสารนี้เป็น Preview เท่านั้น — ยังไม่ได้ส่งเข้าระบบ NSW *
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ManualDeclarationForm({ onBack, onSubmit, onCreated, hsMaster = [] }) {
  const [activeSection, setActiveSection] = useState(1);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedDeclarationId, setSavedDeclarationId] = useState(null);
  const [savedJobId, setSavedJobId] = useState(null);
  const [xmlPreview, setXmlPreview] = useState(null);
  const [showXml, setShowXml] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [exportersMaster, setExportersMaster] = useState([]);
  const [brokersMaster, setBrokersMaster] = useState([]);

  useEffect(() => {
    masterApi.listExporters().then(data => setExportersMaster(data || [])).catch(err => console.error("Failed to load exporters", err));
    masterApi.listBrokers().then(data => setBrokersMaster(Array.isArray(data) ? data : (data?.data ?? []))).catch(err => console.error("Failed to load brokers", err));
  }, []);

  // ─── Section 1: Document Control ───────────────────────────
  const [doc, setDoc] = useState({
    declarationType: "WITH_PRIVILEGE",
    invoiceRef: "",
    releasePort: "0200",       // default Laem Chabang
    loadingPort: "",
    purchaseCountry: "",
    destinationCountry: "",
    currency: "USD",
    exchangeRate: null,
    transportMode: "1",        // Sea
    cargoType: "2",            // Container
    vesselName: "",
    departureDate: "",
    masterBl: "",
    houseBl: "",
  });

  // ─── Section 2: Exporter & Agent ───────────────────────────
  const [exporter, setExporter] = useState({
    taxId: "", branch: "00000", nameTh: "", nameEn: "", address: "",
  });
  const [agent, setAgent] = useState({
    brokerName: "", brokerTaxId: "", agentBranch: "00000",
    cardNo: "", agentName: "", managerIdCard: "", managerName: "",
  });

  const handleSelectMasterExporter = (exporterId) => {
    if (!exporterId) return;
    const found = exportersMaster.find(e => e.id === exporterId);
    if (!found) return;
    setExporter(prev => ({
      ...prev,
      taxId: found.taxId || "",
      branch: found.branch || "00000",
      nameTh: found.nameTh || "",
      nameEn: found.nameEn || "",
      address: found.address || "",
    }));
    setAgent(prev => ({
      ...prev,
      agentName: found.agentName || prev.agentName,
      cardNo: found.agentCardNo || prev.cardNo,
      brokerName: found.brokerName || prev.brokerName,
      brokerTaxId: found.brokerTaxId || prev.brokerTaxId,
      agentBranch: found.brokerBranch || prev.agentBranch,
      managerIdCard: found.agentCardNo || prev.managerIdCard,
      managerName: found.agentName || prev.managerName,
    }));
  };

  const handleSelectMasterBroker = (brokerId) => {
    if (!brokerId) return;
    const found = brokersMaster.find(b => b.id === brokerId);
    if (!found) return;
    setAgent(prev => ({
      ...prev,
      brokerName: found.nameTh || prev.brokerName,
      brokerTaxId: found.taxId || prev.brokerTaxId,
      agentBranch: found.branch || prev.agentBranch,
      agentName: found.agentName || prev.agentName,
      cardNo: found.agentCardNo || prev.cardNo,
      managerIdCard: found.agentCardNo || prev.managerIdCard,
      managerName: found.agentName || prev.managerName,
    }));
  };

  // ─── Section 3: Invoice & Consignee ────────────────────────
  const [invoice, setInvoice] = useState({
    invoiceNo: "", invoiceDate: "", poNumber: "", incoterms: "FOB",
    consigneeName: "", consigneeAddress: "", consigneeCountry: "",
    freightAmount: null, insuranceAmount: null,
  });

  // ─── Section 4: Shipment Summary ──────────────────────────
  const [shipment, setShipment] = useState({
    shippingMarks: "",
    totalPackages: null,
    packageUnit: "CT",
    netWeightUnit: "KGM",
    grossWeightUnit: "KGM",
    paymentMethod: "",
    guaranteeMethod: "",
  });

  // ─── Section 5: Line Items ────────────────────────────────
  const [items, setItems] = useState([emptyItem(1)]);

  // ─── Auto-calculations ────────────────────────────────────
  const totals = useMemo(() => {
    let totalFob = 0, totalNetKg = 0, totalPkgs = 0;
    items.forEach(it => {
      totalFob += (it.fobForeign || 0);
      totalNetKg += (it.netWeightKg || 0);
      totalPkgs += (it.packageQty || 0);
    });
    return { totalFob: Math.round(totalFob * 100) / 100, totalNetKg: Math.round(totalNetKg * 1000) / 1000, totalPkgs };
  }, [items]);

  // ─── Item handlers ────────────────────────────────────────
  const updateItem = useCallback((idx, field, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }, []);

  const addItem = () => setItems(prev => [...prev, emptyItem(prev.length + 1)]);

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, seqNo: i + 1 })));
  };

  const togglePrivilege = (idx, code) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const flags = it.privilegeFlags.includes(code)
        ? it.privilegeFlags.filter(f => f !== code)
        : [...it.privilegeFlags, code];
      return { ...it, privilegeFlags: flags };
    }));
  };

  // ─── HS Code selection handler ────────────────────────────
  const handleHsSelect = (idx, hsCode) => {
    const found = hsMaster.find(h => h.code === hsCode);
    if (found) {
      setItems(prev => prev.map((it, i) => i === idx ? {
        ...it,
        hsCode,
        descriptionEn: found.desc || it.descriptionEn,
        descriptionTh: found.thDesc || it.descriptionTh,
        quantityUnit: found.unit || it.quantityUnit,
        dutyRate: parseFloat(found.dutyRate) || 0,
        statisticsCode: found.statsCode || it.statisticsCode,
      } : it));
    } else {
      updateItem(idx, "hsCode", hsCode);
    }
  };

  // ─── File upload for privilege ────────────────────────────
  const handlePrivilegeFile = (idx, e) => {
    const files = Array.from(e.target.files || []);
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, privilegeFiles: [...it.privilegeFiles, ...files] } : it));
  };

  const removePrivilegeFile = (idx, fileIdx) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, privilegeFiles: it.privilegeFiles.filter((_, fi) => fi !== fileIdx) } : it));
  };

  // ─── Validation ───────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!doc.releasePort) errs.releasePort = "กรุณาเลือกด่านศุลกากร";
    if (!doc.currency) errs.currency = "กรุณาเลือกสกุลเงิน";
    if (!exporter.taxId) errs.exporterTaxId = "กรุณาระบุเลขผู้เสียภาษี";
    if (items.length === 0) errs.items = "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ";
    items.forEach((it, i) => {
      if (!it.hsCode) errs[`item_${i}_hs`] = `รายการที่ ${i+1}: กรุณาระบุ HS Code`;
      if (!it.descriptionEn) errs[`item_${i}_desc`] = `รายการที่ ${i+1}: กรุณาระบุรายละเอียดสินค้า`;
      if (!it.quantity) errs[`item_${i}_qty`] = `รายการที่ ${i+1}: กรุณาระบุจำนวน`;
      // privilege validation
      it.privilegeFlags.forEach(flag => {
        if (it.privilegeFiles.length === 0) {
          errs[`item_${i}_priv_${flag}`] = `รายการที่ ${i+1}: สิทธิ ${flag} ต้องแนบเอกสารอย่างน้อย 1 ไฟล์`;
        }
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Map form data → API DTOs ────────────────────────────
  const buildDeclarationDto = () => ({
    declarationType: doc.declarationType === "WITH_PRIVILEGE" ? "EXPORT_WITH_PRIVILEGE" : "EXPORT",
    invoiceRef: invoice.invoiceNo || undefined,
    exporterTaxId: exporter.taxId || undefined,
    exporterBranch: exporter.branch || "0",
    exporterNameTh: exporter.nameTh || undefined,
    exporterNameEn: exporter.nameEn || undefined,
    exporterAddress: exporter.address || undefined,
    brokerName: agent.brokerName || undefined,
    brokerTaxId: agent.brokerTaxId || undefined,
    agentBranch: agent.agentBranch || "0",
    agentCardNo: agent.cardNo || undefined,
    agentName: agent.agentName || undefined,
    managerIdCard: agent.managerIdCard || undefined,
    managerName: agent.managerName || undefined,
    transportMode: ({ "1":"SEA","3":"LAND","4":"AIR","5":"POST" })[doc.transportMode] || "SEA",
    cargoTypeCode: doc.cargoType || undefined,
    vesselName: doc.vesselName || undefined,
    departureDate: doc.departureDate || undefined,
    portOfReleaseCode: doc.releasePort || undefined,
    portOfLoadingCode: doc.loadingPort || undefined,
    soldToCountryCode: doc.purchaseCountry || undefined,
    destinationCode: doc.destinationCountry || undefined,
    masterBl: doc.masterBl || undefined,
    houseBl: doc.houseBl || undefined,
    totalPackages: shipment.totalPackages ?? (totals.totalPkgs || undefined),
    shippingMarks: shipment.shippingMarks || undefined,
    packageUnitCode: shipment.packageUnit || "CT",
    totalNetWeight: totals.totalNetKg || undefined,
    netWeightUnit: shipment.netWeightUnit || "KGM",
    totalGrossWeight: undefined,
    grossWeightUnit: shipment.grossWeightUnit || "KGM",
    totalFobForeign: totals.totalFob || undefined,
    exchangeRate: doc.exchangeRate || undefined,
    exchangeCurrency: doc.currency || "USD",
    paymentMethod: shipment.paymentMethod || "D",
    guaranteeMethod: shipment.guaranteeMethod || "A",
  });

  const buildItemDto = (it) => ({
    seqNo: it.seqNo,
    descriptionEn: it.descriptionEn,
    descriptionTh: it.descriptionTh || undefined,
    brandName: it.brandName || undefined,
    netWeightKg: it.netWeightKg || undefined,
    quantity: it.quantity,
    quantityUnit: it.quantityUnit || "C62",
    hsCode: it.hsCode,
    statisticsCode: it.statisticsCode || undefined,
    fobForeign: it.fobForeign || 0,
    fobCurrency: doc.currency || "USD",
    privilegeCode: it.privilegeFlags?.length > 0 ? it.privilegeFlags[0] : undefined,
    dutyRate: it.dutyRate || 0,
    packageMark: it.packageMark || undefined,
    packageQty: it.packageQty || undefined,
    packageType: it.packageType || undefined,
    exportLicenseNo: it.licenseNumber || undefined,
    exportLicenseExpiry: it.licenseExpiry || undefined,
    sourceInvoiceNo: invoice.invoiceNo || undefined,
    sourceProductCode: it.productCode || undefined,
  });

  // ─── Submit: Create Job → Declaration → Items ───────────
  const handleSubmit = async () => {
    if (!validate()) {
      setActiveSection(1);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      // 1. Create Job
      const job = await jobsApi.create({
        jobType: "EXPORT",
        transportMode: ({ "1":"SEA","3":"LAND","4":"AIR","5":"POST" })[doc.transportMode] || "SEA",
        vesselName: doc.vesselName || undefined,
        portOfLoadingCode: doc.loadingPort || undefined,
        portOfReleaseCode: doc.releasePort || undefined,
        currency: doc.currency || "USD",
      });

      // 2. Create Declaration
      const declDto = buildDeclarationDto();
      const decl = await declarationsApi.create(job.id, declDto);

      // 3. Add Items (sequential to preserve seqNo order)
      for (const it of items) {
        await declarationsApi.addItem(decl.id, buildItemDto(it));
      }

      setSavedDeclarationId(decl.id);
      setSavedJobId(job.id);

      // Callback
      if (onSubmit) onSubmit({ doc, exporter, agent, invoice, shipment, items, totals, jobId: job.id, declarationId: decl.id });
      if (onCreated) onCreated(job.id);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError(err?.response?.data?.message || err.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ─── Load XML preview ──────────────────────────────────
  const handleXmlPreview = async () => {
    if (!savedDeclarationId) return;
    try {
      const { xml } = await declarationsApi.getXmlPreview(savedDeclarationId);
      setXmlPreview(xml);
      setShowXml(true);
    } catch (err) {
      alert("โหลด XML ไม่สำเร็จ: " + (err?.response?.data?.message || err.message));
    }
  };

  // ─── Section nav ──────────────────────────────────────────
  const sections = [
    { n:1, title:"Exporter & Agent", icon:"🏢" },
    { n:2, title:"Document Control", icon:"📋" },
    { n:3, title:"Invoice & Consignee", icon:"📄" },
    { n:4, title:"Shipment Summary", icon:"📦" },
    { n:5, title:"Line Items", icon:"📝" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <Btn variant="secondary" onClick={onBack}>← กลับ</Btn>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>กรอกใบขนสินค้าขาออก</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Manual export declaration entry · กศก.101/1</p>
        </div>
      </div>

      {/* Section tabs */}
      <Card style={{ marginBottom:18, padding:"10px 16px" }}>
        <div style={{ display:"flex", gap:4 }}>
          {sections.map(s => (
            <button key={s.n} onClick={() => setActiveSection(s.n)} style={{
              flex:1, padding:"8px 4px", borderRadius:6, border:"none", cursor:"pointer",
              background: activeSection===s.n ? "#EFF6FF" : "transparent",
              color: activeSection===s.n ? BLUE : TEXT2,
              fontWeight: activeSection===s.n ? 700 : 500, fontSize:13,
              transition:"all 0.15s",
            }}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Error summary */}
      {Object.keys(errors).length > 0 && (
        <div style={{ marginBottom:14, padding:"10px 16px", borderRadius:8, background:"#FEF2F2", border:"1px solid #FECACA" }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#DC2626", marginBottom:4 }}>กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง:</div>
          {Object.values(errors).map((e, i) => <div key={i} style={{ fontSize:13, color:"#DC2626" }}>• {e}</div>)}
        </div>
      )}

      {/* ═══════════ Section 2: Document Control ═══════════ */}
      {activeSection === 2 && (
        <Card>
          <SectionTitle number={2} title="Document Control — ข้อมูลเอกสาร" icon="📋" />
          <div style={{ padding:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
              <Field label="ประเภทใบขน" required>
                <SelectInput value={doc.declarationType} onChange={v => setDoc(d=>({...d, declarationType:v}))}
                  options={[{code:"WITH_PRIVILEGE",name:"ใช้สิทธิ (With Privilege)"},{code:"WITHOUT_PRIVILEGE",name:"ไม่ใช้สิทธิ"}]} />
              </Field>
              <Field label="เลขที่ Invoice">
                <TextInput value={doc.invoiceRef} onChange={v => setDoc(d=>({...d, invoiceRef:v}))} placeholder="INV-001" maxLength={100} />
              </Field>
              <Field label="วิธีขนส่ง (Transport Mode)" required>
                <SelectInput value={doc.transportMode} onChange={v => setDoc(d=>({...d, transportMode:v}))} options={TRANSPORT_MODES} showCode />
              </Field>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
              <Field label="ด่านศุลกากรปล่อย (Release Port)" required>
                <SelectInput value={doc.releasePort} onChange={v => setDoc(d=>({...d, releasePort:v}))} options={CUSTOMS_PORTS} showCode />
              </Field>
              <Field label="ท่าบรรทุกสินค้า (Loading Port)">
                <SelectInput value={doc.loadingPort} onChange={v => setDoc(d=>({...d, loadingPort:v}))} options={PORTS} showCode />
              </Field>
              <Field label="ประเภทสินค้า (Cargo Type)">
                <SelectInput value={doc.cargoType} onChange={v => setDoc(d=>({...d, cargoType:v}))} options={CARGO_TYPES} showCode />
              </Field>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
              <Field label="ประเทศผู้ซื้อ (Purchase Country)">
                <SelectInput value={doc.purchaseCountry} onChange={v => setDoc(d=>({...d, purchaseCountry:v}))} options={COUNTRIES} showCode />
              </Field>
              <Field label="ประเทศปลายทาง (Destination)">
                <SelectInput value={doc.destinationCountry} onChange={v => setDoc(d=>({...d, destinationCountry:v}))} options={COUNTRIES} showCode />
              </Field>
              <Field label="สกุลเงิน (Currency)" required>
                <SelectInput value={doc.currency} onChange={v => setDoc(d=>({...d, currency:v}))} options={CURRENCIES} showCode />
              </Field>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
              <Field label="อัตราแลกเปลี่ยน">
                <NumberInput value={doc.exchangeRate} onChange={v => setDoc(d=>({...d, exchangeRate:v}))} placeholder="เช่น 34.5200" step="0.0001" />
              </Field>
              <Field label="ชื่อเรือ / เที่ยวบิน">
                <TextInput value={doc.vesselName} onChange={v => setDoc(d=>({...d, vesselName:v}))} placeholder="EVER GIVEN V.89" maxLength={35} />
              </Field>
              <Field label="วันออกเดินทาง">
                <DateInput value={doc.departureDate} onChange={v => setDoc(d=>({...d, departureDate:v}))} />
              </Field>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Master B/L Number">
                <TextInput value={doc.masterBl} onChange={v => setDoc(d=>({...d, masterBl:v}))} placeholder="MAEU12345678" maxLength={35} />
              </Field>
              <Field label="House B/L Number">
                <TextInput value={doc.houseBl} onChange={v => setDoc(d=>({...d, houseBl:v}))} placeholder="HBL-001" maxLength={35} />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {/* ═══════════ Section 1: Exporter & Agent ═══════════ */}
      {activeSection === 1 && (
        <Card>
          <SectionTitle number={1} title="Exporter & Agent — ผู้ส่งออกและตัวแทน" icon="🏢" />
          <div style={{ padding:20 }}>
            {/* Exporter */}
            <div style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:10, paddingBottom:6, borderBottom:`1px solid ${BORDER2}` }}>
              ผู้ส่งออก (Exporter)
            </div>
            <div style={{ marginBottom: 16, background:"#F9FAFB", padding:"12px 16px", borderRadius:6, border:`1px solid ${BORDER2}` }}>
              <Field label="เลือกจาก Master Data (ดึงข้อมูลอัตโนมัติ)">
                <select onChange={e => handleSelectMasterExporter(e.target.value)} style={selectStyle}>
                  <option value="">— ไม่ดึงข้อมูล กรอกเอง —</option>
                  {exportersMaster.map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.taxId} : {exp.nameTh}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 }}>
              <Field label="เลขประจำตัวผู้เสียภาษี" required>
                <TextInput value={exporter.taxId} onChange={v => setExporter(e=>({...e, taxId:v}))} placeholder="0105564001234" maxLength={17} />
              </Field>
              <Field label="สาขา (Branch)">
                <TextInput value={exporter.branch} onChange={v => setExporter(e=>({...e, branch:v}))} placeholder="00000" maxLength={6} />
              </Field>
              <Field label="ชื่อภาษาอังกฤษ">
                <TextInput value={exporter.nameEn} onChange={v => setExporter(e=>({...e, nameEn:v}))} placeholder="Company Name EN" maxLength={70} />
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
              <Field label="ชื่อภาษาไทย">
                <TextInput value={exporter.nameTh} onChange={v => setExporter(e=>({...e, nameTh:v}))} placeholder="ชื่อบริษัท (ไทย)" maxLength={120} />
              </Field>
              <Field label="ที่อยู่">
                <TextInput value={exporter.address} onChange={v => setExporter(e=>({...e, address:v}))} placeholder="123 ถนน..." maxLength={70} />
              </Field>
            </div>

            {/* Agent / Broker */}
            <div style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:10, paddingBottom:6, borderBottom:`1px solid ${BORDER2}` }}>
              ตัวแทนออกของ (Agent / Broker)
            </div>
            <div style={{ marginBottom:14, background:"#F9FAFB", padding:"12px 16px", borderRadius:6, border:`1px solid ${BORDER2}` }}>
              <Field label="เลือกจาก Master Data (ดึงข้อมูลอัตโนมัติ)">
                <select onChange={e => handleSelectMasterBroker(e.target.value)} style={selectStyle}>
                  <option value="">— ไม่ดึงข้อมูล กรอกเอง —</option>
                  {brokersMaster.map(b => (
                    <option key={b.id} value={b.id}>{b.taxId} : {b.nameTh}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
              <Field label="ชื่อตัวแทน">
                <TextInput value={agent.brokerName} onChange={v => setAgent(a=>({...a, brokerName:v}))} placeholder="NKTech Co., Ltd." />
              </Field>
              <Field label="เลขผู้เสียภาษี (ตัวแทน)">
                <TextInput value={agent.brokerTaxId} onChange={v => setAgent(a=>({...a, brokerTaxId:v}))} placeholder="0105564001234" maxLength={15} />
              </Field>
              <Field label="สาขา (ตัวแทน)">
                <TextInput value={agent.branch} onChange={v => setAgent(a=>({...a, agentBranch:v}))} placeholder="00000" maxLength={6} />
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
              <Field label="เลขที่บัตรผ่านพิธีการ">
                <TextInput value={agent.cardNo} onChange={v => setAgent(a=>({...a, cardNo:v}))} placeholder="CL-001" maxLength={50} />
              </Field>
              <Field label="ชื่อผู้ผ่านพิธีการ">
                <TextInput value={agent.agentName} onChange={v => setAgent(a=>({...a, agentName:v}))} placeholder="นายสมชาย..." />
              </Field>
            </div>

            {/* Manager */}
            <div style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:10, paddingBottom:6, borderBottom:`1px solid ${BORDER2}` }}>
              ผู้ผ่านพิธีการ (Clearance Person)
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="เลขที่บัตรผ่านพิธีการ">
                <TextInput value={agent.managerIdCard} onChange={v => setAgent(a=>({...a, managerIdCard:v}))} placeholder="1-1234-56789-01-2" maxLength={17} />
              </Field>
              <Field label="ชื่อผู้ผ่านพิธีการ">
                <TextInput value={agent.managerName} onChange={v => setAgent(a=>({...a, managerName:v}))} placeholder="นายสมชาย รักดี" maxLength={35} />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {/* ═══════════ Section 3: Invoice & Consignee ═══════════ */}
      {activeSection === 3 && (
        <Card>
          <SectionTitle number={3} title="Invoice & Consignee — ข้อมูลการค้า" icon="📄" />
          <div style={{ padding:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
              <Field label="เลขที่ Invoice">
                <TextInput value={invoice.invoiceNo} onChange={v => setInvoice(inv=>({...inv, invoiceNo:v}))} placeholder="INV-2026-001" />
              </Field>
              <Field label="วันที่ Invoice">
                <DateInput value={invoice.invoiceDate} onChange={v => setInvoice(inv=>({...inv, invoiceDate:v}))} />
              </Field>
              <Field label="PO Number">
                <TextInput value={invoice.poNumber} onChange={v => setInvoice(inv=>({...inv, poNumber:v}))} placeholder="PO-001" />
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 }}>
              <Field label="เงื่อนไขการค้า (Incoterms)">
                <SelectInput value={invoice.incoterms} onChange={v => setInvoice(inv=>({...inv, incoterms:v}))} options={INCOTERMS} />
              </Field>
              <Field label="ค่าขนส่ง (Freight)">
                <NumberInput value={invoice.freightAmount} onChange={v => setInvoice(inv=>({...inv, freightAmount:v}))} placeholder="0.00" />
              </Field>
              <Field label="ค่าประกัน (Insurance)">
                <NumberInput value={invoice.insuranceAmount} onChange={v => setInvoice(inv=>({...inv, insuranceAmount:v}))} placeholder="0.00" />
              </Field>
            </div>

            {/* Consignee */}
            <div style={{ fontSize:14, fontWeight:700, color:TEXT, marginBottom:10, paddingBottom:6, borderBottom:`1px solid ${BORDER2}` }}>
              ผู้รับสินค้า (Consignee)
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:14 }}>
              <Field label="ชื่อผู้รับสินค้า">
                <TextInput value={invoice.consigneeName} onChange={v => setInvoice(inv=>({...inv, consigneeName:v}))} placeholder="Company Name" />
              </Field>
              <Field label="ประเทศ">
                <SelectInput value={invoice.consigneeCountry} onChange={v => setInvoice(inv=>({...inv, consigneeCountry:v}))} options={COUNTRIES} showCode />
              </Field>
            </div>
            <Field label="ที่อยู่ผู้รับสินค้า" span={2}>
              <TextInput value={invoice.consigneeAddress} onChange={v => setInvoice(inv=>({...inv, consigneeAddress:v}))} placeholder="123 Main St..." />
            </Field>
          </div>
        </Card>
      )}

      {/* ═══════════ Section 4: Shipment Summary ═══════════ */}
      {activeSection === 4 && (
        <Card>
          <SectionTitle number={4} title="Shipment Summary — สรุปการขนส่ง" icon="📦" />
          <div style={{ padding:20 }}>
            <Field label="Shipping Marks (เครื่องหมายหีบห่อ)" span={3}>
              <textarea
                value={shipment.shippingMarks}
                onChange={e => setShipment(s=>({...s, shippingMarks:e.target.value}))}
                rows={3} maxLength={512} placeholder="N/M&#10;MADE IN THAILAND"
                style={{ ...inputStyle, resize:"vertical" }}
              />
            </Field>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:16, marginBottom:16 }}>
              <Field label="จำนวนหีบห่อรวม">
                <div style={{ display:"flex", gap:8 }}>
                  <NumberInput value={shipment.totalPackages ?? (totals.totalPkgs || null)} onChange={v => setShipment(s=>({...s, totalPackages:v}))} placeholder={String(totals.totalPkgs)} min={0} />
                  <select value={shipment.packageUnit} onChange={e => setShipment(s=>({...s, packageUnit:e.target.value}))} style={{ ...selectStyle, width:120 }}>
                    {PACKAGE_TYPES.map(p => <option key={p.code} value={p.code}>{p.code} — {p.nameTh}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="น้ำหนักสุทธิรวม (Net Weight)">
                <div style={{ display:"flex", gap:8 }}>
                  <NumberInput value={totals.totalNetKg || null} onChange={() => {}} placeholder={String(totals.totalNetKg)} />
                  <select value={shipment.netWeightUnit} onChange={e => setShipment(s=>({...s, netWeightUnit:e.target.value}))} style={{ ...selectStyle, width:80 }}>
                    <option value="KGM">KGM</option>
                    <option value="TNE">TNE</option>
                  </select>
                </div>
              </Field>
              <Field label="น้ำหนักรวม (Gross Weight)">
                <div style={{ display:"flex", gap:8 }}>
                  <NumberInput value={null} onChange={() => {}} placeholder="0.000" />
                  <select value={shipment.grossWeightUnit} onChange={e => setShipment(s=>({...s, grossWeightUnit:e.target.value}))} style={{ ...selectStyle, width:80 }}>
                    <option value="KGM">KGM</option>
                    <option value="TNE">TNE</option>
                  </select>
                </div>
              </Field>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Field label="วิธีชำระอากร (Payment Method)">
                <SelectInput value={shipment.paymentMethod} onChange={v => setShipment(s=>({...s, paymentMethod:v}))}
                  options={[{code:"C",name:"เงินสด (Cash)"},{code:"D",name:"หักบัญชี (Deposit)"},{code:"T",name:"โอน (Transfer)"},{code:"G",name:"ค้ำประกัน (Guarantee)"}]} />
              </Field>
              <Field label="วิธีค้ำประกัน (Guarantee)">
                <SelectInput value={shipment.guaranteeMethod} onChange={v => setShipment(s=>({...s, guaranteeMethod:v}))}
                  options={[{code:"A",name:"หนังสือค้ำประกัน"},{code:"B",name:"เงินสดวางค้ำ"},{code:"C",name:"ไม่ต้องค้ำ"}]} />
              </Field>
              <div>
                {/* Summary card */}
                <div style={{ background:"#EFF6FF", border:`1px solid #BFDBFE`, borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:BLUE, marginBottom:4 }}>สรุปจาก Line Items</div>
                  <div style={{ fontSize:13, color:TEXT }}>FOB รวม: <b>{doc.currency} {totals.totalFob.toLocaleString()}</b></div>
                  <div style={{ fontSize:13, color:TEXT }}>น้ำหนักสุทธิ: <b>{totals.totalNetKg.toLocaleString()} KGM</b></div>
                  <div style={{ fontSize:13, color:TEXT }}>หีบห่อ: <b>{totals.totalPkgs} {shipment.packageUnit}</b></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ═══════════ Section 5: Line Items ═══════════ */}
      {activeSection === 5 && (
        <div>
          <Card>
            <SectionTitle number={5} title={`Line Items — รายการสินค้า (${items.length} รายการ)`} icon="📝" />
            <div style={{ padding:"12px 20px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:13, color:TEXT2 }}>
                FOB รวม: <b style={{ color:TEXT }}>{doc.currency} {totals.totalFob.toLocaleString()}</b>
                {" · "}น้ำหนักรวม: <b style={{ color:TEXT }}>{totals.totalNetKg.toLocaleString()} KGM</b>
              </div>
              <Btn onClick={addItem} style={{ padding:"6px 14px", fontSize:13 }}>+ เพิ่มรายการ</Btn>
            </div>
          </Card>

          {items.map((item, idx) => (
            <Card key={idx} style={{ marginTop:12 }}>
              <div style={{ padding:"10px 20px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:14, fontWeight:700, color:TEXT }}>
                  รายการที่ {item.seqNo}
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} style={{
                    background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA",
                    borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600, cursor:"pointer",
                  }}>ลบ</button>
                )}
              </div>
              <div style={{ padding:16 }}>
                {/* Row 1: HS Code + Description */}
                <div style={{ display:"grid", gridTemplateColumns:"200px 1fr 1fr", gap:12, marginBottom:12 }}>
                  <Field label="HS Code" required>
                    <HsCodeAutocomplete value={item.hsCode} onChange={v => handleHsSelect(idx, v)} hsMaster={hsMaster} />
                  </Field>
                  <Field label="รายละเอียด (EN)" required>
                    <TextInput value={item.descriptionEn} onChange={v => updateItem(idx,"descriptionEn",v)} placeholder="Product description" maxLength={500} />
                  </Field>
                  <Field label="รายละเอียด (TH)">
                    <TextInput value={item.descriptionTh} onChange={v => updateItem(idx,"descriptionTh",v)} placeholder="คำอธิบายสินค้า" maxLength={500} />
                  </Field>
                </div>

                {/* Row 2: Brand, Origin, Product Code */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
                  <Field label="ยี่ห้อ (Brand)">
                    <TextInput value={item.brandName} onChange={v => updateItem(idx,"brandName",v)} placeholder="Brand name" maxLength={200} />
                  </Field>
                  <Field label="ประเทศแหล่งกำเนิด">
                    <SelectInput value={item.originCountry} onChange={v => updateItem(idx,"originCountry",v)} options={COUNTRIES} showCode />
                  </Field>
                  <Field label="รหัสสินค้า (Product Code)">
                    <TextInput value={item.productCode} onChange={v => updateItem(idx,"productCode",v)} placeholder="SKU-001" maxLength={50} />
                  </Field>
                </div>

                {/* Row 3: Quantity, Weight, FOB */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 1fr 1fr 1fr", gap:12, marginBottom:12 }}>
                  <Field label="จำนวน" required>
                    <NumberInput value={item.quantity} onChange={v => updateItem(idx,"quantity",v)} placeholder="0" min={0} />
                  </Field>
                  <Field label="หน่วย">
                    <SelectInput value={item.quantityUnit} onChange={v => updateItem(idx,"quantityUnit",v)} options={UNITS} />
                  </Field>
                  <Field label="น้ำหนักสุทธิ (KG)">
                    <NumberInput value={item.netWeightKg} onChange={v => updateItem(idx,"netWeightKg",v)} placeholder="0.000" step="0.001" />
                  </Field>
                  <Field label={`มูลค่า FOB (${doc.currency})`}>
                    <NumberInput value={item.fobForeign} onChange={v => updateItem(idx,"fobForeign",v)} placeholder="0.00" step="0.01" />
                  </Field>
                  <Field label="อัตราอากร (%)">
                    <NumberInput value={item.dutyRate} onChange={v => updateItem(idx,"dutyRate",v)} placeholder="0" step="0.01" />
                  </Field>
                </div>

                {/* Row 4: Packages, Nature of Transaction */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:12 }}>
                  <Field label="จำนวนหีบห่อ">
                    <NumberInput value={item.packageQty} onChange={v => updateItem(idx,"packageQty",v)} placeholder="0" min={0} />
                  </Field>
                  <Field label="ประเภทหีบห่อ">
                    <SelectInput value={item.packageType} onChange={v => updateItem(idx,"packageType",v)} options={PACKAGE_TYPES} />
                  </Field>
                  <Field label="ลักษณะธุรกรรม">
                    <SelectInput value={item.natureOfTransaction} onChange={v => updateItem(idx,"natureOfTransaction",v)} options={NATURE_OF_TRANSACTION} showCode />
                  </Field>
                  <Field label="รหัสสถิติ">
                    <TextInput value={item.statisticsCode} onChange={v => updateItem(idx,"statisticsCode",v)} placeholder="auto from HS" />
                  </Field>
                </div>

                {/* Privilege flags */}
                {doc.declarationType === "WITH_PRIVILEGE" && (
                  <div style={{ marginTop:8, padding:12, background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#92400E", marginBottom:8 }}>สิทธิประโยชน์ (Privilege Flags)</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
                      {PRIVILEGE_TYPES.map(p => {
                        const active = item.privilegeFlags.includes(p.code);
                        return (
                          <button key={p.code} onClick={() => togglePrivilege(idx, p.code)} style={{
                            padding:"5px 12px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer",
                            border: `1px solid ${active ? "#2563EB" : "#D1D5DB"}`,
                            background: active ? "#EFF6FF" : "#fff",
                            color: active ? "#2563EB" : TEXT2,
                            transition:"all 0.15s",
                          }}>
                            {active ? "✓ " : ""}{p.code} — {p.nameTh}
                          </button>
                        );
                      })}
                    </div>

                    {/* Upload zone per active privilege */}
                    {item.privilegeFlags.length > 0 && (
                      <div style={{ marginTop:8, padding:12, background:"#fff", border:`1px solid ${BORDER}`, borderRadius:8 }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:10 }}>
                          <Field label="เลขที่ใบอนุญาต">
                            <TextInput value={item.licenseNumber} onChange={v => updateItem(idx,"licenseNumber",v)} placeholder={`${item.privilegeFlags[0] || "LIC"}-001/2026`} maxLength={100} />
                          </Field>
                          <Field label="วันหมดอายุ">
                            <DateInput value={item.licenseExpiry} onChange={v => updateItem(idx,"licenseExpiry",v)} />
                          </Field>
                          <Field label="สิทธิที่เลือก">
                            <div style={{ fontSize:13, color:BLUE, fontWeight:600, paddingTop:8 }}>
                              {item.privilegeFlags.join(", ")}
                            </div>
                          </Field>
                        </div>

                        {/* File upload */}
                        <div style={{ border:`2px dashed ${BORDER}`, borderRadius:8, padding:14, textAlign:"center" }}>
                          <input type="file" id={`priv-file-${idx}`} multiple accept=".pdf,.xlsx,.png,.jpg,.jpeg"
                            style={{ display:"none" }} onChange={e => handlePrivilegeFile(idx, e)} />
                          <label htmlFor={`priv-file-${idx}`} style={{ cursor:"pointer" }}>
                            <div style={{ fontSize:14, color:TEXT2, marginBottom:4 }}>📎 แนบเอกสารสิทธิประโยชน์</div>
                            <div style={{ fontSize:12, color:TEXT3 }}>PDF, XLSX, PNG, JPG · สูงสุด 20 MB</div>
                            <div style={{ display:"inline-block", padding:"4px 14px", borderRadius:6, border:`1px solid ${BORDER}`, background:W, fontSize:13, fontWeight:600, color:TEXT2, marginTop:6 }}>
                              เลือกไฟล์
                            </div>
                          </label>
                        </div>

                        {/* File list */}
                        {item.privilegeFiles.length > 0 && (
                          <div style={{ marginTop:8 }}>
                            {item.privilegeFiles.map((f, fi) => (
                              <div key={fi} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", fontSize:13 }}>
                                <span style={{ color:"#16A34A" }}>✓</span>
                                <span style={{ color:TEXT, flex:1 }}>{f.name}</span>
                                <span style={{ color:TEXT3 }}>({(f.size/1024).toFixed(0)} KB)</span>
                                <button onClick={() => removePrivilegeFile(idx, fi)} style={{
                                  background:"none", border:"none", color:"#DC2626", cursor:"pointer", fontSize:12, fontWeight:600,
                                }}>ลบ</button>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.privilegeFlags.length > 0 && item.privilegeFiles.length === 0 && (
                          <div style={{ marginTop:6, fontSize:12, color:"#DC2626" }}>
                            ⚠ ต้องแนบเอกสารอย่างน้อย 1 ไฟล์เมื่อใช้สิทธิประโยชน์
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Add item button */}
          <div style={{ marginTop:12, textAlign:"center" }}>
            <Btn variant="secondary" onClick={addItem} style={{ padding:"10px 28px" }}>
              + เพิ่มรายการสินค้า
            </Btn>
          </div>
        </div>
      )}

      {/* ═══════════ Save error ═══════════ */}
      {saveError && (
        <Card style={{ marginTop:14, padding:"12px 20px", borderColor:"#FECACA", background:"#FEF2F2" }}>
          <div style={{ fontSize:14, color:"#DC2626", fontWeight:600 }}>เกิดข้อผิดพลาด: {saveError}</div>
        </Card>
      )}

      {/* ═══════════ Success panel (after save) ═══════════ */}
      {savedDeclarationId && (
        <Card style={{ marginTop:14, padding:"16px 20px", borderColor:"#BBF7D0", background:"#F0FDF4" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#16A34A", marginBottom:8 }}>
            บันทึกใบขนสำเร็จ
          </div>
          <div style={{ fontSize:13, color:TEXT2, marginBottom:12 }}>
            Declaration ID: <code style={{ background:"#F3F4F6", padding:"2px 6px", borderRadius:4 }}>{savedDeclarationId}</code>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn onClick={handleXmlPreview}>Preview XML</Btn>
            <Btn variant="secondary" onClick={() => setShowPdf(true)}>Preview PDF กศก.101/1</Btn>
            <Btn variant="ghost" onClick={onBack}>← กลับหน้าหลัก</Btn>
          </div>
        </Card>
      )}

      {/* ═══════════ XML Preview Modal ═══════════ */}
      {showXml && xmlPreview && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setShowXml(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"#fff", borderRadius:12, width:"90%", maxWidth:900, maxHeight:"85vh",
            display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:16, fontWeight:700, color:TEXT }}>XML Preview — CustomsExportDeclaration v4.00</div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="secondary" onClick={() => { navigator.clipboard.writeText(xmlPreview); alert("Copied!"); }} style={{ fontSize:12, padding:"4px 10px" }}>Copy</Btn>
                <Btn variant="secondary" onClick={() => {
                  const blob = new Blob([xmlPreview], { type:"application/xml" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = `declaration_${savedDeclarationId}.xml`; a.click();
                  URL.revokeObjectURL(url);
                }} style={{ fontSize:12, padding:"4px 10px" }}>Download .xml</Btn>
                <button onClick={() => setShowXml(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:TEXT2 }}>×</button>
              </div>
            </div>
            <pre style={{
              flex:1, overflow:"auto", margin:0, padding:20, fontSize:12, lineHeight:1.5,
              fontFamily:"'Consolas','Monaco','Courier New',monospace", background:"#1E293B", color:"#E2E8F0",
              borderRadius:"0 0 12px 12px", whiteSpace:"pre-wrap", wordBreak:"break-all",
            }}>{xmlPreview}</pre>
          </div>
        </div>
      )}

      {/* ═══════════ PDF Preview Modal (กศก.101/1) ═══════════ */}
      {showPdf && savedDeclarationId && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setShowPdf(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"#fff", borderRadius:12, width:"90%", maxWidth:900, maxHeight:"90vh",
            display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:16, fontWeight:700, color:TEXT }}>ใบขนสินค้าขาออก กศก.101/1 — Preview</div>
              <button onClick={() => setShowPdf(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:TEXT2 }}>×</button>
            </div>
            <div style={{ flex:1, overflow:"auto", padding:24, background:"#F3F4F6" }}>
              <DeclarationPdfPreview doc={doc} exporter={exporter} agent={agent} invoice={invoice} shipment={shipment} items={items} totals={totals} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ Bottom bar ═══════════ */}
      <div style={{ marginTop:22, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:8 }}>
          {activeSection > 1 && (
            <Btn variant="secondary" onClick={() => setActiveSection(s => s - 1)}>← ก่อนหน้า</Btn>
          )}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {activeSection < 5 ? (
            <Btn onClick={() => setActiveSection(s => s + 1)}>ถัดไป →</Btn>
          ) : !savedDeclarationId ? (
            <Btn onClick={handleSubmit} disabled={saving} style={{ minWidth:180, padding:"10px 24px" }}>
              {saving ? "กำลังบันทึก..." : "✓ บันทึกใบขน"}
            </Btn>
          ) : null}
        </div>
      </div>
    </div>
  );
}
