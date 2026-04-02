import React from "react";
import { STATUS_COLORS } from "../../theme";

const STATUS = STATUS_COLORS;

// ─── Shared helpers ───────────────────────────────────────────────
export const W       = "var(--bg-card)";
export const BG      = "var(--bg-main)";
export const BORDER  = "var(--border-main)";
export const BORDER2 = "var(--border-light)";
export const TEXT    = "var(--text-main)";
export const TEXT2   = "var(--text-muted)";
export const TEXT3   = "var(--text-light)";
export const BLUE    = "var(--primary)";
export const MONO    = "var(--mono)";
export const ROW_HOVER = "var(--border-light)";

// ─── Utilities ────────────────────────────────────────────────────
export function downloadCSV(filename, data, columns) {
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

export function printHTML(title, html) {
  const win = window.open('', '_blank', 'width=800,height=600');
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:20px}table{border-collapse:collapse;width:100%}
    td,th{border:1px solid #ccc;padding:8px;font-size:12px}th{background:#f5f5f5;font-weight:bold}
    h2{font-size:16px}@media print{.no-print{display:none}}</style></head>
    <body>${html}<div class="no-print" style="margin-top:20px">
    <button onclick="window.print()">Print</button></div></body></html>`);
  win.document.close();
}

export function Badge({ status }) {
  const s = STATUS[status] || STATUS.DRAFT;
  return (
    <span style={{
      display:"inline-block", padding:"2px 9px", borderRadius:6,
      fontSize:13, fontWeight:700, letterSpacing:"0.4px",
      color:s.color, background:s.bg, border:`1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

export function Card({ children, style={} }) {
  return <div style={{ background:W, border:`1px solid ${BORDER}`, borderRadius:8, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", ...style }}>{children}</div>;
}

export function SectionHeader({ title, sub, right }) {
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

export function Btn({ children, variant="primary", onClick, style={} }) {
  const base = { border:"none", borderRadius:8, padding:"8px 16px", fontSize:14, fontWeight:600, cursor:"pointer", transition:"all 0.15s", ...style };
  const styles = {
    primary:   { background:BLUE,   color:"#fff" },
    secondary: { background:"none", color:TEXT2,  border:`1px solid ${BORDER}` },
    ghost:     { background:"none", color:BLUE },
    danger:    { background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA" },
  };
  return <button onClick={onClick} style={{ ...base, ...styles[variant] }}>{children}</button>;
}

export function Tag({ label, color="#0EA5E9" }) {
  return (
    <span style={{
      display:"inline-block", padding:"1px 8px", borderRadius:4,
      fontSize:13, fontWeight:700, background:`${color}15`, color, border:`1px solid ${color}33`,
    }}>{label}</span>
  );
}

// ─── Approval Badge ───────────────────────────────────────────────
export const APPROVAL = {
  NONE:     { label:"—",          color:"#94A3B8", bg:"transparent", border:"transparent" },
  PENDING:  { label:"รออนุมัติ",  color:"#D97706", bg:"#FFFBEB",     border:"#FDE68A" },
  APPROVED: { label:"อนุมัติแล้ว", color:"#16A34A", bg:"#F0FDF4",     border:"#BBF7D0" },
  REJECTED: { label:"ถูกปฏิเสธ",  color:"#DC2626", bg:"#FEF2F2",     border:"#FECACA" },
};

export function ApprovalBadge({ status }) {
  const s = APPROVAL[status] || APPROVAL.NONE;
  if (status === "NONE") return <span style={{ color:"#94A3B8", fontSize:13 }}>—</span>;
  return (
    <span style={{
      display:"inline-block", padding:"2px 9px", borderRadius:6,
      fontSize:13, fontWeight:700, letterSpacing:"0.4px",
      color:s.color, background:s.bg, border:`1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

// ─── Read-only Banner (D1) ────────────────────────────────────────
export function ReadOnlyBanner() {
  return (
    <div style={{
      background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:8,
      padding:"10px 20px", marginBottom:16, display:"flex", alignItems:"center", gap:10,
    }}>
      <span style={{ fontSize:18 }}>🔒</span>
      <span style={{ fontSize:14, fontWeight:600, color:"#92400E" }}>
        โหมดอ่านอย่างเดียว — บัญชีของคุณไม่สามารถแก้ไขข้อมูลในหน้านี้ได้
      </span>
    </div>
  );
}

// ─── Role badge helper ─────────────────────────────────────────────
export function RoleBadge({ role }) {
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
