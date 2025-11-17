const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkThumbnailSummary() {
  try {
    const trans = await prisma.projectTranslation.findMany({
      where: { projectId: { gte: 67 } },
      take: 5
    });

    console.log('\n📋 Description Check (ThumbnailSummary):\n');

    trans.forEach(t => {
      console.log(`Project: ${t.title}`);
      console.log(`Description: ${t.description ? t.description.substring(0, 120) + '...' : 'NULL'}`);
      console.log('');
    });

    const withDesc = await prisma.projectTranslation.count({
      where: {
        projectId: { gte: 67 },
        description: { not: null }
      }
    });

    const total = await prisma.projectTranslation.count({
      where: { projectId: { gte: 67 } }
    });

    console.log('📊 Stats:');
    console.log(`  With description: ${withDesc} / ${total}`);
    console.log(`  Coverage: ${((withDesc / total) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkThumbnailSummary();
