const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany({
    orderBy: { id: 'asc' }
  });

  console.log('📋 Sistemdeki Roller:\n');
  roles.forEach(role => {
    console.log(`  ${role.id}. ${role.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
