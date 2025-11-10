/**
 * MENU SYSTEM SEED SCRIPT
 *
 * Bu script şunları yapar:
 * 1. Faaliyet Alanları oluşturur (8 adet)
 * 2. Ana Menü oluşturur (yoksa)
 * 3. Faaliyet Alanları menü öğeleri ekler
 * 4. Medya menü öğeleri ekler
 *
 * KULLANIM:
 * - Development: docker exec yyd_api_dev node prisma/seed-menu-system.js
 * - Production: node prisma/seed-menu-system.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ========== FAALIYET ALANLARI DATA ==========
const activityAreasData = [
  {
    icon: 'nutrition',
    displayOrder: 1,
    translations: {
      tr: {
        title: 'Beslenme Sağlığı',
        slug: 'beslenme-sagligi',
        description: 'Beslenme ile ilgili sağlık çalışmaları',
        content: 'Beslenme sağlığı programları ile yetersiz beslenen topluluklar için gıda desteği ve beslenme eğitimleri sağlıyoruz.'
      },
      en: {
        title: 'Nutrition Health',
        slug: 'nutrition-health',
        description: 'Health studies related to nutrition',
        content: 'We provide food support and nutrition education for malnourished communities through nutrition health programs.'
      }
    }
  },
  {
    icon: 'eye',
    displayOrder: 2,
    translations: {
      tr: {
        title: 'Göz Sağlığı',
        slug: 'goz-sagligi',
        description: 'Göz hizmetleri ve katarakt operasyonları',
        content: 'Göz sağlığı hizmetleri kapsamında katarakt ameliyatları ve göz muayeneleri gerçekleştiriyoruz.'
      },
      en: {
        title: 'Eye Health',
        slug: 'eye-health',
        description: 'Eye care services and cataract operations',
        content: 'We perform cataract surgeries and eye examinations as part of eye health services.'
      }
    }
  },
  {
    icon: 'volunteers',
    displayOrder: 3,
    translations: {
      tr: {
        title: 'Gönüllü Sağlık Ekipleri',
        slug: 'gonullu-saglik-ekipleri',
        description: 'Gönüllülerle oluşturulan sağlık ekipleri',
        content: 'Gönüllü doktorlar ve sağlık çalışanlarıyla oluşturduğumuz ekiplerle ihtiyaç bölgelerinde sağlık hizmeti sunuyoruz.'
      },
      en: {
        title: 'Volunteer Health Teams',
        slug: 'volunteer-health-teams',
        description: 'Health teams formed with volunteers',
        content: 'We provide healthcare services in areas of need with teams formed by volunteer doctors and healthcare workers.'
      }
    }
  },
  {
    icon: 'mother-child',
    displayOrder: 4,
    translations: {
      tr: {
        title: 'Anne Çocuk Sağlığı',
        slug: 'anne-cocuk-sagligi',
        description: 'Anneler ve çocuklar için sağlık hizmetleri',
        content: 'Anne ve çocuk sağlığı programları ile hamilelik takibi, doğum sonrası bakım ve çocuk sağlığı hizmetleri veriyoruz.'
      },
      en: {
        title: 'Maternal and Child Health',
        slug: 'maternal-child-health',
        description: 'Healthcare services for mothers and children',
        content: 'We provide pregnancy monitoring, postnatal care, and child health services through maternal and child health programs.'
      }
    }
  },
  {
    icon: 'water',
    displayOrder: 5,
    translations: {
      tr: {
        title: 'Temiz Suya Erişim',
        slug: 'temiz-suya-erisim',
        description: 'Su kuyusu ve temiz su projeleri',
        content: 'Temiz suya erişimi olmayan bölgelerde su kuyuları açıyor ve temiz su sistemleri kuruyoruz.'
      },
      en: {
        title: 'Access to Clean Water',
        slug: 'access-clean-water',
        description: 'Water well and clean water projects',
        content: 'We drill water wells and establish clean water systems in areas without access to clean water.'
      }
    }
  },
  {
    icon: 'psychology',
    displayOrder: 6,
    translations: {
      tr: {
        title: 'Psikososyal Destek',
        slug: 'psikososyal-destek',
        description: 'Psikolojik ve sosyal destek hizmetleri',
        content: 'Travma yaşayan bireyler ve topluluklar için psikolojik danışmanlık ve psikososyal destek programları sunuyoruz.'
      },
      en: {
        title: 'Psychosocial Support',
        slug: 'psychosocial-support',
        description: 'Psychological and social support services',
        content: 'We provide psychological counseling and psychosocial support programs for individuals and communities who have experienced trauma.'
      }
    }
  },
  {
    icon: 'education',
    displayOrder: 7,
    translations: {
      tr: {
        title: 'Sağlık Eğitimleri',
        slug: 'saglik-egitimleri',
        description: 'Sağlık konusunda eğitim ve bilgilendirme',
        content: 'Toplum sağlığını artırmak için hijyen, hastalıkların önlenmesi ve sağlıklı yaşam konularında eğitimler veriyoruz.'
      },
      en: {
        title: 'Health Education',
        slug: 'health-education',
        description: 'Health education and awareness',
        content: 'We provide education on hygiene, disease prevention, and healthy living to improve community health.'
      }
    }
  },
  {
    icon: 'equipment',
    displayOrder: 8,
    translations: {
      tr: {
        title: 'Ekipman ve Sistem Destek',
        slug: 'ekipman-sistem-destek',
        description: 'Tıbbi ekipman ve sistem desteği',
        content: 'Sağlık kuruluşlarına tıbbi ekipman desteği sağlıyor ve sağlık sistemlerinin güçlendirilmesine katkıda bulunuyoruz.'
      },
      en: {
        title: 'Equipment and System Support',
        slug: 'equipment-system-support',
        description: 'Medical equipment and system support',
        content: 'We provide medical equipment support to healthcare facilities and contribute to strengthening health systems.'
      }
    }
  }
];

// ========== MEDYA MENÜ DATA ==========
const mediaMenuItems = [
  { title: 'Haberler', customUrl: '/haberler', displayOrder: 1 },
  { title: 'Basında Biz', customUrl: '/basinda-biz', displayOrder: 2 },
  { title: 'Galeri', customUrl: '/galeri', displayOrder: 3 },
  { title: 'İyileşme Öyküleri', customUrl: '/iyilesme-oykuleri', displayOrder: 4 },
  { title: 'Kamu Spotları', customUrl: '/kamu-spotlari', displayOrder: 5 },
  { title: 'Broşürler', customUrl: '/brosurler', displayOrder: 6 },
  { title: 'Kurumsal Kimlik', customUrl: '/kurumsal-kimlik', displayOrder: 7 }
];

// ========== HELPER FUNCTIONS ==========

async function seedActivityAreas() {
  console.log('📍 1. Faaliyet Alanları ekleniyor...\n');

  for (const area of activityAreasData) {
    const { translations, ...areaData } = area;

    // Check if already exists
    const existing = await prisma.activityAreaTranslation.findFirst({
      where: {
        slug: translations.tr.slug,
        language: 'tr'
      }
    });

    if (existing) {
      console.log(`   ⏭️  "${translations.tr.title}" zaten mevcut, atlanıyor...`);
      continue;
    }

    const created = await prisma.activityArea.create({
      data: {
        ...areaData,
        isActive: true,
        translations: {
          create: [
            {
              language: 'tr',
              title: translations.tr.title,
              slug: translations.tr.slug,
              description: translations.tr.description,
              content: translations.tr.content
            },
            {
              language: 'en',
              title: translations.en.title,
              slug: translations.en.slug,
              description: translations.en.description,
              content: translations.en.content
            }
          ]
        }
      }
    });

    console.log(`   ✅ ${translations.tr.title} (ID: ${created.id})`);
  }

  console.log('\n');
}

async function seedActivityAreaMenuItems(mainMenu, parentMenuItem) {
  console.log('📍 2. Faaliyet Alanları menü öğeleri ekleniyor...\n');

  // Delete existing activity area menu items
  const deleted = await prisma.menuItem.deleteMany({
    where: {
      parentId: parentMenuItem.id,
      linkType: 'activityArea'
    }
  });

  if (deleted.count > 0) {
    console.log(`   🗑️  ${deleted.count} eski menü öğesi silindi\n`);
  }

  // Get all activity areas
  const activityAreas = await prisma.activityArea.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      translations: {
        where: { language: 'tr' }
      }
    }
  });

  // Create menu items
  for (const area of activityAreas) {
    const trTranslation = area.translations[0];
    if (!trTranslation) continue;

    const menuItem = await prisma.menuItem.create({
      data: {
        menuId: mainMenu.id,
        parentId: parentMenuItem.id,
        title: trTranslation.title,
        linkType: 'activityArea',
        activityAreaId: area.id,
        displayOrder: area.displayOrder,
        isActive: true,
        target: '_self'
      }
    });

    console.log(`   ✅ ${trTranslation.title} (MenuItem ID: ${menuItem.id})`);
  }

  console.log('\n');
}

async function seedMediaMenuItems(mainMenu, parentMenuItem) {
  console.log('📍 3. Medya menü öğeleri ekleniyor...\n');

  // Delete existing media menu items
  const deleted = await prisma.menuItem.deleteMany({
    where: {
      parentId: parentMenuItem.id
    }
  });

  if (deleted.count > 0) {
    console.log(`   🗑️  ${deleted.count} eski menü öğesi silindi\n`);
  }

  // Create menu items
  for (const item of mediaMenuItems) {
    const menuItem = await prisma.menuItem.create({
      data: {
        menuId: mainMenu.id,
        parentId: parentMenuItem.id,
        title: item.title,
        linkType: 'custom',
        customUrl: item.customUrl,
        displayOrder: item.displayOrder,
        isActive: true,
        target: '_self'
      }
    });

    console.log(`   ✅ ${item.title} → ${item.customUrl} (MenuItem ID: ${menuItem.id})`);
  }

  console.log('\n');
}

// ========== MAIN FUNCTION ==========

async function main() {
  console.log('\n🌱 MENU SYSTEM SEED BAŞLIYOR...\n');
  console.log('='.repeat(50) + '\n');

  try {
    // 1. Seed Activity Areas
    await seedActivityAreas();

    // 2. Get or create Main Menu
    let mainMenu = await prisma.menu.findUnique({
      where: { slug: 'main-menu' }
    });

    if (!mainMenu) {
      console.log('📍 Ana menü bulunamadı, oluşturuluyor...\n');
      mainMenu = await prisma.menu.create({
        data: {
          name: 'Ana Menü',
          slug: 'main-menu',
          location: 'header',
          isActive: true
        }
      });
      console.log(`   ✅ Ana menü oluşturuldu (ID: ${mainMenu.id})\n`);
    } else {
      console.log(`   ✅ Ana menü bulundu (ID: ${mainMenu.id})\n`);
    }

    // 3. Fix PostgreSQL sequence
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"MenuItem"', 'id'), COALESCE((SELECT MAX(id) FROM "MenuItem"), 1), true);`
      );
      console.log('   ✅ PostgreSQL sequence güncellendi\n');
    } catch (error) {
      console.log('   ⚠️  Sequence güncellenemedi (muhtemelen PostgreSQL değil)\n');
    }

    // 4. Get "Faaliyet Alanları" parent menu item
    let activityAreasParent = await prisma.menuItem.findFirst({
      where: {
        menuId: mainMenu.id,
        title: 'Faaliyet Alanları',
        parentId: null
      }
    });

    if (!activityAreasParent) {
      console.log('   ⚠️  "Faaliyet Alanları" üst menüsü bulunamadı, oluşturuluyor...\n');
      activityAreasParent = await prisma.menuItem.create({
        data: {
          menuId: mainMenu.id,
          title: 'Faaliyet Alanları',
          linkType: 'custom',
          customUrl: '/faaliyet-alanlari',
          displayOrder: 4,
          isActive: true,
          target: '_self'
        }
      });
      console.log(`   ✅ "Faaliyet Alanları" menü öğesi oluşturuldu (ID: ${activityAreasParent.id})\n`);
    }

    // 5. Seed Activity Area Menu Items
    await seedActivityAreaMenuItems(mainMenu, activityAreasParent);

    // 6. Get "Medya" parent menu item
    let mediaParent = await prisma.menuItem.findFirst({
      where: {
        menuId: mainMenu.id,
        title: 'Medya',
        parentId: null
      }
    });

    if (!mediaParent) {
      console.log('   ⚠️  "Medya" üst menüsü bulunamadı, oluşturuluyor...\n');
      mediaParent = await prisma.menuItem.create({
        data: {
          menuId: mainMenu.id,
          title: 'Medya',
          linkType: 'custom',
          customUrl: '/medya',
          displayOrder: 5,
          isActive: true,
          target: '_self'
        }
      });
      console.log(`   ✅ "Medya" menü öğesi oluşturuldu (ID: ${mediaParent.id})\n`);
    }

    // 7. Seed Media Menu Items
    await seedMediaMenuItems(mainMenu, mediaParent);

    console.log('='.repeat(50));
    console.log('\n✨ MENU SYSTEM SEED TAMAMLANDI!\n');

    // Summary
    const totalActivityAreas = await prisma.activityArea.count();
    const totalMenuItems = await prisma.menuItem.count({ where: { menuId: mainMenu.id } });

    console.log('📊 ÖZET:');
    console.log(`   - Faaliyet Alanları: ${totalActivityAreas}`);
    console.log(`   - Toplam Menü Öğesi: ${totalMenuItems}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ HATA:', error);
    throw error;
  }
}

// ========== RUN ==========

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
