const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Faaliyet Alanları menü öğeleri güncelleniyor...\n');

  // 1. Ana menüyü bul
  const mainMenu = await prisma.menu.findUnique({
    where: { slug: 'main-menu' }
  });

  if (!mainMenu) {
    console.error('❌ Ana menü bulunamadı!');
    return;
  }

  // 2. "Faaliyet Alanları" üst menü öğesini bul
  const parentMenuItem = await prisma.menuItem.findFirst({
    where: {
      menuId: mainMenu.id,
      title: 'Faaliyet Alanları'
    }
  });

  if (!parentMenuItem) {
    console.error('❌ "Faaliyet Alanları" menü öğesi bulunamadı!');
    return;
  }

  console.log(`✅ "Faaliyet Alanları" menü öğesi bulundu (ID: ${parentMenuItem.id})\n`);

  // 3. Mevcut alt menü öğelerini sil
  const deletedItems = await prisma.menuItem.deleteMany({
    where: {
      parentId: parentMenuItem.id
    }
  });

  console.log(`🗑️  ${deletedItems.count} eski alt menü öğesi silindi\n`);

  // 4. En yüksek MenuItem ID'sini bul
  const maxIdItem = await prisma.menuItem.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true }
  });

  console.log(`📊 En yüksek MenuItem ID: ${maxIdItem?.id || 0}\n`);

  // 5. Sequence'i resetle (PostgreSQL için)
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"MenuItem"', 'id'), COALESCE((SELECT MAX(id) FROM "MenuItem"), 1), true);`
    );
    console.log('✅ PostgreSQL sequence güncellendi\n');
  } catch (error) {
    console.log('⚠️  Sequence güncellenemedi (muhtemelen PostgreSQL değil):', error.message, '\n');
  }

  // 6. Tüm faaliyet alanlarını getir
  const activityAreas = await prisma.activityArea.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      translations: {
        where: { language: 'tr' }
      }
    }
  });

  console.log(`📋 ${activityAreas.length} faaliyet alanı bulundu\n`);

  // 7. Her faaliyet alanı için menü öğesi oluştur
  for (const area of activityAreas) {
    const trTranslation = area.translations[0];

    if (!trTranslation) {
      console.log(`⏭️  Faaliyet Alanı ID ${area.id} için Türkçe çeviri yok, atlanıyor...`);
      continue;
    }

    try {
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

      console.log(`✅ Menü öğesi eklendi: ${trTranslation.title} (MenuItem ID: ${menuItem.id}, ActivityArea ID: ${area.id})`);
    } catch (error) {
      console.error(`❌ Hata (${trTranslation.title}):`, error.message);
    }
  }

  console.log('\n✨ Faaliyet Alanları menü öğeleri başarıyla güncellendi!\n');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
