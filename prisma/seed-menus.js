const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🍔 Menüler oluşturuluyor...\n');

  // Ana Menü oluştur
  const mainMenu = await prisma.menu.upsert({
    where: { slug: 'main-menu' },
    update: {},
    create: {
      name: 'Ana Menü',
      slug: 'main-menu',
      description: 'Site üst kısmında yer alan ana navigasyon menüsü',
      location: 'header',
      isActive: true
    }
  });
  console.log('✅ Ana Menü');

  // Footer Menü oluştur
  const footerMenu = await prisma.menu.upsert({
    where: { slug: 'footer-menu' },
    update: {},
    create: {
      name: 'Footer Menü',
      slug: 'footer-menu',
      description: 'Site alt kısmında yer alan menü',
      location: 'footer',
      isActive: true
    }
  });
  console.log('✅ Footer Menü\n');

  // Ana Menü Öğeleri
  console.log('📋 Ana menü öğeleri oluşturuluyor...');

  // 1. Anasayfa
  await prisma.menuItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      menuId: mainMenu.id,
      title: 'Anasayfa',
      linkType: 'custom',
      customUrl: '/',
      icon: 'home',
      displayOrder: 1,
      isActive: true
    }
  });
  console.log('  └─ Anasayfa');

  // 2. Hakkımızda (Parent)
  await prisma.menuItem.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      menuId: mainMenu.id,
      title: 'Hakkımızda',
      linkType: 'custom',
      customUrl: '/hakkimizda',
      displayOrder: 2,
      isActive: true
    }
  });
  console.log('  └─ Hakkımızda');

  // 2.1 Hakkımızda > Biz Kimiz
  await prisma.menuItem.upsert({
    where: { id: 21 },
    update: {},
    create: {
      id: 21,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'Biz Kimiz',
      linkType: 'custom',
      customUrl: '/hakkimizda/biz-kimiz',
      displayOrder: 1,
      isActive: true
    }
  });
  console.log('      └─ Biz Kimiz');

  // 2.2 Hakkımızda > Misyon & Vizyon
  await prisma.menuItem.upsert({
    where: { id: 22 },
    update: {},
    create: {
      id: 22,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'Misyon & Vizyon',
      linkType: 'custom',
      customUrl: '/hakkimizda/misyon-vizyon',
      displayOrder: 2,
      isActive: true
    }
  });
  console.log('      └─ Misyon & Vizyon');

  // 2.3 Hakkımızda > Tarihçe
  await prisma.menuItem.upsert({
    where: { id: 23 },
    update: {},
    create: {
      id: 23,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'Tarihçe',
      linkType: 'custom',
      customUrl: '/hakkimizda/tarihce',
      displayOrder: 3,
      isActive: true
    }
  });
  console.log('      └─ Tarihçe');

  // 2.4 Hakkımızda > Yönetim Kurulu
  await prisma.menuItem.upsert({
    where: { id: 24 },
    update: {},
    create: {
      id: 24,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'Yönetim Kurulu',
      linkType: 'custom',
      customUrl: '/hakkimizda/yonetim-kurulu',
      displayOrder: 4,
      isActive: true
    }
  });
  console.log('      └─ Yönetim Kurulu');

  // 2.5 Hakkımızda > Denetim Kurulu
  await prisma.menuItem.upsert({
    where: { id: 25 },
    update: {},
    create: {
      id: 25,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'Denetim Kurulu',
      linkType: 'custom',
      customUrl: '/hakkimizda/denetim-kurulu',
      displayOrder: 5,
      isActive: true
    }
  });
  console.log('      └─ Denetim Kurulu');

  // 2.6 Hakkımızda > Onursal Başkanlar
  await prisma.menuItem.upsert({
    where: { id: 26 },
    update: {},
    create: {
      id: 26,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'Onursal Başkanlar',
      linkType: 'custom',
      customUrl: '/hakkimizda/onursal-baskanlar',
      displayOrder: 6,
      isActive: true
    }
  });
  console.log('      └─ Onursal Başkanlar');

  // 2.7 Hakkımızda > İş Ortaklarımız
  await prisma.menuItem.upsert({
    where: { id: 27 },
    update: {},
    create: {
      id: 27,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'İş Ortaklarımız',
      linkType: 'custom',
      customUrl: '/hakkimizda/is-ortaklarimiz',
      displayOrder: 7,
      isActive: true
    }
  });
  console.log('      └─ İş Ortaklarımız');

  // 2.8 Hakkımızda > Faaliyet Raporları
  await prisma.menuItem.upsert({
    where: { id: 28 },
    update: {},
    create: {
      id: 28,
      menuId: mainMenu.id,
      parentId: 2,
      title: 'Faaliyet Raporları',
      linkType: 'custom',
      customUrl: '/hakkimizda/faaliyet-raporlari',
      displayOrder: 8,
      isActive: true
    }
  });
  console.log('      └─ Faaliyet Raporları');

  // 3. Projeler
  await prisma.menuItem.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      menuId: mainMenu.id,
      title: 'Projeler',
      linkType: 'custom',
      customUrl: '/projeler',
      displayOrder: 3,
      isActive: true
    }
  });
  console.log('  └─ Projeler');

  // 4. Faaliyet Alanları
  await prisma.menuItem.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      menuId: mainMenu.id,
      title: 'Faaliyet Alanları',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari',
      displayOrder: 4,
      isActive: true
    }
  });
  console.log('  └─ Faaliyet Alanları');

  // 4.1 Faaliyet Alanları > Göz Sağlığı
  await prisma.menuItem.upsert({
    where: { id: 41 },
    update: {},
    create: {
      id: 41,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Göz Sağlığı',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/goz-sagligi',
      displayOrder: 1,
      isActive: true
    }
  });
  console.log('      └─ Göz Sağlığı');

  // 4.2 Faaliyet Alanları > Genel Sağlık Taramaları
  await prisma.menuItem.upsert({
    where: { id: 42 },
    update: {},
    create: {
      id: 42,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Genel Sağlık Taramaları',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/genel-saglik-taramalari',
      displayOrder: 2,
      isActive: true
    }
  });
  console.log('      └─ Genel Sağlık Taramaları');

  // 4.3 Faaliyet Alanları > Eğitim
  await prisma.menuItem.upsert({
    where: { id: 43 },
    update: {},
    create: {
      id: 43,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Eğitim',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/egitim',
      displayOrder: 3,
      isActive: true
    }
  });
  console.log('      └─ Eğitim');

  // 4.4 Faaliyet Alanları > Sosyal Sorumluluk
  await prisma.menuItem.upsert({
    where: { id: 44 },
    update: {},
    create: {
      id: 44,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Sosyal Sorumluluk',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/sosyal-sorumluluk',
      displayOrder: 4,
      isActive: true
    }
  });
  console.log('      └─ Sosyal Sorumluluk');

  // 4.5 Faaliyet Alanları > Çevre ve Sürdürülebilirlik
  await prisma.menuItem.upsert({
    where: { id: 45 },
    update: {},
    create: {
      id: 45,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Çevre ve Sürdürülebilirlik',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/cevre-surdurulebilirlik',
      displayOrder: 5,
      isActive: true
    }
  });
  console.log('      └─ Çevre ve Sürdürülebilirlik');

  // 4.6 Faaliyet Alanları > Afet ve Acil Durum Yardımı
  await prisma.menuItem.upsert({
    where: { id: 46 },
    update: {},
    create: {
      id: 46,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Afet ve Acil Durum Yardımı',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/afet-acil-durum',
      displayOrder: 6,
      isActive: true
    }
  });
  console.log('      └─ Afet ve Acil Durum Yardımı');

  // 4.7 Faaliyet Alanları > Gençlik Programları
  await prisma.menuItem.upsert({
    where: { id: 47 },
    update: {},
    create: {
      id: 47,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Gençlik Programları',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/genclik-programlari',
      displayOrder: 7,
      isActive: true
    }
  });
  console.log('      └─ Gençlik Programları');

  // 4.8 Faaliyet Alanları > Teknoloji ve İnovasyon
  await prisma.menuItem.upsert({
    where: { id: 48 },
    update: {},
    create: {
      id: 48,
      menuId: mainMenu.id,
      parentId: 4,
      title: 'Teknoloji ve İnovasyon',
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/teknoloji-inovasyon',
      displayOrder: 8,
      isActive: true
    }
  });
  console.log('      └─ Teknoloji ve İnovasyon');

  // 5. Medya (Parent)
  await prisma.menuItem.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      menuId: mainMenu.id,
      title: 'Medya',
      linkType: 'custom',
      customUrl: '/medya',
      displayOrder: 5,
      isActive: true
    }
  });
  console.log('  └─ Medya');

  // 5.1 Medya > Haberler (Alt menü)
  await prisma.menuItem.upsert({
    where: { id: 51 },
    update: {},
    create: {
      id: 51,
      menuId: mainMenu.id,
      parentId: 5,
      title: 'Haberler',
      linkType: 'custom',
      customUrl: '/haberler',
      displayOrder: 1,
      isActive: true
    }
  });
  console.log('      └─ Haberler');

  // 5.2 Medya > Galeri
  await prisma.menuItem.upsert({
    where: { id: 52 },
    update: {},
    create: {
      id: 52,
      menuId: mainMenu.id,
      parentId: 5,
      title: 'Galeri',
      linkType: 'custom',
      customUrl: '/galeri',
      displayOrder: 2,
      isActive: true
    }
  });
  console.log('      └─ Galeri');

  // 5.3 Medya > Basında Biz
  await prisma.menuItem.upsert({
    where: { id: 53 },
    update: {},
    create: {
      id: 53,
      menuId: mainMenu.id,
      parentId: 5,
      title: 'Basında Biz',
      linkType: 'custom',
      customUrl: '/basinda-biz',
      displayOrder: 3,
      isActive: true
    }
  });
  console.log('      └─ Basında Biz');

  // 5.4 Medya > Video Galeri
  await prisma.menuItem.upsert({
    where: { id: 54 },
    update: {},
    create: {
      id: 54,
      menuId: mainMenu.id,
      parentId: 5,
      title: 'Video Galeri',
      linkType: 'custom',
      customUrl: '/video-galeri',
      displayOrder: 4,
      isActive: true
    }
  });
  console.log('      └─ Video Galeri');

  // 5.5 Medya > Basın Bültenleri
  await prisma.menuItem.upsert({
    where: { id: 55 },
    update: {},
    create: {
      id: 55,
      menuId: mainMenu.id,
      parentId: 5,
      title: 'Basın Bültenleri',
      linkType: 'custom',
      customUrl: '/basin-bultenleri',
      displayOrder: 5,
      isActive: true
    }
  });
  console.log('      └─ Basın Bültenleri');

  // 5.6 Medya > Sosyal Medya
  await prisma.menuItem.upsert({
    where: { id: 56 },
    update: {},
    create: {
      id: 56,
      menuId: mainMenu.id,
      parentId: 5,
      title: 'Sosyal Medya',
      linkType: 'custom',
      customUrl: '/sosyal-medya',
      displayOrder: 6,
      isActive: true
    }
  });
  console.log('      └─ Sosyal Medya');

  // 5.7 Medya > Başarı Hikayeleri
  await prisma.menuItem.upsert({
    where: { id: 57 },
    update: {},
    create: {
      id: 57,
      menuId: mainMenu.id,
      parentId: 5,
      title: 'Başarı Hikayeleri',
      linkType: 'custom',
      customUrl: '/basari-hikayeleri',
      displayOrder: 7,
      isActive: true
    }
  });
  console.log('      └─ Başarı Hikayeleri');

  // 6. Gönüllü Ol
  await prisma.menuItem.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      menuId: mainMenu.id,
      title: 'Gönüllü Ol',
      linkType: 'custom',
      customUrl: '/gonullu-ol',
      displayOrder: 6,
      isActive: true
    }
  });
  console.log('  └─ Gönüllü Ol');

  // 7. Kariyer
  await prisma.menuItem.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      menuId: mainMenu.id,
      title: 'Kariyer',
      linkType: 'custom',
      customUrl: '/kariyer',
      displayOrder: 7,
      isActive: true
    }
  });
  console.log('  └─ Kariyer');

  // 8. İletişim
  await prisma.menuItem.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      menuId: mainMenu.id,
      title: 'İletişim',
      linkType: 'custom',
      customUrl: '/iletisim',
      displayOrder: 8,
      isActive: true
    }
  });
  console.log('  └─ İletişim');

  // 9. Bağış Yap (Özel stil)
  await prisma.menuItem.upsert({
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      menuId: mainMenu.id,
      title: 'Bağış Yap',
      linkType: 'custom',
      customUrl: '/bagis-yap',
      cssClass: 'btn-donate',
      displayOrder: 9,
      isActive: true
    }
  });
  console.log('  └─ Bağış Yap');

  // Footer Menü Öğeleri
  console.log('\n📋 Footer menü öğeleri oluşturuluyor...');

  await prisma.menuItem.upsert({
    where: { id: 101 },
    update: {},
    create: {
      id: 101,
      menuId: footerMenu.id,
      title: 'Hakkımızda',
      linkType: 'custom',
      customUrl: '/hakkimizda',
      displayOrder: 1,
      isActive: true
    }
  });
  console.log('  └─ Hakkımızda');

  await prisma.menuItem.upsert({
    where: { id: 102 },
    update: {},
    create: {
      id: 102,
      menuId: footerMenu.id,
      title: 'İletişim',
      linkType: 'custom',
      customUrl: '/iletisim',
      displayOrder: 2,
      isActive: true
    }
  });
  console.log('  └─ İletişim');

  await prisma.menuItem.upsert({
    where: { id: 103 },
    update: {},
    create: {
      id: 103,
      menuId: footerMenu.id,
      title: 'Gizlilik Politikası',
      linkType: 'custom',
      customUrl: '/gizlilik-politikasi',
      displayOrder: 3,
      isActive: true
    }
  });
  console.log('  └─ Gizlilik Politikası');

  await prisma.menuItem.upsert({
    where: { id: 104 },
    update: {},
    create: {
      id: 104,
      menuId: footerMenu.id,
      title: 'Kullanım Koşulları',
      linkType: 'custom',
      customUrl: '/kullanim-kosullari',
      displayOrder: 4,
      isActive: true
    }
  });
  console.log('  └─ Kullanım Koşulları');

  console.log('\n✅ Tüm menüler başarıyla oluşturuldu!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
