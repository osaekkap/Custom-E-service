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
  let user = listData?.users?.find((u: any) => u.email === email);

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

// ─── CMS SEED ─────────────────────────────────────────────────────
async function seedCms() {
  console.log('\n📄 Seeding CMS Landing Page...');

  // Theme (upsert single row)
  const existing = await prisma.cmsTheme.findFirst();
  if (!existing) {
    await prisma.cmsTheme.create({ data: {} }); // all defaults
    console.log('  ✅ CMS Theme created (defaults)');
  } else {
    console.log('  ℹ️  CMS Theme already exists');
  }

  // Sections + Cards
  const sections = [
    {
      slug: 'hero', sortOrder: 0,
      title: 'ระบบใบขนสินค้า อิเล็กทรอนิกส์ ครบวงจร',
      subtitle: 'ยื่นใบขน กศก.101/1 ผ่าน National Single Window ด้วย AI ที่ช่วยกรอกข้อมูล ค้นหา HS Code อัตโนมัติ และจัดการ สิทธิประโยชน์ทางภาษี — ทั้งหมดในระบบเดียว',
      metadata: {
        badge: 'พร้อมให้บริการ · NSW Thailand Connected',
        ctaPrimary: 'เริ่มต้นใช้งาน →',
        ctaSecondary: 'เข้าสู่ระบบ',
        trustBadges: ['XSD v4.00', 'ebXML v2.0', 'ISO 27001', 'PDPA'],
      },
      cards: [
        { icon: '🤖', title: 'AI สกัดข้อมูลจากเอกสาร', sortOrder: 0 },
        { icon: '📋', title: 'HS Code 15,913+ รายการ', sortOrder: 1 },
        { icon: '🔗', title: 'เชื่อม NSW/ebXML อัตโนมัติ', sortOrder: 2 },
        { icon: '🛡️', title: 'รองรับ 7 สิทธิประโยชน์', sortOrder: 3 },
      ],
    },
    {
      slug: 'live-data', sortOrder: 1,
      title: 'อัตราแลกเปลี่ยน',
      metadata: { currencies: ['USD', 'EUR', 'JPY', 'CNY', 'GBP'] },
      cards: [],
    },
    {
      slug: 'exchange-rates', sortOrder: 2,
      title: 'อัตราแลกเปลี่ยนวันนี้',
      subtitle: 'ข้อมูลจากกรมศุลกากร',
      tagText: 'LIVE DATA', tagColor: '#16A34A',
      metadata: { highlightCurrencies: ['USD', 'EUR', 'JPY'], visibleCount: 10 },
      cards: [],
    },
    {
      slug: 'news', sortOrder: 3,
      title: 'ข่าวสารจากกรมศุลกากร',
      subtitle: 'อัปเดตล่าสุดจาก customs.go.th',
      tagText: 'ข่าวศุลกากร', tagColor: '#F59E0B',
      cards: [],
    },
    {
      slug: 'pain-points', sortOrder: 4,
      title: 'การทำใบขนแบบเดิม\nยุ่งยากเกินไป',
      subtitle: 'หลายบริษัทยังเสียเวลากับกระบวนการที่ทำซ้ำได้',
      tagText: 'ปัญหาที่พบบ่อย', tagColor: '#EF4444',
      cards: [
        { icon: '📝', title: 'กรอกข้อมูลซ้ำ', description: 'ข้อมูลเดิมๆ ต้องพิมพ์ใหม่ทุกครั้ง ใบขน Invoice Packing List — เสียเวลาหลายชั่วโมง', color: '#EF4444', sortOrder: 0 },
        { icon: '❌', title: 'เอกสารผิดพลาด', description: 'HS Code ผิด น้ำหนักไม่ตรง FOB คำนวณพลาด — ถูก Reject ต้องแก้ไขยื่นใหม่', color: '#F59E0B', sortOrder: 1 },
        { icon: '🔍', title: 'ติดตามสถานะยาก', description: 'ไม่รู้ว่าใบขนไปถึงไหนแล้ว ต้องโทรถามกรมศุลกากรเอง ไม่มี dashboard', color: '#8B5CF6', sortOrder: 2 },
      ],
    },
    {
      slug: 'features', sortOrder: 5,
      title: 'ทุกเครื่องมือที่คุณต้องการ',
      subtitle: 'ระบบครบวงจรตั้งแต่สร้าง Shipment จนถึงผ่านพิธีการศุลกากร',
      tagText: 'ฟีเจอร์หลัก', tagColor: '#2563EB',
      cards: [
        { icon: '🤖', title: 'AI Document Extraction', description: 'อัปโหลด Invoice + Packing List → AI สกัดข้อมูลและกรอก กศก.101/1 ให้อัตโนมัติ', color: '#2563EB', sortOrder: 0 },
        { icon: '🔎', title: 'HS Code Lookup', description: 'ค้นหาจาก 15,913+ รหัส HS ตาม AHTN Protocol 2022 พร้อม auto-fill สถิติ/หน่วย/อัตราภาษี', color: '#06B6D4', sortOrder: 1 },
        { icon: '🔗', title: 'NSW Integration', description: 'ส่งข้อมูลผ่าน ebXML v2.0 ไปยัง National Single Window โดยตรง ไม่ต้องพิมพ์ซ้ำ', color: '#8B5CF6', sortOrder: 2 },
        { icon: '🛡️', title: 'สิทธิประโยชน์ 7 ประเภท', description: 'รองรับ BOI, Bond, Section 19, Re-export, FZ, IEAT, Compensation พร้อมระบบแนบเอกสาร', color: '#F59E0B', sortOrder: 3 },
        { icon: '📊', title: 'Real-time Dashboard', description: 'ติดตามสถานะทุก Shipment แบบ real-time พร้อม KPI charts และ billing summary', color: '#16A34A', sortOrder: 4 },
        { icon: '💰', title: 'Billing & Invoice', description: 'ระบบออกบิลอัตโนมัติ per-job หรือแบบ Term พร้อม PDF invoice และ payment tracking', color: '#EC4899', sortOrder: 5 },
      ],
    },
    {
      slug: 'how-it-works', sortOrder: 6,
      title: 'เริ่มได้ใน 4 ขั้นตอน',
      subtitle: 'จากสมัครจนถึงผ่านพิธีการ — ง่ายกว่าที่คิด',
      tagText: 'วิธีใช้งาน', tagColor: '#06B6D4',
      cards: [
        { icon: '📋', title: 'สมัครใช้งาน', description: 'ลงทะเบียนบริษัท เพิ่มข้อมูลผู้ส่งออก/ตัวแทน ใช้เวลาไม่เกิน 5 นาที', color: '#2563EB', sortOrder: 0, metadata: { step: '01' } },
        { icon: '📦', title: 'สร้าง Shipment', description: 'กรอกข้อมูลใบขน หรือให้ AI สกัดจาก Invoice อัตโนมัติ เลือก HS Code จาก 15,913 รายการ', color: '#06B6D4', sortOrder: 1, metadata: { step: '02' } },
        { icon: '🚀', title: 'ส่งผ่าน NSW', description: 'ระบบสร้าง XML ตาม XSD v4.00 และส่งผ่าน ebXML v2.0 ไปยัง กรมศุลกากร โดยอัตโนมัติ', color: '#8B5CF6', sortOrder: 2, metadata: { step: '03' } },
        { icon: '✅', title: 'ติดตามสถานะ', description: 'ดู Real-time status ของทุก Shipment ได้ จาก Dashboard — ตั้งแต่ Draft จนถึง Cleared', color: '#16A34A', sortOrder: 3, metadata: { step: '04' } },
      ],
    },
    {
      slug: 'statistics', sortOrder: 7,
      title: 'ตัวเลขที่พิสูจน์',
      cards: [
        { icon: '🔎', title: 'รหัส HS Code', metadata: { value: 15913, suffix: '+' }, description: 'จาก AHTN Protocol 2022', sortOrder: 0 },
        { icon: '🛡️', title: 'สิทธิประโยชน์', metadata: { value: 7, suffix: '' }, description: 'BOI · Bond · FZ · IEAT …', sortOrder: 1 },
        { icon: '📄', title: 'กศก.', metadata: { value: 101, suffix: '/1' }, description: 'ใบขนสินค้าขาออก', sortOrder: 2 },
        { icon: '📐', title: 'XSD Version', metadata: { value: 4, suffix: '.00' }, description: 'Export Declaration Schema', sortOrder: 3 },
      ],
    },
    {
      slug: 'target-customers', sortOrder: 8,
      title: 'ออกแบบมาสำหรับธุรกิจส่งออก',
      subtitle: 'ไม่ว่าจะเป็นตัวแทน โรงงาน หรือ logistics — เรามีโซลูชันให้',
      tagText: 'กลุ่มเป้าหมาย', tagColor: '#16A34A',
      cards: [
        { icon: '🚢', title: 'Freight Forwarder', description: 'ตัวแทนออกของ / ตัวแทนเรือ ที่ยื่นใบขนให้ลูกค้าหลายราย — ต้องการระบบ multi-tenant ที่แยกข้อมูลได้', color: '#2563EB', sortOrder: 0, metadata: { features: ['Multi-customer management', 'Batch declaration', 'NSW automation'] } },
        { icon: '🏭', title: 'โรงงานผู้ผลิต', description: 'โรงงานที่ส่งออกเอง — ต้องการกรอกข้อมูลง่าย ค้นหา HS Code ได้เร็ว และจัดการสิทธิประโยชน์ BOI/FZ', color: '#16A34A', sortOrder: 1, metadata: { features: ['Manual declaration form', 'Product master catalog', 'Privilege document upload'] } },
        { icon: '📦', title: 'Logistics Provider', description: 'ผู้ให้บริการโลจิสติกส์ที่มีลูกค้าหลายราย — ต้องการ dashboard รวม billing และ performance tracking', color: '#F59E0B', sortOrder: 2, metadata: { features: ['Unified dashboard', 'Auto billing', 'Performance reports'] } },
      ],
    },
    {
      slug: 'cta', sortOrder: 9,
      title: 'พร้อมเปลี่ยนการทำใบขน\nให้เร็วขึ้น?',
      subtitle: 'เริ่มต้นวันนี้ — สมัครฟรี ไม่มีค่าติดตั้ง ทดลองใช้ได้ทันที',
      metadata: { ctaPrimary: 'สมัครใช้งานฟรี →', ctaSecondary: 'เข้าสู่ระบบ' },
      cards: [],
    },
    {
      slug: 'footer', sortOrder: 10,
      title: 'CUSTOMS-EDOC',
      subtitle: 'ระบบยื่นใบขนสินค้าขาออกอิเล็กทรอนิกส์ผ่าน NSW Thailand · มาตรฐาน ISO 27001',
      metadata: {
        columns: [
          { title: 'Product', links: ['ฟีเจอร์', 'Pricing', 'Roadmap', 'Changelog'] },
          { title: 'Resources', links: ['Documentation', 'API Reference', 'HS Code Lookup', 'XSD v4.00 Guide'] },
          { title: 'ข้อมูลศุลกากร', links: ['อัตราแลกเปลี่ยน', 'ข่าวกรมศุลกากร', 'สถิตินำเข้า-ส่งออก', 'customs.go.th'] },
          { title: 'Contact', links: ['support@customs-edoc.th', '02-XXX-XXXX', 'Line: @customs-edoc', 'Bangkok, Thailand'] },
        ],
        standards: ['ebXML v2.0', 'XSD v4.00', 'NSW Thailand'],
      },
      cards: [],
    },
    {
      slug: 'navbar', sortOrder: -1,
      title: 'CUSTOMS-EDOC',
      metadata: {
        links: [
          { href: 'exchange', label: 'อัตราแลกเปลี่ยน' },
          { href: 'news', label: 'ข่าวศุลกากร' },
          { href: 'features', label: 'ฟีเจอร์' },
          { href: 'how', label: 'วิธีใช้งาน' },
          { href: 'customers', label: 'กลุ่มลูกค้า' },
        ],
      },
      cards: [],
    },
  ];

  for (const sec of sections) {
    const { cards, ...sectionData } = sec;
    const existing = await prisma.cmsSection.findUnique({ where: { slug: sec.slug } });
    if (existing) {
      console.log(`  ℹ️  Section "${sec.slug}" already exists`);
      continue;
    }
    const created = await prisma.cmsSection.create({ data: sectionData });
    for (const card of cards) {
      await prisma.cmsSectionCard.create({ data: { ...card, sectionId: created.id } });
    }
    console.log(`  ✅ Section "${sec.slug}" + ${cards.length} cards`);
  }

  console.log('  ✅ CMS seed complete');
}

// ─── 9. MOCKUP DATA — Jobs + Billing (HHA & DKSH) ───────────────
async function seedMockupData(customerIds: Record<string, string>, superAdminId: string) {
  console.log('\n🌱 9. Seeding Mockup Jobs + Billing...');

  const hhaId  = customerIds['HHA'];
  const dkshId = customerIds['DKSH'];

  // ── Helper: upsert job ────────────────────────────────────────
  async function upsertJob(data: Parameters<typeof prisma.logisticsJob.create>[0]['data']) {
    const existing = await prisma.logisticsJob.findUnique({ where: { jobNo: data.jobNo as string } });
    if (existing) { console.log(`  ℹ️  Job exists: ${data.jobNo}`); return existing; }
    const job = await prisma.logisticsJob.create({ data });
    console.log(`  ✅ Job: ${data.jobNo} (${data.status})`);
    return job;
  }

  // ─────────────────────────────────────────────────────────────
  // HHA JOBS — Import from China (ผ่านแหลมฉบัง)
  // ─────────────────────────────────────────────────────────────
  const hhaCompletedJobs = await Promise.all([
    // Dec 2025
    upsertJob({ customerId: hhaId, jobNo: 'JOB-2025-0003', type: 'IMPORT', status: 'COMPLETED',
      vesselName: 'SITC KEELUNG V.2311N', voyageNo: '2311N', transportMode: 'SEA',
      etd: new Date('2025-12-01'), eta: new Date('2025-12-06'),
      portOfLoading: 'Shanghai, China', portOfLoadingCode: 'CNSHA',
      portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
      containerNo: 'SITC4012311', sealNo: 'SH2311-4012',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 8200, currency: 'CNY', createdById: superAdminId }),

    upsertJob({ customerId: hhaId, jobNo: 'JOB-2025-0007', type: 'IMPORT', status: 'COMPLETED',
      vesselName: 'COSCO SHIPPING V.1198', voyageNo: '1198', transportMode: 'SEA',
      etd: new Date('2025-12-15'), eta: new Date('2025-12-20'),
      portOfLoading: 'Ningbo, China', portOfLoadingCode: 'CNNGB',
      portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
      containerNo: 'CSNU7810198', sealNo: 'NB1198-7810',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 12500, currency: 'CNY', createdById: superAdminId }),

    // Jan 2026
    upsertJob({ customerId: hhaId, jobNo: 'JOB-2026-0008', type: 'IMPORT', status: 'COMPLETED',
      vesselName: 'TG671', voyageNo: 'TG671', transportMode: 'AIR',
      etd: new Date('2026-01-08'),
      portOfLoading: 'Shanghai Pudong Airport', portOfLoadingCode: 'CNPVG',
      portOfDischarge: 'Suvarnabhumi Airport, Thailand', portOfReleaseCode: 'THBKK',
      containerNo: 'AWB-0812345',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 6800, currency: 'CNY', createdById: superAdminId }),

    upsertJob({ customerId: hhaId, jobNo: 'JOB-2026-0015', type: 'IMPORT', status: 'COMPLETED',
      vesselName: 'OOCL NINGBO V.032N', voyageNo: '032N', transportMode: 'SEA',
      etd: new Date('2026-01-20'), eta: new Date('2026-01-25'),
      portOfLoading: 'Guangzhou, China', portOfLoadingCode: 'CNGZH',
      portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
      containerNo: 'OOLU3320156', sealNo: 'GZ032N-6015',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 9100, currency: 'CNY', createdById: superAdminId }),

    // Feb 2026
    upsertJob({ customerId: hhaId, jobNo: 'JOB-2026-0021', type: 'IMPORT', status: 'COMPLETED',
      vesselName: 'SITC GUANGDONG V.2401N', voyageNo: '2401N', transportMode: 'SEA',
      etd: new Date('2026-02-03'), eta: new Date('2026-02-08'),
      portOfLoading: 'Shenzhen, China', portOfLoadingCode: 'CNSZX',
      portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
      containerNo: 'SITC5240021', sealNo: 'SZ2401-5240',
      consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
      totalFobUsd: 11300, currency: 'CNY', createdById: superAdminId }),
  ]);

  // HHA in-progress jobs
  await upsertJob({ customerId: hhaId, jobNo: 'JOB-2026-0045', type: 'IMPORT', status: 'READY_TO_SUBMIT',
    vesselName: 'OOCL TIANJIN V.018N', voyageNo: '018N', transportMode: 'SEA',
    etd: new Date('2026-03-28'), eta: new Date('2026-04-02'),
    portOfLoading: 'Tianjin, China', portOfLoadingCode: 'CNTXG',
    portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
    containerNo: 'OOLU4180045', sealNo: 'TJ018N-0045',
    consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
    totalFobUsd: 14200, currency: 'CNY', createdById: superAdminId });

  await upsertJob({ customerId: hhaId, jobNo: 'JOB-2026-0046', type: 'IMPORT', status: 'DRAFT',
    vesselName: 'TG682', voyageNo: 'TG682', transportMode: 'AIR',
    etd: new Date('2026-04-10'),
    portOfLoading: 'Guangzhou Baiyun Airport', portOfLoadingCode: 'CNCAI',
    portOfDischarge: 'Suvarnabhumi Airport, Thailand', portOfReleaseCode: 'THBKK',
    containerNo: 'AWB-0924601',
    consigneeNameEn: 'HHA (THAILAND) CO., LTD.',
    totalFobUsd: 5600, currency: 'CNY', createdById: superAdminId });

  // ─────────────────────────────────────────────────────────────
  // DKSH JOBS — Mixed Import/Export (Medical + Chemical)
  // ─────────────────────────────────────────────────────────────
  const dkshCompletedJobs = await Promise.all([
    // Nov–Dec 2025
    upsertJob({ customerId: dkshId, jobNo: 'JOB-2025-0001', type: 'EXPORT', status: 'COMPLETED',
      vesselName: 'TG922', voyageNo: 'TG922', transportMode: 'AIR',
      etd: new Date('2025-11-28'),
      portOfLoading: 'Suvarnabhumi Airport', portOfLoadingCode: 'THBKK',
      portOfDischarge: 'Frankfurt Airport, Germany', portOfReleaseCode: 'DEFRA',
      containerNo: 'AWB-0291001',
      consigneeNameEn: 'Roche Diagnostics GmbH',
      totalFobUsd: 89000, currency: 'USD', createdById: superAdminId }),

    upsertJob({ customerId: dkshId, jobNo: 'JOB-2025-0005', type: 'IMPORT', status: 'COMPLETED',
      vesselName: 'MSC GULSUN V.SB522E', voyageNo: 'SB522E', transportMode: 'SEA',
      etd: new Date('2025-12-10'), eta: new Date('2025-12-20'),
      portOfLoading: 'Hamburg, Germany', portOfLoadingCode: 'DEHAM',
      portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
      containerNo: 'MSCU8300522', sealNo: 'HH522E-8300',
      consigneeNameEn: 'DKSH (Thailand) Limited',
      totalFobUsd: 54000, currency: 'EUR', createdById: superAdminId }),

    // Jan 2026
    upsertJob({ customerId: dkshId, jobNo: 'JOB-2026-0010', type: 'EXPORT', status: 'COMPLETED',
      vesselName: 'TG930', voyageNo: 'TG930', transportMode: 'AIR',
      etd: new Date('2026-01-10'),
      portOfLoading: 'Suvarnabhumi Airport', portOfLoadingCode: 'THBKK',
      portOfDischarge: 'Zurich Airport, Switzerland', portOfReleaseCode: 'CHZRH',
      containerNo: 'AWB-0101026',
      consigneeNameEn: 'Sika AG',
      totalFobUsd: 112000, currency: 'USD', createdById: superAdminId }),

    upsertJob({ customerId: dkshId, jobNo: 'JOB-2026-0017', type: 'IMPORT', status: 'COMPLETED',
      vesselName: 'EVER GIVEN V.EG171A', voyageNo: 'EG171A', transportMode: 'SEA',
      etd: new Date('2026-01-24'), eta: new Date('2026-02-03'),
      portOfLoading: 'Rotterdam, Netherlands', portOfLoadingCode: 'NLRTM',
      portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
      containerNo: 'EITU6170017', sealNo: 'RT171A-6017',
      consigneeNameEn: 'DKSH (Thailand) Limited',
      totalFobUsd: 67000, currency: 'EUR', createdById: superAdminId }),

    // Feb 2026
    upsertJob({ customerId: dkshId, jobNo: 'JOB-2026-0023', type: 'EXPORT', status: 'COMPLETED',
      vesselName: 'TG948', voyageNo: 'TG948', transportMode: 'AIR',
      etd: new Date('2026-02-18'),
      portOfLoading: 'Suvarnabhumi Airport', portOfLoadingCode: 'THBKK',
      portOfDischarge: 'Malpensa Airport, Italy', portOfReleaseCode: 'ITMXP',
      containerNo: 'AWB-0231803',
      consigneeNameEn: 'Clariant International Ltd',
      totalFobUsd: 98000, currency: 'USD', createdById: superAdminId }),
  ]);

  // DKSH in-progress jobs
  await upsertJob({ customerId: dkshId, jobNo: 'JOB-2026-0047', type: 'EXPORT', status: 'SUBMITTED',
    vesselName: 'TG960', voyageNo: 'TG960', transportMode: 'AIR',
    etd: new Date('2026-04-05'),
    portOfLoading: 'Suvarnabhumi Airport', portOfLoadingCode: 'THBKK',
    portOfDischarge: 'Frankfurt Airport, Germany', portOfReleaseCode: 'DEFRA',
    containerNo: 'AWB-0471236',
    consigneeNameEn: 'Roche Diagnostics GmbH',
    nswRefNo: 'NSW-TH-2026-0042817',
    totalFobUsd: 134000, currency: 'USD', createdById: superAdminId });

  await upsertJob({ customerId: dkshId, jobNo: 'JOB-2026-0048', type: 'IMPORT', status: 'READY_TO_SUBMIT',
    vesselName: 'CMA CGM MARCO POLO V.0FM1MA1', voyageNo: '0FM1MA1', transportMode: 'SEA',
    etd: new Date('2026-03-30'), eta: new Date('2026-04-09'),
    portOfLoading: 'Antwerp, Belgium', portOfLoadingCode: 'BEANR',
    portOfDischarge: 'Laem Chabang, Thailand', portOfReleaseCode: 'THLCH',
    containerNo: 'CMAU9480016', sealNo: 'ANT0FM-9480',
    consigneeNameEn: 'DKSH (Thailand) Limited',
    totalFobUsd: 78500, currency: 'EUR', createdById: superAdminId });

  // ─────────────────────────────────────────────────────────────
  // BILLING ITEMS — create for all completed jobs
  // ─────────────────────────────────────────────────────────────
  console.log('\n  💰 Creating billing items...');

  async function upsertBillingItem(jobId: string, customerId: string, amount: number) {
    const existing = await prisma.billingItem.findUnique({ where: { jobId } });
    if (existing) return existing;
    return prisma.billingItem.create({
      data: { customerId, jobId, type: 'DECLARATION_FEE', amount, currency: 'THB', isInvoiced: false },
    });
  }

  // Get IDs of existing completed jobs
  const existingHhaCompleted = await prisma.logisticsJob.findMany({
    where: { customerId: hhaId, status: 'COMPLETED' },
    select: { id: true, jobNo: true },
  });
  const existingDkshCompleted = await prisma.logisticsJob.findMany({
    where: { customerId: dkshId, status: 'COMPLETED' },
    select: { id: true, jobNo: true },
  });

  const hhaBillingItems: Record<string, Awaited<ReturnType<typeof upsertBillingItem>>> = {};
  const dkshBillingItems: Record<string, Awaited<ReturnType<typeof upsertBillingItem>>> = {};

  for (const j of existingHhaCompleted) {
    hhaBillingItems[j.jobNo] = await upsertBillingItem(j.id, hhaId, 450);
    console.log(`    ✅ BillingItem: ${j.jobNo} ฿450`);
  }
  for (const j of existingDkshCompleted) {
    dkshBillingItems[j.jobNo] = await upsertBillingItem(j.id, dkshId, 480);
    console.log(`    ✅ BillingItem: ${j.jobNo} ฿480`);
  }

  // ─────────────────────────────────────────────────────────────
  // BILLING INVOICES
  // Strategy:
  //   HHA  (PER_JOB ฿450): 3 invoices + 2 unbilled items
  //   DKSH (TERM ฿480):    3 invoices + 2 unbilled items
  // ─────────────────────────────────────────────────────────────
  console.log('\n  🧾 Creating billing invoices...');

  async function upsertInvoice(invoiceNo: string, data: {
    customerId: string;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    totalAmount: number;
    currency?: string;
    issuedAt: Date;
    dueDate?: Date;
    paidAt?: Date;
    note?: string;
    itemIds: string[];    // BillingItem IDs to link
  }) {
    const existing = await prisma.billingInvoice.findUnique({ where: { invoiceNo } });
    if (existing) { console.log(`    ℹ️  Invoice exists: ${invoiceNo}`); return existing; }

    const invoice = await prisma.billingInvoice.create({
      data: {
        invoiceNo,
        customerId: data.customerId,
        status: data.status,
        totalAmount: data.totalAmount,
        currency: data.currency ?? 'THB',
        issuedAt: data.issuedAt,
        dueDate: data.dueDate,
        paidAt: data.paidAt,
        note: data.note,
      },
    });

    // Link billing items → invoice
    await prisma.billingItem.updateMany({
      where: { id: { in: data.itemIds } },
      data: { invoiceId: invoice.id, isInvoiced: true },
    });

    console.log(`    ✅ Invoice: ${invoiceNo} (${data.status}) ฿${data.totalAmount} — ${data.itemIds.length} items`);
    return invoice;
  }

  // ── HHA Invoices ──────────────────────────────────────────────
  // INV-HHA-2025-001 PAID — Dec 2025 (jobs: 0003, 0007)
  const hhaItems2025 = ['JOB-2025-0003', 'JOB-2025-0007']
    .map(n => hhaBillingItems[n]?.id).filter(Boolean) as string[];
  if (hhaItems2025.length) {
    await upsertInvoice('INV-HHA-2025-001', {
      customerId: hhaId,
      status: 'PAID',
      totalAmount: hhaItems2025.length * 450,
      issuedAt: new Date('2025-12-31'),
      dueDate:  new Date('2026-01-31'),
      paidAt:   new Date('2026-01-15'),
      note:     'ชำระผ่านโอนธนาคาร ธ.กสิกรไทย',
      itemIds:  hhaItems2025,
    });
  }

  // INV-HHA-2026-001 PAID — Jan 2026 (jobs: 0008, 0015)
  const hhaItemsJan = ['JOB-2026-0008', 'JOB-2026-0015']
    .map(n => hhaBillingItems[n]?.id).filter(Boolean) as string[];
  if (hhaItemsJan.length) {
    await upsertInvoice('INV-HHA-2026-001', {
      customerId: hhaId,
      status: 'PAID',
      totalAmount: hhaItemsJan.length * 450,
      issuedAt: new Date('2026-02-01'),
      dueDate:  new Date('2026-03-03'),
      paidAt:   new Date('2026-02-20'),
      note:     'ชำระผ่านโอนธนาคาร ธ.กสิกรไทย',
      itemIds:  hhaItemsJan,
    });
  }

  // INV-HHA-2026-002 SENT — Mar 2026 (jobs: 0021) — Outstanding
  const hhaItemsMar = ['JOB-2026-0021']
    .map(n => hhaBillingItems[n]?.id).filter(Boolean) as string[];
  if (hhaItemsMar.length) {
    await upsertInvoice('INV-HHA-2026-002', {
      customerId: hhaId,
      status: 'SENT',
      totalAmount: hhaItemsMar.length * 450,
      issuedAt: new Date('2026-03-15'),
      dueDate:  new Date('2026-04-15'),
      note:     'กรุณาชำระภายใน 30 วัน',
      itemIds:  hhaItemsMar,
    });
  }
  // Unbilled: JOB-2026-0042 (existing) stays isInvoiced=false

  // ── DKSH Invoices ─────────────────────────────────────────────
  // INV-DKSH-2025-001 PAID — Dec 2025 (jobs: 0001, 0005)
  const dkshItems2025 = ['JOB-2025-0001', 'JOB-2025-0005']
    .map(n => dkshBillingItems[n]?.id).filter(Boolean) as string[];
  if (dkshItems2025.length) {
    await upsertInvoice('INV-DKSH-2025-001', {
      customerId: dkshId,
      status: 'PAID',
      totalAmount: dkshItems2025.length * 480,
      issuedAt: new Date('2025-12-31'),
      dueDate:  new Date('2026-01-30'),
      paidAt:   new Date('2026-01-20'),
      note:     'DKSH TERM30 — ชำระผ่านระบบ EFT',
      itemIds:  dkshItems2025,
    });
  }

  // INV-DKSH-2026-001 OVERDUE — Jan 2026 (jobs: 0010, 0017) — Outstanding + Overdue
  const dkshItemsJan = ['JOB-2026-0010', 'JOB-2026-0017']
    .map(n => dkshBillingItems[n]?.id).filter(Boolean) as string[];
  if (dkshItemsJan.length) {
    await upsertInvoice('INV-DKSH-2026-001', {
      customerId: dkshId,
      status: 'OVERDUE',
      totalAmount: dkshItemsJan.length * 480,
      issuedAt: new Date('2026-01-31'),
      dueDate:  new Date('2026-03-02'),
      note:     'เลยกำหนดชำระ — กรุณาติดต่อฝ่ายบัญชี',
      itemIds:  dkshItemsJan,
    });
  }

  // INV-DKSH-2026-002 SENT — Mar 2026 (jobs: 0023) — Outstanding
  const dkshItemsFeb = ['JOB-2026-0023']
    .map(n => dkshBillingItems[n]?.id).filter(Boolean) as string[];
  if (dkshItemsFeb.length) {
    await upsertInvoice('INV-DKSH-2026-002', {
      customerId: dkshId,
      status: 'SENT',
      totalAmount: dkshItemsFeb.length * 480,
      issuedAt: new Date('2026-03-01'),
      dueDate:  new Date('2026-03-31'),
      note:     'DKSH TERM30 — กรุณาชำระภายในกำหนด',
      itemIds:  dkshItemsFeb,
    });
  }
  // Unbilled: JOB-2026-0040 (existing) stays isInvoiced=false

  console.log('\n  ✅ Mockup data seeded successfully');
  console.log('     HHA  — completed jobs:', existingHhaCompleted.length, '| invoices: 3 (1 PAID ×2, 1 SENT)');
  console.log('     DKSH — completed jobs:', existingDkshCompleted.length, '| invoices: 3 (1 PAID, 1 OVERDUE, 1 SENT)');
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

  // 9. Mockup Data — More Jobs + Billing (HHA & DKSH)
  await seedMockupData(customerIds, superAdminId);

  // 10. CMS Landing Page
  await seedCms();

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
