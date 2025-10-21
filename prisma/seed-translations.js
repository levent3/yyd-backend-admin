const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Çok dilli test verileri ekleniyor...\n');

  // 1. NEWS - Gazze Haberi (Türkçe + İngilizce + Arapça)
  console.log('📰 Haber ekleniyor...');
  const news1 = await prisma.news.create({
    data: {
      imageUrl: '/images/gaza-aid.jpg',
      status: 'published',
      publishedAt: new Date(),
      authorId: null,
      translations: {
        create: [
          {
            language: 'tr',
            title: 'Gazze\'de Yeni Yardım Projesi Başlatıldı',
            slug: 'gazze-yeni-yardim-projesi',
            summary: 'Gazze\'deki ailelere gıda ve sağlık yardımı ulaştırılıyor.',
            content: 'Yeryüzü Doktorları olarak Gazze\'de yeni bir insani yardım projesi başlattık. Proje kapsamında 5000 aileye gıda kolisi ve temel sağlık malzemeleri ulaştırılacak.'
          },
          {
            language: 'en',
            title: 'New Aid Project Launched in Gaza',
            slug: 'new-aid-project-gaza',
            summary: 'Food and medical aid being delivered to families in Gaza.',
            content: 'As Doctors Worldwide, we launched a new humanitarian aid project in Gaza. Within the scope of the project, food parcels and basic medical supplies will be delivered to 5000 families.'
          },
          {
            language: 'ar',
            title: 'إطلاق مشروع مساعدات جديد في غزة',
            slug: 'new-aid-gaza-ar',
            summary: 'يتم تسليم الغذاء والمساعدات الطبية للعائلات في غزة',
            content: 'نحن كأطباء العالم، أطلقنا مشروع مساعدات إنسانية جديد في غزة. في إطار المشروع، سيتم توصيل طرود غذائية ومستلزمات طبية أساسية إلى 5000 عائلة.'
          }
        ]
      }
    },
    include: { translations: true }
  });
  console.log(`✅ Haber eklendi: "${news1.translations[0].title}" (${news1.translations.length} dil)`);

  // 2. PROJECT - Yemen Sağlık Projesi (Türkçe + İngilizce)
  console.log('\n🏥 Proje ekleniyor...');
  const project1 = await prisma.project.create({
    data: {
      coverImage: '/images/yemen-health.jpg',
      category: 'Sağlık',
      location: 'Sana, Yemen',
      country: 'Yemen',
      status: 'active',
      priority: 'high',
      targetAmount: 500000,
      collectedAmount: 125000,
      beneficiaryCount: 2500,
      isActive: true,
      isFeatured: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      authorId: null,
      translations: {
        create: [
          {
            language: 'tr',
            title: 'Yemen Sağlık Desteği Projesi',
            slug: 'yemen-saglik-destegi',
            description: 'Yemen\'de sağlık hizmetlerine erişimi olmayan ailelere destek',
            content: 'Yemen\'de devam eden insani krizden etkilenen ailelere temel sağlık hizmetleri sunuyoruz. Mobil sağlık ekiplerimiz bölgede 2500 kişiye ulaşacak.'
          },
          {
            language: 'en',
            title: 'Yemen Health Support Project',
            slug: 'yemen-health-support',
            description: 'Support for families without access to healthcare in Yemen',
            content: 'We provide basic health services to families affected by the ongoing humanitarian crisis in Yemen. Our mobile health teams will reach 2500 people in the region.'
          }
        ]
      }
    },
    include: { translations: true }
  });
  console.log(`✅ Proje eklendi: "${project1.translations[0].title}" (${project1.translations.length} dil)`);

  // 3. CAMPAIGN - Ramazan Kampanyası (Türkçe + İngilizce)
  console.log('\n🎁 Kampanya ekleniyor...');
  const campaign1 = await prisma.donationCampaign.create({
    data: {
      imageUrl: '/images/ramadan-campaign.jpg',
      category: 'Ramazan',
      targetAmount: 1000000,
      collectedAmount: 350000,
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-04-30'),
      donorCount: 450,
      beneficiaryCount: 10000,
      translations: {
        create: [
          {
            language: 'tr',
            title: 'Ramazan Yardım Kampanyası 2025',
            slug: 'ramazan-yardim-2025',
            description: 'Bu Ramazan ayında ihtiyaç sahiplerine destek olun. Gıda kolisi ve iftar yardımları.'
          },
          {
            language: 'en',
            title: 'Ramadan Aid Campaign 2025',
            slug: 'ramadan-aid-2025',
            description: 'Support those in need this Ramadan. Food parcels and iftar aid.'
          }
        ]
      }
    },
    include: { translations: true }
  });
  console.log(`✅ Kampanya eklendi: "${campaign1.translations[0].title}" (${campaign1.translations.length} dil)`);

  // 4. PAGE - Hakkımızda (Sadece Türkçe)
  console.log('\n📄 Sayfa ekleniyor...');
  const page1 = await prisma.page.create({
    data: {
      pageType: 'about',
      status: 'published',
      isPublic: true,
      isActive: true,
      publishedAt: new Date(),
      featuredImage: '/images/about-us.jpg',
      authorId: null,
      translations: {
        create: [
          {
            language: 'tr',
            title: 'Hakkımızda',
            slug: 'hakkimizda',
            excerpt: 'Yeryüzü Doktorları olarak kim olduğumuzu ve ne yaptığımızı öğrenin.',
            content: 'Yeryüzü Doktorları, dünya çapında insani yardım ve sağlık hizmetleri sunan bir sivil toplum kuruluşudur. 2010 yılında kurulduğumuzdan bu yana 50\'den fazla ülkede projeler gerçekleştirdik.',
            metaTitle: 'Hakkımızda - Yeryüzü Doktorları',
            metaDescription: 'Yeryüzü Doktorları hakkında bilgi edinin. Misyonumuz, vizyonumuz ve çalışmalarımız.',
            metaKeywords: 'hakkımızda, yardım kuruluşu, sivil toplum'
          }
        ]
      }
    },
    include: { translations: true }
  });
  console.log(`✅ Sayfa eklendi: "${page1.translations[0].title}" (${page1.translations.length} dil)`);

  console.log('\n✨ Test verileri başarıyla eklendi!');
  console.log('\n📊 Özet:');
  console.log(`  - 1 Haber (3 dil: TR, EN, AR)`);
  console.log(`  - 1 Proje (2 dil: TR, EN)`);
  console.log(`  - 1 Kampanya (2 dil: TR, EN)`);
  console.log(`  - 1 Sayfa (1 dil: TR)`);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
