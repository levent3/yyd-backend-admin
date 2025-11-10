const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Medya menü öğeleri güncelleniyor...\n');

  // 1. Ana menüyü bul
  const mainMenu = await prisma.menu.findUnique({
    where: { slug: 'main-menu' }
  });

  if (!mainMenu) {
    console.error('❌ Ana menü bulunamadı!');
    return;
  }

  // 2. "Medya" üst menü öğesini bul
  const parentMenuItem = await prisma.menuItem.findFirst({
    where: {
      menuId: mainMenu.id,
      title: 'Medya'
    }
  });

  if (!parentMenuItem) {
    console.error('❌ "Medya" menü öğesi bulunamadı!');
    return;
  }

  console.log(`✅ "Medya" menü öğesi bulundu (ID: ${parentMenuItem.id})\n`);

  // 3. Mevcut alt menü öğelerini sil
  const deletedItems = await prisma.menuItem.deleteMany({
    where: {
      parentId: parentMenuItem.id
    }
  });

  console.log(`🗑️  ${deletedItems.count} eski alt menü öğesi silindi\n`);

  // 4. PostgreSQL sequence'i güncelle
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"MenuItem"', 'id'), COALESCE((SELECT MAX(id) FROM "MenuItem"), 1), true);`
    );
    console.log('✅ PostgreSQL sequence güncellendi\n');
  } catch (error) {
    console.log('⚠️  Sequence güncellenemedi:', error.message, '\n');
  }

  // 5. Yeni medya alt menü öğelerini ekle
  const mediaSubMenus = [
    {
      title: 'Haberler',
      customUrl: '/haberler',
      displayOrder: 1
    },
    {
      title: 'Basında Biz',
      customUrl: '/basinda-biz',
      displayOrder: 2
    },
    {
      title: 'Galeri',
      customUrl: '/galeri',
      displayOrder: 3
    },
    {
      title: 'İyileşme Öyküleri',
      customUrl: '/iyilesme-oykuleri',
      displayOrder: 4
    },
    {
      title: 'Kamu Spotları',
      customUrl: '/kamu-spotlari',
      displayOrder: 5
    },
    {
      title: 'Broşürler',
      customUrl: '/brosurler',
      displayOrder: 6
    },
    {
      title: 'Kurumsal Kimlik',
      customUrl: '/kurumsal-kimlik',
      displayOrder: 7
    }
  ];

  console.log(`📋 ${mediaSubMenus.length} medya alt menü öğesi eklenecek\n`);

  for (const item of mediaSubMenus) {
    try {
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

      console.log(`✅ Menü öğesi eklendi: ${item.title} → ${item.customUrl} (MenuItem ID: ${menuItem.id})`);
    } catch (error) {
      console.error(`❌ Hata (${item.title}):`, error.message);
    }
  }

  console.log('\n✨ Medya menü öğeleri başarıyla güncellendi!\n');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
