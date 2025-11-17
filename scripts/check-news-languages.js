const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNewsLanguages() {
  try {
    const news = await prisma.news.findMany({
      include: { translations: true },
      orderBy: { id: 'asc' },
      take: 20
    });

    console.log('\n📰 HABER DİL KONTROLÜ:\n');

    let singleLang = 0;
    let multiLang = 0;

    news.forEach(n => {
      const langCount = n.translations.length;
      console.log(`News ID ${n.id}: ${langCount} dil`);
      n.translations.forEach(t => {
        console.log(`  - [${t.language}] ${t.title}`);
      });
      console.log('');

      if (langCount === 1) singleLang++;
      if (langCount > 1) multiLang++;
    });

    console.log('📊 Stats:');
    console.log(`  Tek dilli haberler: ${singleLang}`);
    console.log(`  Çok dilli haberler: ${multiLang}`);

    // ContentId mapping kontrolü - MSSQL'deki aynı haberin farklı dilleri
    const totalNews = await prisma.news.count();
    const totalTrans = await prisma.newsTranslation.count();

    console.log(`\n  Total News: ${totalNews}`);
    console.log(`  Total Translations: ${totalTrans}`);
    console.log(`  Avg translations per news: ${(totalTrans / totalNews).toFixed(2)}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewsLanguages();
