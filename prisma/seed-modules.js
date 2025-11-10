const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Modüller oluşturuluyor...\n');

  // Ana modüller (parentId = null) - ID'siz, sadece moduleKey ile
  const mainModules = [
    { name: 'Dashboard', moduleKey: 'dashboard', path: '/dashboard', icon: 'home', displayOrder: 1 },
    { name: 'Kullanıcılar', moduleKey: 'users', path: '/admin/users', icon: 'users', displayOrder: 2 },
    { name: 'Roller', moduleKey: 'roles', path: '/admin/roles', icon: 'shield', displayOrder: 3 },
    { name: 'Projeler', moduleKey: 'projects', path: '/admin/projects', icon: 'briefcase', displayOrder: 4 },
    { name: 'Bağış Yönetimi', moduleKey: 'donations', path: null, icon: 'dollar-sign', displayOrder: 6 },
    { name: 'Haber Yönetimi', moduleKey: 'news', path: '/admin/news', icon: 'file-text', displayOrder: 7 },
    { name: 'Galeri Yönetimi', moduleKey: 'gallery', path: '/admin/gallery', icon: 'image', displayOrder: 8 },
    { name: 'İletişim Mesajları', moduleKey: 'contact', path: '/admin/contact', icon: 'mail', displayOrder: 9 },
    { name: 'Gönüllü Başvuruları', moduleKey: 'volunteers', path: '/admin/volunteers', icon: 'heart', displayOrder: 10 },
    { name: 'Kariyer Başvuruları', moduleKey: 'careers', path: '/admin/careers', icon: 'briefcase', displayOrder: 11 },
    { name: 'Modül Yönetimi', moduleKey: 'modules', path: '/admin/modules', icon: 'grid', displayOrder: 18 },
    { name: 'Sistem Ayarları', moduleKey: 'settings', path: '/admin/system-settings', icon: 'settings', displayOrder: 19 },
    { name: 'Sayfalar', moduleKey: 'pages', path: '/admin/pages', icon: 'file', displayOrder: 20 },
    { name: 'Medya Yönetimi', moduleKey: 'media', path: null, icon: 'folder', displayOrder: 16 },
    { name: 'Faaliyet Alanları', moduleKey: 'activity-areas', path: '/admin/activity-areas', icon: 'target', displayOrder: 15 },
    { name: 'Anasayfa Yönetimi', moduleKey: 'homepage', path: null, icon: 'home', displayOrder: 5 },
    { name: 'Menü Yönetimi', moduleKey: 'menus', path: '/admin/menus', icon: 'menu', displayOrder: 17 },
  ];

  for (const module of mainModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
      },
      create: module,
    });
    console.log(`✅ ${module.name}`);
  }

  // Parent modülleri bul (moduleKey ile)
  const projectsParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'projects' } });
  const donationsParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'donations' } });
  const homepageParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'homepage' } });
  const mediaParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'media' } });
  const careersParent = await prisma.adminModule.findUnique({ where: { moduleKey: 'careers' } });

  // Projeler alt modülleri
  const projectSubModules = [
    { name: 'Proje Ayarları', moduleKey: 'project-settings', path: '/admin/project-settings', icon: 'settings', displayOrder: 1, parentId: projectsParent.id },
  ];

  for (const module of projectSubModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId,
      },
      create: module,
    });
    console.log(`  └─ ${module.name}`);
  }

  // Bağış Yönetimi alt modülleri
  const donationSubModules = [
    { name: 'Tüm Bağışlar', moduleKey: 'donations-list', path: '/admin/donations', icon: 'list', displayOrder: 2, parentId: donationsParent.id },
    { name: 'Düzenli Bağışlar', moduleKey: 'recurring-donations', path: '/admin/recurring-donations', icon: 'repeat', displayOrder: 3, parentId: donationsParent.id },
    { name: 'Ödeme İşlemleri', moduleKey: 'payment-transactions', path: '/admin/payment-transactions', icon: 'credit-card', displayOrder: 4, parentId: donationsParent.id },
    { name: 'Banka Hesapları', moduleKey: 'bank-accounts', path: '/admin/bank-accounts', icon: 'dollar-sign', displayOrder: 5, parentId: donationsParent.id },
    { name: 'Bankalar', moduleKey: 'banks', path: '/admin/banks', icon: 'home', displayOrder: 6, parentId: donationsParent.id },
    { name: 'BIN Kodları', moduleKey: 'bin-codes', path: '/admin/bin-codes', icon: 'credit-card', displayOrder: 7, parentId: donationsParent.id },
  ];

  for (const module of donationSubModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId,
      },
      create: module,
    });
    console.log(`  └─ ${module.name}`);
  }

  // Homepage alt modülleri
  const homepageSubModules = [
    { name: 'Anasayfa Sliderları', moduleKey: 'home-sliders', path: '/admin/home-sliders', icon: 'image', displayOrder: 1, parentId: homepageParent.id },
    { name: 'Site İstatistikleri', moduleKey: 'site-statistics', path: '/admin/site-statistics', icon: 'bar-chart', displayOrder: 2, parentId: homepageParent.id },
  ];

  for (const module of homepageSubModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId,
      },
      create: module,
    });
    console.log(`  └─ ${module.name}`);
  }

  // Medya Yönetimi alt modülleri
  const mediaSubModules = [
    { name: 'Kurumsal Kimlik', moduleKey: 'brand-assets', path: '/admin/brand-assets', icon: 'award', displayOrder: 1, parentId: mediaParent.id },
    { name: 'Broşürler', moduleKey: 'brochures', path: '/admin/brochures', icon: 'file-text', displayOrder: 2, parentId: mediaParent.id },
    { name: 'Tanıtım Videoları', moduleKey: 'public-spots', path: '/admin/public-spots', icon: 'video', displayOrder: 3, parentId: mediaParent.id },
    { name: 'Başarı Hikayeleri', moduleKey: 'success-stories', path: '/admin/success-stories', icon: 'star', displayOrder: 4, parentId: mediaParent.id },
    { name: 'Basında Biz', moduleKey: 'media-coverage', path: '/admin/media-coverage', icon: 'tv', displayOrder: 5, parentId: mediaParent.id },
  ];

  for (const module of mediaSubModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId,
      },
      create: module,
    });
    console.log(`  └─ ${module.name}`);
  }

  // Kariyer alt modülleri
  const careerSubModules = [
    { name: 'Başvurular', moduleKey: 'career-applications', path: '/admin/careers', icon: 'list', displayOrder: 1, parentId: careersParent.id },
    { name: 'Açık Pozisyonlar', moduleKey: 'job-positions', path: '/admin/job-positions', icon: 'briefcase', displayOrder: 2, parentId: careersParent.id },
  ];

  for (const module of careerSubModules) {
    await prisma.adminModule.upsert({
      where: { moduleKey: module.moduleKey },
      update: {
        name: module.name,
        path: module.path,
        icon: module.icon,
        displayOrder: module.displayOrder,
        parentId: module.parentId,
      },
      create: module,
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
