const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkContent() {
  try {
    const translations = await prisma.projectTranslation.findMany({
      where: { projectId: { gte: 25 } },
      take: 10
    });

    console.log('\n📋 Translation Content Check:\n');

    translations.forEach(t => {
      console.log(`ID: ${t.id} | Language: ${t.language}`);
      console.log(`  Title: ${t.title || 'NULL'}`);
      console.log(`  Description: ${t.description ? (t.description.substring(0, 80) + '...') : 'NULL'}`);
      console.log(`  Content: ${t.content ? (t.content.substring(0, 80) + '...') : 'NULL'}`);
      console.log('');
    });

    const stats = {
      total: translations.length,
      withDescription: translations.filter(t => t.description).length,
      withContent: translations.filter(t => t.content).length,
    };

    console.log('📊 Statistics:');
    console.log(`  Total translations: ${stats.total}`);
    console.log(`  With description: ${stats.withDescription}`);
    console.log(`  With content: ${stats.withContent}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContent();
