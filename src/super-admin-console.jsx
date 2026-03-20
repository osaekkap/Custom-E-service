import { useState } from "react";

// ─── Design tokens ───────────────────────────────────────────────
const C = {
  bg0: "#080E1A",
  bg1: "#0D1627",
  bg2: "#111E35",
  bg3: "#172444",
  border: "#1E2F4E",
  borderHi: "#2A4070",
  teal: "#00C9A7",
  tealDim: "#00997F",
  tealBg: "rgba(0,201,167,0.08)",
  amber: "#F59E0B",
  amberBg: "rgba(245,158,11,0.1)",
  blue: "#3B82F6",
  blueBg: "rgba(59,130,246,0.1)",
  red: "#EF4444",
  redBg: "rgba(239,68,68,0.08)",
  green: "#22C55E",
  greenBg: "rgba(34,197,94,0.08)",
  purple: "#A78BFA",
  purpleBg: "rgba(167,139,250,0.1)",
  text: "#E2E8F0",
  textMid: "#94A3B8",
  textDim: "#475569",
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
];

const INVOICES = [
  { id: "INV-2026-0089", tenantCode: "THEL", tenantName: "ไทยอิเล็กทรอนิกส์", jobs: 5, amount: 2250, status: "pending", due: "2026-03-25", issued: "2026-03-20" },
  { id: "INV-2026-0088", tenantCode: "SAPT", tenantName: "สยามออโต้ พาร์ท", jobs: 20, amount: 8400, status: "pending", due: "2026-04-01", issued: "2026-03-02" },
  { id: "INV-2026-0087", tenantCode: "MITR", tenantName: "มิตรผล กรุ๊ป", jobs: 7, amount: 3360, status: "overdue", due: "2026-03-15", issued: "2026-03-01" },
  { id: "INV-2026-0086", tenantCode: "BKEX", tenantName: "กรุงเทพเอ็กซ์พอร์ต", jobs: 30, amount: 12600, status: "overdue", due: "2026-03-01", issued: "2026-02-01" },
  { id: "INV-2026-0085", tenantCode: "THEL", tenantName: "ไทยอิเล็กทรอนิกส์", jobs: 42, amount: 18900, status: "paid", due: "2026-03-05", issued: "2026-02-28" },
  { id: "INV-2026-0084", tenantCode: "SAPT", tenantName: "สยามออโต้ พาร์ท", jobs: 25, amount: 10500, status: "paid", due: "2026-03-01", issued: "2026-02-01" },
];

const JOBS_RECENT = [
  { id: "SH-2026-0238", tenant: "THEL", type: "Export", vessel: "MSC AURORA V.124", fob: "USD 128,450", status: "CLEARED", time: "10 min ago" },
  { id: "SH-2026-0237", tenant: "SAPT", type: "Export", vessel: "EVER GIVEN V.89", fob: "USD 87,200", status: "NSW_PROC", time: "34 min ago" },
  { id: "SH-2026-0236", tenant: "MITR", type: "Import", vessel: "OOCL EUROPE V.32", fob: "USD 45,600", status: "REVIEW", time: "1h ago" },
  { id: "SH-2026-0235", tenant: "THEL", type: "Export", vessel: "COSCO PRIDE V.67", fob: "USD 234,100", status: "SUBMITTED", time: "2h ago" },
  { id: "SH-2026-0234", tenant: "SAPT", type: "Export", vessel: "MAERSK TITAN V.41", fob: "USD 63,800", status: "DRAFT", time: "3h ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────
const fmt = {
  thb: (n) => `฿${n.toLocaleString()}`,
  pct: (a, b) => `${Math.round((a / b) * 100)}%`,
};

function Pill({ label, color, bg, border }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
      color, background: bg, border: `1px solid ${border || color + "44"}`,
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
    <div style={{
      background: C.bg2, border: `1px solid ${C.border}`,
      borderRadius: 12, ...style,
    }}>{children}</div>
  );
}

function CardHeader({ title, sub, action }) {
  return (
    <div style={{
      padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value, sub, color = C.teal }) {
  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: C.mono, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textDim }}>{sub}</div>}
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

function Sidebar({ active, onNav }) {
  return (
    <div style={{
      width: 210, background: C.bg0, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Brand */}
      <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: C.teal, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, color: C.bg0,
          }}>⚓</div>
          <div>
            <div style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: "1px" }}>CUSTOMS-EDOC</div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>Super Admin</div>
          </div>
        </div>
      </div>

      {/* Operator badge */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ background: C.bg3, borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.teal, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>Operator</div>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>LogiConnect Co., Ltd.</div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>admin@logiconnect.co.th</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "9px 12px", borderRadius: 8, marginBottom: 2,
              background: isActive ? C.tealBg : "transparent",
              border: `1px solid ${isActive ? C.teal + "44" : "transparent"}`,
              color: isActive ? C.teal : C.textMid,
              cursor: "pointer", textAlign: "left",
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              transition: "all 0.1s",
            }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center", fontFamily: C.mono }}>{item.icon}</span>
              {item.label}
              {item.id === "billing" && (
                <span style={{
                  marginLeft: "auto", background: C.red, color: "#fff",
                  borderRadius: 10, padding: "1px 6px", fontSize: 9, fontWeight: 700,
                }}>2</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System status */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
        {[
          { label: "NSW API", ok: true },
          { label: "Customs Portal", ok: true },
          { label: "BoT Rate API", ok: true },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.ok ? C.green : C.red, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: C.textDim }}>{s.label}</span>
          </div>
        ))}
        <div style={{ fontSize: 9, color: C.textDim, marginTop: 6, fontFamily: C.mono }}>v2.0.0 · ISO 27001</div>
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
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>System Overview</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textDim, fontFamily: C.mono }}>March 2026 · All tenants</p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Tenant summary table */}
        <Card>
          <CardHeader title="Tenant summary" sub="All registered factories" action={
            <button onClick={() => onNav("tenants")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.textMid, cursor: "pointer" }}>View all →</button>
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
                  fontSize: 9, fontFamily: C.mono, fontWeight: 700, color: C.teal,
                }}>{t.code}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>{t.stats.jobsMonth} jobs · {t.billingType === "per_job" ? "Per job" : `${t.termDays}-day term`}</div>
                </div>
                <div style={{ fontSize: 12, fontFamily: C.mono, color: C.green, textAlign: "right" }}>฿{(t.stats.revenue * 35).toLocaleString()}</div>
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
                    <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textMid }}>{inv.id}</div>
                    <div style={{ fontSize: 12, color: C.text, fontWeight: 500, marginTop: 2 }}>{inv.tenantName}</div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>Due: {inv.due}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: C.mono, color: inv.status === "overdue" ? C.red : C.amber }}>฿{(inv.amount * 35).toLocaleString()}</div>
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
                      <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textMid }}>{j.id}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                        background: j.type === "Export" ? C.blueBg : C.amberBg,
                        color: j.type === "Export" ? C.blue : C.amber,
                        border: `1px solid ${j.type === "Export" ? C.blue + "44" : C.amber + "44"}`,
                      }}>{j.type}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{j.tenant} · {j.time}</div>
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Tenants</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textDim }}>{filtered.length} factories registered</p>
        </div>
        <button onClick={onNew} style={{
          background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
          padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: C.mono,
        }}>+ Add tenant</button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["all", "active", "trial", "suspended"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: filter === f ? C.teal : "transparent",
            color: filter === f ? C.bg0 : C.textMid,
            border: `1px solid ${filter === f ? C.teal : C.border}`,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Tenant", "Billing", "Jobs (Mar)", "Revenue", "Outstanding", "API", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
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
                      fontSize: 9, fontFamily: C.mono, fontWeight: 700, color: C.teal, flexShrink: 0,
                    }}>{t.code}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>Tax: {t.taxId}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, color: C.text }}>{t.billingType === "per_job" ? "Per job" : `${t.termDays}-day term`}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 1, fontFamily: C.mono }}>฿{t.pricePerJob}/job</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: C.mono, color: C.text }}>{t.stats.jobsMonth}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 13, fontFamily: C.mono, color: C.green, fontWeight: 700 }}>฿{(t.stats.revenue * 35).toLocaleString()}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 13, fontFamily: C.mono, color: t.stats.outstanding > 0 ? C.red : C.textDim, fontWeight: t.stats.outstanding > 0 ? 700 : 400 }}>
                    {t.stats.outstanding > 0 ? `฿${(t.stats.outstanding * 35).toLocaleString()}` : "—"}
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.apiStatus.nsw === "connected" ? C.teal : t.apiStatus.nsw === "pending" ? C.amber : C.red }} />
                      <span style={{ fontSize: 10, color: C.textDim }}>NSW</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.apiStatus.customs === "connected" ? C.teal : t.apiStatus.customs === "pending" ? C.amber : C.red }} />
                      <span style={{ fontSize: 10, color: C.textDim }}>Customs</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}><StatusPill status={t.status} /></td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>Details →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.textMid }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: C.bg3, border: `1px solid ${C.borderHi}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontFamily: C.mono, fontWeight: 700, color: C.teal,
          }}>{tenant.code}</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>{tenant.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <StatusPill status={status} />
              <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.mono }}>ID: {tenant.id}</span>
              <span style={{ fontSize: 10, color: C.textDim }}>Joined: {tenant.joined}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                  <span style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 12, color: C.text }}>{val}</span>
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
                <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Billing type</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["per_job", "Per job", "Invoice per job"], ["term", "Term payment", "Bundle by period"]].map(([val, label, sub]) => (
                    <button key={val} onClick={() => setBillingType(val)} style={{
                      flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                      background: billingType === val ? C.tealBg : C.bg3,
                      border: `1px solid ${billingType === val ? C.teal : C.border}`,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: billingType === val ? C.teal : C.textMid }}>{label}</div>
                      <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Term days (conditional) */}
              {billingType === "term" && (
                <div>
                  <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment term</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[15, 30, 45, 60].map(d => (
                      <button key={d} onClick={() => setTermDays(d)} style={{
                        flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer",
                        background: termDays === d ? C.bg3 : "transparent",
                        border: `1px solid ${termDays === d ? C.teal : C.border}`,
                        fontSize: 13, fontWeight: 700, fontFamily: C.mono,
                        color: termDays === d ? C.teal : C.textMid,
                      }}>{d}d</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Price per job (THB)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    value={pricePerJob}
                    onChange={e => setPricePerJob(Number(e.target.value))}
                    style={{
                      background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "8px 12px", fontSize: 16, fontWeight: 700, fontFamily: C.mono,
                      color: C.teal, width: 120,
                    }}
                  />
                  <span style={{ fontSize: 12, color: C.textDim }}>THB / job</span>
                  <span style={{ fontSize: 11, color: C.textDim, marginLeft: "auto" }}>
                    Est. monthly: ฿{(pricePerJob * tenant.stats.jobsMonth).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Account status */}
              <div>
                <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Account status</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["active", "trial", "suspended"].map(s => (
                    <button key={s} onClick={() => setStatus(s)} style={{
                      flex: 1, padding: "7px", borderRadius: 8, cursor: "pointer",
                      fontSize: 11, fontWeight: 700, textTransform: "capitalize",
                      background: status === s ? (s === "active" ? C.greenBg : s === "trial" ? C.amberBg : C.redBg) : "transparent",
                      border: `1px solid ${status === s ? (s === "active" ? C.green : s === "trial" ? C.amber : C.red) : C.border}`,
                      color: status === s ? (s === "active" ? C.green : s === "trial" ? C.amber : C.red) : C.textDim,
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <button style={{
                background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Save configuration</button>
            </div>
          </Card>
        </div>

        {/* Right: Stats + history */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{api.name}</div>
                      <div style={{ fontSize: 10, color: C.textDim, fontFamily: C.mono, marginTop: 2 }}>{api.endpoint}</div>
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
                    <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textMid }}>{inv.id}</div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{inv.jobs} jobs · Issued: {inv.issued}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: C.mono, color: inv.status === "paid" ? C.green : inv.status === "overdue" ? C.red : C.amber }}>
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
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Billing</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textDim }}>All invoices across tenants</p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
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
            padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: filter === f ? C.teal : "transparent",
            color: filter === f ? C.bg0 : C.textMid,
            border: `1px solid ${filter === f ? C.teal : C.border}`,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Invoice", "Tenant", "Jobs", "Amount", "Issued", "Due date", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg3}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize: 11, color: C.textMid }}>{inv.id}</td>
                <td style={{ padding: "12px 18px", fontSize: 12, fontWeight: 600, color: C.text }}>{inv.tenantName}</td>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize: 13, color: C.text }}>{inv.jobs}</td>
                <td style={{ padding: "12px 18px", fontFamily: C.mono, fontSize: 13, fontWeight: 700, color: inv.status === "paid" ? C.green : inv.status === "overdue" ? C.red : C.amber }}>฿{(inv.amount * 35).toLocaleString()}</td>
                <td style={{ padding: "12px 18px", fontSize: 11, color: C.textDim }}>{inv.issued}</td>
                <td style={{ padding: "12px 18px", fontSize: 11, color: inv.status === "overdue" ? C.red : C.textDim }}>{inv.due}</td>
                <td style={{ padding: "12px 18px" }}><StatusPill status={inv.status} /></td>
                <td style={{ padding: "12px 18px" }}>
                  {inv.status !== "paid" && (
                    <button style={{
                      background: "none", border: `1px solid ${C.teal}`, borderRadius: 6,
                      padding: "4px 10px", fontSize: 10, color: C.teal, cursor: "pointer", fontWeight: 600,
                    }}>Send reminder</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.textMid }}>← Back</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Add new tenant</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textDim }}>Onboard a new factory to the platform</p>
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
                    fontSize: 11, fontFamily: C.mono, fontWeight: 700,
                    color: done ? C.bg0 : active ? C.teal : C.textDim,
                  }}>{done ? "✓" : n}</div>
                  <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? C.text : C.textDim, whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: done ? C.teal : C.border, margin: "0 12px" }} />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step content */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
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
                    <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                    <input placeholder={f.ph} style={{
                      width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "9px 12px", fontSize: 12, color: C.text, boxSizing: "border-box",
                    }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Industry type</label>
                  <select style={{ width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8, padding: "9px 12px", fontSize: 12, color: C.text }}>
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
                  <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Billing model</label>
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
                          <span style={{ fontSize: 13, fontWeight: 700, color: billingType === val ? C.teal : C.text }}>{label}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {billingType === "term" && (
                  <div>
                    <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment term</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[15, 30, 45, 60].map(d => (
                        <button key={d} onClick={() => setTermDays(d)} style={{
                          flex: 1, padding: "12px 8px", borderRadius: 8, cursor: "pointer",
                          background: termDays === d ? C.tealBg : C.bg3,
                          border: `1px solid ${termDays === d ? C.teal : C.border}`,
                          fontFamily: C.mono, fontSize: 16, fontWeight: 800,
                          color: termDays === d ? C.teal : C.textMid,
                        }}>
                          <div>{d}</div>
                          <div style={{ fontSize: 9, fontWeight: 400, fontFamily: "inherit", marginTop: 2, color: termDays === d ? C.tealDim : C.textDim }}>days</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Price per job</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" defaultValue={450} style={{
                      background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "10px 14px", fontSize: 20, fontWeight: 800, fontFamily: C.mono,
                      color: C.teal, width: 130,
                    }} />
                    <span style={{ fontSize: 14, color: C.textDim }}>THB per job</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: C.textDim }}>Service breakdown: Declaration ฿300 + AI extraction ฿100 + NSW submission ฿50</div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Contract start date</label>
                  <input type="date" defaultValue="2026-04-01" style={{
                    background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                    padding: "9px 12px", fontSize: 12, color: C.text, width: 180,
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
                  <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 4 }}>Security note</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>Credentials are encrypted at rest and never exposed in logs. Stored in environment variables only.</div>
                </div>
                {[
                  { label: "กรมศุลกากร username", ph: "factory_username" },
                  { label: "กรมศุลกากร password", ph: "••••••••", type: "password" },
                  { label: "NSW agent code", ph: "AGT-XXXXX" },
                  { label: "Customs importer/exporter ID", ph: "EXP-1234567" },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 11, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.ph} style={{
                      width: "100%", background: C.bg3, border: `1px solid ${C.borderHi}`, borderRadius: 8,
                      padding: "9px 12px", fontSize: 12, color: C.text, fontFamily: f.type === "password" ? "inherit" : C.mono, boxSizing: "border-box",
                    }} />
                  </div>
                ))}
                <div style={{ background: C.tealBg, border: `1px solid ${C.teal}44`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: C.teal, fontWeight: 600, marginBottom: 4 }}>Test connection</div>
                  <div style={{ fontSize: 11, color: C.textMid, marginBottom: 8 }}>Verify credentials before saving by running a dry-run connection test.</div>
                  <button style={{ background: C.tealBg, border: `1px solid ${C.teal}`, borderRadius: 6, padding: "6px 14px", fontSize: 11, color: C.teal, cursor: "pointer", fontWeight: 600 }}>Run test</button>
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
                    <span style={{ fontSize: 12, color: C.textDim }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, background: C.greenBg, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Ready to create</div>
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>Tenant ID will be auto-generated. Invitation email sent to contact.</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 16 }}>Onboarding checklist</div>
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
                    fontSize: 10, color: C.teal,
                  }}>{item.done ? "✓" : ""}</div>
                  <span style={{ fontSize: 12, color: item.done ? C.text : C.textDim }}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "11px", fontSize: 12, color: C.textMid, cursor: "pointer",
              }}>← Back</button>
            )}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                flex: 2, background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "11px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Continue →</button>
            ) : (
              <button style={{
                flex: 2, background: C.teal, color: C.bg0, border: "none", borderRadius: 8,
                padding: "11px", fontSize: 12, fontWeight: 700, cursor: "pointer",
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
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>System monitor</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textDim }}>API health · connections · audit log</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="API connections" sub="Real-time status" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Service", "Endpoint", "Latency", "Uptime", "Req (24h)", "Status"].map(h => (
                <th key={h} style={{ padding: "9px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apis.map((api, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: C.text }}>{api.name}</td>
                <td style={{ padding: "12px 18px", fontSize: 11, fontFamily: C.mono, color: C.textDim }}>{api.endpoint}</td>
                <td style={{ padding: "12px 18px", fontSize: 12, fontFamily: C.mono, color: Number(api.latency) > 500 ? C.amber : C.green }}>{api.latency}</td>
                <td style={{ padding: "12px 18px", fontSize: 12, fontFamily: C.mono, color: C.teal }}>{api.uptime}</td>
                <td style={{ padding: "12px 18px", fontSize: 12, fontFamily: C.mono, color: C.text }}>{api.requests}</td>
                <td style={{ padding: "12px 18px" }}><StatusPill status={api.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader title="Audit log" sub="Last 24 hours" />
        <div style={{ padding: "4px 0" }}>
          {logs.map((log, i) => (
            <div key={i} style={{
              padding: "8px 18px", borderBottom: i < logs.length - 1 ? `1px solid ${C.border}` : "none",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textDim, width: 72, flexShrink: 0 }}>{log.time}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, width: 36, textAlign: "center",
                background: log.level === "WARN" ? C.amberBg : C.tealBg,
                color: log.level === "WARN" ? C.amber : C.teal,
                border: `1px solid ${log.level === "WARN" ? C.amber + "44" : C.teal + "44"}`,
              }}>{log.level}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, fontFamily: C.mono,
                background: C.bg3, color: C.textMid, border: `1px solid ${C.border}`,
              }}>{log.tenant}</span>
              <span style={{ fontSize: 12, color: C.textMid }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("overview");
  const [selectedTenant, setSelectedTenant] = useState(null);

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
      case "system":   return <SystemPage />;
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
            <div style={{ fontSize: 32, fontFamily: C.mono, color: C.teal, marginBottom: 12 }}>⊙</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Coming soon</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>Module under development</div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg1, fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <Sidebar active={screen} onNav={handleNav} />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: "100vh" }}>
        {renderContent()}
      </main>
    </div>
  );
}
