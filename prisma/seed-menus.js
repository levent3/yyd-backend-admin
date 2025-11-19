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
      linkType: 'custom',
      customUrl: '/',
      icon: 'home',
      displayOrder: 1,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Anasayfa' },
          { language: 'en', title: 'Home' },
          { language: 'ar', title: 'الصفحة الرئيسية' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda',
      displayOrder: 2,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Hakkımızda' },
          { language: 'en', title: 'About Us' },
          { language: 'ar', title: 'معلومات عنا' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/biz-kimiz',
      displayOrder: 1,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Biz Kimiz' },
          { language: 'en', title: 'Who We Are' },
          { language: 'ar', title: 'من نحن' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/misyon-vizyon',
      displayOrder: 2,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Misyon & Vizyon' },
          { language: 'en', title: 'Mission & Vision' },
          { language: 'ar', title: 'المهمة والرؤية' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/tarihce',
      displayOrder: 3,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Tarihçe' },
          { language: 'en', title: 'History' },
          { language: 'ar', title: 'التاريخ' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/yonetim-kurulu',
      displayOrder: 4,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Yönetim Kurulu' },
          { language: 'en', title: 'Board of Directors' },
          { language: 'ar', title: 'مجلس الإدارة' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/denetim-kurulu',
      displayOrder: 5,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Denetim Kurulu' },
          { language: 'en', title: 'Audit Committee' },
          { language: 'ar', title: 'لجنة التدقيق' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/onursal-baskanlar',
      displayOrder: 6,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Onursal Başkanlar' },
          { language: 'en', title: 'Honorary Presidents' },
          { language: 'ar', title: 'الرؤساء الفخريون' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/is-ortaklarimiz',
      displayOrder: 7,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'İş Ortaklarımız' },
          { language: 'en', title: 'Our Partners' },
          { language: 'ar', title: 'شركاؤنا' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda/faaliyet-raporlari',
      displayOrder: 8,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Faaliyet Raporları' },
          { language: 'en', title: 'Activity Reports' },
          { language: 'ar', title: 'تقارير الأنشطة' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/projeler',
      displayOrder: 3,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Projeler' },
          { language: 'en', title: 'Projects' },
          { language: 'ar', title: 'المشاريع' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari',
      displayOrder: 4,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Faaliyet Alanları' },
          { language: 'en', title: 'Activity Areas' },
          { language: 'ar', title: 'مجالات النشاط' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/goz-sagligi',
      displayOrder: 1,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Göz Sağlığı' },
          { language: 'en', title: 'Eye Health' },
          { language: 'ar', title: 'صحة العين' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/genel-saglik-taramalari',
      displayOrder: 2,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Genel Sağlık Taramaları' },
          { language: 'en', title: 'General Health Screenings' },
          { language: 'ar', title: 'الفحوصات الصحية العامة' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/egitim',
      displayOrder: 3,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Eğitim' },
          { language: 'en', title: 'Education' },
          { language: 'ar', title: 'التعليم' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/sosyal-sorumluluk',
      displayOrder: 4,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Sosyal Sorumluluk' },
          { language: 'en', title: 'Social Responsibility' },
          { language: 'ar', title: 'المسؤولية الاجتماعية' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/cevre-surdurulebilirlik',
      displayOrder: 5,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Çevre ve Sürdürülebilirlik' },
          { language: 'en', title: 'Environment and Sustainability' },
          { language: 'ar', title: 'البيئة والاستدامة' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/afet-acil-durum',
      displayOrder: 6,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Afet ve Acil Durum Yardımı' },
          { language: 'en', title: 'Disaster and Emergency Relief' },
          { language: 'ar', title: 'الإغاثة في حالات الكوارث والطوارئ' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/genclik-programlari',
      displayOrder: 7,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Gençlik Programları' },
          { language: 'en', title: 'Youth Programs' },
          { language: 'ar', title: 'برامج الشباب' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/faaliyet-alanlari/teknoloji-inovasyon',
      displayOrder: 8,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Teknoloji ve İnovasyon' },
          { language: 'en', title: 'Technology and Innovation' },
          { language: 'ar', title: 'التكنولوجيا والابتكار' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/medya',
      displayOrder: 5,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Medya' },
          { language: 'en', title: 'Media' },
          { language: 'ar', title: 'الإعلام' }
        ]
      }
    }
  });
  console.log('  └─ Medya');

  // 5.1 Medya > Haberler
  await prisma.menuItem.upsert({
    where: { id: 51 },
    update: {},
    create: {
      id: 51,
      menuId: mainMenu.id,
      parentId: 5,
      linkType: 'custom',
      customUrl: '/haberler',
      displayOrder: 1,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Haberler' },
          { language: 'en', title: 'News' },
          { language: 'ar', title: 'الأخبار' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/galeri',
      displayOrder: 2,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Galeri' },
          { language: 'en', title: 'Gallery' },
          { language: 'ar', title: 'المعرض' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/basinda-biz',
      displayOrder: 3,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Basında Biz' },
          { language: 'en', title: 'In The Press' },
          { language: 'ar', title: 'في الصحافة' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/video-galeri',
      displayOrder: 4,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Video Galeri' },
          { language: 'en', title: 'Video Gallery' },
          { language: 'ar', title: 'معرض الفيديو' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/basin-bultenleri',
      displayOrder: 5,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Basın Bültenleri' },
          { language: 'en', title: 'Press Releases' },
          { language: 'ar', title: 'البيانات الصحفية' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/sosyal-medya',
      displayOrder: 6,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Sosyal Medya' },
          { language: 'en', title: 'Social Media' },
          { language: 'ar', title: 'وسائل التواصل الاجتماعي' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/basari-hikayeleri',
      displayOrder: 7,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Başarı Hikayeleri' },
          { language: 'en', title: 'Success Stories' },
          { language: 'ar', title: 'قصص النجاح' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/gonullu-ol',
      displayOrder: 6,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Gönüllü Ol' },
          { language: 'en', title: 'Become a Volunteer' },
          { language: 'ar', title: 'كن متطوعاً' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/kariyer',
      displayOrder: 7,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Kariyer' },
          { language: 'en', title: 'Career' },
          { language: 'ar', title: 'الوظائف' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/iletisim',
      displayOrder: 8,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'İletişim' },
          { language: 'en', title: 'Contact' },
          { language: 'ar', title: 'اتصل بنا' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/bagis-yap',
      cssClass: 'btn-donate',
      displayOrder: 9,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Bağış Yap' },
          { language: 'en', title: 'Donate' },
          { language: 'ar', title: 'تبرع' }
        ]
      }
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
      linkType: 'custom',
      customUrl: '/hakkimizda',
      displayOrder: 1,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Hakkımızda' },
          { language: 'en', title: 'About Us' },
          { language: 'ar', title: 'معلومات عنا' }
        ]
      }
    }
  });
  console.log('  └─ Hakkımızda');

  await prisma.menuItem.upsert({
    where: { id: 102 },
    update: {},
    create: {
      id: 102,
      menuId: footerMenu.id,
      linkType: 'custom',
      customUrl: '/iletisim',
      displayOrder: 2,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'İletişim' },
          { language: 'en', title: 'Contact' },
          { language: 'ar', title: 'اتصل بنا' }
        ]
      }
    }
  });
  console.log('  └─ İletişim');

  await prisma.menuItem.upsert({
    where: { id: 103 },
    update: {},
    create: {
      id: 103,
      menuId: footerMenu.id,
      linkType: 'custom',
      customUrl: '/gizlilik-politikasi',
      displayOrder: 3,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Gizlilik Politikası' },
          { language: 'en', title: 'Privacy Policy' },
          { language: 'ar', title: 'سياسة الخصوصية' }
        ]
      }
    }
  });
  console.log('  └─ Gizlilik Politikası');

  await prisma.menuItem.upsert({
    where: { id: 104 },
    update: {},
    create: {
      id: 104,
      menuId: footerMenu.id,
      linkType: 'custom',
      customUrl: '/kullanim-kosullari',
      displayOrder: 4,
      isActive: true,
      translations: {
        create: [
          { language: 'tr', title: 'Kullanım Koşulları' },
          { language: 'en', title: 'Terms of Use' },
          { language: 'ar', title: 'شروط الاستخدام' }
        ]
      }
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
