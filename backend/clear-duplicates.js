const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDuplicates() {
  console.log('Finding duplicates...');
  
  // Find all items
  const items = await prisma.hsMasterItem.findMany();
  console.log(`Total HS codes found: ${items.length}`);
  
  // Group by customerId + hsCode
  const seen = new Map();
  const toDelete = [];
  
  for (const item of items) {
    const key = `${item.customerId}_${item.hsCode}`;
    if (seen.has(key)) {
      toDelete.push(item.id);
    } else {
      seen.set(key, true);
    }
  }
  
  console.log(`Found ${toDelete.length} duplicates to delete.`);
  
  if (toDelete.length > 0) {
    // Delete duplicates
    const res = await prisma.hsMasterItem.deleteMany({
      where: {
        id: { in: toDelete }
      }
    });
    console.log(`Deleted ${res.count} items.`);
  } else {
    console.log('No duplicates found.');
  }
}

clearDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
