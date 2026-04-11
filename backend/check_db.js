const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exporters = await prisma.exporter.findMany({
    select: { id: true, nameTh: true, customerId: true }
  });
  console.log("EXPORTERS:", exporters);
  
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true }
  });
  console.log("CUSTOMERS:", customers);

  await prisma.$disconnect();
}

main();
