import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./stores/AuthContext.jsx";
import LoginScreen from "./LoginScreen.jsx";
import RegisterScreen from "./RegisterScreen.jsx";
import { jobsApi } from "./api/jobsApi.js";
import { customerApi } from "./api/customerApi.js";
import { auditApi } from "./api/auditApi.js";
import client from "./api/client.js";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import CustomerDashboard from "./CustomerDashboard.jsx";
import FinanceDashboard from "./FinanceDashboard.jsx";
import SuperAdminConsole from "./super-admin-console.jsx";
import { usePermissions } from "./hooks/usePermissions.js";

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

// ─── HS Code Master (ข้อมูลจริงจาก hscode8digits_ahtnprotocol2022 + HHA + สถิติส่งออก) ──
const HS_MASTER = [
  // Electronics & Semiconductors (ส่งออกสูงสุดของไทย)
  { code:"85423110", desc:"Processors and controllers", thDesc:"ตัวประมวลผลและตัวควบคุม", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85423900", desc:"Other electronic integrated circuits", thDesc:"วงจรรวมอิเล็กทรอนิกส์อื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85340090", desc:"Printed circuits — other", thDesc:"แผงวงจรพิมพ์ชนิดอื่น", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84733010", desc:"Assembled printed circuit boards", thDesc:"แผงวงจรพิมพ์ที่ประกอบแล้ว", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84733090", desc:"Computer parts — other", thDesc:"ชิ้นส่วนคอมพิวเตอร์ชนิดอื่น", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84717020", desc:"Hard disk drives", thDesc:"หน่วยขับจานบันทึกแบบแข็ง", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84717050", desc:"Storage devices for ADP machines", thDesc:"อุปกรณ์หน่วยเก็บข้อมูล", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85176249", desc:"Communication apparatus — other", thDesc:"เครื่องมือสื่อสารอื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85171200", desc:"Telephones for cellular/wireless networks", thDesc:"เครื่องโทรศัพท์เซลลูลาร์", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85044090", desc:"Static converters — other", thDesc:"เครื่องแปลงกระแสไฟฟ้า", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85371019", desc:"Electrical control panels — other", thDesc:"แผงควบคุมไฟฟ้า", unit:"C62", dutyRate:"0%", origin:"TH" },

  // Automotive (SAPT-type products)
  { code:"87042129", desc:"Motor vehicles — other", thDesc:"ยานยนต์อื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"87032364", desc:"Vehicles cylinder > 2,500cc", thDesc:"รถยนต์ความจุกระบอกสูบเกิน 2,500 ซีซี", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"87089980", desc:"Motor vehicle parts — other", thDesc:"ส่วนประกอบยานยนต์อื่นๆ", unit:"C62", dutyRate:"5%", origin:"TH" },
  { code:"87115090", desc:"Motorcycles — other", thDesc:"จักรยานยนต์อื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84082022", desc:"Diesel engines for vehicles", thDesc:"เครื่องยนต์ดีเซลสำหรับยานยนต์", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"40111000", desc:"Tyres for motor cars", thDesc:"ยางล้อรถยนต์นั่ง", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"40112010", desc:"Tyres for buses/trucks — width ≤ 450mm", thDesc:"ยางล้อรถบรรทุก", unit:"C62", dutyRate:"0%", origin:"TH" },

  // Rubber & Plastics
  { code:"40011011", desc:"Centrifuged rubber latex concentrate", thDesc:"น้ำยางเข้มข้นที่ได้โดยวิธีหมุนเหวี่ยง", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40012220", desc:"TSNR 20 natural rubber", thDesc:"ยางธรรมชาติ TSNR ชั้น 20", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40012130", desc:"RSS Grade 3 natural rubber", thDesc:"ยางแผ่นรมควันชั้น 3", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40028090", desc:"Synthetic rubber — other", thDesc:"ยางสังเคราะห์อื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40151900", desc:"Gloves — other", thDesc:"ถุงมืออื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"39012000", desc:"Polyethylene — other", thDesc:"โพลิเอทิลีนอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"39014000", desc:"Ethylene-alpha-olefin copolymers", thDesc:"เอทิลีน-อัลฟา-โอลีฟิน โคโพลิเมอร์", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"39074000", desc:"Polycarbonates", thDesc:"โพลิคาร์บอเนต", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"39269099", desc:"Other articles of plastic", thDesc:"ของทำด้วยพลาสติกอื่นๆ", unit:"C62", dutyRate:"10%", origin:"TH" },

  // Food & Agriculture (MITR-type products)
  { code:"10063040", desc:"White Thai Hom Mali rice 100%", thDesc:"ข้าวเจ้าขาวหอมมะลิไทย 100%", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"11081400", desc:"Manioc (cassava) starch", thDesc:"สตาร์ชทำจากมันสำปะหลัง", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"08106000", desc:"Durians", thDesc:"ทุเรียน", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"16041419", desc:"Prepared tuna — other", thDesc:"ปลาทูน่าปรุงแต่งอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"16023290", desc:"Prepared chicken — other", thDesc:"ไก่ปรุงแต่งอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"07141011", desc:"Dried cassava chips", thDesc:"มันสำปะหลังอัดเม็ด/ดรายชิพ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"23091010", desc:"Pet food — other", thDesc:"อาหารสัตว์เลี้ยงอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"22029990", desc:"Non-alcoholic beverages — other", thDesc:"เครื่องดื่มไม่มีแอลกอฮอล์อื่นๆ", unit:"LTR", dutyRate:"0%", origin:"TH" },

  // Precious metals & gems
  { code:"71081210", desc:"Gold in lumps/ingots", thDesc:"ทองคำเป็นก้อน/อินกอต", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"71131190", desc:"Gold jewellery — other", thDesc:"เครื่องเพชรพลอยทำจากทองอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"71131990", desc:"Gold alloy jewellery", thDesc:"เครื่องเพชรพลอยทำจากสารเจือทอง", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"71023900", desc:"Diamonds — other", thDesc:"เพชรอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },

  // Iron & Steel / Metal (HHA-type imports)
  { code:"73181590", desc:"Bolts and screws — other", thDesc:"สกรูและโบลต์อื่นๆ", unit:"C62", dutyRate:"10%", origin:"CN" },
  { code:"73181690", desc:"Nuts — other", thDesc:"น็อตอื่นๆ", unit:"C62", dutyRate:"10%", origin:"CN" },
  { code:"73182200", desc:"Washers", thDesc:"แหวนรอง", unit:"C62", dutyRate:"10%", origin:"CN" },
  { code:"73269099", desc:"Articles of iron/steel — other", thDesc:"ของทำจากเหล็กอื่นๆ", unit:"KGM", dutyRate:"10%", origin:"CN" },
  { code:"74111000", desc:"Copper tubes/pipes — refined", thDesc:"ท่อทองแดงบริสุทธิ์", unit:"KGM", dutyRate:"5%", origin:"CN" },
  { code:"74040000", desc:"Copper waste and scrap", thDesc:"เศษทองแดง", unit:"KGM", dutyRate:"0%", origin:"TH" },

  // Machinery & Electrical (HHA-type imports)
  { code:"85015229", desc:"AC motors > 750W — other", thDesc:"มอเตอร์ไฟฟ้ากระแสสลับ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85322900", desc:"Capacitors — other", thDesc:"ตัวเก็บประจุอื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85312000", desc:"Indicator panels with LCD/LED", thDesc:"แผงแสดงผล LCD/LED", unit:"C62", dutyRate:"0%", origin:"CN" },
  { code:"85444299", desc:"Electric conductors — other", thDesc:"ชุดสายไฟฟ้า", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85369099", desc:"Electrical switching apparatus — other", thDesc:"สวิตช์ไฟฟ้าอื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85389019", desc:"Parts for switchgear — other", thDesc:"ชิ้นส่วนสวิตช์อื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85472000", desc:"Insulating fittings of plastics", thDesc:"ท่อฉนวนไฟฟ้า (พลาสติก)", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"84151010", desc:"Air conditioning machines — other", thDesc:"เครื่องปรับอากาศอื่นๆ", unit:"C62", dutyRate:"10%", origin:"TH" },
  { code:"84151090", desc:"Air conditioning parts — other", thDesc:"ส่วนประกอบเครื่องปรับอากาศ", unit:"C62", dutyRate:"10%", origin:"TH" },

  // Hoses & Tubes (HHA-type imports)
  { code:"39173299", desc:"Plastic tubes/hoses — other non-rigid", thDesc:"ท่ออ่อนพลาสติกอื่นๆ", unit:"MTR", dutyRate:"10%", origin:"CN" },
  { code:"39173999", desc:"Plastic tubes/hoses — other", thDesc:"ท่อพลาสติกอื่นๆ", unit:"MTR", dutyRate:"10%", origin:"CN" },
  { code:"40169999", desc:"Rubber articles — other", thDesc:"ของทำด้วยยางอื่นๆ", unit:"KGM", dutyRate:"10%", origin:"CN" },

  // Miscellaneous
  { code:"90015000", desc:"Spectacle lenses of other materials", thDesc:"เลนส์แว่นตาทำด้วยวัตถุอื่น", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"90251919", desc:"Temperature sensors — other", thDesc:"เซนเซอร์อุณหภูมิอื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"44072997", desc:"Rubber wood — other", thDesc:"ไม้ยางพาราอื่นๆ", unit:"MTQ", dutyRate:"0%", origin:"TH" },
  { code:"27101971", desc:"Automotive diesel fuel", thDesc:"น้ำมันดีเซลสำหรับยานยนต์", unit:"LTR", dutyRate:"0%", origin:"TH" },
];

const INVOICES_FACTORY = [
  { id:"INV-2026-0085", jobs:42, amount:"฿661,500", status:"paid",    issued:"2026-02-28", due:"2026-03-05", period:"Feb 2026" },
  { id:"INV-2026-0089", jobs:5,  amount:"฿78,750",  status:"pending", issued:"2026-03-20", due:"2026-03-25", period:"Mar 2026 (partial)" },
];

// ─── Shared helpers ───────────────────────────────────────────────
const W       = "var(--bg-card)";
const BG      = "var(--bg-main)";
const BORDER  = "var(--border-main)";
const BORDER2 = "var(--border-light)";
const TEXT    = "var(--text-main)";
const TEXT2   = "var(--text-muted)";
const TEXT3   = "var(--text-light)";
const BLUE    = "var(--primary)";
const MONO    = "var(--mono)";
const ROW_HOVER = "var(--border-light)";

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
      display:"inline-block", padding:"2px 9px", borderRadius:6,
      fontSize:13, fontWeight:700, letterSpacing:"0.4px",
      color:s.color, background:s.bg, border:`1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:8, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", ...style }}>{children}</div>;
}

function SectionHeader({ title, sub, right }) {
  return (
    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER2}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:TEXT }}>{title}</div>
        {sub && <div style={{ fontSize:14, color:TEXT3, marginTop:2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Btn({ children, variant="primary", onClick, style={} }) {
  const base = { border:"none", borderRadius:8, padding:"8px 16px", fontSize:14, fontWeight:600, cursor:"pointer", transition:"all 0.15s", ...style };
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
      fontSize:13, fontWeight:700, background:`${color}15`, color, border:`1px solid ${color}33`,
    }}>{label}</span>
  );
}

// ─── Role badge helper ─────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    SUPER_ADMIN:    { label:"Super Admin",  color:"#7C3AED" },
    TENANT_ADMIN:   { label:"Admin",        color:"#2563EB" },
    MANAGER:        { label:"ผู้บริหาร",    color:"#0284C7" },
    STAFF:          { label:"เจ้าหน้าที่",  color:"#059669" },
    USER:           { label:"เจ้าหน้าที่",  color:"#059669" },
    CUSTOMER_ADMIN: { label:"โรงงาน Admin", color:"#7C3AED" },
    CUSTOMER:       { label:"ลูกค้า",       color:"#D97706" },
    VIEWER:         { label:"Viewer",       color:"#94A3B8" },
  };
  const m = map[role] || { label: role, color:"#94A3B8" };
  return (
    <span style={{
      fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4,
      background:`${m.color}18`, color:m.color, border:`1px solid ${m.color}30`,
      letterSpacing:"0.03em",
    }}>{m.label}</span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  const auth = useContext(AuthContext);
  const perms = usePermissions();
  const email   = auth?.user?.email || "";
  const company = auth?.user?.customer;
  const role    = auth?.user?.role || "VIEWER";
  const initials = email.charAt(0).toUpperCase();

  const isFactoryUser = perms.isCustomerAdmin || perms.isCustomer;
  const ALL_NAV = [
    ...(perms.canViewSuperAdmin ? [{ id:"superadmin", label:"Administration", icon:"👑" }] : []),
    { id:"dashboard",    label:"Dashboard",                               icon:"▦",  show: true },
    { id:"shipments",    label: isFactoryUser ? "Shipments ของฉัน" : "Shipments", icon:"≡", badge: 3, show: true },
    { id:"new",          label:"New Shipment",                            icon:"+",  show: perms.canCreateShipment },
    { id:"nsw",          label:"NSW Tracking",                            icon:"⊙",  show: true },
    { id:"declarations", label:"Declarations",                            icon:"◫",  show: perms.canViewDeclarations },
    { id:"master",       label:"Master Data",                             icon:"⊞",  show: perms.canViewMasterData },
    { id:"billing",      label: isFactoryUser ? "Billing ของฉัน" : "Billing", icon:"◧", show: perms.canViewBilling },
    { id:"reports",      label:"Reports",                                 icon:"⌗",  show: true },
    { id:"settings",     label:"Settings",                                icon:"⚙",  show: perms.canViewSettings },
  ];

  const NAV = ALL_NAV.filter(item => item.show !== false);

  return (
    <div style={{
      width:256, background:W, minHeight:"100vh",
      borderRight:`1px solid ${BORDER}`,
      boxShadow:"1px 0 0 #E5E7EB",
      display:"flex", flexDirection:"column", flexShrink:0,
      position:"sticky", top:0,
    }}>
      {/* Logo */}
      <div style={{
        height:64, padding:"0 20px",
        borderBottom:`1px solid ${BORDER}`,
        display:"flex", alignItems:"center", gap:10,
      }}>
        <div style={{
          width:36, height:36, borderRadius:8,
          background:BLUE, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:20, color:"#fff", flexShrink:0,
        }}>⚓</div>
        <div>
          <div style={{ fontSize:14, fontWeight:800, letterSpacing:"0.05em", color:BLUE, fontFamily:MONO }}>CUSTOMS-EDOC</div>
          <div style={{ fontSize:13, color:TEXT3 }}>Factory Portal</div>
        </div>
      </div>

      {/* Company info */}
      {company && (
        <div style={{
          padding:"12px 20px",
          borderBottom:`1px solid ${BORDER}`,
          background:"#F9FAFB",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:BLUE, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:15, fontWeight:700, color:"#fff", flexShrink:0,
            }}>{initials}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {company.companyNameTh || company.companyNameEn || "—"}
              </div>
              <div style={{ fontSize:13, color:TEXT3, fontFamily:MONO }}>{company.code || "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
        <p style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:TEXT3, padding:"0 8px", marginBottom:8, marginTop:0 }}>Main Menu</p>
        {NAV.map(item => {
          const isActive = active === item.id || (active === "shipment_detail" && item.id === "shipments");
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center",
              gap:10, padding:"8px 12px",
              marginBottom:2,
              borderRadius:"0 6px 6px 0",
              background: isActive ? "#EFF6FF" : "transparent",
              color: isActive ? BLUE : TEXT2,
              fontWeight: isActive ? 600 : 400,
              fontSize:15,
              cursor:"pointer",
              borderTop:"none",
              borderRight:"none",
              borderBottom:"none",
              borderLeft: isActive ? `3px solid ${BLUE}` : "3px solid transparent",
              textAlign:"left",
              transition:"all 0.15s",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="#F9FAFB"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{ fontSize:17, width:20, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background:"#EF4444", color:"#fff",
                  borderRadius:10, padding:"1px 6px",
                  fontSize:12, fontWeight:700, lineHeight:"14px",
                }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding:"14px 20px",
        borderTop:`1px solid ${BORDER}`,
        background:"#F9FAFB",
      }}>
        {/* User info row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:BLUE, color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, flexShrink:0,
          }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{email}</div>
            <div style={{ marginTop:2 }}><RoleBadge role={role}/></div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", flexShrink:0 }}/>
          <span style={{ fontSize:12, color:TEXT3 }}>NSW · Customs · BoT</span>
        </div>
        <button
          onClick={auth?.logout}
          onMouseEnter={e => { e.currentTarget.style.color="#DC2626"; e.currentTarget.style.background="#FEF2F2"; }}
          onMouseLeave={e => { e.currentTarget.style.color=TEXT2; e.currentTarget.style.background="transparent"; }}
          style={{
            width:"100%", display:"flex", alignItems:"center", gap:8,
            padding:"7px 10px", borderRadius:6,
            border:"none", background:"transparent",
            color:TEXT2, fontSize:14, fontWeight:600, cursor:"pointer",
            textAlign:"left", transition:"all 0.15s",
          }}>
          ⎋ Sign out
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function Dashboard({ onNav }) {
  const perms = usePermissions();

  // Route to the right dashboard view based on real role
  if (perms.isCustomer || perms.isCustomerAdmin) return <CustomerDashboard />;
  if (perms.isManager) return <FinanceDashboard />;
  if (perms.isSuperAdmin || perms.isAdmin) {
    // Admin/SuperAdmin can switch between views for demo purposes
    const [view, setView] = useState("default");
    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display:"flex", gap:8, marginBottom:24, padding:"12px 16px", background:W, borderRadius:10, border:`1px solid ${BORDER}` }}>
          <span style={{ fontSize:13, color:TEXT2, alignSelf:"center", marginRight:4 }}>Dashboard view:</span>
          {[
            { id:"default",  label:"🏛️ Operations" },
            { id:"customer", label:"👨‍💼 Customer" },
            { id:"finance",  label:"📊 Finance" },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding:"6px 14px", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer",
              background: view===v.id ? BLUE : "transparent",
              color: view===v.id ? "#fff" : TEXT2,
              border: `1px solid ${view===v.id ? BLUE : BORDER}`,
              transition:"all 0.15s",
            }}>{v.label}</button>
          ))}
        </div>
        {view === "customer" && <CustomerDashboard />}
        {view === "finance"  && <FinanceDashboard />}
        {view === "default"  && <DefaultDashboard onNav={onNav} />}
      </div>
    );
  }
  // STAFF → full operations dashboard
  return <DefaultDashboard onNav={onNav} />;
}

function DefaultDashboard({ onNav }) {
  const auth = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const companyName = auth?.user?.customer?.companyNameTh || auth?.user?.customer?.companyNameEn || "\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17";

  useEffect(() => {
    jobsApi.list({ limit: 200 }).then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setJobs(arr);
    }).catch(() => {});
  }, []);

  const thisMonth = new Date().toISOString().substring(0,7);
  const monthJobs = jobs.filter(j => (j.createdAt||"").startsWith(thisMonth));
  const pending = jobs.filter(j => ["NSW_PROCESSING","CUSTOMS_REVIEW","SUBMITTED"].includes(j.status));
  const cleared = jobs.filter(j => ["CLEARED","COMPLETED"].includes(j.status));
  const pendingUi = (jobs.length > 0 ? pending : SHIPMENTS.filter(s => ["NSW_PROCESSING","CUSTOMS_REVIEW","SUBMITTED"].includes(s.status)));
  const recentUi = jobs.length > 0 ? jobs.slice(0,5).map(mapJob) : SHIPMENTS.slice(0,5);
  const mon = new Date().toLocaleString("th-TH",{month:"long", year:"numeric"});

  // Build last 6 months for chart
  const fobChartData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toISOString().substring(0,7);
      const label = d.toLocaleString("th-TH", { month:"short" });
      const monthJb = jobs.filter(j => (j.createdAt||"").startsWith(key));
      const fob = monthJb.reduce((sum, j) => sum + (Number(j.totalFobUsd) || 0), 0);
      months.push({ month: label, fob: Math.round(fob / 1000), jobs: monthJb.length });
    }
    if (jobs.length === 0) return [
      { month:"\u0e15.\u0e04.", fob:2100, jobs:28 },
      { month:"\u0e1e.\u0e22.", fob:2800, jobs:35 },
      { month:"\u0e18.\u0e04.", fob:3100, jobs:42 },
      { month:"\u0e21.\u0e04.", fob:2600, jobs:31 },
      { month:"\u0e01.\u0e1e.", fob:3800, jobs:47 },
      { month:"\u0e21\u0e35.\u0e04.", fob:4200, jobs:52 },
    ];
    return months;
  })();

  // Status breakdown for bar chart
  const statusData = (() => {
    const src = jobs.length > 0 ? jobs : SHIPMENTS;
    const counts = {};
    src.forEach(j => { counts[j.status] = (counts[j.status]||0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS[status]?.label || status,
      count,
      fill: STATUS[status]?.color || "#6B7280",
    }));
  })();

  // Custom tooltip for FOB chart
  const FobTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", fontSize:14 }}>
        <div style={{ fontWeight:700, color:TEXT, marginBottom:4 }}>{label}</div>
        <div style={{ color:BLUE }}>FOB: ${payload[0]?.value?.toLocaleString()}K</div>
        <div style={{ color:"#8B5CF6" }}>Jobs: {payload[1]?.value}</div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Dashboard</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>{companyName} \u00b7 {mon}</p>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-metrics">
        {[
          { label:"Jobs this month",    value: jobs.length>0 ? String(monthJobs.length) : "\u2014", sub:"\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e43\u0e19\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e19\u0e35\u0e49",   color:"#2563EB" },
          { label:"Awaiting clearance", value: jobs.length>0 ? String(pending.length) : "\u2014",   sub:"NSW + Customs queue", color:"#F59E0B" },
          { label:"Cleared / Done",     value: jobs.length>0 ? String(cleared.length) : "\u2014",   sub:"All export jobs",     color:"#22C55E" },
          { label:"Total jobs",         value: jobs.length>0 ? String(jobs.length) : "\u2014",       sub:"\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e43\u0e19\u0e23\u0e30\u0e1a\u0e1a",       color:"#8B5CF6" },
        ].map((k,i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:13, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>{k.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:k.color, fontFamily:MONO, marginBottom:4 }}>{k.value}</div>
            <div style={{ fontSize:14, color:TEXT3 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="dashboard-split">
        {/* FOB Area Chart */}
        <Card>
          <SectionHeader title="FOB Value by Month" sub="USD (thousands) \u00b7 6 \u0e40\u0e14\u0e37\u0e2d\u0e19\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14" />
          <div style={{ padding:"16px 20px 8px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={fobChartData} margin={{ top:4, right:8, left:-16, bottom:0 }}>
                <defs>
                  <linearGradient id="fobGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<FobTooltip/>}/>
                <Area type="monotone" dataKey="fob" stroke={BLUE} strokeWidth={2} fill="url(#fobGrad)" dot={{ r:3, fill:BLUE }}/>
                <Area type="monotone" dataKey="jobs" stroke="#8B5CF6" strokeWidth={2} fill="url(#jobGrad)" dot={{ r:3, fill:"#8B5CF6" }}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:TEXT3 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:BLUE }}/> FOB (K USD)
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:TEXT3 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:"#8B5CF6" }}/> Jobs
              </div>
            </div>
          </div>
        </Card>

        {/* Status Bar Chart */}
        <Card>
          <SectionHeader title="Jobs by Status" sub="\u0e2a\u0e16\u0e32\u0e19\u0e30 shipment \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14" />
          <div style={{ padding:"16px 20px 8px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} margin={{ top:4, right:8, left:-16, bottom:0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false}/>
                <XAxis type="number" tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="status" tick={{ fill:TEXT3, fontSize:13 }} axisLine={false} tickLine={false} width={80}/>
                <Tooltip
                  contentStyle={{ background:W, border:`1px solid ${BORDER}`, borderRadius:8, fontSize:14, boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}
                  cursor={{ fill:"#F9FAFB" }}
                />
                <Bar dataKey="count" radius={[0,4,4,0]} maxBarSize={20}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="dashboard-split">
        <Card>
          <SectionHeader title="Recent shipments" right={<Btn variant="ghost" onClick={() => onNav("shipments")} style={{ fontSize:14 }}>View all \u2192</Btn>} />
          {recentUi.length === 0 && <div style={{ padding:"20px", fontSize:14, color:TEXT3, textAlign:"center" }}>\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35 shipment</div>}
          {recentUi.map((s,i) => (
            <div key={i} onClick={() => onNav("shipment_detail", s)} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"11px 20px", borderBottom:i<recentUi.length-1?`1px solid ${BORDER2}`:"none",
              cursor:"pointer",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
            onMouseLeave={e=>e.currentTarget.style.background=W}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:TEXT, fontFamily:MONO }}>{s.id}</span>
                  <Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"} />
                </div>
                <div style={{ fontSize:14, color:TEXT3 }}>{s.vessel} \u00b7 {s.fob}</div>
              </div>
              <Badge status={s.status} />
            </div>
          ))}
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card>
            <SectionHeader title="Jobs awaiting clearance" />
            {pendingUi.length === 0 && <div style={{ padding:"20px", fontSize:14, color:TEXT3, textAlign:"center" }}>All clear \u2713</div>}
            {pendingUi.slice(0,5).map((s,i) => (
              <div key={i} style={{ padding:"10px 18px", borderBottom:i<Math.min(pendingUi.length,5)-1?`1px solid ${BORDER2}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:TEXT, fontFamily:MONO }}>{s.id || s.jobNo}</span>
                  <Badge status={s.status} />
                </div>
                <div style={{ fontSize:14, color:TEXT3 }}>{s.fob} \u00b7 {s.date || s.createdAt?.substring(0,10)}</div>
              </div>
            ))}
          </Card>

          <Card>
            <SectionHeader title="Billing summary" />
            <div style={{ padding:"14px 18px" }}>
              {[
                { label:"Jobs this month", value: jobs.length>0 ? `${monthJobs.length} jobs` : "42 jobs", color:TEXT  },
                { label:"Rate per job",    value:"\u0e3f450 / job", color:TEXT2 },
                { label:"Est. this month", value: jobs.length>0 ? `\u0e3f${(monthJobs.length*450).toLocaleString()}` : "\u0e3f18,900", color:"#16A34A" },
                { label:"Outstanding",     value:"\u0e3f78,750", color:"#DC2626" },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                  <span style={{ fontSize:14, color:TEXT3 }}>{r.label}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:r.color }}>{r.value}</span>
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
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Shipments</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>{apiLoading ? "Loading…" : `${shown.length} records`}</p>
        </div>
        <Btn onClick={onNew}>+ New shipment</Btn>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
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
        <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead>
            <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
              {["Job ID","Type","Vessel","Container","HS Code","FOB","Items","Status","Date",""].map(h => (
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((s,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
                onMouseLeave={e=>e.currentTarget.style.background=W}
                onClick={() => onDetail(s)}>
                <td style={{ padding:"12px 16px", fontFamily:MONO, fontSize:14, fontWeight:700, color:TEXT }}>{s.id}</td>
                <td style={{ padding:"12px 16px" }}><Tag label={s.type} color={s.type==="Export"?"#2563EB":"#D97706"}/></td>
                <td style={{ padding:"12px 16px", color:TEXT2, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.vessel}</td>
                <td style={{ padding:"12px 16px", fontFamily:MONO, fontSize:14, color:TEXT2 }}>{s.container}</td>
                <td style={{ padding:"12px 16px", fontFamily:MONO, fontSize:14, color:"#2563EB", fontWeight:600 }}>{s.hs}</td>
                <td style={{ padding:"12px 16px", fontWeight:700, color:TEXT }}>{s.fob}</td>
                <td style={{ padding:"12px 16px", fontFamily:MONO, color:TEXT2 }}>{s.items||"—"}</td>
                <td style={{ padding:"12px 16px" }}><Badge status={s.status}/></td>
                <td style={{ padding:"12px 16px", color:TEXT3, fontSize:14 }}>{s.date}</td>
                <td style={{ padding:"12px 16px", color:BLUE, fontSize:14, fontWeight:600 }}>→</td>
              </tr>
            ))}
          </tbody>
        </table></div>
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

// ─── NEW SHIPMENT WIZARD ──────────────────────────────────────────
function NewShipment({ onBack, onCreated }) {
  const [step, setStep] = useState(1);
  const [submitMethod, setSubmitMethod] = useState("nsw");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractErr, setExtractErr] = useState("");
  const [extracted, setExtracted] = useState(null); // AI result
  const [uploadedFiles, setUploadedFiles] = useState({ invoice: null, packingList: null, booking: null });
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
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>New export shipment</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>ยื่นใบขนสินค้าขาออก · Export declaration wizard</p>
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

// ─── NSW TRACKING ─────────────────────────────────────────────────
function NSWTracking() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      setAllJobs(arr.length > 0 ? arr.map(mapJob) : SHIPMENTS);
      setLastUpdated(new Date());
    }).catch(() => setAllJobs(SHIPMENTS)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      jobsApi.list().then(data => {
        const arr = data?.data ?? (Array.isArray(data) ? data : []);
        if (arr.length > 0) setAllJobs(arr.map(mapJob));
        setLastUpdated(new Date());
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    jobsApi.list().then(data => {
      const arr = data?.data ?? (Array.isArray(data) ? data : []);
      if (arr.length > 0) setAllJobs(arr.map(mapJob));
      setLastUpdated(new Date());
    }).catch(() => {});
  };

  const active = allJobs.filter(s=>!["COMPLETED","DRAFT"].includes(s.status));

  return (
    <div>
      <div style={{ marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>NSW Tracking</h1>
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>
            NSW Thailand status \u00b7 \u0e2d\u0e31\u0e1b\u0e40\u0e14\u0e15\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14: {lastUpdated.toLocaleTimeString("th-TH", {hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            {loading && " \u00b7 Loading\u2026"}
            {!loading && ` \u00b7 ${active.length} jobs in progress`}
          </p>
        </div>
        <Btn variant="secondary" onClick={handleRefresh} style={{ fontSize:14, flexShrink:0 }}>Refresh</Btn>
      </div>

      <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:10, padding:"12px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:20 }}>
        {[
          { dot:"#22C55E", label:"NSW API", val:"Connected" },
          { dot:"#22C55E", label:"\u0e01\u0e23\u0e21\u0e28\u0e38\u0e25\u0e01\u0e32\u0e01\u0e23", val:"Online" },
          { dot:"#0EA5E9", label:"BoT Rate", val:"35.75 THB/USD" },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:s.dot }}/>
            <span style={{ fontSize:14, color:TEXT2 }}>{s.label}: <strong>{s.val}</strong></span>
            {i<2 && <span style={{ color:BORDER, marginLeft:12 }}>|</span>}
          </div>
        ))}
        <span style={{ marginLeft:"auto", fontSize:14, color:TEXT3 }}>Auto-refresh every 30s</span>
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
                  <span style={{ fontFamily:MONO, fontWeight:700, color:TEXT, fontSize:15 }}>{job.id}</span>
                  <Tag label={job.type} color={job.type==="Export"?"#2563EB":"#D97706"}/>
                  <span style={{ fontSize:14, color:TEXT3 }}>{job.vessel} · {job.fob}</span>
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
                        fontSize:13, fontWeight:700, color:s.done||s.active?"#fff":TEXT3,
                      }}>{s.done?"✓":s.active?"●":""}</div>
                      {si<steps.length-1 && <div style={{ flex:1, height:2, background:s.done?"#22C55E":BORDER }}/>}
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:s.active?BLUE:s.done?"#16A34A":TEXT3, marginTop:6, textAlign:"center", maxWidth:70 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {job.nsw && (
                <div style={{ padding:"8px 24px 14px", display:"flex", gap:20 }}>
                  <span style={{ fontSize:14, color:TEXT3 }}>NSW ref: <span style={{ fontFamily:MONO, color:"#2563EB" }}>{job.nsw}</span></span>
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
          <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>ใบขนสินค้าและเอกสารศุลกากร</p>
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
                  <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:14, color:TEXT2 }}>{s.id}</td>
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
                  <span style={{ color:TEXT3 }}>Job ref</span><span style={{ fontFamily:MONO, color:TEXT2 }}>{s.id}</span>
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
      <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      <input value={hsForm[key]} onChange={e => setHsForm(f => ({...f, [key]: e.target.value}))}
        style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}
        {...(opts||{})} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Master Data</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>HS codes · Exporters · Privilege codes · Customers</p>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:18 }}>
        {[
          ["hs","HS Codes"],["exporters","Exporters"],["privilege","Privilege codes"],["customers","Customers"],
        ].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 18px", background:"none", border:"none",
            borderBottom:`2px solid ${tab===id?BLUE:"transparent"}`,
            color:tab===id?BLUE:TEXT2, fontWeight:tab===id?700:400, fontSize:15, cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {/* HS Modal */}
      {hsModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:480, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:800, color:TEXT }}>
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
            <input placeholder="Search HS code or description..." style={{ border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", fontSize:14, width:320, background:W }}/>
            <Btn onClick={openAdd}>+ Add HS code</Btn>
          </div>
          <Card>
            <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["HS Code","Description (EN)","Thai description","Unit","Duty rate","Origin",""].map(h=>(
                    <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hsList.map((hs,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
                    onMouseLeave={e=>e.currentTarget.style.background=W}>
                    <td style={{ padding:"11px 16px", fontFamily:MONO, fontSize:14, color:"#2563EB", fontWeight:700 }}>{hs.code}</td>
                    <td style={{ padding:"11px 16px", color:TEXT, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{hs.desc}</td>
                    <td style={{ padding:"11px 16px", color:TEXT2, fontSize:14 }}>{hs.thDesc}</td>
                    <td style={{ padding:"11px 16px", color:TEXT2 }}>{hs.unit}</td>
                    <td style={{ padding:"11px 16px" }}>
                      <Tag label={hs.dutyRate} color={hs.dutyRate==="0%"?"#16A34A":"#DC2626"}/>
                    </td>
                    <td style={{ padding:"11px 16px" }}><Tag label={hs.origin} color="#16A34A"/></td>
                    <td style={{ padding:"11px 16px", display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => openEdit(hs)}>Edit</Btn>
                      <Btn variant="danger" style={{ fontSize:13, padding:"3px 8px" }} onClick={() => deleteHs(hs.code)}>Delete</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
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
                  <span style={{ fontSize:15, fontWeight:700, color:TEXT }}>{e.name}</span>
                  {e.default && <Tag label="Default" color="#16A34A"/>}
                </div>
                <div style={{ fontSize:14, color:TEXT3, marginBottom:2 }}>Tax ID: <span style={{ fontFamily:MONO }}>{e.taxId}</span></div>
                <div style={{ fontSize:14, color:TEXT3, marginBottom:2 }}>{e.address}</div>
                <div style={{ fontSize:14, color:TEXT3 }}>{e.tel}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="secondary" style={{ fontSize:14 }} onClick={() => alert(`แก้ไข: ${e.name}`)}>Edit</Btn>
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
                      <span style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:"#7C3AED" }}>{p.code}</span>
                      <span style={{ fontSize:14, color:TEXT }}>{p.name}</span>
                      <Tag label={p.type} color="#7C3AED"/>
                    </div>
                    <div style={{ fontSize:14, color:TEXT3 }}>{p.taxBenefit}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Tag label={p.active?"Active":"Inactive"} color={p.active?"#16A34A":"#DC2626"}/>
                  <Btn variant="ghost" style={{ fontSize:14 }} onClick={() => alert(`แก้ไข: ${p.code}`)}>Edit</Btn>
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
                  <div style={{ fontSize:15, fontWeight:600, color:TEXT, marginBottom:2 }}>{c.name}</div>
                  <div style={{ fontSize:14, color:TEXT3 }}>{c.country} · {c.jobs} shipments</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Tag label={c.code} color={BLUE}/>
                  <Btn variant="ghost" style={{ fontSize:14 }} onClick={() => alert(`แก้ไข: ${c.name}`)}>Edit</Btn>
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
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Billing</h1>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Service invoices from LogiConnect Co., Ltd.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Billing type",     value:"Per job",     color:BLUE  },
          { label:"Rate per job",     value:"฿450",        color:TEXT  },
          { label:"Outstanding",      value:"฿78,750",     color:"#DC2626" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:13, color:TEXT3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:MONO }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid-2">
        <Card>
          <SectionHeader title="Invoice history" />
          {INVOICES_FACTORY.map((inv,i) => (
            <div key={i} style={{ padding:"14px 20px", borderBottom:i<INVOICES_FACTORY.length-1?`1px solid ${BORDER2}`:"none", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:TEXT, marginBottom:4 }}>{inv.id}</div>
                <div style={{ fontSize:14, color:TEXT3 }}>{inv.period} · {inv.jobs} jobs</div>
                <div style={{ fontSize:14, color:TEXT3 }}>Issued: {inv.issued} · Due: {inv.due}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:MONO, color:inv.status==="paid"?"#16A34A":"#DC2626", marginBottom:6 }}>{inv.amount}</div>
                <Tag label={inv.status} color={inv.status==="paid"?"#16A34A":"#DC2626"}/>
                <div style={{ marginTop:8 }}>
                  <Btn variant="ghost" style={{ fontSize:13 }} onClick={() => {
                    const html = `<h2>Invoice ${inv.id}</h2>
                      <div className="table-wrapper"><table>
                        <tr><th style="text-align:left;width:160px">Invoice No.</th><td>${inv.id}</td></tr>
                        <tr><th style="text-align:left">Period</th><td>${inv.period}</td></tr>
                        <tr><th style="text-align:left">Jobs</th><td>${inv.jobs} jobs</td></tr>
                        <tr><th style="text-align:left">Amount</th><td><strong>${inv.amount}</strong></td></tr>
                        <tr><th style="text-align:left">Status</th><td>${inv.status.toUpperCase()}</td></tr>
                        <tr><th style="text-align:left">Issued</th><td>${inv.issued}</td></tr>
                        <tr><th style="text-align:left">Due</th><td>${inv.due}</td></tr>
                      </table></div>
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
                  <div style={{ fontFamily:MONO, fontSize:14, color:TEXT, fontWeight:600 }}>{s.id}</div>
                  <div style={{ fontSize:13, color:TEXT3, marginTop:2 }}>{s.date} · {s.fob}</div>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>฿450</span>
              </div>
            ))}
            <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, color:TEXT3 }}>Estimated invoice (5 jobs)</span>
              <span style={{ fontSize:16, fontWeight:800, color:TEXT }}>฿2,250</span>
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
      padding:"2px 8px", borderRadius:20, fontSize:13, fontWeight:700,
      background: failed?"#FEF2F2":`${meta.color}12`,
      color: failed?"#DC2626":meta.color,
      border:`1px solid ${failed?"#FECACA":`${meta.color}30`}`,
    }}>
      {meta.icon} {meta.label}
      {failed && <span style={{ marginLeft:2, fontSize:12 }}>✗</span>}
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
      <div className="grid-2">
        <Card>
          <SectionHeader title="เปลี่ยนรหัสผ่าน" />
          <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
            {[["รหัสผ่านปัจจุบัน","current"],["รหัสผ่านใหม่","next"],["ยืนยันรหัสผ่านใหม่","confirm"]].map(([l,k]) => (
              <div key={k}>
                <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                <input type="password" placeholder="••••••••" value={pwForm[k]}
                  onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{ width:"100%", background:"#FFFFFF", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, color:TEXT, boxSizing:"border-box" }}/>
              </div>
            ))}
            {pwErr && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:14, color:"#DC2626" }}>{pwErr}</div>}
            {pwOk  && <div style={{ padding:"8px 12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, fontSize:14, color:"#16A34A" }}>✓ เปลี่ยนรหัสผ่านสำเร็จ</div>}
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
                <span style={{ fontSize:14, color:TEXT3 }}>{l}</span>
                <span style={{ fontSize:14, fontWeight:600, color: l==="ISO 27001"?"#16A34A":TEXT }}>{v}</span>
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
                  padding:"4px 10px", borderRadius:20, fontSize:13, fontWeight:600, cursor:"pointer",
                  background: filter===f ? BLUE : "transparent",
                  color: filter===f ? "#fff" : TEXT2,
                  border:`1px solid ${filter===f ? BLUE : BORDER}`,
                }}>{f}</button>
              ))}
            </div>
          }
        />
        {loading && <div style={{ padding:"24px", textAlign:"center", fontSize:14, color:TEXT3 }}>Loading audit logs…</div>}
        {!loading && shown.length === 0 && <div style={{ padding:"24px", textAlign:"center", fontSize:14, color:TEXT3 }}>ยังไม่มีประวัติการใช้งาน</div>}
        {shown.length > 0 && (
          <div style={{ overflowX:"auto" }}>
            <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                  {["วันเวลา","Action","ผู้ใช้","IP Address","Status"].map(h => (
                    <th key={h} style={{ padding:"8px 16px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((log, i) => {
                  const dt = new Date(log.createdAt).toLocaleString("th-TH", { dateStyle:"short", timeStyle:"medium" });
                  const failed = log.status === "FAILED" || (log.detail && log.detail.error);
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${BORDER2}`, background: failed?"#FFFBEB":W }}
                      onMouseEnter={e=>e.currentTarget.style.background=ROW_HOVER}
                      onMouseLeave={e=>e.currentTarget.style.background=failed?"#FFFBEB":W}>
                      <td style={{ padding:"10px 16px", fontFamily:MONO, fontSize:13, color:TEXT3, whiteSpace:"nowrap" }}>{dt}</td>
                      <td style={{ padding:"10px 16px" }}>
                        <AuditActionBadge action={log.action} status={log.status} />
                        {log.entityId && <span style={{ marginLeft:6, fontSize:13, color:TEXT3, fontFamily:MONO }}>{log.entityId.substring(0,8)}…</span>}
                      </td>
                      <td style={{ padding:"10px 16px", fontSize:14, color:TEXT2 }}>
                        {log.actorEmail || "—"}
                      </td>
                      <td style={{ padding:"10px 16px", fontFamily:MONO, fontSize:13, color:TEXT2 }}>
                        {log.ipAddress || "—"}
                      </td>
                      <td style={{ padding:"10px 16px" }}>
                        <span style={{
                          padding:"2px 7px", borderRadius:20, fontSize:12, fontWeight:700,
                          background: failed?"#FEF2F2":"#F0FDF4",
                          color: failed?"#DC2626":"#16A34A",
                          border:`1px solid ${failed?"#FECACA":"#BBF7D0"}`,
                        }}>{failed?"FAILED":"SUCCESS"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
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
    <div className="dashboard-split">
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
              <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
              <input
                value={form[k]}
                readOnly={readonly}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ width:"100%", background: readonly?"#F3F4F6":"#FFFFFF", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, color: readonly?TEXT3:TEXT, boxSizing:"border-box", cursor: readonly?"not-allowed":"text" }}
              />
            </div>
          ))}
          {errMsg && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:14, color:"#DC2626" }}>{errMsg}</div>}
          {saved  && <div style={{ padding:"8px 12px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, fontSize:14, color:"#16A34A" }}>✓ บันทึกสำเร็จ</div>}
          <Btn onClick={handleSave} style={{ alignSelf:"flex-start" }}>{saving ? "Saving…" : "Save changes"}</Btn>
        </div>
      </Card>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <SectionHeader title="Service plan" />
          <div style={{ padding:"16px 20px" }}>
            <div style={{ background:BG, borderRadius:8, padding:"14px", border:`1px solid ${BORDER}`, marginBottom:12 }}>
              <div style={{ fontSize:13, color:TEXT3, marginBottom:4, textTransform:"uppercase", fontWeight:600 }}>Current plan</div>
              <div style={{ fontSize:18, fontWeight:800, color:TEXT }}>Standard</div>
              <div style={{ fontSize:14, color:TEXT3, marginTop:4 }}>฿450 per job · Per-job billing</div>
            </div>
            {[
              ["Status", cust?.status || "ACTIVE"],
              ["Customer code", cust?.code || "—"],
              ["Tax ID", form.taxId || "—"],
              ["T&C version", cust?.tcVersion || "—"],
            ].map(([l,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<3?`1px solid ${BORDER2}`:"none" }}>
                <span style={{ fontSize:14, color:TEXT3 }}>{l}</span>
                <span style={{ fontSize:14, fontWeight:600, color: l==="Status"&&v==="TRIAL"?"#D97706":TEXT }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsUsers() {
  const perms = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email:"", fullName:"", role:"CUSTOMER", password:"" });
  const [inviting, setInviting] = useState(false);
  const [inviteErr, setInviteErr] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(null); // { email, password }
  const [editModal, setEditModal] = useState(null); // { user, role }
  const [editRole, setEditRole] = useState("CUSTOMER");
  const [savingRole, setSavingRole] = useState(false);
  const [showInvitePw, setShowInvitePw] = useState(false);

  // Role options visible to the current user when inviting / editing
  // CUSTOMER_ADMIN (factory) → only factory-side roles
  // NKTech ADMIN → all roles
  const ROLE_OPTIONS = perms.isCustomerAdmin
    ? [
        { value:"CUSTOMER",       label:"ลูกค้า — ยื่น Shipment + ดูข้อมูลตัวเอง" },
        { value:"CUSTOMER_ADMIN", label:"โรงงาน Admin — จัดการ Users + Billing ของบริษัท" },
        { value:"VIEWER",         label:"Viewer — ดูได้อย่างเดียว" },
      ]
    : [
        { value:"CUSTOMER",       label:"ลูกค้า — ยื่น Shipment + ดูข้อมูลตัวเอง" },
        { value:"CUSTOMER_ADMIN", label:"โรงงาน Admin — จัดการ Users + Billing ของบริษัท" },
        { value:"STAFF",          label:"เจ้าหน้าที่ — ทำใบขน + NSW (NKTech)" },
        { value:"MANAGER",        label:"ผู้บริหาร — ดู Reports + อนุมัติ Billing (NKTech)" },
        { value:"TENANT_ADMIN",   label:"Admin — สิทธิ์เต็ม (NKTech)" },
        { value:"VIEWER",         label:"Viewer — ดูได้อย่างเดียว" },
      ];
  const [pwCopied, setPwCopied] = useState(false);

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
    if (!inviteForm.password || inviteForm.password.length < 8)
      return setInviteErr("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(inviteForm.password))
      return setInviteErr("รหัสผ่านต้องมีตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข");
    setInviting(true);
    try {
      await customerApi.inviteUser({ ...inviteForm });
      const savedEmail = inviteForm.email;
      const savedPw = inviteForm.password;
      setInviteModal(false);
      setInviteForm({ email:"", fullName:"", role:"USER", password:"" });
      setShowInvitePw(false);
      setInviteSuccess({ email: savedEmail, password: savedPw });
      loadUsers();
    } catch(e) {
      const m = e?.response?.data?.message;
      setInviteErr(Array.isArray(m) ? m.join(", ") : (m || "Invite failed"));
    } finally { setInviting(false); }
  };

  const copyPw = () => {
    if (inviteSuccess?.password) {
      navigator.clipboard?.writeText(inviteSuccess.password).catch(() => {});
      setPwCopied(true);
      setTimeout(() => setPwCopied(false), 2000);
    }
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
      {/* Invite Success Dialog */}
      {inviteSuccess && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:420, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
              <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:TEXT }}>Invite สำเร็จ!</h3>
              <p style={{ fontSize:14, color:TEXT2, margin:0 }}>แชร์ข้อมูลด้านล่างให้ผู้ใช้เพื่อเข้าสู่ระบบครั้งแรก</p>
            </div>
            <div style={{ background:"#F0F9FF", border:"1px solid #BAE6FD", borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
                <span style={{ color:TEXT3, fontWeight:600 }}>EMAIL</span>
                <span style={{ color:TEXT, fontWeight:600 }}>{inviteSuccess.email}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14 }}>
                <span style={{ color:TEXT3, fontWeight:600 }}>รหัสผ่าน</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontFamily:"monospace", fontWeight:700, color:TEXT, fontSize:16, letterSpacing:1 }}>
                    {inviteSuccess.password}
                  </span>
                  <button onClick={copyPw} style={{ background: pwCopied ? "#DCFCE7":"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:6, padding:"3px 10px", fontSize:14, fontWeight:600, color: pwCopied ? "#16A34A":BLUE, cursor:"pointer" }}>
                    {pwCopied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
            <p style={{ fontSize:14, color:TEXT3, margin:"0 0 16px", textAlign:"center" }}>⚠️ บันทึกรหัสผ่านนี้ไว้ก่อนปิด — ระบบจะไม่แสดงอีก</p>
            <Btn style={{ width:"100%" }} onClick={() => setInviteSuccess(null)}>ปิด</Btn>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:420, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:800, color:TEXT }}>+ Invite User</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["Email *","email","email"],["Full Name","fullName","text"]].map(([l,k,t]) => (
                <div key={k}>
                  <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</label>
                  <input type={t} value={inviteForm[k]} onChange={e => setInviteForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>Temporary Password *</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={showInvitePw ? "text" : "password"}
                    value={inviteForm.password}
                    onChange={e => setInviteForm(f=>({...f, password:e.target.value}))}
                    placeholder="อย่างน้อย 8 ตัว · A-Z a-z 0-9"
                    style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 40px 9px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}/>
                  <button type="button" onClick={() => setShowInvitePw(v=>!v)}
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:TEXT3, fontSize:15 }}>
                    {showInvitePw ? "🙈" : "👁"}
                  </button>
                </div>
                <p style={{ fontSize:14, color:TEXT3, margin:"4px 0 0" }}>ส่งรหัสผ่านนี้ให้ผู้ใช้เพื่อ login ครั้งแรก และแนะนำให้เปลี่ยนทันที</p>
              </div>
              <div>
                <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(f=>({...f,role:e.target.value}))}
                  style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:14, background:"#FFFFFF", boxSizing:"border-box" }}>
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {inviteErr && <div style={{ padding:"8px 12px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:14, color:"#DC2626" }}>{inviteErr}</div>}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={() => { setInviteModal(false); setInviteErr(""); setInviteForm({ email:"", fullName:"", role:"USER", password:"" }); }}>Cancel</Btn>
              <Btn onClick={handleInvite}>{inviting ? "Inviting…" : "Send invite"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editModal && (
        <div style={{ position:"fixed", inset:0, background:"#00000060", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:W, borderRadius:16, padding:28, width:360, maxWidth:"95vw", boxShadow:"0 20px 60px #0003" }}>
            <h3 style={{ margin:"0 0 16px", fontSize:18, fontWeight:800, color:TEXT }}>Edit Role</h3>
            <p style={{ fontSize:15, color:TEXT2, margin:"0 0 16px" }}>{editModal.profile?.email || editModal.email || "—"}</p>
            <div>
              <label style={{ fontSize:14, color:TEXT3, fontWeight:600, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)}
                style={{ width:"100%", border:`1px solid ${BORDER}`, borderRadius:8, padding:"9px 12px", fontSize:15, background:"#FFFFFF" }}>
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
        {loading && <div style={{ padding:"20px", textAlign:"center", fontSize:14, color:TEXT3 }}>Loading users…</div>}
        {!loading && users.length === 0 && <div style={{ padding:"20px", textAlign:"center", fontSize:14, color:TEXT3 }}>ยังไม่มีผู้ใช้ในระบบ</div>}
        {users.length > 0 && (
          <div className="table-wrapper"><table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead>
              <tr style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
                {["Name","Email","Role","Status",""].map(h=>(
                  <th key={h} style={{ padding:"9px 18px", textAlign:"left", fontSize:13, fontWeight:700, color:TEXT3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
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
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"#0EA5E915", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, color:BLUE }}>
                          {name.charAt(0)}
                        </div>
                        <span style={{ fontSize:15, fontWeight:600, color:TEXT }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"13px 18px", color:TEXT2 }}>{email}</td>
                    <td style={{ padding:"13px 18px" }}>
                      <RoleBadge role={role}/>
                    </td>
                    <td style={{ padding:"13px 18px" }}>
                      <Tag label="Active" color="#16A34A"/>
                    </td>
                    <td style={{ padding:"13px 18px", display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ fontSize:13 }} onClick={() => openEditRole(u)}>Edit role</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
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
            <span style={{ fontSize:15, color:TEXT }}>{label}</span>
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

function Settings({ canManageUsers = true, canEditCompany = true, canViewSecurity = false, readOnly = false }) {
  const [tab, setTab] = useState("company");

  // Build visible tabs based on permissions
  const allTabs = [
    { id:"company",       label:"Company",       show: true },
    { id:"users",         label:"Users",         show: canManageUsers },
    { id:"notifications", label:"Notifications", show: true },
    { id:"security",      label:"Security",      show: canViewSecurity },
  ].filter(t => t.show);

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:TEXT }}>Settings</h1>
          {readOnly && (
            <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:4,
              background:"#FFF7ED", color:"#D97706", border:"1px solid #FDE68A" }}>
              👁 View Only
            </span>
          )}
        </div>
        <p style={{ margin:"3px 0 0", fontSize:14, color:TEXT3 }}>Account · notifications · users · security</p>
      </div>

      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${BORDER}`, marginBottom:18 }}>
        {allTabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"10px 18px", background:"none", border:"none",
            borderBottom:`2px solid ${tab===id?BLUE:"transparent"}`,
            color:tab===id?BLUE:TEXT2, fontWeight:tab===id?700:400, fontSize:15, cursor:"pointer",
          }}>{label}</button>
        ))}
      </div>

      {tab==="company"       && <SettingsCompany readOnly={readOnly || !canEditCompany} />}
      {tab==="users"         && canManageUsers && <SettingsUsers />}
      {tab==="notifications" && <SettingsNotifications />}
      {tab==="security"      && canViewSecurity && <SettingsSecurity />}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  const auth = useContext(AuthContext);
  const perms = usePermissions();
  const [screen, setScreen] = useState("dashboard");
  const [detailJob, setDetailJob] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Show register / login screen if not authenticated
  if (!auth?.token) {
    if (showRegister) return <RegisterScreen onBack={() => setShowRegister(false)} />;
    return <LoginScreen onRegister={() => setShowRegister(true)} />;
  }

  if (screen === "superadmin" && perms.canViewSuperAdmin) {
    return <SuperAdminConsole onExit={() => setScreen("dashboard")} />;
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

  // ─── Screen access guard ──────────────────────────────────────────
  const AccessDenied = () => (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:16 }}>
      <div style={{ fontSize:48 }}>🔒</div>
      <div style={{ fontSize:20, fontWeight:700, color:TEXT }}>ไม่มีสิทธิ์เข้าถึงหน้านี้</div>
      <div style={{ fontSize:14, color:TEXT2 }}>บัญชีของคุณ (<RoleBadge role={auth?.user?.role}/>) ไม่มีสิทธิ์ดูส่วนนี้</div>
      <button onClick={() => setScreen("dashboard")} style={{
        marginTop:8, padding:"8px 20px", background:BLUE, color:"#fff",
        border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer",
      }}>← กลับ Dashboard</button>
    </div>
  );

  const content = () => {
    switch(screen) {
      case "dashboard":       return <Dashboard onNav={handleNav}/>;
      case "shipments":       return <ShipmentList onNew={() => handleNav("new")} onDetail={job => handleNav("shipment_detail",job)}/>;
      case "shipment_detail": return <ShipmentDetail job={detailJob} onBack={() => setScreen("shipments")}/>;
      case "new":             return perms.canCreateShipment
                                ? <NewShipment onBack={() => setScreen("shipments")} onCreated={() => setScreen("shipments")}/>
                                : <AccessDenied/>;
      case "nsw":             return <NSWTracking/>;
      case "declarations":    return perms.canViewDeclarations ? <Declarations readOnly={perms.isReadOnly("declarations")}/> : <AccessDenied/>;
      case "master":          return perms.canViewMasterData   ? <MasterData   readOnly={perms.isReadOnly("master")}/>       : <AccessDenied/>;
      case "billing":         return perms.canViewBilling      ? <Billing/>                                                  : <AccessDenied/>;
      case "reports":         return <Reports/>;
      case "settings":        return perms.canViewSettings     ? <Settings canManageUsers={perms.canManageUsers} canEditCompany={perms.canEditCompanySettings} canViewSecurity={perms.canViewSecurity} readOnly={perms.isReadOnly("settings")}/> : <AccessDenied/>;
      default: return null;
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:BG }}>
      <Sidebar active={screen} onNav={handleNav}/>
      <main style={{ flex:1, padding:"24px 32px", overflowY:"auto", minHeight:"100vh" }}>
        {content()}
      </main>
    </div>
  );
}
