import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });
const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
);

// ─── Helper: Create or get Supabase Auth user ─────────────────────
async function ensureSupabaseUser(email: string, password: string, fullName: string) {
  const { data: listData } = await supabase.auth.admin.listUsers();
  let user = listData?.users?.find((u) => u.email === email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw new Error(`Supabase createUser failed for ${email}: ${error.message}`);
    user = data.user;
    console.log(`  ✅ Auth user created: ${email}`);
  } else {
    console.log(`  ℹ️  Auth user exists: ${email}`);
  }
  return user;
}

// ─── Helper: Upsert Profile ───────────────────────────────────────
async function ensureProfile(id: string, email: string, fullName: string) {
  await prisma.profile.upsert({
    where: { id },
    create: { id, email, fullName },
    update: { fullName },
  });
}

// ─── 1. SUPER ADMIN ──────────────────────────────────────────────
async function seedSuperAdmin() {
  console.log('\n🌱 1. Seeding Super Admin...');
  const email = 'admin@customs-edoc.local';
  const password = 'Admin1234!';
  const fullName = 'Super Admin';

  const user = await ensureSupabaseUser(email, password, fullName);
  await ensureProfile(user.id, email, fullName);
  console.log('  ✅ Super Admin ready');
  return user.id;
}

// ─── 2. CUSTOMERS (HHA, DKSH) ───────────────────────────────────
async function seedCustomers() {
  console.log('\n🌱 2. Seeding Customers (HHA, DKSH)...');

  const customers = [
    {
      code: 'HHA',
      companyNameTh: 'บริษัท เอชเอชเอ (ประเทศไทย) จำกัด',
      companyNameEn: 'HHA (THAILAND) CO., LTD.',
      taxId: '0105564012345',
      address: '700/867 หมู่ 1 ต.พานทอง อ.พานทอง จ.ชลบุรี 20160',
      postcode: '20160',
      phone: '038-206789',
      email: 'napa@hha-thailand.com',
      billingType: 'PER_JOB' as const,
      pricePerJob: 450,
      status: 'ACTIVE' as const,
      brokerName: 'NKTech Customs Co., Ltd.',
      brokerTaxId: '0105567000001',
      agentCardNo: 'CC-2568-00456',
      agentName: 'นางสาวมนัสนันท์ ศรีวิไล',
      nswAgentCode: 'NSW-HHA-001',
    },
    {
      code: 'DKSH',
      companyNameTh: 'บริษัท ดีเคเอสเอช (ประเทศไทย) จำกัด',
      companyNameEn: 'DKSH (Thailand) Limited',
      taxId: '0105535012678',
      address: '2106 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310',
      postcode: '10310',
      phone: '02-206-5900',
      email: 'wanna@dksh.co.th',
      billingType: 'TERM' as const,
      termDays: 30,
      pricePerJob: 480,
      status: 'ACTIVE' as const,
      brokerName: 'NKTech Customs Co., Ltd.',
      brokerTaxId: '0105567000001',
      agentCardNo: 'CC-2568-00457',
      agentName: 'นายธนพล วัฒนกุล',
      nswAgentCode: 'NSW-DKSH-001',
    },
  ];

  const customerIds: Record<string, string> = {};

  for (const c of customers) {
    const customer = await prisma.customer.upsert({
      where: { code: c.code },
      create: c,
      update: {
        companyNameTh: c.companyNameTh,
        companyNameEn: c.companyNameEn,
        email: c.email,
        status: c.status,
      },
    });
    customerIds[c.code] = customer.id;
    console.log(`  ✅ Customer ${c.code}: ${customer.id}`);
  }

  return customerIds;
}

// ─── 3. CUSTOMER USERS ──────────────────────────────────────────
async function seedCustomerUsers(customerIds: Record<string, string>) {
  console.log('\n🌱 3. Seeding Customer Users...');

  const users = [
    {
      email: 'napa@hha-thailand.com',
      password: 'Hha@2026!',
      fullName: 'คุณนภา ศรีสุข',
      customerCode: 'HHA',
      role: 'CUSTOMER_ADMIN' as const,
    },
    {
      email: 'somchai@hha-thailand.com',
      password: 'Hha@2026!',
      fullName: 'คุณสมชาย ประเสริฐ',
      customerCode: 'HHA',
      role: 'CUSTOMER' as const,
    },
    {
      email: 'wanna@dksh.co.th',
      password: 'Dksh@2026!',
      fullName: 'คุณวรรณา พัฒนกุล',
      customerCode: 'DKSH',
      role: 'CUSTOMER_ADMIN' as const,
    },
    {
      email: 'ploypailin@dksh.co.th',
      password: 'Dksh@2026!',
      fullName: 'คุณพลอยไพลิน รัตนะ',
      customerCode: 'DKSH',
      role: 'CUSTOMER' as const,
    },
  ];

  for (const u of users) {
    const authUser = await ensureSupabaseUser(u.email, u.password, u.fullName);
    await ensureProfile(authUser.id, u.email, u.fullName);

    const customerId = customerIds[u.customerCode];
    await prisma.customerUser.upsert({
      where: { customerId_profileId: { customerId, profileId: authUser.id } },
      create: { customerId, profileId: authUser.id, role: u.role },
      update: { role: u.role },
    });
    console.log(`  ✅ ${u.customerCode} user: ${u.email} (${u.role})`);
  }
}

// ─── 4. HS CODE MASTER (from CSV) ───────────────────────────────
async function seedHsCodes(customerIds: Record<string, string>) {
  console.log('\n🌱 4. Seeding HS Code Master from CSV...');

  const csvPath = path.resolve(
    'G:/My Drive/งานส่วนตัว/งาน/งานพี่จุ่น/Project Custom-E-service/โครงสร้างระบบ/hscode8digits_ahtnprotocol2022.csv',
  );

  if (!fs.existsSync(csvPath)) {
    console.log('  ⚠️  HS code CSV not found, skipping. Path:', csvPath);
    return;
  }

  // Read CSV using xlsx (handles BOM)
  const workbook = XLSX.readFile(csvPath, { type: 'file' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<{ TRF: string; TRFDSC: string; TRFDSCENG: string }>(sheet);

  console.log(`  📦 Found ${rows.length} HS codes in CSV`);

  // Seed for each customer in batches
  for (const [code, customerId] of Object.entries(customerIds)) {
    console.log(`  📥 Seeding HS codes for ${code}...`);

    const batchSize = 500;
    let created = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      const data = batch
        .filter((r) => r.TRF && r.TRF.toString().trim())
        .map((r) => ({
          customerId,
          hsCode: r.TRF.toString().trim().substring(0, 20),
          descriptionTh: (r.TRFDSC || '').toString().trim().substring(0, 500),
          descriptionEn: (r.TRFDSCENG || '').toString().trim().substring(0, 500),
          dutyRate: 0,
          isActive: true,
        }));

      // Use createMany with skipDuplicates for speed
      const result = await prisma.hsMasterItem.createMany({
        data,
        skipDuplicates: true,
      });
      created += result.count;
    }
    console.log(`  ✅ ${code}: ${created} HS codes seeded`);
  }
}

// ─── 5. EXPORTERS ───────────────────────────────────────────────
async function seedExporters(customerIds: Record<string, string>) {
  console.log('\n🌱 5. Seeding Exporters...');

  const exporters = [
    {
      customerCode: 'HHA',
      nameTh: 'บริษัท เอชเอชเอ (ประเทศไทย) จำกัด',
      nameEn: 'HHA (THAILAND) CO., LTD.',
      taxId: '0105564012345',
      address: '700/867 หมู่ 1 ต.พานทอง อ.พานทอง จ.ชลบุรี 20160',
      postcode: '20160',
      isDefault: true,
    },
    {
      customerCode: 'DKSH',
      nameTh: 'บริษัท ดีเคเอสเอช (ประเทศไทย) จำกัด',
      nameEn: 'DKSH (Thailand) Limited',
      taxId: '0105535012678',
      address: '2106 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310',
      postcode: '10310',
      isDefault: true,
    },
  ];

  for (const e of exporters) {
    const customerId = customerIds[e.customerCode];
    await prisma.exporter.upsert({
      where: { id: `exp-${e.customerCode.toLowerCase()}` },
      create: {
        id: `exp-${e.customerCode.toLowerCase()}`,
        customerId,
        nameTh: e.nameTh,
        nameEn: e.nameEn,
        taxId: e.taxId,
        address: e.address,
        postcode: e.postcode,
        isDefault: e.isDefault,
      },
      update: { nameTh: e.nameTh },
    });
    console.log(`  ✅ Exporter: ${e.nameEn}`);
  }
}

// ─── 6. CONSIGNEES ──────────────────────────────────────────────
async function seedConsignees(customerIds: Record<string, string>) {
  console.log('\n🌱 6. Seeding Consignees...');

  const consignees = [
    // HHA consignees (import from China — HHA is the consignee/importer)
    {
      customerCode: 'HHA',
      nameEn: 'Guangdong HHA Electric Appliances Co., Ltd.',
      nameTh: 'กวางตง เอชเอชเอ อิเล็คทริค แอพพลายแอนซ์',
      country: 'China',
      countryCode: 'CN',
      address: 'No.8 Chenghan Road, Beijiao Town, Shunde District, Foshan, Guangdong',
    },
    {
      customerCode: 'HHA',
      nameEn: 'Zhejiang HHA Parts Manufacturing Co., Ltd.',
      nameTh: 'เจ้อเจียง เอชเอชเอ พาร์ทส์',
      country: 'China',
      countryCode: 'CN',
      address: 'No.18 Industrial Zone, Yuyao, Zhejiang',
    },
    // DKSH consignees
    {
      customerCode: 'DKSH',
      nameEn: 'Roche Diagnostics GmbH',
      nameTh: 'โรช ไดแอกโนสติกส์',
      country: 'Germany',
      countryCode: 'DE',
      address: 'Sandhofer Strasse 116, 68305 Mannheim, Germany',
    },
    {
      customerCode: 'DKSH',
      nameEn: 'Sika AG',
      nameTh: 'ซิก้า เอจี',
      country: 'Switzerland',
      countryCode: 'CH',
      address: 'Zugerstrasse 50, 6340 Baar, Switzerland',
    },
    {
      customerCode: 'DKSH',
      nameEn: 'Clariant International Ltd',
      nameTh: 'คลาเรียนท์ อินเตอร์เนชั่นแนล',
      country: 'Switzerland',
      countryCode: 'CH',
      address: 'Rothausstrasse 61, 4132 Muttenz, Switzerland',
    },
  ];

  for (const c of consignees) {
    const customerId = customerIds[c.customerCode];
    const id = `con-${c.customerCode.toLowerCase()}-${c.countryCode.toLowerCase()}-${consignees.indexOf(c)}`;
    await prisma.consignee.upsert({
      where: { id },
      create: { id, customerId, ...c, customerCode: undefined } as any,
      update: { nameEn: c.nameEn },
    });
    console.log(`  ✅ Consignee: ${c.nameEn} (${c.countryCode})`);
  }

  return consignees;
}

// ─── 7. PRIVILEGE CODES ─────────────────────────────────────────
async function seedPrivilegeCodes(customerIds: Record<string, string>) {
  console.log('\n🌱 7. Seeding Privilege Codes...');

  const privileges = [
    {
      customerCode: 'HHA',
      code: 'BOI-HHA-001',
      nameTh: 'สิทธิ BOI — เครื่องจักรและอุปกรณ์ผลิตเครื่องปรับอากาศ',
      nameEn: 'BOI — Air conditioner manufacturing machinery',
      type: 'BOI',
      taxBenefit: 'ยกเว้นอากรขาเข้าเครื่องจักร 100%',
      refNumber: 'BOI-2568-HHA-0001',
      expiryDate: new Date('2029-12-31'),
    },
    {
      customerCode: 'HHA',
      code: 'IEAT-HHA-001',
      nameTh: 'สิทธิ กนอ. — นิคมอุตสาหกรรมอมตะนคร',
      nameEn: 'IEAT — Amata Nakorn Industrial Estate',
      type: 'IEAT',
      taxBenefit: 'ยกเว้นอากรขาเข้าวัตถุดิบเพื่อผลิตส่งออก',
      refNumber: 'IEAT-AN-2567-0456',
      expiryDate: new Date('2028-06-30'),
    },
    {
      customerCode: 'DKSH',
      code: 'FZ-DKSH-001',
      nameTh: 'สิทธิเขตปลอดอากร — ท่าเรือแหลมฉบัง',
      nameEn: 'Free Zone — Laem Chabang Port',
      type: 'FreeZone',
      taxBenefit: 'ยกเว้นอากรสินค้าในเขตปลอดอากร',
      refNumber: 'FZ-LCB-2568-0089',
      expiryDate: new Date('2029-03-31'),
    },
  ];

  for (const p of privileges) {
    const customerId = customerIds[p.customerCode];
    const id = `priv-${p.code.toLowerCase()}`;
    await prisma.privilegeCode.upsert({
      where: { id },
      create: {
        id,
        customerId,
        code: p.code,
        nameTh: p.nameTh,
        nameEn: p.nameEn,
        type: p.type,
        taxBenefit: p.taxBenefit,
        refNumber: p.refNumber,
        expiryDate: p.expiryDate,
      },
      update: { nameTh: p.nameTh },
    });
    console.log(`  ✅ Privilege: ${p.code} (${p.type})`);
  }
}

// ─── 8. SAMPLE JOBS + DECLARATIONS (HHA import data) ────────────
async function seedSampleJobs(customerIds: Record<string, string>, superAdminId: string) {
  console.log('\n🌱 8. Seeding Sample Jobs + Declarations...');

  // ── HHA Jobs (Import from China) ──
  const hhaJobs = [
    {
      jobNo: 'JOB-2026-0044',
      type: 'IMPORT' as const,
      status: 'CUSTOMS_REVIEW' as const,
      vesselName: 'SITC GUANGXI V.2403S',
      voyageNo: '2403S',
      transportMode: 'SEA' as const,
      etd: new Date('2026-03-18'),
      eta: new Date('2026-03-22'),
      portOfLoading: 'Shanghai, China',
      portOfLoadingCode: 'CNSHA',
      portOfDischarge: 'Laem Chabang, Thailand',
      portOfReleaseCode: 'THLCH',
      containerNo: 'SITU3812450',
      sealNo: 'SH2403-8812',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 12714.28, // CNY 434,999 / ~7.8 * ~0.228 (approx)
      currency: 'CNY',
    },
    {
      jobNo: 'JOB-2026-0043',
      type: 'IMPORT' as const,
      status: 'CLEARED' as const,
      vesselName: 'OOCL DALIAN V.015N',
      voyageNo: '015N',
      transportMode: 'SEA' as const,
      etd: new Date('2026-03-10'),
      eta: new Date('2026-03-15'),
      portOfLoading: 'Dalian, China',
      portOfLoadingCode: 'CNDLC',
      portOfDischarge: 'Laem Chabang, Thailand',
      portOfReleaseCode: 'THLCH',
      containerNo: 'OOLU2918340',
      sealNo: 'DL015N-3340',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 8401.26,
      currency: 'CNY',
    },
    {
      jobNo: 'JOB-2026-0042',
      type: 'IMPORT' as const,
      status: 'COMPLETED' as const,
      vesselName: 'COSCO SHIPPING V.1205',
      voyageNo: '1205',
      transportMode: 'SEA' as const,
      etd: new Date('2026-03-03'),
      eta: new Date('2026-03-08'),
      portOfLoading: 'Ningbo, China',
      portOfLoadingCode: 'CNNGB',
      portOfDischarge: 'Laem Chabang, Thailand',
      portOfReleaseCode: 'THLCH',
      containerNo: 'CSNU8192034',
      sealNo: 'NB1205-2034',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 5223.53,
      currency: 'CNY',
    },
  ];

  // ── DKSH Jobs (Mixed Import/Export) ──
  const dkshJobs = [
    {
      jobNo: 'JOB-2026-0041',
      type: 'IMPORT' as const,
      status: 'NSW_PROCESSING' as const,
      vesselName: 'COSCO SHIPPING V.88',
      voyageNo: '088',
      transportMode: 'SEA' as const,
      etd: new Date('2026-03-16'),
      eta: new Date('2026-03-21'),
      portOfLoading: 'Hamburg, Germany',
      portOfLoadingCode: 'DEHAM',
      portOfDischarge: 'Laem Chabang, Thailand',
      portOfReleaseCode: 'THLCH',
      containerNo: 'CSNU5291834',
      sealNo: 'HH088-1834',
      consigneeNameEn: 'DKSH (Thailand) Limited',
      totalFobUsd: 67300,
      currency: 'EUR',
    },
    {
      jobNo: 'JOB-2026-0040',
      type: 'EXPORT' as const,
      status: 'COMPLETED' as const,
      vesselName: 'TG676',
      voyageNo: 'TG676',
      transportMode: 'AIR' as const,
      etd: new Date('2026-03-14'),
      portOfLoading: 'Suvarnabhumi Airport',
      portOfLoadingCode: 'THBKK',
      portOfDischarge: 'Frankfurt, Germany',
      portOfReleaseCode: 'DEFRA',
      containerNo: 'AWB-0291834',
      consigneeNameEn: 'Roche Diagnostics GmbH',
      totalFobUsd: 145800,
      currency: 'USD',
    },
  ];

  const allJobs = [
    ...hhaJobs.map((j) => ({ ...j, customerCode: 'HHA' })),
    ...dkshJobs.map((j) => ({ ...j, customerCode: 'DKSH' })),
  ];

  const jobIds: Record<string, string> = {};

  for (const j of allJobs) {
    const customerId = customerIds[j.customerCode];
    const existing = await prisma.logisticsJob.findUnique({ where: { jobNo: j.jobNo } });
    if (existing) {
      jobIds[j.jobNo] = existing.id;
      console.log(`  ℹ️  Job exists: ${j.jobNo}`);
      continue;
    }

    const job = await prisma.logisticsJob.create({
      data: {
        customerId,
        jobNo: j.jobNo,
        type: j.type,
        status: j.status,
        vesselName: j.vesselName,
        voyageNo: j.voyageNo,
        transportMode: j.transportMode,
        etd: j.etd,
        eta: j.eta,
        portOfLoading: j.portOfLoading,
        portOfLoadingCode: j.portOfLoadingCode,
        portOfDischarge: j.portOfDischarge,
        portOfReleaseCode: j.portOfReleaseCode,
        containerNo: j.containerNo,
        sealNo: j.sealNo,
        consigneeNameEn: j.consigneeNameEn,
        totalFobUsd: j.totalFobUsd,
        currency: j.currency,
        createdById: superAdminId,
      },
    });
    jobIds[j.jobNo] = job.id;
    console.log(`  ✅ Job: ${j.jobNo} (${j.type} — ${j.status})`);
  }

  // ── Declaration for HHA JOB-2026-0044 (from HHA000406A data) ──
  const hhaJobId = jobIds['JOB-2026-0044'];
  const hhaCustomerId = customerIds['HHA'];

  if (hhaJobId) {
    const existingDecl = await prisma.exportDeclaration.findFirst({
      where: { jobId: hhaJobId },
    });

    if (!existingDecl) {
      const decl = await prisma.exportDeclaration.create({
        data: {
          customerId: hhaCustomerId,
          jobId: hhaJobId,
          declarationType: 'WITHOUT_PRIVILEGE',
          invoiceRef: 'HHA000406A',
          transportMode: 'SEA',
          portOfReleaseCode: 'THLCH',
          portOfLoadingCode: 'CNSHA',
          soldToCountryCode: 'TH',
          destinationCode: 'TH',
          exchangeCurrency: 'CNY',
          exchangeRate: 4.8526,
          totalPackages: 1,
          shippingMarks: 'K8PYD',
          vesselName: 'SITC GUANGXI V.2403S',
          departureDate: new Date('2026-03-18'),
          exporterTaxId: '0105564012345',
          exporterNameTh: 'บริษัท เอชเอชเอ (ประเทศไทย) จำกัด',
          exporterNameEn: 'HHA (THAILAND) CO., LTD.',
          brokerTaxId: '0105567000001',
          agentCardNo: 'CC-2568-00456',
          agentName: 'นางสาวมนัสนันท์ ศรีวิไล',
        },
      });

      // Declaration Items (from HHA000406A — 12 representative items)
      const items = [
        { seqNo: 1,  hsCode: '73181590', descriptionEn: 'SCREW',                   descriptionTh: 'สกรู',                          qty: 7940,     unit: 'C62', price: 0.0102, amt: 81.20,    origin: 'CN' },
        { seqNo: 2,  hsCode: '39269099', descriptionEn: 'STRAPPING BAND',           descriptionTh: 'สายรัดบรรจุภัณฑ์',              qty: 32473.57, unit: 'MTR', price: 0.04,   amt: 1299.23,  origin: 'CN' },
        { seqNo: 3,  hsCode: '39269099', descriptionEn: 'CABLE TIE',                descriptionTh: 'เคเบิลไทร์',                   qty: 19850,    unit: 'C62', price: 0.0164, amt: 325.54,   origin: 'CN' },
        { seqNo: 4,  hsCode: '39173999', descriptionEn: 'EXHAUST HOSE',             descriptionTh: 'ท่ออ่อนสำหรับระบายอากาศ',       qty: 164,      unit: 'C62', price: 0.051,  amt: 73607.26, origin: 'CN' },
        { seqNo: 5,  hsCode: '39269099', descriptionEn: 'COVER',                    descriptionTh: 'ฝาครอบทำจากพลาสติก',            qty: 89340,    unit: 'C62', price: 0.0038, amt: 58153.53, origin: 'CN' },
        { seqNo: 6,  hsCode: '85015229', descriptionEn: 'MOTOR',                    descriptionTh: 'มอเตอร์ไฟฟ้า',                  qty: 1200,     unit: 'C62', price: 41.14,  amt: 49369.24, origin: 'CN' },
        { seqNo: 7,  hsCode: '85444299', descriptionEn: 'WIRE HARNESS',             descriptionTh: 'ชุดสายไฟฟ้า',                   qty: 3600,     unit: 'C62', price: 11.93,  amt: 42954.49, origin: 'CN' },
        { seqNo: 8,  hsCode: '74111000', descriptionEn: 'SUCTION PIPE ASSEMBLY',    descriptionTh: 'ท่อทองแดงสำหรับระบบทำความเย็น', qty: 1200,     unit: 'C62', price: 24.07,  amt: 28882.73, origin: 'CN' },
        { seqNo: 9,  hsCode: '85322900', descriptionEn: 'CAPACITOR',                descriptionTh: 'ตัวเก็บประจุ',                  qty: 2400,     unit: 'C62', price: 9.91,   amt: 23791.43, origin: 'CN' },
        { seqNo: 10, hsCode: '39173299', descriptionEn: 'HOSE DRAIN ASSY',          descriptionTh: 'ท่อน้ำทิ้งแอร์',                qty: 3600,     unit: 'C62', price: 6.02,   amt: 21680.24, origin: 'CN' },
        { seqNo: 11, hsCode: '85312000', descriptionEn: 'STICKER KEY PRESS FILM',   descriptionTh: 'ฟิล์มกดปุ่ม / เมมเบรนสวิตช์',  qty: 3600,     unit: 'C62', price: 4.34,   amt: 15633.68, origin: 'CN' },
        { seqNo: 12, hsCode: '40169999', descriptionEn: 'DAMPING RUBBER',           descriptionTh: 'ยางกันสั่นสะเทือน',             qty: 10200,    unit: 'C62', price: 1.53,   amt: 15631.38, origin: 'CN' },
      ];

      await prisma.declarationItem.createMany({
        data: items.map((item) => ({
          declarationId: decl.id,
          customerId: hhaCustomerId,
          seqNo: item.seqNo,
          hsCode: item.hsCode,
          descriptionEn: item.descriptionEn,
          descriptionTh: item.descriptionTh,
          quantity: item.qty,
          quantityUnit: item.unit,
          fobForeign: item.amt,
          fobCurrency: 'CNY',
          dutyRate: 0,
          hsVerification: 'AI_MATCHED',
          hsConfidence: 0.95,
        })),
        skipDuplicates: true,
      });
      console.log(`  ✅ Declaration HHA000406A: ${items.length} items`);
    } else {
      console.log('  ℹ️  Declaration for JOB-2026-0044 already exists');
    }
  }
}

// ─── MAIN ───────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Custom-E-service — Full Seed');
  console.log('═══════════════════════════════════════════════════');

  // 1. Super Admin
  const superAdminId = await seedSuperAdmin();

  // 2. Customers
  const customerIds = await seedCustomers();

  // 3. Customer Users
  await seedCustomerUsers(customerIds);

  // 4. HS Codes from CSV
  await seedHsCodes(customerIds);

  // 5. Exporters
  await seedExporters(customerIds);

  // 6. Consignees
  await seedConsignees(customerIds);

  // 7. Privilege Codes
  await seedPrivilegeCodes(customerIds);

  // 8. Sample Jobs + Declarations
  await seedSampleJobs(customerIds, superAdminId);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  🎉 Full seed complete!');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n📋 Test Accounts:');
  console.log('─────────────────────────────────────────');
  console.log('Super Admin  : admin@customs-edoc.local / Admin1234!');
  console.log('HHA Admin    : napa@hha-thailand.com / Hha@2026!');
  console.log('HHA User     : somchai@hha-thailand.com / Hha@2026!');
  console.log('DKSH Admin   : wanna@dksh.co.th / Dksh@2026!');
  console.log('DKSH User    : ploypailin@dksh.co.th / Dksh@2026!');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
