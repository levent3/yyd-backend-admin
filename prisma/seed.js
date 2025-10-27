const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seed işlemi başlatılıyor...\n');

  // 1. ROLLER OLUŞTUR
  console.log('📋 Roller oluşturuluyor...');
  const superAdminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'superadmin',
      description: 'Tam yetkili süper yönetici rolü'
    }
  });

  const editorRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'editor',
      description: 'İçerik düzenleyici rolü'
    }
  });
  console.log('✅ Roller oluşturuldu\n');

  // 2. VARSAYILAN KULLANICI OLUŞTUR
  console.log('👤 Varsayılan kullanıcı oluşturuluyor...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yyd.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@yyd.com',
      passwordHash: hashedPassword,
      roleId: 1,
      isActive: true
    }
  });
  console.log('✅ Varsayılan kullanıcı oluşturuldu (admin@yyd.com / admin123)\n');

  // 3. ADMIN MODÜLLER
  console.log('🔧 Admin modülleri oluşturuluyor...');

  const modules = [
    // Ana modüller (parentId null)
    { id: 1, name: 'Dashboard', moduleKey: 'dashboard', path: '/admin/dashboard', icon: 'home', displayOrder: 0, parentId: null },
    { id: 2, name: 'Kullanıcılar', moduleKey: 'users', path: '/admin/users', icon: 'users', displayOrder: 1, parentId: null },
    { id: 3, name: 'Roller', moduleKey: 'roles', path: '/admin/roles', icon: 'shield', displayOrder: 2, parentId: null },
    { id: 4, name: 'Projeler', moduleKey: 'projects', path: '/admin/projects', icon: 'briefcase', displayOrder: 3, parentId: null },
    { id: 6, name: 'Bağış Yönetimi', moduleKey: 'donations', path: null, icon: 'heart', displayOrder: 4, parentId: null },
    { id: 7, name: 'Haber Yönetimi', moduleKey: 'news', path: '/admin/news', icon: 'newspaper', displayOrder: 7, parentId: null },
    { id: 8, name: 'Galeri Yönetimi', moduleKey: 'gallery', path: '/admin/gallery', icon: 'image', displayOrder: 8, parentId: null },
    { id: 9, name: 'İletişim Mesajları', moduleKey: 'contact', path: '/admin/contact', icon: 'mail', displayOrder: 9, parentId: null },
    { id: 10, name: 'Gönüllü Başvuruları', moduleKey: 'volunteers', path: '/admin/volunteers', icon: 'users', displayOrder: 10, parentId: null },
    { id: 11, name: 'Kariyer Başvuruları', moduleKey: 'careers', path: null, icon: 'briefcase', displayOrder: 11, parentId: null },
    { id: 18, name: 'Modül Yönetimi', moduleKey: 'modules', path: '/admin/modules', icon: 'grid', displayOrder: 17, parentId: null },
    { id: 19, name: 'Sistem Ayarları', moduleKey: 'settings', path: '/admin/settings', icon: 'settings', displayOrder: 18, parentId: null },
    { id: 20, name: 'Sayfalar', moduleKey: 'pages', path: '/admin/pages', icon: 'file-text', displayOrder: 12, parentId: null },
    { id: 21, name: 'Tarihçe', moduleKey: 'timeline', path: '/admin/timeline', icon: 'clock', displayOrder: 13, parentId: null },
    { id: 22, name: 'Ekip Üyeleri', moduleKey: 'team-members', path: '/admin/team-members', icon: 'users', displayOrder: 14, parentId: null },
    { id: 23, name: 'Medya Yönetimi', moduleKey: 'media', path: null, icon: 'folder', displayOrder: 16, parentId: null },

    // Bağış Yönetimi alt modülleri
    { id: 12, name: 'Bağışlar', moduleKey: 'donations-list', path: '/admin/donations', icon: 'list', displayOrder: 1, parentId: 6 },
    { id: 13, name: 'Bağış Kampanyaları', moduleKey: 'campaigns', path: '/admin/campaigns', icon: 'target', displayOrder: 2, parentId: 6 },
    { id: 14, name: 'Düzenli Bağışlar', moduleKey: 'recurring-donations', path: '/admin/recurring-donations', icon: 'repeat', displayOrder: 3, parentId: 6 },
    { id: 15, name: 'Ödeme İşlemleri', moduleKey: 'payment-transactions', path: '/admin/payment-transactions', icon: 'credit-card', displayOrder: 4, parentId: 6 },
    { id: 16, name: 'Kampanya Ayarları', moduleKey: 'campaign-settings', path: '/admin/campaign-settings', icon: 'sliders', displayOrder: 5, parentId: 6 },
    { id: 17, name: 'Banka Hesapları', moduleKey: 'bank-accounts', path: '/admin/bank-accounts', icon: 'dollar-sign', displayOrder: 6, parentId: 6 },

    // Medya Yönetimi alt modülleri
    { id: 24, name: 'Kurumsal Kimlik', moduleKey: 'brand-assets', path: '/admin/brand-assets', icon: 'award', displayOrder: 1, parentId: 23 },
    { id: 25, name: 'Broşürler', moduleKey: 'brochures', path: '/admin/brochures', icon: 'file-text', displayOrder: 2, parentId: 23 },
    { id: 26, name: 'Tanıtım Videoları', moduleKey: 'public-spots', path: '/admin/public-spots', icon: 'video', displayOrder: 3, parentId: 23 },
    { id: 27, name: 'Başarı Hikayeleri', moduleKey: 'success-stories', path: '/admin/success-stories', icon: 'star', displayOrder: 4, parentId: 23 },
    { id: 28, name: 'Medya Haberleri', moduleKey: 'media-coverage', path: '/admin/media-coverage', icon: 'tv', displayOrder: 5, parentId: 23 },

    // Kariyer Başvuruları alt modülleri
    { id: 29, name: 'Başvurular', moduleKey: 'career-applications', path: '/admin/careers', icon: 'file-text', displayOrder: 1, parentId: 11 },
    { id: 30, name: 'Açık Pozisyonlar', moduleKey: 'job-positions', path: '/admin/job-positions', icon: 'briefcase', displayOrder: 2, parentId: 11 }
  ];

  for (const module of modules) {
    await prisma.adminModule.upsert({
      where: { id: module.id },
      update: {
        name: module.name,
        moduleKey: module.moduleKey,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId
      },
      create: module
    });
  }
  console.log(`✅ ${modules.length} adet modül oluşturuldu\n`);

  // 4. ROL YETKİLERİ
  console.log('🔐 Rol yetkileri ayarlanıyor...');

  // Super Admin için tüm modüllere tam yetki
  for (const module of modules) {
    await prisma.roleModulePermission.upsert({
      where: {
        roleId_moduleId: {
          roleId: 1,
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
        roleId: 1,
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
  for (const module of modules) {
    await prisma.roleModulePermission.upsert({
      where: {
        roleId_moduleId: {
          roleId: 2,
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
        roleId: 2,
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

  console.log('✨ Seed işlemi başarıyla tamamlandı!\n');
  console.log('📝 Giriş Bilgileri:');
  console.log('   Email: admin@yyd.com');
  console.log('   Password: admin123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
