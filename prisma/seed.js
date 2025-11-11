const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seed işlemi başlatılıyor...\n');

  // 1. ROLLER OLUŞTUR
  console.log('📋 Roller oluşturuluyor...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: {
      name: 'superadmin'
    }
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor'
    }
  });
  console.log('✅ Roller oluşturuldu\n');

  // 2. VARSAYILAN KULLANICI OLUŞTUR
  console.log('👤 Varsayılan kullanıcı oluşturuluyor...');

  // Environment variable'dan şifre oku, yoksa default kullan (development için)
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

  // Production'da default şifre kullanılıyorsa uyar
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_DEFAULT_PASSWORD) {
    console.warn('⚠️  WARNING: Using default admin password in production!');
    console.warn('⚠️  Please set ADMIN_DEFAULT_PASSWORD environment variable for security!');
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yyd.com' },
    update: {},
    create: {
      username: 'admin',
      fullName: 'Super Admin',
      email: 'admin@yyd.com',
      passwordHash: hashedPassword,
      roleId: superAdminRole.id
    }
  });
  console.log(`✅ Varsayılan kullanıcı oluşturuldu (admin@yyd.com / ${process.env.ADMIN_DEFAULT_PASSWORD ? '***' : defaultPassword})\n`);

  // 3. ADMIN MODÜLLER - seed-modules.js'i çalıştır
  console.log('🔧 Admin modülleri oluşturuluyor...');
  const { execSync } = require('child_process');
  try {
    execSync('node prisma/seed-modules.js', { stdio: 'inherit' });
  } catch (e) {
    console.error('⚠️  Modül seed hatası:', e.message);
  }
  console.log();

  // 4. ROL YETKİLERİ
  console.log('🔐 Rol yetkileri ayarlanıyor...');

  // Tüm modülleri database'den çek (ID'leri almak için)
  const allModules = await prisma.adminModule.findMany();

  // Super Admin için tüm modüllere tam yetki
  for (const module of allModules) {
    await prisma.roleModulePermission.upsert({
      where: {
        roleId_moduleId: {
          roleId: superAdminRole.id,
          moduleId: module.id
        }
      },
      update: {
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: true
        }
      },
      create: {
        roleId: superAdminRole.id,
        moduleId: module.id,
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: true
        }
      }
    });
  }

  // Editor için sınırlı yetki (silme yetkisi yok)
  for (const module of allModules) {
    await prisma.roleModulePermission.upsert({
      where: {
        roleId_moduleId: {
          roleId: editorRole.id,
          moduleId: module.id
        }
      },
      update: {
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: false
        }
      },
      create: {
        roleId: editorRole.id,
        moduleId: module.id,
        permissions: {
          read: true,
          create: true,
          update: true,
          delete: false
        }
      }
    });
  }
  console.log('✅ Rol yetkileri ayarlandı\n');

  // 5. EK SEED DOSYALARINI ÇALIŞTIR
  console.log('🌱 Ek veriler ekleniyor...\n');

  // Activity Areas (Faaliyet Alanları)
  try {
    console.log('📍 Faaliyet Alanları ekleniyor...');
    const activityAreasCount = await prisma.activityArea.count();
    if (activityAreasCount === 0) {
      const { execSync } = require('child_process');
      execSync('node prisma/seed-activity-areas.js', { stdio: 'inherit' });
      console.log('✅ Faaliyet Alanları eklendi\n');
    } else {
      console.log(`ℹ️  Zaten ${activityAreasCount} faaliyet alanı var, atlanıyor\n`);
    }
  } catch (e) {
    console.warn('⚠️  Faaliyet Alanları eklenemedi:', e.message, '\n');
  }

  // Menus (Menü Sistemi)
  try {
    console.log('🍔 Menü sistemi oluşturuluyor...');
    const menusCount = await prisma.menu.count();
    if (menusCount === 0) {
      const { execSync } = require('child_process');
      execSync('node prisma/seed-menus.js', { stdio: 'inherit' });
      console.log('✅ Menü sistemi oluşturuldu\n');
    } else {
      console.log(`ℹ️  Zaten ${menusCount} menü var, atlanıyor\n`);
    }
  } catch (e) {
    console.warn('⚠️  Menü sistemi oluşturulamadı:', e.message, '\n');
  }

  // About Pages (Hakkımızda Sayfaları)
  try {
    console.log('📄 Hakkımızda sayfaları oluşturuluyor...');
    const pagesCount = await prisma.page.count();
    if (pagesCount === 0) {
      const { execSync } = require('child_process');
      execSync('node prisma/seed-about-pages.js', { stdio: 'inherit' });
      console.log('✅ Hakkımızda sayfaları oluşturuldu\n');
    } else {
      console.log(`ℹ️  Zaten ${pagesCount} sayfa var, atlanıyor\n`);
    }
  } catch (e) {
    console.warn('⚠️  Hakkımızda sayfaları oluşturulamadı:', e.message, '\n');
  }

  console.log('✨ Seed işlemi başarıyla tamamlandı!\n');
  console.log('📝 Giriş Bilgileri:');
  console.log('   Email: admin@yyd.com');
  console.log(`   Password: ${process.env.ADMIN_DEFAULT_PASSWORD ? '***' : 'admin123'}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
