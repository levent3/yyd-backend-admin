/**
 * Seed ActivityArea data with multi-language support (TR, EN, AR)
 * Similar to Project structure
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const activityAreas = [
  {
    icon: '🍎',
    displayOrder: 1,
    isActive: true,
    translations: {
      tr: {
        title: 'Beslenme Sağlığı',
        slug: 'beslenme-sagligi',
        description: 'Açlık problemlerinin yaşandığı bölgelerde beslenme sağlığı merkezleri kurmakta ve destek sağlamaktayız.',
        content: `<h2>YERYÜZÜNDE AÇLIK SEVİYESİ GİDEREK ARTIYOR!</h2>
<p>673 milyondan fazla insan açlıkla mücadele ediyor. Kriz bölgelerinde her dakika bir çocuk şiddetli açlık ile karşı karşıya kalıyor.</p>

<h3>Malnutrisyon Nedir?</h3>
<p>Yetersiz veya dengesiz beslenme sonucu ortaya çıkan hastalık durumudur. Özellikle hamile/emziren anneler ve 5 yaş altı çocuklar risk altındadır.</p>

<h3>Tıbbi Beslenme Tedavisi</h3>
<p>Pediatrik ve jinekolojik muayeneler ile özel besleyici mamalar (RUTF) kullanılarak tedavi sağlanmaktadır.</p>

<h3>BİZ NE YAPIYORUZ?</h3>
<ul>
<li>Yemen, Çad, Afganistan ve Somali'de beslenme merkezleri işletiyoruz</li>
<li>Pediatrik ve jinekolojik muayene hizmetleri sunuyoruz</li>
<li>Beslenme eğitimleri düzenliyoruz</li>
<li>Gıda kolisi dağıtımı yapıyoruz</li>
</ul>

<h3>Aktif Merkezlerimiz</h3>
<h4>Yemen Taiz</h4>
<p>2021'de açıldı, beslenme tedavisi sağlıyor</p>

<h4>Çad Sido</h4>
<p>2016'dan beri mülteci bölgesinde hizmet veriyor</p>

<h4>Afganistan</h4>
<p>15 sağlık merkezi ve 11 mobil ekip</p>

<h4>Somali Mogadişu</h4>
<p>2019'dan beri operasyonel</p>`,
        metaTitle: 'Beslenme Sağlığı - Yeryüzü Doktorları',
        metaDescription: '673 milyondan fazla insan açlıkla mücadele ediyor. Yemen, Çad, Afganistan ve Somali\'de beslenme sağlığı merkezleri işletiyoruz.'
      },
      en: {
        title: 'Nutrition Health',
        slug: 'nutrition-health',
        description: 'We establish nutrition health centers and provide support in regions experiencing hunger problems.',
        content: `<h2>HUNGER LEVELS ARE INCREASING WORLDWIDE!</h2>
<p>More than 673 million people are struggling with hunger. In crisis regions, a child faces severe hunger every minute.</p>

<h3>What is Malnutrition?</h3>
<p>It is a disease condition resulting from inadequate or unbalanced nutrition. Pregnant/nursing mothers and children under 5 are particularly at risk.</p>

<h3>Medical Nutrition Treatment</h3>
<p>Treatment is provided through pediatric and gynecological examinations using special nutritional supplements (RUTF).</p>

<h3>WHAT WE DO</h3>
<ul>
<li>Operating nutrition centers in Yemen, Chad, Afghanistan and Somalia</li>
<li>Providing pediatric and gynecological examination services</li>
<li>Organizing nutrition training programs</li>
<li>Distributing food packages</li>
</ul>

<h3>Our Active Centers</h3>
<h4>Yemen Taiz</h4>
<p>Opened in 2021, providing nutrition treatment</p>

<h4>Chad Sido</h4>
<p>Serving refugee areas since 2016</p>

<h4>Afghanistan</h4>
<p>15 health centers and 11 mobile teams</p>

<h4>Somalia Mogadishu</h4>
<p>Operational since 2019</p>`,
        metaTitle: 'Nutrition Health - Doctors Worldwide',
        metaDescription: 'More than 673 million people struggle with hunger. We operate nutrition health centers in Yemen, Chad, Afghanistan and Somalia.'
      },
      ar: {
        title: 'صحة التغذية',
        slug: 'nutrition-health-ar',
        description: 'نؤسس مراكز الصحة الغذائية ونقدم الدعم في المناطق التي تعاني من مشاكل الجوع.',
        content: `<h2>مستويات الجوع تتزايد في جميع أنحاء العالم!</h2>
<p>أكثر من 673 مليون شخص يعانون من الجوع. في مناطق الأزمات، يواجه طفل الجوع الشديد كل دقيقة.</p>`,
        metaTitle: 'صحة التغذية - أطباء العالم',
        metaDescription: 'أكثر من 673 مليون شخص يعانون من الجوع. نشغل مراكز الصحة الغذائية في اليمن وتشاد وأفغانستان والصومال.'
      }
    }
  },
  {
    icon: '👁️',
    displayOrder: 2,
    isActive: true,
    translations: {
      tr: {
        title: 'Göz Sağlığı',
        slug: 'goz-sagligi',
        description: 'Kriz bölgelerinde göz sağlığı hizmetleri sunuyoruz.',
        content: '<p>Göz sağlığı hizmetlerimiz devam ediyor...</p>',
        metaTitle: 'Göz Sağlığı - Yeryüzü Doktorları',
        metaDescription: 'Kriz bölgelerinde göz sağlığı hizmetleri sunuyoruz.'
      },
      en: {
        title: 'Eye Health',
        slug: 'eye-health',
        description: 'We provide eye health services in crisis regions.',
        content: '<p>Our eye health services continue...</p>',
        metaTitle: 'Eye Health - Doctors Worldwide',
        metaDescription: 'We provide eye health services in crisis regions.'
      },
      ar: {
        title: 'صحة العيون',
        slug: 'eye-health-ar',
        description: 'نقدم خدمات صحة العيون في مناطق الأزمات.',
        content: '<p>خدمات صحة العيون لدينا مستمرة...</p>',
        metaTitle: 'صحة العيون - أطباء العالم',
        metaDescription: 'نقدم خدمات صحة العيون في مناطق الأزمات.'
      }
    }
  },
  {
    icon: '👨‍⚕️',
    displayOrder: 3,
    isActive: true,
    translations: {
      tr: {
        title: 'Gönüllü Sağlık Ekipleri',
        slug: 'gonullu-saglik-ekipleri',
        description: 'Gönüllü sağlık profesyonelleri ile kriz bölgelerinde hizmet veriyoruz.',
        content: '<p>Gönüllü sağlık ekiplerimiz...</p>',
        metaTitle: 'Gönüllü Sağlık Ekipleri - Yeryüzü Doktorları',
        metaDescription: 'Gönüllü sağlık profesyonelleri ile kriz bölgelerinde hizmet veriyoruz.'
      },
      en: {
        title: 'Volunteer Health Teams',
        slug: 'volunteer-health-teams',
        description: 'We serve in crisis regions with volunteer health professionals.',
        content: '<p>Our volunteer health teams...</p>',
        metaTitle: 'Volunteer Health Teams - Doctors Worldwide',
        metaDescription: 'We serve in crisis regions with volunteer health professionals.'
      },
      ar: {
        title: 'فرق الصحة التطوعية',
        slug: 'volunteer-health-teams-ar',
        description: 'نخدم في مناطق الأزمات مع المتطوعين الصحيين.',
        content: '<p>فرق الصحة التطوعية لدينا...</p>',
        metaTitle: 'فرق الصحة التطوعية - أطباء العالم',
        metaDescription: 'نخدم في مناطق الأزمات مع المتطوعين الصحيين.'
      }
    }
  },
  {
    icon: '👶',
    displayOrder: 4,
    isActive: true,
    translations: {
      tr: {
        title: 'Anne Çocuk Sağlığı',
        slug: 'anne-cocuk-sagligi',
        description: 'Anne ve çocuk sağlığı hizmetleri sunuyoruz.',
        content: '<p>Anne çocuk sağlığı programlarımız...</p>',
        metaTitle: 'Anne Çocuk Sağlığı - Yeryüzü Doktorları',
        metaDescription: 'Anne ve çocuk sağlığı hizmetleri sunuyoruz.'
      },
      en: {
        title: 'Maternal and Child Health',
        slug: 'maternal-child-health',
        description: 'We provide maternal and child health services.',
        content: '<p>Our maternal and child health programs...</p>',
        metaTitle: 'Maternal and Child Health - Doctors Worldwide',
        metaDescription: 'We provide maternal and child health services.'
      },
      ar: {
        title: 'صحة الأم والطفل',
        slug: 'maternal-child-health-ar',
        description: 'نقدم خدمات صحة الأم والطفل.',
        content: '<p>برامج صحة الأم والطفل لدينا...</p>',
        metaTitle: 'صحة الأم والطفل - أطباء العالم',
        metaDescription: 'نقدم خدمات صحة الأم والطفل.'
      }
    }
  },
  {
    icon: '💧',
    displayOrder: 5,
    isActive: true,
    translations: {
      tr: {
        title: 'Temiz Suya Erişim',
        slug: 'temiz-suya-erisim',
        description: 'Temiz içme suyu ve sanitasyon projeleri yürütüyoruz.',
        content: '<p>Temiz su projelerimiz...</p>',
        metaTitle: 'Temiz Suya Erişim - Yeryüzü Doktorları',
        metaDescription: 'Temiz içme suyu ve sanitasyon projeleri yürütüyoruz.'
      },
      en: {
        title: 'Access to Clean Water',
        slug: 'access-clean-water',
        description: 'We implement clean drinking water and sanitation projects.',
        content: '<p>Our clean water projects...</p>',
        metaTitle: 'Access to Clean Water - Doctors Worldwide',
        metaDescription: 'We implement clean drinking water and sanitation projects.'
      },
      ar: {
        title: 'الوصول إلى المياه النظيفة',
        slug: 'access-clean-water-ar',
        description: 'ننفذ مشاريع مياه الشرب النظيفة والصرف الصحي.',
        content: '<p>مشاريع المياه النظيفة لدينا...</p>',
        metaTitle: 'الوصول إلى المياه النظيفة - أطباء العالم',
        metaDescription: 'ننفذ مشاريع مياه الشرب النظيفة والصرف الصحي.'
      }
    }
  },
  {
    icon: '🧠',
    displayOrder: 6,
    isActive: true,
    translations: {
      tr: {
        title: 'Psikososyal Destek',
        slug: 'psikososyal-destek',
        description: 'Travma yaşayan bireylere psikososyal destek hizmetleri sunuyoruz.',
        content: '<p>Psikososyal destek programlarımız...</p>',
        metaTitle: 'Psikososyal Destek - Yeryüzü Doktorları',
        metaDescription: 'Travma yaşayan bireylere psikososyal destek hizmetleri sunuyoruz.'
      },
      en: {
        title: 'Psychosocial Support',
        slug: 'psychosocial-support',
        description: 'We provide psychosocial support services to trauma survivors.',
        content: '<p>Our psychosocial support programs...</p>',
        metaTitle: 'Psychosocial Support - Doctors Worldwide',
        metaDescription: 'We provide psychosocial support services to trauma survivors.'
      },
      ar: {
        title: 'الدعم النفسي والاجتماعي',
        slug: 'psychosocial-support-ar',
        description: 'نقدم خدمات الدعم النفسي والاجتماعي للناجين من الصدمات.',
        content: '<p>برامج الدعم النفسي والاجتماعي لدينا...</p>',
        metaTitle: 'الدعم النفسي والاجتماعي - أطباء العالم',
        metaDescription: 'نقدم خدمات الدعم النفسي والاجتماعي للناجين من الصدمات.'
      }
    }
  },
  {
    icon: '📚',
    displayOrder: 7,
    isActive: true,
    translations: {
      tr: {
        title: 'Sağlık Eğitimleri',
        slug: 'saglik-egitimleri',
        description: 'Toplum sağlığı için eğitim programları düzenliyoruz.',
        content: '<p>Sağlık eğitim programlarımız...</p>',
        metaTitle: 'Sağlık Eğitimleri - Yeryüzü Doktorları',
        metaDescription: 'Toplum sağlığı için eğitim programları düzenliyoruz.'
      },
      en: {
        title: 'Health Education',
        slug: 'health-education',
        description: 'We organize health education programs for communities.',
        content: '<p>Our health education programs...</p>',
        metaTitle: 'Health Education - Doctors Worldwide',
        metaDescription: 'We organize health education programs for communities.'
      },
      ar: {
        title: 'التثقيف الصحي',
        slug: 'health-education-ar',
        description: 'ننظم برامج التثقيف الصحي للمجتمعات.',
        content: '<p>برامج التثقيف الصحي لدينا...</p>',
        metaTitle: 'التثقيف الصحي - أطباء العالم',
        metaDescription: 'ننظم برامج التثقيف الصحي للمجتمعات.'
      }
    }
  },
  {
    icon: '🏥',
    displayOrder: 8,
    isActive: true,
    translations: {
      tr: {
        title: 'Ekipman ve Sistem Destek',
        slug: 'ekipman-ve-sistem-destek',
        description: 'Sağlık tesislerine ekipman ve sistem desteği sağlıyoruz.',
        content: '<p>Ekipman ve sistem destek programlarımız...</p>',
        metaTitle: 'Ekipman ve Sistem Destek - Yeryüzü Doktorları',
        metaDescription: 'Sağlık tesislerine ekipman ve sistem desteği sağlıyoruz.'
      },
      en: {
        title: 'Equipment and System Support',
        slug: 'equipment-system-support',
        description: 'We provide equipment and system support to health facilities.',
        content: '<p>Our equipment and system support programs...</p>',
        metaTitle: 'Equipment and System Support - Doctors Worldwide',
        metaDescription: 'We provide equipment and system support to health facilities.'
      },
      ar: {
        title: 'دعم المعدات والنظام',
        slug: 'equipment-system-support-ar',
        description: 'نوفر دعم المعدات والنظام للمرافق الصحية.',
        content: '<p>برامج دعم المعدات والنظام لدينا...</p>',
        metaTitle: 'دعم المعدات والنظام - أطباء العالم',
        metaDescription: 'نوفر دعم المعدات والنظام للمرافق الصحية.'
      }
    }
  }
];

async function seedActivityAreas() {
  try {
    console.log('🌱 ActivityArea seed data ekleniyor...\n');

    for (const areaData of activityAreas) {
      const { translations, ...areaFields } = areaData;

      // ActivityArea oluştur
      const area = await prisma.activityArea.create({
        data: areaFields
      });

      console.log(`✅ ActivityArea oluşturuldu: ${area.id}`);

      // Her dil için translation ekle (Project gibi)
      for (const [lang, transData] of Object.entries(translations)) {
        await prisma.activityAreaTranslation.create({
          data: {
            activityAreaId: area.id,
            language: lang,
            ...transData
          }
        });
        console.log(`   📝 Translation eklendi: ${lang} - ${transData.title}`);
      }

      console.log('');
    }

    console.log('✨ Seed işlemi tamamlandı!');
    console.log(`📊 Toplam: ${activityAreas.length} ActivityArea, ${activityAreas.length * 3} Translation`);

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedActivityAreas()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedActivityAreas };
