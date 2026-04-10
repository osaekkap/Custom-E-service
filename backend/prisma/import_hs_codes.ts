import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
  const prisma = new PrismaClient({ adapter });

  console.log('🚀 Starting HS Code import...');

  const csvPath = path.resolve(__dirname, 'HS Code.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ HS Code.csv not found at', csvPath);
    return;
  }

  // Load all customers
  const customers = await prisma.customer.findMany({ select: { id: true, code: true } });
  if (customers.length === 0) {
    console.error('❌ No customers found in database.');
    return;
  }
  console.log(`👥 Found ${customers.length} customers: ${customers.map(c => c.code).join(', ')}`);

  // Read CSV
  console.log('📖 Reading CSV file (this may take a while)...');
  const workbook = XLSX.readFile(csvPath, { type: 'file' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Use a custom mapping to handle the column names
  const rawRows = XLSX.utils.sheet_to_json<any>(sheet);
  console.log(`📦 Total rows in CSV: ${rawRows.length}`);

  // Deduplicate by HS Code (taking the first one we see)
  const uniqueHsCodes = new Map<string, any>();
  for (const row of rawRows) {
    const hsCode = row['พิกัดศุลกากร 8 หลัก']?.toString().trim();
    if (hsCode && !uniqueHsCodes.has(hsCode)) {
      uniqueHsCodes.set(hsCode, row);
    }
  }
  console.log(`✨ Unique HS codes found: ${uniqueHsCodes.size}`);

  // Insert for each customer
  for (const customer of customers) {
    console.log(`📥 Importing for customer ${customer.code} (${customer.id})...`);
    
    const rowsToInsert = Array.from(uniqueHsCodes.values()).map(row => ({
      customerId: customer.id,
      hsCode: row['พิกัดศุลกากร 8 หลัก']?.toString().trim(),
      descriptionTh: (row['คำอธิบายไทย'] || '').toString().trim().substring(0, 500),
      descriptionEn: (row['คำอธิบาย'] || '').toString().trim().substring(0, 500),
      statisticsCode: (row['รหัสสถิติ'] || '').toString().trim(),
      statisticsUnit: (row['หน่วยตามรหัสสถิติ'] || '').toString().trim(),
      dutyRate: 0,
      isControlled: false,
      isActive: true,
    }));

    // Batch insert
    const batchSize = 1000;
    let created = 0;
    for (let i = 0; i < rowsToInsert.length; i += batchSize) {
      const batch = rowsToInsert.slice(i, i + batchSize);
      const result = await prisma.hsMasterItem.createMany({
        data: batch,
        skipDuplicates: true,
      });
      created += result.count;
      if (i % 5000 === 0 && i > 0) console.log(`   ... inserted ${i} items`);
    }
    console.log(`✅ Customer ${customer.code}: ${created} HS codes imported.`);
  }

  console.log('🎉 Import completed successfully!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
