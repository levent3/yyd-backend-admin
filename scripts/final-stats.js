const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getFinalStats() {
  try {
    const total = await prisma.projectTranslation.count({
      where: { projectId: { gte: 46 } }
    });

    const withContent = await prisma.projectTranslation.count({
      where: {
        projectId: { gte: 46 },
        content: { not: null }
      }
    });

    const withDesc = await prisma.projectTranslation.count({
      where: {
        projectId: { gte: 46 },
        description: { not: null }
      }
    });

    const projectCount = await prisma.project.count({
      where: { id: { gte: 46 } }
    });

    console.log('\n✅ MIGRATION BAŞARILI!\n');
    console.log('📊 FINAL STATISTICS:');
    console.log('  Migrated Projects:', projectCount);
    console.log('  Total Translations:', total);
    console.log('  With Content:', withContent, `(${((withContent / total) * 100).toFixed(1)}%)`);
    console.log('  With Description:', withDesc, `(${((withDesc / total) * 100).toFixed(1)}%)`);

    // Örnek içerik göster
    const sample = await prisma.projectTranslation.findFirst({
      where: {
        projectId: { gte: 46 },
        content: { not: null }
      },
      include: { project: true }
    });

    if (sample) {
      console.log('\n📝 Sample Content:');
      console.log(`  Project: ${sample.title}`);
      console.log(`  Language: ${sample.language}`);
      console.log(`  Content (first 200 chars):`);
      console.log(`  ${sample.content.substring(0, 200)}...`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getFinalStats();
