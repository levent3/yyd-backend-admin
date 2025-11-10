const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📄 Hakkımızda sayfaları oluşturuluyor...\n');

  // Hakkımızda sayfaları
  const aboutPages = [
    {
      slug: 'biz-kimiz',
      title: 'Biz Kimiz',
      excerpt: 'Yardım Yolu Derneği hakkında genel bilgiler',
      menuItemId: 21
    },
    {
      slug: 'misyon-vizyon',
      title: 'Misyon & Vizyon',
      excerpt: 'Misyonumuz ve vizyonumuz',
      menuItemId: 22
    },
    {
      slug: 'tarihce',
      title: 'Tarihçe',
      excerpt: 'Derneğimizin tarihçesi',
      menuItemId: 23
    },
    {
      slug: 'yonetim-kurulu',
      title: 'Yönetim Kurulu',
      excerpt: 'Yönetim kurulu üyelerimiz',
      menuItemId: 24
    },
    {
      slug: 'denetim-kurulu',
      title: 'Denetim Kurulu',
      excerpt: 'Denetim kurulu üyelerimiz',
      menuItemId: 25
    },
    {
      slug: 'onursal-baskanlar',
      title: 'Onursal Başkanlar',
      excerpt: 'Onursal başkanlarımız',
      menuItemId: 26
    },
    {
      slug: 'is-ortaklarimiz',
      title: 'İş Ortaklarımız',
      excerpt: 'Birlikte çalıştığımız kurumlar',
      menuItemId: 27
    },
    {
      slug: 'faaliyet-raporlari',
      title: 'Faaliyet Raporları',
      excerpt: 'Yıllık faaliyet raporlarımız',
      menuItemId: 28
    }
  ];

  for (const pageData of aboutPages) {
    // Önce translation'dan sayfa var mı kontrol et
    const existingTranslation = await prisma.pageTranslation.findUnique({
      where: {
        language_slug: {
          language: 'tr',
          slug: pageData.slug
        }
      },
      include: { page: true }
    });

    let page;
    if (existingTranslation) {
      // Sayfa zaten var, güncelle
      page = await prisma.page.update({
        where: { id: existingTranslation.pageId },
        data: {
          status: 'published',
          isPublic: true,
          isActive: true
        }
      });
      console.log(`⏭️  Sayfa zaten mevcut: ${pageData.title} (ID: ${page.id})`);
    } else {
      // Yeni sayfa oluştur
      page = await prisma.page.create({
        data: {
          pageType: 'about',
          status: 'published',
          isPublic: true,
          isActive: true,
          displayOrder: 0,
          translations: {
            create: {
              language: 'tr',
              slug: pageData.slug,
              title: pageData.title,
              content: `<h1>${pageData.title}</h1><p>${pageData.excerpt}</p><p>Bu sayfa içeriği admin panelden düzenlenebilir.</p>`,
              excerpt: pageData.excerpt,
              metaTitle: pageData.title,
              metaDescription: pageData.excerpt
            }
          }
        }
      });
      console.log(`✅ Sayfa oluşturuldu: ${pageData.title} (ID: ${page.id})`);
    }

    // Menü öğesini güncelle - artık pageId kullan
    await prisma.menuItem.update({
      where: { id: pageData.menuItemId },
      data: {
        linkType: 'page',
        pageId: page.id,
        customUrl: null
      }
    });

    console.log(`   └─ Menü öğesi sayfaya bağlandı (MenuItem ID: ${pageData.menuItemId} -> Page ID: ${page.id})`);
  }

  console.log('\n✅ Tüm Hakkımızda sayfaları oluşturuldu ve menülere bağlandı!');
  console.log('📝 Not: Sayfa içerikleri admin panelden düzenlenebilir.');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
