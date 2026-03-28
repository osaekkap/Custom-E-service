# Custom-E-service — Master Plan

> อัปเดต: 2026-03-28 | กำลังทำ: **Phase 5C** (Integration — XML + PDF preview)

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
| **5C** | **Integration — XML generation + PDF preview** | ⏳ กำลังทำ |

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
| C1 | Form data → ExportDeclaration + DeclarationItems (save to DB) | ❌ |
| C2 | Generate XML ตาม XSD v4.00 | ❌ |
| C3 | Preview ใบขน PDF (กศก.101/1) ก่อน submit | ❌ |

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

## งานในอนาคต

| ลำดับ | งาน | Priority |
|-------|-----|----------|
| 1 | Approval Workflow (Manager อนุมัติก่อน submit NSW) | 🔴 สูง |
| 2 | Job Assignment (assign shipment ให้คนรับผิดชอบ) | 🟡 กลาง |
| 3 | Customer Notifications (แจ้งลูกค้าเมื่อสถานะเปลี่ยน) | 🟡 กลาง |
| 4 | Staff Alert (แจ้งเมื่อลูกค้า submit shipment ใหม่) | 🟡 กลาง |
| 5 | Read-only Mode Badge | 🟢 ต่ำ |
| 6 | Customer Portal Dashboard แบบง่าย | 🟢 ต่ำ |
| 7 | ย้าย mock data → DB queries จริง | 🟢 ต่ำ |

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
