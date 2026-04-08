import { colors, fonts } from "../theme";

export const RESPONSIVE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: var(--sans); font-size: 15px; }
  .rsp-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .rsp-grid-2 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
  .rsp-grid-2-eq { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .rsp-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .rsp-grid-form { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .sidebar-overlay { display: none; }
  .nav-btn:hover { background: ${colors.accentBg} !important; color: ${colors.accent} !important; }
  .card-hover:hover { border-color: ${colors.navyBorderHi} !important; box-shadow: 0 4px 24px rgba(0,0,0,0.25) !important; }
  tr.row-hover:hover td { background: ${colors.navyMid}; }
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

// ─── Design tokens (from unified theme) ──────────────────────────
export const C = {
  bg0: colors.navyDeep,
  bg1: colors.navy,
  bg2: colors.navyCard,
  bg3: colors.navyMid,
  border: colors.navyBorder,
  borderHi: colors.navyBorderHi,
  teal: colors.accent,
  tealDim: colors.accentHover,
  tealBg: colors.accentBg,
  amber: colors.gold,
  amberBg: colors.warningBg,
  blue: colors.primaryLight,
  blueBg: colors.primaryBg,
  red: colors.danger,
  redBg: colors.dangerBg,
  green: colors.success,
  greenBg: colors.successBg,
  purple: colors.purpleLight,
  purpleBg: colors.purpleBg,
  text: colors.textWhite,
  textMid: colors.textGray,
  textDim: colors.textDim,
  mono: fonts.mono,
};

// ─── Mock data ────────────────────────────────────────────────────
export const TENANTS = [
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

export const INVOICES = [
  { id: "INV-2026-0089", tenantCode: "THEL", tenantName: "ไทยอิเล็กทรอนิกส์", jobs: 5, amount: 2250, status: "pending", due: "2026-03-25", issued: "2026-03-20" },
  { id: "INV-2026-0088", tenantCode: "SAPT", tenantName: "สยามออโต้ พาร์ท", jobs: 20, amount: 8400, status: "pending", due: "2026-04-01", issued: "2026-03-02" },
  { id: "INV-2026-0087", tenantCode: "MITR", tenantName: "มิตรผล กรุ๊ป", jobs: 7, amount: 3360, status: "overdue", due: "2026-03-15", issued: "2026-03-01" },
  { id: "INV-2026-0086", tenantCode: "BKEX", tenantName: "กรุงเทพเอ็กซ์พอร์ต", jobs: 30, amount: 12600, status: "overdue", due: "2026-03-01", issued: "2026-02-01" },
  { id: "INV-2026-0085", tenantCode: "THEL", tenantName: "ไทยอิเล็กทรอนิกส์", jobs: 42, amount: 18900, status: "paid", due: "2026-03-05", issued: "2026-02-28" },
  { id: "INV-2026-0084", tenantCode: "SAPT", tenantName: "สยามออโต้ พาร์ท", jobs: 25, amount: 10500, status: "paid", due: "2026-03-01", issued: "2026-02-01" },
  { id: "INV-2026-0090", tenantCode: "HHA", tenantName: "HHA (THAILAND)", jobs: 4, amount: 1800, status: "pending", due: "2026-04-05", issued: "2026-03-22" },
  { id: "INV-2026-0091", tenantCode: "DKSH", tenantName: "ดีเคเอสเอช", jobs: 15, amount: 7200, status: "pending", due: "2026-04-10", issued: "2026-03-15" },
];

export const JOBS_RECENT = [
  { id: "SH-2026-0244", tenant: "HHA",  type: "Import", vessel: "SITC GUANGXI V.2403S",  fob: "CNY 434,999", status: "CUSTOMS_REVIEW", time: "5 min ago" },
  { id: "SH-2026-0243", tenant: "THEL", type: "Export", vessel: "MSC AURORA V.124",       fob: "USD 128,450", status: "CLEARED",  time: "10 min ago" },
  { id: "SH-2026-0242", tenant: "DKSH", type: "Import", vessel: "COSCO SHIPPING V.88",    fob: "EUR 67,300",  status: "NSW_PROC", time: "25 min ago" },
  { id: "SH-2026-0241", tenant: "SAPT", type: "Export", vessel: "EVER GIVEN V.89",         fob: "USD 87,200",  status: "SUBMITTED", time: "1h ago" },
  { id: "SH-2026-0240", tenant: "HHA",  type: "Import", vessel: "OOCL DALIAN V.015N",     fob: "CNY 286,543", status: "CLEARED",  time: "2h ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────
export const fmt = {
  thb: (n) => `฿${n.toLocaleString()}`,
  pct: (a, b) => `${Math.round((a / b) * 100)}%`,
};

export const NAV = [
  { id: "overview",  icon: "◈", label: "Overview" },
  { id: "tenants",   icon: "⊞", label: "Tenants" },
  { id: "billing",   icon: "◧", label: "Billing" },
  { id: "jobs",      icon: "≡", label: "All Jobs" },
  { id: "system",    icon: "⊙", label: "System" },
  { id: "new_tenant",icon: "+", label: "Add Tenant" },
  { id: "landing",   icon: "◎", label: "Landing Page" },
  { id: "theme",     icon: "◐", label: "Theme" },
];
