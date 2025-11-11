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

  // 3. ADMIN MODÜLLER
  console.log('🔧 Admin modülleri oluşturuluyor...');

  // Önce parent modülleri oluştur
  const parentModules = [
    { name: 'Dashboard', moduleKey: 'dashboard', path: '/admin/dashboard', icon: 'home', displayOrder: 0 },
    { name: 'Kullanıcılar', moduleKey: 'users', path: '/admin/users', icon: 'users', displayOrder: 1 },
    { name: 'Roller', moduleKey: 'roles', path: '/admin/roles', icon: 'shield', displayOrder: 2 },
    { name: 'Projeler', moduleKey: 'projects', path: '/admin/projects', icon: 'briefcase', displayOrder: 3 },
    { name: 'Bağış Yönetimi', moduleKey: 'donations', path: null, icon: 'heart', displayOrder: 4 },
    { name: 'Haber Yönetimi', moduleKey: 'news', path: '/admin/news', icon: 'newspaper', displayOrder: 5 },
    { name: 'Galeri Yönetimi', moduleKey: 'gallery', path: '/admin/gallery', icon: 'image', displayOrder: 6 },
    { name: 'İletişim Mesajları', moduleKey: 'contact', path: '/admin/contact', icon: 'mail', displayOrder: 7 },
    { name: 'Gönüllü Başvuruları', moduleKey: 'volunteers', path: '/admin/volunteers', icon: 'users', displayOrder: 8 },
    { name: 'Kariyer', moduleKey: 'careers', path: null, icon: 'briefcase', displayOrder: 9 },
    { name: 'Sayfalar', moduleKey: 'pages', path: '/admin/pages', icon: 'file-text', displayOrder: 10 },
    { name: 'Faaliyet Alanları', moduleKey: 'activity-areas', path: '/admin/activity-areas', icon: 'target', displayOrder: 11 },
    { name: 'Medya Yönetimi', moduleKey: 'media', path: null, icon: 'folder', displayOrder: 12 },
    { name: 'Modül Yönetimi', moduleKey: 'modules', path: '/admin/modules', icon: 'grid', displayOrder: 13 },
    { name: 'Sistem Ayarları', moduleKey: 'settings', path: '/admin/settings', icon: 'settings', displayOrder: 14 }
  ];

  for (const module of parentModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: null
      },
      create: {
        name: module.name,
        moduleKey: module.moduleKey,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: null
      }
    });
  }

  // Şimdi child modülleri oluştur (parent ID'leri database'den çek)
  const projectsParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'projects' } });
  const donationsParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'donations' } });
  const careersParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'careers' } });
  const mediaParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'media' } });

  const childModules = [
    // Projeler alt modülü
    { name: 'Proje Ayarları', moduleKey: 'project-settings', path: '/admin/project-settings', icon: 'settings', displayOrder: 1, parentId: projectsParent.id },

    // Bağış Yönetimi alt modülleri
    { name: 'Bağışlar', moduleKey: 'donations-list', path: '/admin/donations', icon: 'list', displayOrder: 1, parentId: donationsParent.id },
    { name: 'Düzenli Bağışlar', moduleKey: 'recurring-donations', path: '/admin/recurring-donations', icon: 'repeat', displayOrder: 2, parentId: donationsParent.id },
    { name: 'Ödeme İşlemleri', moduleKey: 'payment-transactions', path: '/admin/payment-transactions', icon: 'credit-card', displayOrder: 3, parentId: donationsParent.id },
    { name: 'Banka Hesapları', moduleKey: 'bank-accounts', path: '/admin/bank-accounts', icon: 'dollar-sign', displayOrder: 4, parentId: donationsParent.id },
    { name: 'Bankalar', moduleKey: 'banks', path: '/admin/banks', icon: 'building', displayOrder: 5, parentId: donationsParent.id },
    { name: 'BIN Kodları', moduleKey: 'bin-codes', path: '/admin/bin-codes', icon: 'credit-card', displayOrder: 6, parentId: donationsParent.id },

    // Kariyer alt modülleri
    { name: 'Başvurular', moduleKey: 'career-applications', path: '/admin/careers', icon: 'file-text', displayOrder: 1, parentId: careersParent.id },
    { name: 'Açık Pozisyonlar', moduleKey: 'job-positions', path: '/admin/job-positions', icon: 'briefcase', displayOrder: 2, parentId: careersParent.id },

    // Medya Yönetimi alt modülleri
    { name: 'Kurumsal Kimlik', moduleKey: 'brand-assets', path: '/admin/brand-assets', icon: 'award', displayOrder: 1, parentId: mediaParent.id },
    { name: 'Broşürler', moduleKey: 'brochures', path: '/admin/brochures', icon: 'file-text', displayOrder: 2, parentId: mediaParent.id },
    { name: 'Tanıtım Videoları', moduleKey: 'public-spots', path: '/admin/public-spots', icon: 'video', displayOrder: 3, parentId: mediaParent.id },
    { name: 'Başarı Hikayeleri', moduleKey: 'success-stories', path: '/admin/success-stories', icon: 'star', displayOrder: 4, parentId: mediaParent.id },
    { name: 'Medya Haberleri', moduleKey: 'media-coverage', path: '/admin/media-coverage', icon: 'tv', displayOrder: 5, parentId: mediaParent.id }
  ];

  for (const module of childModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId
      },
      create: {
        name: module.name,
        moduleKey: module.moduleKey,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId
      }
    });
  }
  console.log(`✅ ${parentModules.length + childModules.length} adet modül oluşturuldu\n`);

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
