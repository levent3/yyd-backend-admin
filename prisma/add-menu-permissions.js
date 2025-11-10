const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔑 Menü Yönetimi yetkileri ekleniyor...\n');

  // Menü modülünü bul
  const menuModule = await prisma.adminModule.findUnique({
    where: { moduleKey: 'menus' }
  });

  if (!menuModule) {
    console.error('❌ Menü modülü bulunamadı!');
    process.exit(1);
  }

  console.log(`✅ Modül bulundu: ${menuModule.name} (ID: ${menuModule.id})`);

  // Super Admin rolünü bul
  const superAdminRole = await prisma.role.findFirst({
    where: {
      name: 'superadmin'
    }
  });

  if (!superAdminRole) {
    console.error('❌ Super Admin rolü bulunamadı!');
    process.exit(1);
  }

  console.log(`✅ Rol bulundu: ${superAdminRole.name} (ID: ${superAdminRole.id})\n`);

  // Modül için yetki kaydı var mı kontrol et
  const existing = await prisma.roleModulePermission.findUnique({
    where: {
      roleId_moduleId: {
        roleId: superAdminRole.id,
        moduleId: menuModule.id
      }
    }
  });

  if (existing) {
    console.log('  ⏭️  Menü Yönetimi yetkileri zaten mevcut');
    console.log(`     Mevcut yetkiler: ${JSON.stringify(existing.permissions)}`);
  } else {
    // Tüm yetkileri true yap
    await prisma.roleModulePermission.create({
      data: {
        roleId: superAdminRole.id,
        moduleId: menuModule.id,
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: true
        }
      }
    });
    console.log('  ✅ Tüm yetkiler eklendi (create, read, update, delete)');
  }

  console.log('\n✅ İşlem tamamlandı!');
  console.log('🔄 Tarayıcıda sayfayı yenile (F5) ve sidebar menüde "Menü Yönetimi" görünecek.');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
