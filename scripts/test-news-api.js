/**
 * Test News API Response
 * Haber API'sinin translations döndürüp döndürmediğini kontrol et
 */

const newsRepo = require('../src/api/modules/news/news.repository');

async function testNewsAPI() {
  try {
    console.log('\n📰 Testing News Repository findMany...\n');

    // Repository'yi direkt çağır
    const news = await newsRepo.findMany({ skip: 0, take: 3, where: {}, language: null });

    console.log(`Returned: ${news.length} news\n`);

    if (news.length > 1) {
      const secondNews = news[1];
      console.log('Second News (from repository):');
      console.log(`  ID: ${secondNews.id}`);
      console.log(`  Has translations: ${!!secondNews.translations}`);
      console.log(`  Translations count: ${secondNews.translations ? secondNews.translations.length : 0}`);

      if (secondNews.translations) {
        console.log('  Languages:');
        secondNews.translations.forEach(t => {
          console.log(`    - [${t.language.toUpperCase()}] ${t.title.substring(0, 50)}`);
        });
      }
    }

    console.log('\n📰 Testing getAllNews Service...\n');

    const newsService = require('../src/api/modules/news/news.service');
    const result = await newsService.getAllNews({ page: 1, limit: 3, language: 'tr' });

    console.log(`Total news: ${result.pagination.total}`);
    console.log(`Returned: ${result.data.length}\n`);

    // İkinci haberi detaylı göster (ID=2, hem TR hem EN var)
    if (result.data.length > 1) {
      const firstNews = result.data[1];
      console.log('First News:');
      console.log(`  ID: ${firstNews.id}`);
      console.log(`  Title: ${firstNews.title}`);
      console.log(`  Has translations array: ${!!firstNews.translations}`);
      console.log(`  Translations count: ${firstNews.translations ? firstNews.translations.length : 0}`);

      if (firstNews.translations && firstNews.translations.length > 0) {
        console.log('\n  Translations:');
        firstNews.translations.forEach(t => {
          console.log(`    - [${t.language.toUpperCase()}] ${t.title.substring(0, 50)}...`);
        });
      }

      console.log('\n  Full object keys:', Object.keys(firstNews).join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testNewsAPI();
