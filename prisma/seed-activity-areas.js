const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Faaliyet Alanları ekleniyor...\n');

  const activityAreas = [
    {
      icon: 'nutrition',
      displayOrder: 1,
      translations: {
        tr: {
          title: 'Beslenme Sağlığı',
          slug: 'beslenme-sagligi',
          description: 'Beslenme ile ilgili sağlık çalışmaları',
          content: 'Beslenme sağlığı programları ile yetersiz beslenen topluluklar için gıda desteği ve beslenme eğitimleri sağlıyoruz.'
        },
        en: {
          title: 'Nutrition Health',
          slug: 'nutrition-health',
          description: 'Health studies related to nutrition',
          content: 'We provide food support and nutrition education for malnourished communities through nutrition health programs.'
        }
      }
    },
    {
      icon: 'eye',
      displayOrder: 2,
      translations: {
        tr: {
          title: 'Göz Sağlığı',
          slug: 'goz-sagligi',
          description: 'Göz hizmetleri ve katarakt operasyonları',
          content: 'Göz sağlığı hizmetleri kapsamında katarakt ameliyatları ve göz muayeneleri gerçekleştiriyoruz.'
        },
        en: {
          title: 'Eye Health',
          slug: 'eye-health',
          description: 'Eye care services and cataract operations',
          content: 'We perform cataract surgeries and eye examinations as part of eye health services.'
        }
      }
    },
    {
      icon: 'volunteers',
      displayOrder: 3,
      translations: {
        tr: {
          title: 'Gönüllü Sağlık Ekipleri',
          slug: 'gonullu-saglik-ekipleri',
          description: 'Gönüllülerle oluşturulan sağlık ekipleri',
          content: 'Gönüllü doktorlar ve sağlık çalışanlarıyla oluşturduğumuz ekiplerle ihtiyaç bölgelerinde sağlık hizmeti sunuyoruz.'
        },
        en: {
          title: 'Volunteer Health Teams',
          slug: 'volunteer-health-teams',
          description: 'Health teams formed with volunteers',
          content: 'We provide healthcare services in areas of need with teams formed by volunteer doctors and healthcare workers.'
        }
      }
    },
    {
      icon: 'mother-child',
      displayOrder: 4,
      translations: {
        tr: {
          title: 'Anne Çocuk Sağlığı',
          slug: 'anne-cocuk-sagligi',
          description: 'Anneler ve çocuklar için sağlık hizmetleri',
          content: 'Anne ve çocuk sağlığı programları ile hamilelik takibi, doğum sonrası bakım ve çocuk sağlığı hizmetleri veriyoruz.'
        },
        en: {
          title: 'Maternal and Child Health',
          slug: 'maternal-child-health',
          description: 'Healthcare services for mothers and children',
          content: 'We provide pregnancy monitoring, postnatal care, and child health services through maternal and child health programs.'
        }
      }
    },
    {
      icon: 'water',
      displayOrder: 5,
      translations: {
        tr: {
          title: 'Temiz Suya Erişim',
          slug: 'temiz-suya-erisim',
          description: 'Su kuyusu ve temiz su projeleri',
          content: 'Temiz suya erişimi olmayan bölgelerde su kuyuları açıyor ve temiz su sistemleri kuruyoruz.'
        },
        en: {
          title: 'Access to Clean Water',
          slug: 'access-clean-water',
          description: 'Water well and clean water projects',
          content: 'We drill water wells and establish clean water systems in areas without access to clean water.'
        }
      }
    },
    {
      icon: 'psychology',
      displayOrder: 6,
      translations: {
        tr: {
          title: 'Psikososyal Destek',
          slug: 'psikososyal-destek',
          description: 'Psikolojik ve sosyal destek hizmetleri',
          content: 'Travma yaşayan bireyler ve topluluklar için psikolojik danışmanlık ve psikososyal destek programları sunuyoruz.'
        },
        en: {
          title: 'Psychosocial Support',
          slug: 'psychosocial-support',
          description: 'Psychological and social support services',
          content: 'We provide psychological counseling and psychosocial support programs for individuals and communities who have experienced trauma.'
        }
      }
    },
    {
      icon: 'education',
      displayOrder: 7,
      translations: {
        tr: {
          title: 'Sağlık Eğitimleri',
          slug: 'saglik-egitimleri',
          description: 'Sağlık konusunda eğitim ve bilgilendirme',
          content: 'Toplum sağlığını artırmak için hijyen, hastalıkların önlenmesi ve sağlıklı yaşam konularında eğitimler veriyoruz.'
        },
        en: {
          title: 'Health Education',
          slug: 'health-education',
          description: 'Health education and awareness',
          content: 'We provide education on hygiene, disease prevention, and healthy living to improve community health.'
        }
      }
    },
    {
      icon: 'equipment',
      displayOrder: 8,
      translations: {
        tr: {
          title: 'Ekipman ve Sistem Destek',
          slug: 'ekipman-sistem-destek',
          description: 'Tıbbi ekipman ve sistem desteği',
          content: 'Sağlık kuruluşlarına tıbbi ekipman desteği sağlıyor ve sağlık sistemlerinin güçlendirilmesine katkıda bulunuyoruz.'
        },
        en: {
          title: 'Equipment and System Support',
          slug: 'equipment-system-support',
          description: 'Medical equipment and system support',
          content: 'We provide medical equipment support to healthcare facilities and contribute to strengthening health systems.'
        }
      }
    }
  ];

  for (const area of activityAreas) {
    const { translations, ...areaData } = area;

    // Check if already exists
    const existing = await prisma.activityAreaTranslation.findFirst({
      where: {
        slug: translations.tr.slug,
        language: 'tr'
      }
    });

    if (existing) {
      console.log(`⏭️  "${translations.tr.title}" zaten mevcut, atlanıyor...`);
      continue;
    }

    const created = await prisma.activityArea.create({
      data: {
        ...areaData,
        isActive: true,
        translations: {
          create: [
            {
              language: 'tr',
              title: translations.tr.title,
              slug: translations.tr.slug,
              description: translations.tr.description,
              content: translations.tr.content
            },
            {
              language: 'en',
              title: translations.en.title,
              slug: translations.en.slug,
              description: translations.en.description,
              content: translations.en.content
            }
          ]
        }
      },
      include: {
        translations: true
      }
    });

    console.log(`✅ Eklendi: ${translations.tr.title} (ID: ${created.id})`);
  }

  console.log('\n✨ Faaliyet Alanları başarıyla eklendi!\n');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
