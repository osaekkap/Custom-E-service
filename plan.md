# Custom-E-service — Master Plan

> อัปเดต: 2026-04-03 | **Phase 6 เสร็จ + Pre-Deploy Audit Phase 1-4 เสร็จ + Phase 5A-5B เสร็จ**

---

## สรุปสถานะ

| Phase | สิ่งที่ทำ | สถานะ |
|-------|----------|-------|
| 1 | Auth, Customer CRUD, User Management | ✅ เสร็จ |
| 2 | Jobs CRUD + status transitions + audit trail | ✅ เสร็จ |
| 3 | Master Data, Declaration กศก.101/1, Billing | ✅ เสร็จ |
| 4 | Document Upload, XSD v4.00 alignment, NSW Connector, Frontend | ✅ เสร็จ |
| — | RBAC 8 roles (Prisma + usePermissions + nav filter + screen guards) | ✅ เสร็จ |
| — | UI Redesign (สไตล์ Customs-Edoc-test2, 12 steps) | ✅ เสร็จ |
| — | Data Plan (mock data + backend seed HHA/DKSH + HS codes 15,913) | ✅ เสร็จ |
| — | XSD Gap Analysis (ExportDeclaration ครบทุก field ตาม v4.00) | ✅ เสร็จ |
| **5A** | **ProductMaster + PrivilegeDocument models + APIs + master codes** | ✅ เสร็จ |
| **5B** | **Frontend — ฟอร์มกรอกใบขนเอง (5 sections)** | ✅ เสร็จ |
| **5C** | **Integration — XML generation + PDF preview** | ✅ เสร็จ |
| **6A** | **Landing Page (9 sections + Login Card)** | ✅ เสร็จ |
| **6A** | **Notification System (backend + bell icon)** | ✅ เสร็จ |
| **6B** | **Job Assignment (B1) — backend + frontend** | ✅ เสร็จ |
| **6B** | **Approval Workflow (B2) — backend + frontend** | ✅ เสร็จ |
| **6C** | **Customer Notifications (C1) + Staff Alert (C2)** | ✅ เสร็จ |
| **6D** | **Read-only Mode Badge (D1)** | ✅ เสร็จ |
| **6D** | **Customer Portal Dashboard (D2) — ดึงข้อมูลจริง** | ✅ เสร็จ |
| **CMS** | **Landing Page CMS (Theme/Section/Card management)** | ✅ เสร็จ |
| **Audit P1** | **Pre-Deploy Security Audit — Phase 1 (Critical fixes)** | ✅ เสร็จ |
| **Audit P2** | **Pre-Deploy Audit — Phase 2 (Go-live readiness)** | ✅ เสร็จ |
| **Audit P3** | **Pre-Deploy Audit — Phase 3 (Post-launch fixes)** | ✅ เสร็จ |

---

## Phase 5B: ฟอร์มกรอกใบขนเอง (สิ่งที่ต้องทำ)

> ลูกค้า (เช่น HDMC/Harley-Davidson) กรอกข้อมูลใบขน กศก.101/1 เอง ไม่ใช้ AI extraction

| # | Task | สถานะ |
|---|------|-------|
| B1 | ปุ่ม "กรอกข้อมูลเอง" ใน New Shipment wizard (สลับ AI/Manual) | ✅ |
| B2 | Section 1: Document Control (ท่าเรือ, ประเทศ, สกุลเงิน, transport, B/L) | ✅ |
| B3 | Section 2: Exporter & Agent (Tax ID, Branch, Address, Agent, Manager) | ✅ |
| B4 | Section 3: Invoice & Consignee (Invoice, Incoterms, Consignee, Freight) | ✅ |
| B5 | Section 4: Shipment Summary (Marks, Packages, Weight, Payment, Guarantee) | ✅ |
| B6 | Section 5: Line Items table (repeatable, add/remove) | ✅ |
| B7 | HS Code autocomplete (ค้นจาก HS_MASTER, auto-fill desc/unit/duty) | ✅ |
| B8 | Product Code field (manual entry) | ✅ |
| B9 | Privilege flags (6 types) + conditional upload zones + file list | ✅ |
| B10 | Auto-calculations (FOB/NetWeight/Packages auto-sum) | ✅ |
| B11 | Mandatory field validation + error summary | ✅ |

### รายละเอียดแต่ละ Section

**Section 1 — Document Control**
DocType, Release/Load Port, Purchase/Destination Country, Currency + Exchange Rate, Transport Mode, Cargo Type, Vessel Name, Departure Date, Master B/L, House B/L

**Section 2 — Exporter & Agent**
Exporter lookup (Tax ID → auto-fill), Agent (จาก Customer config → read-only), Clearance Card, Manager ID/Name

**Section 3 — Invoice & Consignee**
Invoice No/Date, PO Number, Incoterms, Total Amount, Consignee (lookup/new), Freight, Insurance

**Section 4 — Shipment Summary**
Shipping Marks (multiline), Total Packages + Unit, Net/Gross Weight (auto-sum), Payment Method, Guarantee Method

**Section 5 — Line Items** (ตารางแต่ละรายการ)
- Product Code (lookup จาก ProductMaster หรือพิมพ์เอง)
- HS Code (autocomplete → auto-fill stat code, unit, tariff)
- Description EN/TH, Brand, Origin Country
- Quantity + Unit, Net/Gross Weight, Unit Price, FOB
- Privilege Flags (checkbox: BOI/Bond/Bis19/ReExport/FZ/IEAT/Compensation)
  - เมื่อเลือก → แสดง upload zone + License number + Expiry
  - ต้องแนบไฟล์อย่างน้อย 1 ไฟล์ต่อ flag (PDF/XLSX/PNG/JPG, max 20MB)

### ไฟล์ที่ต้องสร้าง/แก้ไข (Phase 5B)

| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| `src/factory-portal-complete_2.jsx` | เพิ่ม ManualDeclarationForm + ปุ่มกรอกเอง |
| `src/components/HsCodeLookup.jsx` | ใหม่ — HS code autocomplete |
| `src/components/LineItemsTable.jsx` | ใหม่ — ตารางรายการสินค้า |
| `src/components/PrivilegeUpload.jsx` | ใหม่ — upload zone ตามสิทธิประโยชน์ |

---

## Phase 5C: Integration (รอทำหลัง 5B)

| # | Task | สถานะ |
|---|------|-------|
| C1 | Form data → API สร้าง Job + Declaration + Items (save to DB) | ✅ |
| C2 | Generate XML ตาม XSD v4.00 + Preview modal | ✅ |
| C3 | Preview ใบขน PDF (กศก.101/1) ก่อน submit | ✅ |

---

## Privilege Flags → เอกสารที่ต้องแนบ

| Flag | privilegeType | เอกสารที่ต้องแนบ |
|------|--------------|-----------------|
| BOI | `BOI` | บัตรส่งเสริม BOI + ใบอนุญาตนำเข้า/ส่งออก |
| Bond | `Bond` | สัญญาค้ำประกัน + ใบขนนำเข้าเดิม |
| Section 19 | `Bis19` | ใบขนนำเข้าเดิม + หลักฐานชำระอากร |
| Re-export | `ReExport` | ใบขนนำเข้าเดิม + ใบรับรองการนำเข้า |
| FZ | `FZ` | หนังสืออนุญาตเขตปลอดอากร + บัญชีสินค้า |
| IEAT | `IEAT` | หนังสืออนุญาต กนอ. + สำเนาสัญญาเช่า |
| Compensation | `Compensation` | ใบสมัครรับค่าชดเชย + หลักฐานต้นทุน |

---

## Phase 6: Landing Page + งาน 1-6

> ✅ เสร็จสมบูรณ์ | 2026-03-30

### ลำดับ Implementation

```
Phase A (Foundation — คู่ขนานได้):
  A1. Landing Page (standalone + Login Card)          ✅
  A2. Notification System (backend + bell icon)       ✅

Phase B (Core — ต้องมี A2):
  B1. Job Assignment                                  ✅
  B2. Approval Workflow                               ✅

Phase C (Triggers — ต้องมี A2+B):
  C1. Customer Notifications                          ✅
  C2. Staff Alert                                     ✅

Phase D (Polish):
  D1. Read-only Mode Badge                            ✅
  D2. Customer Portal Dashboard                       ✅
```

### A1: Landing Page (9 sections)

| Section | Content |
|---------|---------|
| Navbar | Logo CUSTOMS-EDOC + nav links + ปุ่มเข้าสู่ระบบ (sticky) |
| Hero | Value prop (ซ้าย) + **Login Card** (ขวา) — 2 คอลัมน์ |
| Pain Points | 3 cards: กรอกซ้ำ / เอกสารผิด / ติดตามยาก |
| Features | 6 cards: AI / HS Code / NSW / สิทธิฯ / Dashboard / Billing |
| How It Works | 4 steps: สมัคร → สร้าง Shipment → ส่ง NSW → ติดตาม |
| Statistics | 15,913+ HS / กศก.101/1 / XSD v4.00 / 7 สิทธิประโยชน์ |
| Target Customers | 3 cards: Freight Forwarder / โรงงาน / Logistics |
| CTA Banner | "พร้อมเปลี่ยนการทำใบขนให้เร็วขึ้น?" + ปุ่ม สมัคร/ติดต่อ |
| Footer | Brand / Product / Resources / Contact (4 คอลัมน์) |

**Login Card** ฝังใน Hero Section — ใช้ useAuth() เดิม, login เดียวสำหรับทุก role

### A2: Notification System
- DB: Notification model (recipientId, type, title, message, entityType, entityId, isRead)
- Backend: `backend/src/notifications/` (module, service, controller)
- Frontend: `NotificationBell.jsx` — bell + badge + dropdown (polling 30s)

### B1: Job Assignment
- DB: LogisticsJob += assignedToId, assignedAt, assignedById
- Backend: PATCH /jobs/:id/assign + notification trigger
- Frontend: คอลัมน์ผู้รับผิดชอบ + dropdown เลือก staff

### B2: Approval Workflow
- DB: ApprovalStatus enum + ApprovalLog model
- Flow: Staff ขออนุมัติ → Manager approve/reject → Guard ก่อน submit NSW
- Backend: 3 endpoints (request-approval, approve, reject)
- Frontend: approval panel + badges + KPI card

### C1: Customer Notifications
- jobs.service.ts updateStatus() → notify CUSTOMER_ADMIN/CUSTOMER เมื่อสถานะเปลี่ยน

### C2: Staff Alert
- jobs.service.ts create() → notify TENANT_ADMIN/MANAGER/STAFF เมื่อ customer สร้าง shipment

### D1: Read-only Badge
- ReadOnlyBadge component + ตรวจ disabled buttons ทุกหน้า

### D2: Customer Dashboard
- CustomerDashboard.jsx ดึงข้อมูลจริงจาก jobsApi แทน mock data

### ไฟล์ที่สร้าง/แก้ไข (Phase 6)

| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| `src/LandingPage.jsx` | ใหม่ — Landing Page (9 sections + Login Card) |
| `src/index.css` | เพิ่ม Landing Page CSS + Notification Bell CSS |
| `src/factory-portal-complete_2.jsx` | Routing → LandingPage, NotificationBell, ApprovalBadge, ReadOnlyBanner, Assignment/Approval panels ใน ShipmentDetail |
| `src/api/jobsApi.js` | เพิ่ม assign/approve/reject/requestApproval/listStaff methods |
| `src/api/notificationsApi.js` | ใหม่ — Notification API client |
| `src/components/NotificationBell.jsx` | ใหม่ — Bell + badge + dropdown (polling 30s) |
| `src/hooks/usePermissions.js` | เพิ่ม canAssignJobs, canApproveJobs, canRequestApproval flags |
| `src/CustomerDashboard.jsx` | เขียนใหม่ — ดึงข้อมูลจาก API จริง (KPIs, pipeline, action center) |
| `backend/prisma/schema.prisma` | เพิ่ม Notification model, ApprovalLog, ApprovalStatus enum, Assignment fields |
| `backend/src/notifications/` | ใหม่ — NotificationsModule (service + controller) |
| `backend/src/jobs/jobs.service.ts` | เพิ่ม assignJob, requestApproval, approveJob, rejectJob + notification triggers |
| `backend/src/jobs/jobs.controller.ts` | เพิ่ม PATCH endpoints (assign, request-approval, approve, reject) |

---

## Pre-Deployment Security Audit

> ตรวจสอบ workflow ทั้งหมด + ความสัมพันธ์ข้อมูลทั้งระบบก่อน deploy production

### Phase 1: Critical Fixes — ✅ เสร็จ (2026-04-02)

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| C1 | API Keys & Secrets | ✅ | `.gitignore` เพิ่ม `backend/.env`, สร้าง `.env.example` |
| C2 | Rate Limiting | ✅ | `@nestjs/throttler` — 60 req/min global, 5 req/min login/register |
| C3 | helmet.js | ✅ | Security headers (X-Frame-Options, CSP, etc.) |
| C4 | CustomsData Auth | ✅ | ตั้งใจ public (Landing Page) + rate limit 30 req/min |
| C5 | **Role Guards ทุก controller** | ✅ | **7 controllers, 55+ endpoints** — `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()` |
| C6 | NSW assertAccess | ✅ | เพิ่ม `!user.customerId` สำหรับ NKTech internal staff |
| C7 | onDelete Relations | ✅ | Cascade/SetNull ครบ 10 relations ที่ขาด |
| H4 | documentsApi method | ✅ | POST → PATCH + แก้ URL path |
| H9 | CORS fail-fast | ✅ | Throw error ถ้า production ไม่มี FRONTEND_URL |
| M9 | forbidNonWhitelisted | ✅ | Reject unknown properties ใน request body |

### Phase 2: Before Go-live — ✅ เสร็จ (2026-04-02)

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| H1 | Soft delete (deletedAt) | ✅ | `deletedAt` field + `update` แทน `delete` + filter `deletedAt: null` |
| H2 | Race condition fix | ✅ | Serializable transaction ครอบ generateJobNo/generateInvoiceNo |
| H3 | /users endpoint | ✅ | UsersModule — `GET /users?role=STAFF,MANAGER` |
| H5 | billingApi.js + FinanceDashboard | ✅ | FinanceDashboard ดึงข้อมูลจริงจาก billing API |
| H6 | productsApi.js, masterApi.js | ✅ | Frontend API clients ครบ |
| H7 | Docker configuration | ✅ | Multi-stage Dockerfile (frontend + backend) + docker-compose + nginx |
| M8 | Env var validation (Joi) | ✅ | ConfigModule + Joi schema (DATABASE_URL, JWT_SECRET, etc.) |

### Phase 3: Post-launch — ✅ เสร็จ (2026-04-02)

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| M1 | Error logging | ✅ | Replace `.catch(() => null)` → `logger.error()` (9 instances in jobs.service + auth.service) |
| M2 | React Error Boundary | ✅ | `ErrorBoundary.jsx` ครอบ App — fallback UI + refresh button |
| M3 | authApi.me() revalidation | ✅ | AuthContext useEffect เรียก `authApi.me()` ตอน app load — ตรวจ deactivated users |
| M4 | Pagination (master/billing) | ✅ | HS codes + consignees: `page/limit` query params + `{ data, meta }` response |
| M5 | Master controller SUPER_ADMIN fix | ✅ | `resolveCustomerId()` — admin/internal ใช้ `?customerId=` query param |
| M6 | NSW approval status check | ✅ | เช็ค `job.approvalStatus` ก่อน submit — block PENDING/REJECTED, warn NONE |
| M7 | Swagger documentation | ✅ | `@nestjs/swagger` — available at `/api/docs` |
| L6 | Health check endpoint | ✅ | `GET /api/health` — DB connectivity check + timestamp |

### Phase 4: Technical Debt — ✅ เสร็จ (2026-04-03)

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| L1 | 401 interceptor redirect | ✅ | มีอยู่แล้วใน `client.js` — auto-logout + reload |
| L3 | Component decomposition | ✅ | **3158→91 lines** — แยก 20+ modules (ui/, dashboard/, shipments/, settings/, lib/) |
| L5 | NSW ebXML auto-retry | ✅ | Exponential backoff (1s→2s→4s), configurable `NSW_MAX_RETRIES`, `POST /nsw/retry-failed` endpoint |
| H8 | CI/CD Pipeline | ✅ | GitHub Actions — backend tsc, frontend vite build, Docker build check |
| L4 | TypeScript migration (frontend) | ⬜ | ต้องทำ separate PR — risk regression |
| L7 | Structured logging (pino/winston) | ⬜ | Phase 5D |
| L8 | Code splitting (React.lazy) | ⬜ | Phase 6+ (ต้องมี React Router ก่อน) |

### Phase 5A: Mock Data Elimination — ✅ เสร็จ (2026-04-03)

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| 5A.1 | Billing.jsx → billingApi | ✅ | ลบ mock 100% → เรียก `listInvoices()` + `listItems()` + loading/error/empty states |
| 5A.2 | MasterData.jsx → masterApi | ✅ | ทุก tab (HS/Exporters/Privileges/Consignees) CRUD ผ่าน API จริง, ข้อมูล persist |
| 5A.3 | NSWTracking.jsx mock removal | ✅ | ลบ SHIPMENTS fallback → empty state + error handling |
| 5A.4 | ShipmentList + Declarations mock removal | ✅ | `useState([])` แทน `useState(SHIPMENTS)` + error display |
| 5A.5 | สร้าง nswApi.js + privilegeDocsApi.js | ✅ | API clients ใหม่สำหรับ NSW retry + privilege document CRUD |

### Phase 5B: Frontend UX + Reports — ✅ เสร็จ (2026-04-03)

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| 5B.1 | Toast notification system | ✅ | ToastContext + ToastContainer + client.js interceptor (400/403/422/429/500 → Thai error messages) |
| 5B.2 | Reports.jsx → API + Recharts | ✅ | Backend ReportsModule (monthly-summary + top-destinations) + Recharts BarChart/PieChart + CSV export |
| 5B.3 | Global exception filter | ✅ | AllExceptionsFilter — Prisma P2002→409, P2025→404, P2003→400 + 5xx stack trace logging |

### Phase 5C: Backend Security + Testing — ⬜ รอ

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| 5C.1 | Refresh token implementation | ⬜ | RefreshToken model + rotate on use + 15min access / 7d refresh |
| 5C.2 | customsPasswordEnc encryption | ⬜ | AES-256-GCM + ENCRYPTION_KEY env var |
| 5C.3 | Backend test suite | ⬜ | auth/jobs/billing spec files + CI `npm test` step |

### Phase 5D: Architecture Polish — ⬜ รอ

| # | Item | สถานะ | รายละเอียด |
|---|------|-------|-----------|
| 5D.1 | Super-admin-console decomposition | ⬜ | 1,992 lines → ~100-150 lines + 5-6 modules |
| 5D.2 | Swagger endpoint decorators | ⬜ | @ApiTags/@ApiOperation/@ApiResponse ทุก controller |
| 5D.3 | Structured logging | ⬜ | JSON format + correlation ID middleware |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@customs-edoc.local | Admin1234! |
| CUSTOMER_ADMIN (HHA) | napa@hha-thailand.com | Hha@2026! |
| CUSTOMER (HHA) | somchai@hha-thailand.com | Hha@2026! |
| CUSTOMER_ADMIN (DKSH) | wanna@dksh.co.th | Dksh@2026! |
| CUSTOMER (DKSH) | ploypailin@dksh.co.th | Dksh@2026! |

---

## ไฟล์สำคัญ

| ไฟล์ | หน้าที่ |
|------|--------|
| `backend/prisma/schema.prisma` | Database schema (roles, models, enums) |
| `backend/prisma/seed.ts` | Seed ข้อมูลทดสอบ |
| `backend/src/products/` | ProductMaster CRUD API |
| `backend/src/privilege-docs/` | PrivilegeDocument upload/list/delete API |
| `src/components/ManualDeclarationForm.jsx` | ฟอร์มกรอกใบขน กศก.101/1 (5 sections) |
| `src/factory-portal-complete_2.jsx` | หน้าหลัก factory portal (nav, screens, RBAC) |
| `src/super-admin-console.jsx` | Super Admin Console |
| `src/hooks/usePermissions.js` | Frontend permission hook (20+ flags) |
| `src/data/masterCodes.js` | Master data (Country/Currency/Unit/Port/Customs/Incoterms) |

---

## ข้อมูลอ้างอิง (Google Drive)

| ไฟล์ | ใช้ทำอะไร |
|------|----------|
| `hscode8digits_ahtnprotocol2022.csv` | HS Code master (15,913 codes) |
| `HHA (THAILAND) CO., LTD. Update.csv` | Template mock jobs (93 items) |
| `CustomsExportDeclaration_4_00.xsd` | Export Declaration XSD schema |
| `117362_Export_BKKC65357.XML` | ตัวอย่าง XML จริง (HDMC/Harley-Davidson) |
| `Export Declaration Form.pdf` | ตัวอย่าง กศก.101/1 |
| `NetBay-ShippingNet*.png` | UI ของ NetBay (Declaration Control + Goods Detail) |
