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

  // 4. Tüm faaliyet alanlarını getir
  const activityAreas = await prisma.activityArea.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      translations: {
        where: { language: 'tr' }
      }
    }
  });

  console.log(`📋 ${activityAreas.length} faaliyet alanı bulundu\n`);

  // 5. Her faaliyet alanı için menü öğesi oluştur
  for (const area of activityAreas) {
    const trTranslation = area.translations[0];

    if (!trTranslation) {
      console.log(`⏭️  Faaliyet Alanı ID ${area.id} için Türkçe çeviri yok, atlanıyor...`);
      continue;
    }

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
