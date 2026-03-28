import { useState, useEffect } from "react";

const RESPONSIVE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; font-size: 15px; }
  .rsp-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .rsp-grid-2 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
  .rsp-grid-2-eq { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .rsp-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .rsp-grid-form { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .sidebar-overlay { display: none; }
  .nav-btn:hover { background: rgba(0,201,167,0.1) !important; color: #00C9A7 !important; }
  .card-hover:hover { border-color: #2A4070 !important; box-shadow: 0 4px 24px rgba(0,0,0,0.25) !important; }
  tr.row-hover:hover td { background: #172444; }
  @media (max-width: 900px) {
    .rsp-grid-4 { grid-template-columns: repeat(2,1fr); }
    .rsp-grid-2, .rsp-grid-2-eq, .rsp-grid-form { grid-template-columns: 1fr; }
    .rsp-grid-3 { grid-template-columns: 1fr 1fr; }
    .main-sidebar { transform: translateX(-100%); transition: transform 0.25s ease; position: fixed !important; z-index: 200; height: 100vh; }
    .main-sidebar.open { transform: translateX(0); }
    .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 199; }
    .hamburger-btn { display: flex !important; }
    .main-content { padding: 20px !important; }
  }
  @media (max-width: 600px) {
    .rsp-grid-4 { grid-template-columns: 1fr 1fr; }
    .rsp-grid-3 { grid-template-columns: 1fr; }
    .main-content { padding: 14px !important; }
  }
  .hamburger-btn { display: none; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; padding: 8px; }
`;

// ─── Design tokens ───────────────────────────────────────────────
const C = {
  bg0: "#060D1A",
  bg1: "#0B1525",
  bg2: "#0F1D30",
  bg3: "#152238",
  border: "#1A2B42",
  borderHi: "#243D5C",
  teal: "#00D4B0",
  tealDim: "#00A88A",
  tealBg: "rgba(0,212,176,0.09)",
  amber: "#F59E0B",
  amberBg: "rgba(245,158,11,0.1)",
  blue: "#60A5FA",
  blueBg: "rgba(96,165,250,0.1)",
  red: "#F87171",
  redBg: "rgba(248,113,113,0.09)",
  green: "#34D399",
  greenBg: "rgba(52,211,153,0.09)",
  purple: "#C084FC",
  purpleBg: "rgba(192,132,252,0.1)",
  text: "#E2E8F0",
  textMid: "#94A3B8",
  textDim: "#4E6480",
  mono: "'JetBrains Mono', 'Courier New', monospace",
};

// ─── Mock data ────────────────────────────────────────────────────
const TENANTS = [
  {
    id: "T001", code: "THEL", name: "บริษัท ไทยอิเล็กทรอนิกส์ จำกัด",
    taxId: "0105561000123", contact: "คุณสมชาย ใจดี", email: "somchai@thaielectronics.co.th",
    billingType: "per_job", termDays: null, pricePerJob: 450,
    status: "active", plan: "Standard",
    stats: { jobsMonth: 42, jobsTotal: 318, revenue: 18900, outstanding: 2250, users: 3 },
    apiStatus: { nsw: "connected", customs: "connected" },
    joined: "2025-09-01",
  },
  {
    id: "T002", code: "SAPT", name: "บริษัท สยามออโต้ พาร์ท จำกัด",
    taxId: "0105548009876", contact: "คุณวิภา รักดี", email: "vipa@siamautoPart.co.th",
    billingType: "term", termDays: 30, pricePerJob: 420,
    status: "active", plan: "Professional",
    stats: { jobsMonth: 28, jobsTotal: 204, revenue: 11760, outstanding: 8400, users: 5 },
    apiStatus: { nsw: "connected", customs: "connected" },
    joined: "2025-11-15",
  },
  {
    id: "T003", code: "MITR", name: "บริษัท มิตรผล กรุ๊ป จำกัด",
    taxId: "0105519004321", contact: "คุณธนากร มั่งมี", email: "thanakorn@mitrphol.com",
    billingType: "term", termDays: 15, pricePerJob: 480,
    status: "active", plan: "Standard",
    stats: { jobsMonth: 17, jobsTotal: 89, revenue: 8160, outstanding: 3360, users: 2 },
    apiStatus: { nsw: "connected", customs: "pending" },
    joined: "2026-01-10",
  },
  {
    id: "T004", code: "TPAK", name: "บริษัท ไทยแพ็กเกจจิ้ง จำกัด",
    taxId: "0105560007890", contact: "คุณปิยะ สุขใจ", email: "piya@thaipack.co.th",
    billingType: "per_job", termDays: null, pricePerJob: 450,
    status: "trial", plan: "Trial",
    stats: { jobsMonth: 3, jobsTotal: 3, revenue: 0, outstanding: 0, users: 1 },
    apiStatus: { nsw: "pending", customs: "pending" },
    joined: "2026-03-10",
  },
  {
    id: "T005", code: "BKEX", name: "บริษัท กรุงเทพเอ็กซ์พอร์ต จำกัด",
    taxId: "0105540001234", contact: "คุณสุนีย์ แสงทอง", email: "sunee@bkkexport.co.th",
    billingType: "term", termDays: 30, pricePerJob: 420,
    status: "suspended", plan: "Standard",
    stats: { jobsMonth: 0, jobsTotal: 56, revenue: 0, outstanding: 12600, users: 2 },
    apiStatus: { nsw: "disconnected", customs: "disconnected" },
    joined: "2025-07-20",
  },
  {
    id: "T006", code: "HHA", name: "HHA (THAILAND) CO., LTD.",
    taxId: "0105564012345", contact: "คุณนภา ศรีสุข", email: "napa@hha-thailand.com",
    billingType: "per_job", termDays: null, pricePerJob: 450,
    status: "active", plan: "Standard",
    stats: { jobsMonth: 4, jobsTotal: 12, revenue: 5400, outstanding: 1800, users: 2 },
    apiStatus: { nsw: "connected", customs: "connected" },
    joined: "2026-02-15",
  },
  {
    id: "T007", code: "DKSH", name: "บริษัท ดีเคเอสเอช (ประเทศไทย) จำกัด",
    taxId: "0105535012678", contact: "คุณวรรณา พัฒนกุล", email: "wanna@dksh.co.th",
    billingType: "term", termDays: 30, pricePerJob: 480,
    status: "active", plan: "Professional",
    stats: { jobsMonth: 15, jobsTotal: 67, revenue: 7200, outstanding: 4320, users: 4 },
    apiStatus: { nsw: "connected", customs: "connected" },
    joined: "2026-01-05",
  },
];

const INVOICES = [
  { id: "INV-2026-0089", tenantCode: "THEL", tenantName: "ไทยอิเล็กทรอนิกส์", jobs: 5, amount: 2250, status: "pending", due: "2026-03-25", issued: "2026-03-20" },
  { id: "INV-2026-0088", tenantCode: "SAPT", tenantName: "สยามออโต้ พาร์ท", jobs: 20, amount: 8400, status: "pending", due: "2026-04-01", issued: "2026-03-02" },
  { id: "INV-2026-0087", tenantCode: "MITR", tenantName: "มิตรผล กรุ๊ป", jobs: 7, amount: 3360, status: "overdue", due: "2026-03-15", issued: "2026-03-01" },
  { id: "INV-2026-0086", tenantCode: "BKEX", tenantName: "กรุงเทพเอ็กซ์พอร์ต", jobs: 30, amount: 12600, status: "overdue", due: "2026-03-01", issued: "2026-02-01" },
  { id: "INV-2026-0085", tenantCode: "THEL", tenantName: "ไทยอิเล็กทรอนิกส์", jobs: 42, amount: 18900, status: "paid", due: "2026-03-05", issued: "2026-02-28" },
  { id: "INV-2026-0084", tenantCode: "SAPT", tenantName: "สยามออโต้ พาร์ท", jobs: 25, amount: 10500, status: "paid", due: "2026-03-01", issued: "2026-02-01" },
  { id: "INV-2026-0090", tenantCode: "HHA", tenantName: "HHA (THAILAND)", jobs: 4, amount: 1800, status: "pending", due: "2026-04-05", issued: "2026-03-22" },
  { id: "INV-2026-0091", tenantCode: "DKSH", tenantName: "ดีเคเอสเอช", jobs: 15, amount: 7200, status: "pending", due: "2026-04-10", issued: "2026-03-15" },
];

const JOBS_RECENT = [
  { id: "SH-2026-0244", tenant: "HHA",  type: "Import", vessel: "SITC GUANGXI V.2403S",  fob: "CNY 434,999", status: "CUSTOMS_REVIEW", time: "5 min ago" },
  { id: "SH-2026-0243", tenant: "THEL", type: "Export", vessel: "MSC AURORA V.124",       fob: "USD 128,450", status: "CLEARED",  time: "10 min ago" },
  { id: "SH-2026-0242", tenant: "DKSH", type: "Import", vessel: "COSCO SHIPPING V.88",    fob: "EUR 67,300",  status: "NSW_PROC", time: "25 min ago" },
  { id: "SH-2026-0241", tenant: "SAPT", type: "Export", vessel: "EVER GIVEN V.89",         fob: "USD 87,200",  status: "SUBMITTED", time: "1h ago" },
  { id: "SH-2026-0240", tenant: "HHA",  type: "Import", vessel: "OOCL DALIAN V.015N",     fob: "CNY 286,543", status: "CLEARED",  time: "2h ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────
const fmt = {
  thb: (n) => `฿${n.toLocaleString()}`,
  pct: (a, b) => `${Math.round((a / b) * 100)}%`,
};

function Pill({ label, color, bg, border }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 11px", borderRadius: 20,
      fontSize:14, fontWeight: 700, letterSpacing: "0.4px",
      color, background: bg, border: `1px solid ${border || color + "55"}`,
      textTransform: "uppercase",
    }}>{label}</span>
  );
}

function StatusPill({ status }) {
  const map = {
    active:       { label: "Active",       color: C.green,  bg: C.greenBg },
    trial:        { label: "Trial",        color: C.amber,  bg: C.amberBg },
    suspended:    { label: "Suspended",    color: C.red,    bg: C.redBg },
    connected:    { label: "Connected",    color: C.teal,   bg: C.tealBg },
    pending:      { label: "Pending",      color: C.amber,  bg: C.amberBg },
    disconnected: { label: "Offline",      color: C.red,    bg: C.redBg },
    paid:         { label: "Paid",         color: C.green,  bg: C.greenBg },
    overdue:      { label: "Overdue",      color: C.red,    bg: C.redBg },
    CLEARED:      { label: "Cleared",      color: C.green,  bg: C.greenBg },
    NSW_PROC:     { label: "NSW Proc.",    color: C.blue,   bg: C.blueBg },
    REVIEW:       { label: "Review",       color: C.amber,  bg: C.amberBg },
    SUBMITTED:    { label: "Submitted",    color: C.purple, bg: C.purpleBg },
    DRAFT:        { label: "Draft",        color: C.textDim, bg: "rgba(71,85,105,0.15)" },
  };
  const c = map[status] || map.active;
  return <Pill label={c.label} color={c.color} bg={c.bg} />;
}

function Card({ children, style = {} }) {
  return (
    <div className="card-hover" style={{
      background: C.bg2, border: `1px solid ${C.border}`,
      borderRadius: 16, transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      ...style,
    }}>{children}</div>
  );
}

function CardHeader({ title, sub, action }) {
  return (
    <div style={{
      padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize:17, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>{title}</div>
        {sub && <div style={{ fontSize:14, color: C.textDim, marginTop: 3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value, sub, color = C.teal }) {
  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ fontSize:14, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight: 800, color, fontFamily: C.mono, marginBottom: 5, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize:14, color: C.textDim }}>{sub}</div>}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────
const NAV = [
  { id: "overview",  icon: "◈", label: "Overview" },
  { id: "tenants",   icon: "⊞", label: "Tenants" },
  { id: "billing",   icon: "◧", label: "Billing" },
  { id: "jobs",      icon: "≡", label: "All Jobs" },
  { id: "system",    icon: "⊙", label: "System" },
  { id: "new_tenant",icon: "+", label: "Add Tenant" },
];

function Sidebar({ active, onNav, onClose, onExit }) {
  return (
    <div className="main-sidebar" style={{
      width: 230, background: C.bg0, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Brand */}
      <div style={{ padding: "24px 22px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDim})`,
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize:20, color: C.bg0,
            boxShadow: `0 0 16px ${C.teal}44`,
          }}>⚓</div>
          <div>
            <div style={{ fontFamily: C.mono, fontSize:14, fontWeight: 700, color: C.teal, letterSpacing: "1px" }}>CUSTOMS-EDOC</div>
            <div style={{ fontSize:14, color: C.textDim, marginTop: 2 }}>Super Admin Console</div>
          </div>
        </div>
      </div>

      {/* Operator badge */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ background: C.bg3, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.borderHi}` }}>
          <div style={{ fontSize:12, color: C.teal, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Operator</div>
          <div style={{ fontSize:15, color: C.text, fontWeight: 600 }}>LogiConnect Co., Ltd.</div>
          <div style={{ fontSize:14, color: C.textDim, marginTop: 3 }}>admin@logiconnect.co.th</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 12px" }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} className="nav-btn" onClick={() => { onNav(item.id); onClose && onClose(); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 14px", borderRadius: 10, marginBottom: 3,
              background: isActive ? C.tealBg : "transparent",
              border: `1px solid ${isActive ? C.teal + "55" : "transparent"}`,
              color: isActive ? C.teal : C.textMid,
              cursor: "pointer", textAlign: "left",
              fontSize:16, fontWeight: isActive ? 600 : 400,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize:17, width: 20, textAlign: "center", fontFamily: C.mono }}>{item.icon}</span>
              {item.label}
              {item.id === "billing" && (
                <span style={{
                  marginLeft: "auto", background: C.red, color: "#fff",
                  borderRadius: 10, padding: "2px 7px", fontSize:13, fontWeight: 700,
                }}>2</span>
              )}
            </button>
          );
        })}
      </nav>

      {onExit && (
        <div style={{ padding: "12px 16px" }}>
          <button onClick={onExit} onMouseEnter={e => { e.currentTarget.style.background = C.bg3; e.currentTarget.style.color = C.text; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; }} style={{
            width: "100%", padding: "10px", borderRadius: 8,
            background: "transparent", border: `1px solid ${C.borderHi}`,
            color: C.textMid, cursor: "pointer", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
            transition: "all 0.15s"
          }}>
            ⎋ Exit to Portal
          </button>
        </div>
      )}

      {/* System status */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
        {[
          { label: "NSW API", ok: true },
          { label: "Customs Portal", ok: true },
          { label: "BoT Rate API", ok: true },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.ok ? C.green : C.red, flexShrink: 0 }} />
            <span style={{ fontSize:14, color: C.textDim }}>{s.label}</span>
          </div>
        ))}
        <div style={{ fontSize:12, color: C.textDim, marginTop: 6, fontFamily: C.mono }}>v2.0.0 · ISO 27001</div>
      </div>
    </div>
  );
}

// ─── OVERVIEW PAGE ────────────────────────────────────────────────
function OverviewPage({ onNav }) {
  const totalRevMonth = TENANTS.reduce((a, t) => a + t.stats.revenue, 0);
  const totalOutstanding = TENANTS.reduce((a, t) => a + t.stats.outstanding, 0);
  const totalJobs = TENANTS.reduce((a, t) => a + t.stats.jobsMonth, 0);
  const activeCount = TENANTS.filter(t => t.status === "active").length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>System Overview</h1>
        <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim, fontFamily: C.mono }}>March 2026 · All tenants</p>
      </div>

      {/* KPI row */}
      <div className="rsp-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Active tenants", value: activeCount, sub: `${TENANTS.length} total registered`, color: C.teal },
          { label: "Jobs this month", value: totalJobs, sub: "Across all factories", color: C.blue },
          { label: "Revenue (Mar)", value: fmt.thb(totalRevMonth * 35), sub: "≈ " + fmt.thb(totalRevMonth * 35) + " THB", color: C.green },
          { label: "Outstanding", value: fmt.thb(totalOutstanding * 35), sub: "2 overdue invoices", color: C.red },
        ].map((k, i) => (
          <Card key={i}>
            <Stat label={k.label} value={k.value} sub={k.sub} color={k.color} />
          </Card>
        ))}
      </div>

      <div className="rsp-grid-2" style={{ marginBottom: 16 }}>
        {/* Tenant summary table */}
        <Card>
          <CardHeader title="Tenant summary" sub="All registered factories" action={
            <button onClick={() => onNav("tenants")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize:14, color: C.textMid, cursor: "pointer" }}>View all →</button>
          } />
          <div>
            {TENANTS.map((t, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "32px 1fr 80px 80px 70px",
                alignItems: "center", gap: 8,
                padding: "10px 20px", borderBottom: i < TENANTS.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: C.bg3, border: `1px solid ${C.borderHi}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize:12, fontFamily: C.mono, fontWeight: 700, color: C.teal,
                }}>{t.code}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div style={{ fontSize:13, color: C.textDim, marginTop: 1 }}>{t.stats.jobsMonth} jobs · {t.billingType === "per_job" ? "Per job" : `${t.termDays}-day term`}</div>
                </div>
                <div style={{ fontSize:14, fontFamily: C.mono, color: C.green, textAlign: "right" }}>฿{(t.stats.revenue * 35).toLocaleString()}</div>
                <div style={{ textAlign: "right" }}><StatusPill status={t.status} /></div>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.apiStatus.nsw === "connected" ? C.teal : C.red }} title="NSW" />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.apiStatus.customs === "connected" ? C.teal : t.apiStatus.customs === "pending" ? C.amber : C.red }} title="Customs" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Billing alerts */}
          <Card>
            <CardHeader title="Billing alerts" />
            <div style={{ padding: "4px 0" }}>
              {INVOICES.filter(v => v.status !== "paid").map((inv, i) => (
                <div key={i} style={{
                  padding: "10px 18px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize:14, fontFamily: C.mono, color: C.textMid }}>{inv.id}</div>
                    <div style={{ fontSize:14, color: C.text, fontWeight: 500, marginTop: 2 }}>{inv.tenantName}</div>
                    <div style={{ fontSize:13, color: C.textDim, marginTop: 1 }}>Due: {inv.due}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize:15, fontWeight: 700, fontFamily: C.mono, color: inv.status === "overdue" ? C.red : C.amber }}>฿{(inv.amount * 35).toLocaleString()}</div>
                    <div style={{ marginTop: 4 }}><StatusPill status={inv.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent jobs */}
          <Card>
            <CardHeader title="Recent jobs" sub="All tenants" />
            <div>
              {JOBS_RECENT.slice(0, 4).map((j, i) => (
                <div key={i} style={{
                  padding: "8px 18px", borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: C.mono, fontSize:14, color: C.textMid }}>{j.id}</span>
                      <span style={{
                        fontSize:12, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                        background: j.type === "Export" ? C.blueBg : C.amberBg,
                        color: j.type === "Export" ? C.blue : C.amber,
                        border: `1px solid ${j.type === "Export" ? C.blue + "44" : C.amber + "44"}`,
                      }}>{j.type}</span>
                    </div>
                    <div style={{ fontSize:13, color: C.textDim, marginTop: 2 }}>{j.tenant} · {j.time}</div>
                  </div>
                  <StatusPill status={j.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── TENANT LIST PAGE ─────────────────────────────────────────────
function TenantListPage({ onSelect, onNew }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? TENANTS : TENANTS.filter(t => t.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>Tenants</h1>
          <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>{filtered.length} factories registered</p>
        </div>
        <button onClick={onNew} style={{
          background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
          padding: "9px 18px", fontSize:14, fontWeight: 700, cursor: "pointer", fontFamily: C.mono,
        }}>+ Add tenant</button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["all", "active", "trial", "suspended"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize:14, fontWeight: 600, cursor: "pointer",
            background: filter === f ? C.teal : "transparent",
            color: filter === f ? C.bg0 : C.textMid,
            border: `1px solid ${filter === f ? C.teal : C.border}`,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Tenant", "Billing", "Jobs (Mar)", "Revenue", "Outstanding", "API", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize:13, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i}
                style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg3}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => onSelect(t)}
              >
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: C.bg3, border: `1px solid ${C.borderHi}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize:12, fontFamily: C.mono, fontWeight: 700, color: C.teal, flexShrink: 0,
                    }}>{t.code}</div>
                    <div>
                      <div style={{ fontSize:15, fontWeight: 600, color: C.text }}>{t.name}</div>
                      <div style={{ fontSize:13, color: C.textDim, marginTop: 1 }}>Tax: {t.taxId}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:14, color: C.text }}>{t.billingType === "per_job" ? "Per job" : `${t.termDays}-day term`}</div>
                  <div style={{ fontSize:13, color: C.textDim, marginTop: 1, fontFamily: C.mono }}>฿{t.pricePerJob}/job</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:18, fontWeight: 800, fontFamily: C.mono, color: C.text }}>{t.stats.jobsMonth}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:15, fontFamily: C.mono, color: C.green, fontWeight: 700 }}>฿{(t.stats.revenue * 35).toLocaleString()}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize:15, fontFamily: C.mono, color: t.stats.outstanding > 0 ? C.red : C.textDim, fontWeight: t.stats.outstanding > 0 ? 700 : 400 }}>
                    {t.stats.outstanding > 0 ? `฿${(t.stats.outstanding * 35).toLocaleString()}` : "—"}
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.apiStatus.nsw === "connected" ? C.teal : t.apiStatus.nsw === "pending" ? C.amber : C.red }} />
                      <span style={{ fontSize:13, color: C.textDim }}>NSW</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.apiStatus.customs === "connected" ? C.teal : t.apiStatus.customs === "pending" ? C.amber : C.red }} />
                      <span style={{ fontSize:13, color: C.textDim }}>Customs</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}><StatusPill status={t.status} /></td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize:14, color: C.teal, fontWeight: 600 }}>Details →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

// ─── TENANT DETAIL PAGE ───────────────────────────────────────────
function TenantDetailPage({ tenant, onBack }) {
  const [billingType, setBillingType] = useState(tenant.billingType);
  const [termDays, setTermDays] = useState(tenant.termDays || 30);
  const [pricePerJob, setPricePerJob] = useState(tenant.pricePerJob);
  const [status, setStatus] = useState(tenant.status);

  const tenantJobs = JOBS_RECENT.filter(j => j.tenant === tenant.code);
  const tenantInvoices = INVOICES.filter(inv => inv.tenantCode === tenant.code);

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize:14, color: C.textMid }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: C.bg3, border: `1px solid ${C.borderHi}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize:14, fontFamily: C.mono, fontWeight: 700, color: C.teal,
          }}>{tenant.code}</div>
          <div>
            <h1 style={{ margin: 0, fontSize:20, fontWeight: 800, color: C.text }}>{tenant.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <StatusPill status={status} />
              <span style={{ fontSize:13, color: C.textDim, fontFamily: C.mono }}>ID: {tenant.id}</span>
              <span style={{ fontSize:13, color: C.textDim }}>Joined: {tenant.joined}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rsp-grid-2-eq" style={{}}>
        {/* Left: Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Company info */}
          <Card>
            <CardHeader title="Company information" />
            <div style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
              {[
                ["Company name", tenant.name],
                ["Tax ID", tenant.taxId],
                ["Contact person", tenant.contact],
                ["Email", tenant.email],
                ["Users", `${tenant.stats.users} accounts`],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center" }}>
                  <span style={{ fontSize:14, color: C.textDim, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize:14, color: C.text }}>{val}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Billing configuration */}
          <Card>
            <CardHeader title="Billing configuration" sub="Changes apply to next invoice cycle" />
            <div style={{ padding: "16px 20px", display: "grid", gap: 16 }}>
              {/* Billing type toggle */}
              <div>
                <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Billing type</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["per_job", "Per job", "Invoice per job"], ["term", "Term payment", "Bundle by period"]].map(([val, label, sub]) => (
                    <button key={val} onClick={() => setBillingType(val)} style={{
                      flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                      background: billingType === val ? C.tealBg : C.bg3,
                      border: `1px solid ${billingType === val ? C.teal : C.border}`,
                    }}>
                      <div style={{ fontSize:14, fontWeight: 700, color: billingType === val ? C.teal : C.textMid }}>{label}</div>
                      <div style={{ fontSize:13, color: C.textDim, marginTop: 2 }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Term days (conditional) */}
              {billingType === "term" && (
                <div>
                  <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment term</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[15, 30, 45, 60].map(d => (
                      <button key={d} onClick={() => setTermDays(d)} style={{
                        flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer",
                        background: termDays === d ? C.bg3 : "transparent",
                        border: `1px solid ${termDays === d ? C.teal : C.border}`,
                        fontSize:15, fontWeight: 700, fontFamily: C.mono,
                        color: termDays === d ? C.teal : C.textMid,
                      }}>{d}d</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Price per job (THB)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    value={pricePerJob}
                    onChange={e => setPricePerJob(Number(e.target.value))}
                    style={{
                      background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "8px 12px", fontSize:18, fontWeight: 700, fontFamily: C.mono,
                      color: C.teal, width: 120,
                    }}
                  />
                  <span style={{ fontSize:14, color: C.textDim }}>THB / job</span>
                  <span style={{ fontSize:14, color: C.textDim, marginLeft: "auto" }}>
                    Est. monthly: ฿{(pricePerJob * tenant.stats.jobsMonth).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Account status */}
              <div>
                <div style={{ fontSize:14, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Account status</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["active", "trial", "suspended"].map(s => (
                    <button key={s} onClick={() => setStatus(s)} style={{
                      flex: 1, padding: "7px", borderRadius: 8, cursor: "pointer",
                      fontSize:14, fontWeight: 700, textTransform: "capitalize",
                      background: status === s ? (s === "active" ? C.greenBg : s === "trial" ? C.amberBg : C.redBg) : "transparent",
                      border: `1px solid ${status === s ? (s === "active" ? C.green : s === "trial" ? C.amber : C.red) : C.border}`,
                      color: status === s ? (s === "active" ? C.green : s === "trial" ? C.amber : C.red) : C.textDim,
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <button style={{
                background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "10px", fontSize:14, fontWeight: 700, cursor: "pointer",
              }}>Save configuration</button>
            </div>
          </Card>
        </div>

        {/* Right: Stats + history */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stats */}
          <div className="rsp-grid-2-eq" style={{}}>
            {[
              { label: "Jobs this month", value: tenant.stats.jobsMonth, color: C.blue },
              { label: "Total jobs", value: tenant.stats.jobsTotal, color: C.teal },
              { label: "Revenue (Mar)", value: `฿${(tenant.stats.revenue * 35).toLocaleString()}`, color: C.green },
              { label: "Outstanding", value: tenant.stats.outstanding > 0 ? `฿${(tenant.stats.outstanding * 35).toLocaleString()}` : "None", color: tenant.stats.outstanding > 0 ? C.red : C.textMid },
            ].map((s, i) => (
              <Card key={i}>
                <Stat label={s.label} value={s.value} color={s.color} />
              </Card>
            ))}
          </div>

          {/* API connections */}
          <Card>
            <CardHeader title="API connections" />
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "NSW Thailand API", key: "nsw", endpoint: "https://api.nsw.go.th/v2/submit" },
                { name: "กรมศุลกากร Portal", key: "customs", endpoint: "https://e-export.customs.go.th" },
                { name: "BoT Exchange Rate", key: "bot", endpoint: "https://api.bot.or.th/v1/fxrate" },
              ].map((api, i) => {
                const st = tenant.apiStatus[api.key] || "connected";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.bg3, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: st === "connected" ? C.teal : st === "pending" ? C.amber : C.red, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize:14, fontWeight: 600, color: C.text }}>{api.name}</div>
                      <div style={{ fontSize:13, color: C.textDim, fontFamily: C.mono, marginTop: 2 }}>{api.endpoint}</div>
                    </div>
                    <StatusPill status={st} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Invoice history */}
          <Card>
            <CardHeader title="Invoice history" />
            <div>
              {(tenantInvoices.length > 0 ? tenantInvoices : INVOICES.slice(0, 3)).map((inv, i) => (
                <div key={i} style={{
                  padding: "10px 18px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize:14, fontFamily: C.mono, color: C.textMid }}>{inv.id}</div>
                    <div style={{ fontSize:13, color: C.textDim, marginTop: 2 }}>{inv.jobs} jobs · Issued: {inv.issued}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize:15, fontWeight: 700, fontFamily: C.mono, color: inv.status === "paid" ? C.green : inv.status === "overdue" ? C.red : C.amber }}>
                      ฿{(inv.amount * 35).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 4 }}><StatusPill status={inv.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── BILLING PAGE ─────────────────────────────────────────────────
function BillingPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? INVOICES : INVOICES.filter(inv => inv.status === filter);
  const totalPending = INVOICES.filter(i => i.status === "pending").reduce((a, i) => a + i.amount, 0);
  const totalOverdue = INVOICES.filter(i => i.status === "overdue").reduce((a, i) => a + i.amount, 0);
  const totalPaid = INVOICES.filter(i => i.status === "paid").reduce((a, i) => a + i.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>Billing</h1>
        <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>All invoices across tenants</p>
      </div>

      {/* Summary */}
      <div className="rsp-grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: "Pending collection", value: fmt.thb(totalPending * 35), color: C.amber },
          { label: "Overdue", value: fmt.thb(totalOverdue * 35), color: C.red },
          { label: "Paid this month", value: fmt.thb(totalPaid * 35), color: C.green },
        ].map((s, i) => (
          <Card key={i}><Stat label={s.label} value={s.value} color={s.color} /></Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["all", "pending", "overdue", "paid"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize:14, fontWeight: 600, cursor: "pointer",
            background: filter === f ? C.teal : "transparent",
            color: filter === f ? C.bg0 : C.textMid,
            border: `1px solid ${filter === f ? C.teal : C.border}`,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      <Card>
        <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Invoice", "Tenant", "Jobs", "Amount", "Issued", "Due date", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize:13, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg3}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize:14, color: C.textMid }}>{inv.id}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontWeight: 600, color: C.text }}>{inv.tenantName}</td>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize:15, color: C.text }}>{inv.jobs}</td>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize:15, fontWeight: 700, color: inv.status === "paid" ? C.green : inv.status === "overdue" ? C.red : C.amber }}>฿{(inv.amount * 35).toLocaleString()}</td>
                <td style={{ padding: "12px 18px", fontSize:14, color: C.textDim }}>{inv.issued}</td>
                <td style={{ padding: "12px 18px", fontSize:14, color: inv.status === "overdue" ? C.red : C.textDim }}>{inv.due}</td>
                <td style={{ padding: "12px 18px" }}><StatusPill status={inv.status} /></td>
                <td style={{ padding: "12px 18px" }}>
                  {inv.status !== "paid" && (
                    <button style={{
                      background: "none", border: `1px solid ${C.teal}`, borderRadius: 6,
                      padding: "4px 10px", fontSize:13, color: C.teal, cursor: "pointer", fontWeight: 600,
                    }}>Send reminder</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

// ─── ADD TENANT PAGE ──────────────────────────────────────────────
function AddTenantPage({ onBack }) {
  const [step, setStep] = useState(1);
  const [billingType, setBillingType] = useState("per_job");
  const [termDays, setTermDays] = useState(30);

  const steps = ["Company info", "Billing setup", "API credentials", "Review & create"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize:14, color: C.textMid }}>← Back</button>
        <div>
          <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>Add new tenant</h1>
          <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>Onboard a new factory to the platform</p>
        </div>
      </div>

      {/* Step bar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center" }}>
          {steps.map((s, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: done ? C.teal : active ? C.bg3 : C.bg3,
                    border: `1px solid ${done ? C.teal : active ? C.teal : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize:14, fontFamily: C.mono, fontWeight: 700,
                    color: done ? C.bg0 : active ? C.teal : C.textDim,
                  }}>{done ? "✓" : n}</div>
                  <span style={{ fontSize:14, fontWeight: active ? 700 : 400, color: active ? C.text : C.textDim, whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: done ? C.teal : C.border, margin: "0 12px" }} />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step content */}
      <div className="rsp-grid-form" style={{}}>
        <Card>
          {step === 1 && (
            <div>
              <CardHeader title="Company information" sub="Basic details of the factory" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Company name (Thai)", ph: "บริษัท ไทยแมนูแฟคเจอร์ริ่ง จำกัด" },
                  { label: "Tax ID (13 digits)", ph: "0105561012345" },
                  { label: "Contact person", ph: "คุณชื่อ นามสกุล" },
                  { label: "Contact email", ph: "name@company.co.th" },
                  { label: "Phone number", ph: "02-xxx-xxxx" },
                  { label: "Address", ph: "123 ถ. พระราม 2 แขวง บางมด เขต จอมทอง กรุงเทพฯ 10150" },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                    <input placeholder={f.ph} style={{
                      width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "9px 12px", fontSize:14, color: C.text, boxSizing: "border-box",
                    }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Industry type</label>
                  <select style={{ width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8, padding: "9px 12px", fontSize:14, color: C.text }}>
                    <option>Electronics / Semiconductor</option>
                    <option>Automotive Parts</option>
                    <option>Food & Agriculture</option>
                    <option>Packaging</option>
                    <option>Textiles</option>
                    <option>Other Manufacturing</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <CardHeader title="Billing setup" sub="Configure how this tenant will be billed" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Billing model</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["per_job", "Per job", "Invoice sent immediately after each job is completed. Best for low-volume factories."],
                      ["term", "Term payment", "Accumulate all jobs into one invoice at end of period. Best for high-volume, established clients."],
                    ].map(([val, label, desc]) => (
                      <button key={val} onClick={() => setBillingType(val)} style={{
                        padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: billingType === val ? C.tealBg : C.bg3,
                        border: `1px solid ${billingType === val ? C.teal : C.border}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${billingType === val ? C.teal : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {billingType === val && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal }} />}
                          </div>
                          <span style={{ fontSize:15, fontWeight: 700, color: billingType === val ? C.teal : C.text }}>{label}</span>
                        </div>
                        <p style={{ margin: 0, fontSize:14, color: C.textDim, lineHeight: 1.5 }}>{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {billingType === "term" && (
                  <div>
                    <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment term</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[15, 30, 45, 60].map(d => (
                        <button key={d} onClick={() => setTermDays(d)} style={{
                          flex: 1, padding: "12px 8px", borderRadius: 8, cursor: "pointer",
                          background: termDays === d ? C.tealBg : C.bg3,
                          border: `1px solid ${termDays === d ? C.teal : C.border}`,
                          fontFamily: C.mono, fontSize:18, fontWeight: 800,
                          color: termDays === d ? C.teal : C.textMid,
                        }}>
                          <div>{d}</div>
                          <div style={{ fontSize:12, fontWeight: 400, fontFamily: "inherit", marginTop: 2, color: termDays === d ? C.tealDim : C.textDim }}>days</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Price per job</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" defaultValue={450} style={{
                      background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "10px 14px", fontSize:22, fontWeight: 800, fontFamily: C.mono,
                      color: C.teal, width: 130,
                    }} />
                    <span style={{ fontSize:16, color: C.textDim }}>THB per job</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize:14, color: C.textDim }}>Service breakdown: Declaration ฿300 + AI extraction ฿100 + NSW submission ฿50</div>
                </div>

                <div>
                  <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Contract start date</label>
                  <input type="date" defaultValue="2026-04-01" style={{
                    background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                    padding: "9px 12px", fontSize:14, color: C.text, width: 180,
                  }} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <CardHeader title="API credentials" sub="Customs portal credentials for this tenant" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: C.amberBg, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize:14, color: C.amber, fontWeight: 600, marginBottom: 4 }}>Security note</div>
                  <div style={{ fontSize:14, color: C.textMid }}>Credentials are encrypted at rest and never exposed in logs. Stored in environment variables only.</div>
                </div>
                {[
                  { label: "กรมศุลกากร username", ph: "factory_username" },
                  { label: "กรมศุลกากร password", ph: "••••••••", type: "password" },
                  { label: "NSW agent code", ph: "AGT-XXXXX" },
                  { label: "Customs importer/exporter ID", ph: "EXP-1234567" },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize:14, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.ph} style={{
                      width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "9px 12px", fontSize:14, color: C.text, fontFamily: f.type === "password" ? "inherit" : C.mono, boxSizing: "border-box",
                    }} />
                  </div>
                ))}
                <div style={{ background: C.tealBg, border: `1px solid ${C.teal}44`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize:14, color: C.teal, fontWeight: 600, marginBottom: 4 }}>Test connection</div>
                  <div style={{ fontSize:14, color: C.textMid, marginBottom: 8 }}>Verify credentials before saving by running a dry-run connection test.</div>
                  <button style={{ background: C.tealBg, border: `1px solid ${C.teal}`, borderRadius: 6, padding: "6px 14px", fontSize:14, color: C.teal, cursor: "pointer", fontWeight: 600 }}>Run test</button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <CardHeader title="Review & confirm" sub="Check all details before creating the tenant" />
              <div style={{ padding: "20px" }}>
                {[
                  ["Company", "บริษัท ไทยแมนูแฟคเจอร์ริ่ง จำกัด"],
                  ["Tax ID", "0105561012345"],
                  ["Billing model", billingType === "per_job" ? "Per job" : `Term payment (${termDays} days)`],
                  ["Price per job", "฿450 THB"],
                  ["NSW connection", "Pending test"],
                  ["Customs connection", "Pending test"],
                  ["Contract start", "2026-04-01"],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize:14, color: C.textDim }}>{label}</span>
                    <span style={{ fontSize:14, fontWeight: 600, color: C.text }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, background: C.greenBg, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize:14, color: C.green, fontWeight: 600 }}>Ready to create</div>
                  <div style={{ fontSize:14, color: C.textMid, marginTop: 4 }}>Tenant ID will be auto-generated. Invitation email sent to contact.</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize:14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Onboarding checklist</div>
              {[
                { label: "Company info", done: step > 1 },
                { label: "Billing configuration", done: step > 2 },
                { label: "API credentials", done: step > 3 },
                { label: "System ready", done: false },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: item.done ? C.tealBg : C.bg3,
                    border: `1px solid ${item.done ? C.teal : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize:13, color: C.teal,
                  }}>{item.done ? "✓" : ""}</div>
                  <span style={{ fontSize:14, color: item.done ? C.text : C.textDim }}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "11px", fontSize:14, color: C.textMid, cursor: "pointer",
              }}>← Back</button>
            )}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                flex: 2, background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "11px", fontSize:14, fontWeight: 700, cursor: "pointer",
              }}>Continue →</button>
            ) : (
              <button style={{
                flex: 2, background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "11px", fontSize:14, fontWeight: 700, cursor: "pointer",
              }}>Create tenant</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SYSTEM PAGE ─────────────────────────────────────────────────
function SystemPage() {
  const apis = [
    { name: "NSW Thailand API", endpoint: "https://api.nsw.go.th/v2/", latency: "142ms", uptime: "99.9%", status: "connected", requests: "1,234" },
    { name: "กรมศุลกากร Portal", endpoint: "https://e-export.customs.go.th", latency: "380ms", uptime: "99.5%", status: "connected", requests: "892" },
    { name: "BoT Exchange Rate", endpoint: "https://api.bot.or.th/v1/", latency: "95ms", uptime: "100%", status: "connected", requests: "240" },
    { name: "Gemini Flash AI", endpoint: "https://generativelanguage.googleapis.com", latency: "1,240ms", uptime: "99.8%", status: "connected", requests: "4,510" },
    { name: "Supabase DB", endpoint: "supabase.co · PostgreSQL", latency: "18ms", uptime: "100%", status: "connected", requests: "—" },
  ];

  const logs = [
    { time: "10:42:31", level: "INFO", tenant: "THEL", msg: "Job SH-2026-0238 cleared by กรมศุลกากร" },
    { time: "10:38:12", level: "INFO", tenant: "SAPT", msg: "NSW submission NSW-TH-2026-039205 acknowledged" },
    { time: "10:22:04", level: "WARN", tenant: "MITR", msg: "Customs portal session timeout — retrying (1/3)" },
    { time: "10:21:58", level: "INFO", tenant: "MITR", msg: "Playwright session re-authenticated successfully" },
    { time: "09:55:18", level: "INFO", tenant: "THEL", msg: "AI extraction complete: 14 items, 2 HS codes flagged" },
    { time: "09:30:00", level: "INFO", tenant: "SYS", msg: "BoT exchange rate updated: USD 35.75 THB" },
    { time: "08:00:00", level: "INFO", tenant: "SYS", msg: "Daily backup completed — Supabase snapshot OK" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize:22, fontWeight: 800, color: C.text }}>System monitor</h1>
        <p style={{ margin: "4px 0 0", fontSize:14, color: C.textDim }}>API health · connections · audit log</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="API connections" sub="Real-time status" />
        <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Service", "Endpoint", "Latency", "Uptime", "Req (24h)", "Status"].map(h => (
                <th key={h} style={{ padding: "9px 18px", textAlign: "left", fontSize:13, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apis.map((api, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 18px", fontSize:15, fontWeight: 600, color: C.text }}>{api.name}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: C.textDim }}>{api.endpoint}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: Number(api.latency) > 500 ? C.amber : C.green }}>{api.latency}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: C.teal }}>{api.uptime}</td>
                <td style={{ padding: "12px 18px", fontSize:14, fontFamily: C.mono, color: C.text }}>{api.requests}</td>
                <td style={{ padding: "12px 18px" }}><StatusPill status={api.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Audit log" sub="Last 24 hours" />
        <div style={{ padding: "4px 0" }}>
          {logs.map((log, i) => (
            <div key={i} style={{
              padding: "8px 18px", borderBottom: i < logs.length - 1 ? `1px solid ${C.border}` : "none",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontFamily: C.mono, fontSize:14, color: C.textDim, width: 72, flexShrink: 0 }}>{log.time}</span>
              <span style={{
                fontSize:12, fontWeight: 700, padding: "2px 6px", borderRadius: 4, width: 36, textAlign: "center",
                background: log.level === "WARN" ? C.amberBg : C.tealBg,
                color: log.level === "WARN" ? C.amber : C.teal,
                border: `1px solid ${log.level === "WARN" ? C.amber + "44" : C.teal + "44"}`,
              }}>{log.level}</span>
              <span style={{
                fontSize:12, fontWeight: 700, padding: "2px 6px", borderRadius: 4, fontFamily: C.mono,
                background: C.bg3, color: C.textMid, border: `1px solid ${C.border}`,
              }}>{log.tenant}</span>
              <span style={{ fontSize:14, color: C.textMid }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── ALL JOBS PAGE ────────────────────────────────────────────────
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

const JOB_STATUS_MAP = {
  DRAFT:           { label:"Draft",           color: C.textDim, bg:"rgba(71,85,105,0.15)" },
  PREPARING:       { label:"Preparing",       color: C.amber,   bg: C.amberBg },
  READY:           { label:"Ready",           color: C.blue,    bg: C.blueBg  },
  SUBMITTED:       { label:"Submitted",       color: C.purple,  bg: C.purpleBg },
  NSW_PROCESSING:  { label:"NSW Proc.",       color: C.blue,    bg: C.blueBg  },
  CUSTOMS_REVIEW:  { label:"Customs Review",  color: C.amber,   bg: C.amberBg },
  CLEARED:         { label:"Cleared",         color: C.teal,    bg: C.tealBg  },
  COMPLETED:       { label:"Completed",       color: C.green,   bg: C.greenBg },
  REJECTED:        { label:"Rejected",        color: C.red,     bg: C.redBg   },
};

function JobStatusPill({ status }) {
  const s = JOB_STATUS_MAP[status] || JOB_STATUS_MAP.DRAFT;
  return (
    <span style={{
      display:"inline-block", padding:"3px 10px", borderRadius:20,
      fontSize:13, fontWeight:700, letterSpacing:"0.3px",
      color:s.color, background:s.bg, border:`1px solid ${s.color}44`,
    }}>{s.label}</span>
  );
}

function AllJobsPage() {
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

// ─── APP SHELL ────────────────────────────────────────────────────
export default function App({ onExit }) {
  const [screen, setScreen] = useState("overview");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = RESPONSIVE_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const handleNav = (id) => {
    setSelectedTenant(null);
    setScreen(id);
  };

  const handleSelectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setScreen("tenant_detail");
  };

  const renderContent = () => {
    if (screen === "tenant_detail" && selectedTenant) {
      return <TenantDetailPage tenant={selectedTenant} onBack={() => setScreen("tenants")} />;
    }
    if (screen === "new_tenant") {
      return <AddTenantPage onBack={() => setScreen("tenants")} />;
    }
    switch (screen) {
      case "overview": return <OverviewPage onNav={handleNav} />;
      case "tenants":  return <TenantListPage onSelect={handleSelectTenant} onNew={() => setScreen("new_tenant")} />;
      case "billing":  return <BillingPage />;
      case "jobs":     return <AllJobsPage />;
      case "system":   return <SystemPage />;
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
            <div style={{ fontSize:32, fontFamily: C.mono, color: C.teal, marginBottom: 12 }}>⊙</div>
            <div style={{ fontSize:16, fontWeight: 600, color: C.text }}>Coming soon</div>
            <div style={{ fontSize:14, color: C.textDim, marginTop: 6 }}>Module under development</div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg1, fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar active={screen} onNav={handleNav} onClose={() => setSidebarOpen(false)}
        className={sidebarOpen ? "open" : ""} onExit={onExit} />

      <main className="main-content" style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: "100vh", overflowX: "hidden" }}>
        {/* Mobile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)}
            style={{ color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", background: C.bg2 }}>
            ☰
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
