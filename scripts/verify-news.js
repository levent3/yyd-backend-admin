const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyNews() {
  try {
    const newsCount = await prisma.news.count();
    const transCount = await prisma.newsTranslation.count();

    console.log('\n📰 NEWS MIGRATION SUMMARY:\n');
    console.log(`  Total News: ${newsCount}`);
    console.log(`  Total Translations: ${transCount}`);

    const sample = await prisma.news.findFirst({
      include: { translations: true },
      orderBy: { createdAt: 'desc' }
    });

    if (sample) {
      console.log('\n📝 Sample News:');
      console.log(`  ID: ${sample.id}`);
      console.log(`  Status: ${sample.status}`);
      console.log(`  Published: ${sample.publishedAt ? sample.publishedAt.toLocaleDateString('tr-TR') : 'Not published'}`);
      console.log(`  Translations (${sample.translations.length}):`);
      sample.translations.forEach(t => {
        console.log(`    [${t.language.toUpperCase()}] ${t.title}`);
        console.log(`         Slug: ${t.slug}`);
        console.log(`         Summary: ${t.summary ? t.summary.substring(0, 60) + '...' : 'NULL'}`);
      });
    }

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyNews();
