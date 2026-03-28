# Custom-E-service — Master Plan

> Updated: 2026-03-28 (Part 4b-4e Backend Seed ✅)

---

## Phase 1–4: Backend Core (Auth, Jobs, Master Data, Docs, NSW, Schema)

| Phase | Module | Status |
|-------|--------|--------|
| 1 | Auth (login/register/me) + JwtStrategy + RolesGuard | ✅ |
| 1 | Customer CRUD (SUPER_ADMIN only) | ✅ |
| 1 | CustomerUser management (invite/role/remove) | ✅ |
| 2 | Jobs Module — CRUD + status transitions + audit trail | ✅ |
| 3 | Master Data (HS Codes, Exporters, Consignees, Privileges) | ✅ |
| 3 | Export Declaration กศก.101/1 + DeclarationItems + HS verify | ✅ |
| 3 | Billing (auto-create on COMPLETED + invoice bundling) | ✅ |
| 4.1 | Document Upload — Supabase Storage | ✅ |
| 4.1.5 | Schema Update — ExportDeclaration aligned with XSD v4.00 (23 fields) | ✅ |
| 4.2 | NSW Connector — XML Builder + ebXML SOAP + NswSubmission audit trail | ✅ |
| 4.3 | Frontend Integration — API layer, AuthContext, Login screen, Jobs list | ✅ |

---

## RBAC — Role-Based Access Control

### Roles (8 types — all defined in Prisma + usePermissions)

| Role | Group | Prisma | usePermissions | Nav Filter |
|------|-------|--------|----------------|------------|
| SUPER_ADMIN | ระบบ (NKTech) | ✅ | ✅ | ✅ |
| TENANT_ADMIN | แอดมิน (NKTech) | ✅ | ✅ | ✅ |
| MANAGER | ผู้บริหาร (NKTech) | ✅ | ✅ | ✅ |
| STAFF | เจ้าหน้าที่ (NKTech) | ✅ | ✅ | ✅ |
| CUSTOMER_ADMIN | แอดมินโรงงาน | ✅ | ✅ | ✅ |
| CUSTOMER | ลูกค้า/โรงงาน | ✅ | ✅ | ✅ |
| USER | Legacy alias | ✅ | ✅ | ✅ |
| VIEWER | Read-only | ✅ | ✅ | ✅ |

### Implementation Status

| Layer | File | Status |
|-------|------|--------|
| Backend Prisma enum | `backend/prisma/schema.prisma` | ✅ 8 roles |
| Backend RolesGuard | `backend/src/auth/roles.decorator.ts` | ✅ |
| Backend Audit scoping | `backend/src/audit/audit.controller.ts` | ✅ role-based log filtering |
| Frontend permissions hook | `src/hooks/usePermissions.js` | ✅ 20+ permission flags |
| Frontend nav filtering | `src/factory-portal-complete_2.jsx` | ✅ per-role nav items |
| Frontend screen guards | `src/factory-portal-complete_2.jsx` | ✅ access denied + read-only |

---

## UI Redesign (Customs-Edoc-test2 style)

| Step | Item | Status |
|------|------|--------|
| 1 | Color constants → CSS variables | ✅ |
| 2 | Google Fonts (Sarabun + DM Sans) | ✅ |
| 3 | Global CSS (focus ring, scrollbar, grids) | ✅ |
| 4 | App root div (use global font) | ✅ |
| 5 | Card border-radius 8px + shadow | ✅ |
| 6 | Badge border-radius 6px | ✅ |
| 7 | Input backgrounds white + focus ring | ✅ |
| 8 | Table row hover | ✅ |
| 9 | LoginScreen logo color | ✅ |
| 10 | Sidebar — white, blue accents, nav labels | ✅ |
| 11 | Btn transitions | ✅ |
| 12 | Visual QA | ✅ |

---

## Data Plan — Google Drive Reference Data

### Frontend Mock Data

| Part | Item | File | Status |
|------|------|------|--------|
| 1 | Super Admin "All Jobs" (16 jobs, HHA/DKSH tenants) | `src/super-admin-console.jsx` | ✅ |
| 1 | HHA_DECL_ITEMS (12 items from HHA000406A) | `src/super-admin-console.jsx` | ✅ |
| 1 | HHA tenant (T006) + DKSH tenant (T007) | `src/super-admin-console.jsx` | ✅ |
| 2 | HS Code Master — 61 real codes (7 categories) | `src/factory-portal-complete_2.jsx` | ✅ |
| 3 | Master Codes (Country/Currency/Unit/Port/Transport/Package/Privilege) | `src/data/masterCodes.js` | ✅ |

### Backend Seed

| Part | Item | File | Status |
|------|------|------|--------|
| 4a | Seed Super Admin user | `backend/prisma/seed.ts` | ✅ |
| 4b | Seed HS codes from hscode8digits CSV (15,913 records per customer) | `backend/prisma/seed.ts` | ✅ 24,495 records |
| 4c | Seed HHA customer + 3 jobs + declaration (12 items from HHA000406A) | `backend/prisma/seed.ts` | ✅ |
| 4d | Seed DKSH customer + 2 jobs (Import/Export) | `backend/prisma/seed.ts` | ✅ |
| 4e | Seed Exporters (2), Consignees (5), PrivilegeCodes (3) | `backend/prisma/seed.ts` | ✅ |
| 4f | Seed Customer Users (4 users: HHA admin+user, DKSH admin+user) | `backend/prisma/seed.ts` | ✅ |

---

## XSD Gap Analysis — ExportDeclaration vs XSD v4.00

| Group | Status |
|-------|--------|
| Exporter fields (TaxId, Branch, Names, Address) | ✅ Added |
| Agent/Broker (Branch) | ✅ Added |
| AuthorisedPerson (ManagerIDCard, ManagerName) | ✅ Added |
| Transport (CargoTypeCode, VesselName, DepartureDate) | ✅ Added |
| Bill of Lading (Master, House) | ✅ Added |
| Package/Weight (ShippingMarks, NetWeight, GrossWeight, Units) | ✅ Added |
| FOB/Financial (FobForeign, PaymentMethod, GuaranteeMethod) | ✅ Added |
| NSW/Reference (ReferenceNumber, DocumentType, RegistrationId) | ✅ Added |
| DeclarationItem fields (all GoodsItem XSD fields) | ✅ Complete |

---

## Pending / Future Work

### Priority: High (ต้องทำ)

| # | Item | Notes |
|---|------|-------|
| — | ~~Backend seed expansion~~ | ✅ Completed 2026-03-28 |

### Priority: Medium (แนะนำ)

| # | Item | Notes |
|---|------|-------|
| 2 | Approval Workflow | Manager อนุมัติก่อน submit NSW |
| 3 | Job Assignment | Admin/Staff assign shipment ให้คนรับผิดชอบ |
| 4 | Customer Notifications | แจ้งลูกค้าเมื่อสถานะ shipment เปลี่ยน |
| 5 | Staff Alert | เมื่อ Customer submit shipment ใหม่ |

### Priority: Low (เสริม)

| # | Item | Notes |
|---|------|-------|
| 6 | Read-only Mode Badge | แสดง "View Only" เมื่อ Manager ดู form |
| 7 | Customer Portal Simplified Dashboard | Widget เฉพาะลูกค้า |
| 8 | Move mock data to DB queries | แทน hardcoded arrays ใน frontend |

---

## Database Stats (after seed 2026-03-28)

| Table | Count |
|-------|-------|
| Customers | 5 (THEL, SAPT, MITR + HHA, DKSH) |
| Profiles | 14 |
| CustomerUsers | 13 |
| HS Codes | 24,495 |
| Exporters | 3 |
| Consignees | 6 |
| PrivilegeCodes | 4 |
| LogisticsJobs | 10 |
| ExportDeclarations | — |
| DeclarationItems | 15 |

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@customs-edoc.local | Admin1234! |
| CUSTOMER_ADMIN (HHA) | napa@hha-thailand.com | Hha@2026! |
| CUSTOMER (HHA) | somchai@hha-thailand.com | Hha@2026! |
| CUSTOMER_ADMIN (DKSH) | wanna@dksh.co.th | Dksh@2026! |
| CUSTOMER (DKSH) | ploypailin@dksh.co.th | Dksh@2026! |

---

## Data Sources (Google Drive)

| File | Purpose |
|------|---------|
| `hscode8digits_ahtnprotocol2022.csv` | HS Code master (15,913 codes) |
| `ตัวอย่างพิกัด.csv` | สถิติส่งออก (202,908 records) |
| `HHA (THAILAND) CO., LTD. Update.csv` | Template mock jobs + declaration items (93 items) |
| `HHA泰国进口清关需求...xlsx` | ตัวอย่าง import case (Invoice + Packing List) |
| `data-dict-rtc_03_03.xlsx` | Data dictionary — field definitions |
| `CustomsExportDeclaration_4_00.xsd` | Export Declaration XSD schema |
| `CustomsResponse_10_00.xsd` | Customs Response XSD schema |
| `mockup/*.pdf` | Booking, Invoice, Packing, ใบขนสินค้าขาออก |

---

## Critical Files Reference

| File | Role |
|------|------|
| `backend/prisma/schema.prisma` | Database schema (roles, models, enums) |
| `backend/prisma/seed.ts` | Database seeding |
| `backend/src/auth/` | Auth module (JWT, roles, guards) |
| `backend/src/audit/audit.controller.ts` | Audit log with role-based scoping |
| `src/factory-portal-complete_2.jsx` | Main factory portal (nav, screens, RBAC) |
| `src/super-admin-console.jsx` | Super Admin Console (All Jobs, Tenants, Billing) |
| `src/hooks/usePermissions.js` | Frontend permission hook (20+ flags) |
| `src/data/masterCodes.js` | Frontend master data (Country/Currency/Unit/Port) |
| `src/LoginScreen.jsx` | Login page |
| `src/RegisterScreen.jsx` | Registration page |
| `src/index.css` | Design system (CSS variables, typography, shadows) |
| `index.html` | Google Fonts, meta tags |
