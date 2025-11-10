const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const areas = await prisma.activityArea.findMany({
    include: {
      translations: {
        where: { language: 'tr' }
      }
    }
  });

  console.log('Mevcut Faaliyet Alanları:');
  console.log(JSON.stringify(areas, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
