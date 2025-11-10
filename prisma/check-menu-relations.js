const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Menü ilişkileri kontrol ediliyor...\n');

  const menus = await prisma.menu.findMany({
    include: {
      menuItems: {
        include: {
          page: {
            select: {
              id: true,
              pageType: true,
              translations: {
                select: { language: true, title: true, slug: true }
              }
            }
          },
          project: {
            select: {
              id: true,
              shortCode: true,
              translations: {
                select: { language: true, title: true }
              }
            }
          },
          news: {
            select: {
              id: true,
              translations: {
                select: { language: true, title: true, slug: true }
              }
            }
          },
          activityArea: {
            select: {
              id: true,
              translations: {
                select: { language: true, title: true, slug: true }
              }
            }
          },
          children: true
        }
      }
    }
  });

  for (const menu of menus) {
    console.log(`\n📁 ${menu.name} (${menu.slug})`);
    console.log(`   Toplam ${menu.menuItems.length} menü öğesi\n`);

    for (const item of menu.menuItems) {
      const indent = item.parentId ? '   └─' : '   ├─';
      console.log(`${indent} [${item.id}] ${item.title}`);
      console.log(`      linkType: ${item.linkType}`);

      if (item.linkType === 'page' && item.pageId) {
        if (item.page) {
          const trTitle = item.page.translations.find(t => t.language === 'tr')?.title || 'N/A';
          const trSlug = item.page.translations.find(t => t.language === 'tr')?.slug || 'N/A';
          console.log(`      ✅ Page: [${item.pageId}] ${trTitle} (/${item.page.pageType}/${trSlug})`);
        } else {
          console.log(`      ❌ Page ID ${item.pageId} bulunamadı!`);
        }
      } else if (item.linkType === 'project' && item.projectId) {
        if (item.project) {
          const trTitle = item.project.translations.find(t => t.language === 'tr')?.title || 'N/A';
          console.log(`      ✅ Project: [${item.projectId}] ${trTitle} (/${item.project.shortCode})`);
        } else {
          console.log(`      ❌ Project ID ${item.projectId} bulunamadı!`);
        }
      } else if (item.linkType === 'news' && item.newsId) {
        if (item.news) {
          const trTitle = item.news.translations.find(t => t.language === 'tr')?.title || 'N/A';
          const trSlug = item.news.translations.find(t => t.language === 'tr')?.slug || 'N/A';
          console.log(`      ✅ News: [${item.newsId}] ${trTitle} (/haberler/${trSlug})`);
        } else {
          console.log(`      ❌ News ID ${item.newsId} bulunamadı!`);
        }
      } else if (item.linkType === 'activityArea' && item.activityAreaId) {
        if (item.activityArea) {
          const trTitle = item.activityArea.translations.find(t => t.language === 'tr')?.title || 'N/A';
          const trSlug = item.activityArea.translations.find(t => t.language === 'tr')?.slug || 'N/A';
          console.log(`      ✅ ActivityArea: [${item.activityAreaId}] ${trTitle} (/faaliyet-alanlari/${trSlug})`);
        } else {
          console.log(`      ❌ ActivityArea ID ${item.activityAreaId} bulunamadı!`);
        }
      } else if (item.linkType === 'custom' || item.linkType === 'external') {
        console.log(`      📍 Custom URL: ${item.customUrl || 'Belirtilmemiş'}`);
      }

      if (item.children && item.children.length > 0) {
        console.log(`      👶 ${item.children.length} alt öğe var`);
      }
    }
  }

  console.log('\n\n📊 Özet:');
  const totalItems = menus.reduce((sum, m) => sum + m.menuItems.length, 0);
  const pageLinks = menus.reduce((sum, m) =>
    sum + m.menuItems.filter(i => i.linkType === 'page' && i.pageId).length, 0);
  const projectLinks = menus.reduce((sum, m) =>
    sum + m.menuItems.filter(i => i.linkType === 'project' && i.projectId).length, 0);
  const newsLinks = menus.reduce((sum, m) =>
    sum + m.menuItems.filter(i => i.linkType === 'news' && i.newsId).length, 0);
  const activityLinks = menus.reduce((sum, m) =>
    sum + m.menuItems.filter(i => i.linkType === 'activityArea' && i.activityAreaId).length, 0);
  const customLinks = menus.reduce((sum, m) =>
    sum + m.menuItems.filter(i => i.linkType === 'custom' || i.linkType === 'external').length, 0);

  console.log(`Toplam menü öğesi: ${totalItems}`);
  console.log(`├─ Page bağlantıları: ${pageLinks}`);
  console.log(`├─ Project bağlantıları: ${projectLinks}`);
  console.log(`├─ News bağlantıları: ${newsLinks}`);
  console.log(`├─ ActivityArea bağlantıları: ${activityLinks}`);
  console.log(`└─ Custom/External URL'ler: ${customLinks}`);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
