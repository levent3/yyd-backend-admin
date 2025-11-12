const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating Nafile Kurban Bağışı project...');

  // 1. Project oluştur
  const project = await prisma.project.create({
    data: {
      imageUrl: '/images/kurban-default.jpg',
      coverImage: '/images/kurban-cover.jpg',
      isActive: true,
      isFeatured: true,
      category: 'Kurban',
      status: 'active',
      priority: 'high',
      targetAmount: 280000.00,  // 70 kurban x 4000 TL
      collectedAmount: 0.00,
      budget: 280000.00,
      beneficiaryCount: 490,  // 70 kurban x 7 hisse
      donorCount: 0,
      displayOrder: 1,
      country: 'Türkiye',
      location: 'Türkiye Geneli',
      shortCode: 'kurban-2025',
      startDate: new Date(),
      endDate: new Date('2025-07-15T23:59:59'),
    }
  });

  console.log('✅ Project created with ID:', project.id);

  // 2. Translation ekle
  const translation = await prisma.projectTranslation.create({
    data: {
      projectId: project.id,
      language: 'tr',
      title: 'Nafile Kurban Bağışı',
      slug: 'nafile-kurban-bagisi',
      description: 'Kurban Bayramı için nafile kurban bağışı yaparak sevabına ortak olun. Her kurban 7 hisseye bölünerek ihtiyaç sahiplerine ulaştırılır.',
      content: `<h2>Nafile Kurban Bağışı Hakkında</h2>
<p>Kurban Bayramı, İslam dininde büyük bir öneme sahip olan mübarek günlerdendir.</p>

<h3>Kurban Bağışınızın Özellikleri:</h3>
<ul>
  <li><strong>7 Hisse Sistemi:</strong> Her kurban 7 hisseye bölünür</li>
  <li><strong>Hissedar Belirleme:</strong> Her hisse için ayrı hissedar belirleyebilirsiniz</li>
  <li><strong>Güvenilir Kesim:</strong> Kurbanlar yetkili ekiplerimiz tarafından kesilir</li>
  <li><strong>İhtiyaç Sahiplerine Ulaşım:</strong> Kurbanlar ihtiyaç sahibi ailelere dağıtılır</li>
</ul>

<h3>Hisse Başı Fiyat:</h3>
<p><strong>4.000 TL</strong> / Hisse</p>
<p>Tam kurban (7 hisse): 28.000 TL</p>`
    }
  });

  console.log('✅ Translation created');

  // 3. Project Settings ekle
  const settings = await prisma.projectSettings.create({
    data: {
      projectId: project.id,
      presetAmounts: [4000, 8000, 12000, 16000, 28000],
      minAmount: 4000.00,
      maxAmount: 28000.00,
      allowRepeat: false,
      minRepeatCount: 1,
      maxRepeatCount: 1,
      allowOneTime: true,
      allowRecurring: false,
      allowedFrequencies: [],
      allowDedication: true,
      allowAnonymous: true,
      requireMessage: false,
      isSacrifice: true,
      sacrificeConfig: {
        sharePrice: 4000,
        totalShares: 7,
        sacrificeType: 'nafile',
        allowPartialShares: true,
        requireShareholderInfo: false,
        cutDate: '2025-07-16',
        distributionDates: ['2025-07-16', '2025-07-17', '2025-07-18', '2025-07-19']
      },
      showProgress: true,
      showDonorCount: true,
      showBeneficiaries: true,
      impactMetrics: [
        {
          icon: 'users',
          label: 'Faydalanıcı Aile',
          value: '70+',
          description: 'İhtiyaç sahibi aileye ulaşacak'
        },
        {
          icon: 'heart',
          label: 'Kurban Sayısı',
          value: '70',
          description: 'Kurban kesilecek'
        },
        {
          icon: 'calendar',
          label: 'Kesim Tarihi',
          value: '16-19 Temmuz',
          description: 'Kurban Bayramı'
        }
      ]
    }
  });

  console.log('✅ Project Settings created');

  // Sonuç
  const result = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      translations: true,
      settings: true
    }
  });

  console.log('\n🎉 Nafile Kurban Bağışı projesi başarıyla oluşturuldu!\n');
  console.log('📋 Proje Detayları:');
  console.log('- ID:', result.id);
  console.log('- Short Code:', result.shortCode);
  console.log('- Title:', result.translations[0].title);
  console.log('- Target Amount:', result.targetAmount, 'TL');
  console.log('- isSacrifice:', result.settings.isSacrifice);
  console.log('- Share Price:', result.settings.sacrificeConfig.sharePrice, 'TL/hisse');
  console.log('\n✅ Test için hazır!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
