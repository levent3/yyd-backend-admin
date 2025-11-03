const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Modüller oluşturuluyor...\n');

  // Ana modüller (parentId = null)
  const mainModules = [
    { id: 1, name: 'Dashboard', moduleKey: 'dashboard', path: '/dashboard', icon: 'home', displayOrder: 1 },
    { id: 2, name: 'Kullanıcılar', moduleKey: 'users', path: '/admin/users', icon: 'users', displayOrder: 2 },
    { id: 3, name: 'Roller', moduleKey: 'roles', path: '/admin/roles', icon: 'shield', displayOrder: 3 },
    { id: 4, name: 'Projeler', moduleKey: 'projects', path: '/admin/projects', icon: 'briefcase', displayOrder: 4 },
    { id: 6, name: 'Bağış Yönetimi', moduleKey: 'donations', path: null, icon: 'dollar-sign', displayOrder: 6 },
    { id: 7, name: 'Haber Yönetimi', moduleKey: 'news', path: '/admin/news', icon: 'file-text', displayOrder: 7 },
    { id: 8, name: 'Galeri Yönetimi', moduleKey: 'gallery', path: '/admin/gallery', icon: 'image', displayOrder: 8 },
    { id: 9, name: 'İletişim Mesajları', moduleKey: 'contact', path: '/admin/contact', icon: 'mail', displayOrder: 9 },
    { id: 10, name: 'Gönüllü Başvuruları', moduleKey: 'volunteers', path: '/admin/volunteers', icon: 'heart', displayOrder: 10 },
    { id: 11, name: 'Kariyer Başvuruları', moduleKey: 'careers', path: '/admin/careers', icon: 'briefcase', displayOrder: 11 },
    { id: 18, name: 'Modül Yönetimi', moduleKey: 'modules', path: '/admin/modules', icon: 'grid', displayOrder: 18 },
    { id: 19, name: 'Sistem Ayarları', moduleKey: 'settings', path: '/admin/system-settings', icon: 'settings', displayOrder: 19 },
    { id: 20, name: 'Sayfalar', moduleKey: 'pages', path: '/admin/pages', icon: 'file', displayOrder: 20 },
    { id: 21, name: 'Tarihçe', moduleKey: 'timeline', path: '/admin/timeline', icon: 'clock', displayOrder: 21 },
    { id: 22, name: 'Ekip Üyeleri', moduleKey: 'team-members', path: '/admin/team-members', icon: 'users', displayOrder: 22 },
    { id: 23, name: 'Medya Yönetimi', moduleKey: 'media', path: null, icon: 'folder', displayOrder: 16 },
  ];

  for (const module of mainModules) {
    await prisma.adminModule.upsert({
      where: { id: module.id },
      update: module,
      create: module
    });
    console.log(`✅ ${module.name}`);
  }

  // Projeler alt modülleri (parentId = 4)
  const projectSubModules = [
    { id: 5, name: 'Proje Ayarları', moduleKey: 'project-settings', path: '/admin/project-settings', icon: 'settings', displayOrder: 1, parentId: 4 },
  ];

  for (const module of projectSubModules) {
    await prisma.adminModule.upsert({
      where: { id: module.id },
      update: module,
      create: module
    });
    console.log(`  └─ ${module.name}`);
  }

  // Bağış Yönetimi alt modülleri (parentId = 6)
  const donationSubModules = [
    { id: 13, name: 'Tüm Bağışlar', moduleKey: 'donations-list', path: '/admin/donations', icon: 'list', displayOrder: 2, parentId: 6 },
    { id: 14, name: 'Düzenli Bağışlar', moduleKey: 'recurring-donations', path: '/admin/recurring-donations', icon: 'repeat', displayOrder: 3, parentId: 6 },
    { id: 15, name: 'Ödeme İşlemleri', moduleKey: 'payment-transactions', path: '/admin/payment-transactions', icon: 'credit-card', displayOrder: 4, parentId: 6 },
    { id: 16, name: 'Banka Hesapları', moduleKey: 'bank-accounts', path: '/admin/bank-accounts', icon: 'dollar-sign', displayOrder: 5, parentId: 6 },
  ];

  for (const module of donationSubModules) {
    await prisma.adminModule.upsert({
      where: { id: module.id },
      update: module,
      create: module
    });
    console.log(`  └─ ${module.name}`);
  }

  // Medya Yönetimi alt modülleri (parentId = 23)
  const mediaSubModules = [
    { id: 24, name: 'Kurumsal Kimlik', moduleKey: 'brand-assets', path: '/admin/brand-assets', icon: 'award', displayOrder: 1, parentId: 23 },
    { id: 25, name: 'Broşürler', moduleKey: 'brochures', path: '/admin/brochures', icon: 'file-text', displayOrder: 2, parentId: 23 },
    { id: 26, name: 'Tanıtım Videoları', moduleKey: 'public-spots', path: '/admin/public-spots', icon: 'video', displayOrder: 3, parentId: 23 },
    { id: 27, name: 'Başarı Hikayeleri', moduleKey: 'success-stories', path: '/admin/success-stories', icon: 'star', displayOrder: 4, parentId: 23 },
    { id: 28, name: 'Basında Biz', moduleKey: 'media-coverage', path: '/admin/media-coverage', icon: 'tv', displayOrder: 5, parentId: 23 },
  ];

  for (const module of mediaSubModules) {
    await prisma.adminModule.upsert({
      where: { id: module.id },
      update: module,
      create: module
    });
    console.log(`  └─ ${module.name}`);
  }

  // Kariyer alt modülleri (parentId = 11)
  const careerSubModules = [
    { id: 30, name: 'Açık Pozisyonlar', moduleKey: 'job-positions', path: '/admin/job-positions', icon: 'briefcase', displayOrder: 1, parentId: 11 },
  ];

  for (const module of careerSubModules) {
    await prisma.adminModule.upsert({
      where: { id: module.id },
      update: module,
      create: module
    });
    console.log(`  └─ ${module.name}`);
  }

  console.log('\n✅ Tüm modüller başarıyla oluşturuldu!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
