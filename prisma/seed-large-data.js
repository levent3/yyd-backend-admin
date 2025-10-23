const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Büyük veri seti oluşturuluyor...\n');

  const startTime = Date.now();
  const uniqueId = Date.now(); // Slug'ları benzersiz yapmak için

  // Batch size - PostgreSQL için optimize
  const BATCH_SIZE = 100;
  const TOTAL_PROJECTS = 10000; // 10k test - 100k'ya giden yolda

  console.log(`📊 Hedef: ${TOTAL_PROJECTS} proje (${TOTAL_PROJECTS * 2} translation kayıt)\n`);

  let createdCount = 0;

  for (let batch = 0; batch < Math.ceil(TOTAL_PROJECTS / BATCH_SIZE); batch++) {
    const batchStart = Date.now();
    const promises = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const index = batch * BATCH_SIZE + i;
      if (index >= TOTAL_PROJECTS) break;

      const projectNum = index + 1;

      promises.push(
        prisma.project.create({
          data: {
            coverImage: `/images/test/project-${projectNum}.jpg`,
            category: ['Eğitim', 'Sağlık', 'Su', 'Gıda', 'Barınma'][projectNum % 5],
            location: ['Gazze', 'Yemen', 'Suriye', 'Somali', 'Türkiye'][projectNum % 5],
            country: ['Filistin', 'Yemen', 'Suriye', 'Somali', 'Türkiye'][projectNum % 5],
            status: 'active',
            priority: ['low', 'medium', 'high'][projectNum % 3],
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            targetAmount: 10000 + (projectNum * 100),
            collectedAmount: (projectNum * 50),
            beneficiaryCount: 100 + (projectNum * 10),
            isActive: true,
            isFeatured: projectNum % 10 === 0, // Her 10'da bir featured
            displayOrder: projectNum,
            translations: {
              create: [
                {
                  language: 'tr',
                  title: `Test Projesi ${projectNum} - Türkçe`,
                  slug: `test-projesi-${uniqueId}-${projectNum}-tr`,
                  description: `Bu ${projectNum} numaralı test projesidir. İhtiyaç sahiplerine yardım için oluşturulmuştur.`,
                  content: `Detaylı açıklama: Proje ${projectNum} toplam ${100 + (projectNum * 10)} kişiye ulaşacak.`
                },
                {
                  language: 'en',
                  title: `Test Project ${projectNum} - English`,
                  slug: `test-project-${uniqueId}-${projectNum}-en`,
                  description: `This is test project number ${projectNum}. Created to help those in need.`,
                  content: `Detailed description: Project ${projectNum} will reach ${100 + (projectNum * 10)} people in total.`
                }
              ]
            }
          }
        })
      );

      createdCount++;
    }

    await Promise.all(promises);

    const batchTime = Date.now() - batchStart;
    console.log(`✅ Batch ${batch + 1}/${Math.ceil(TOTAL_PROJECTS / BATCH_SIZE)} tamamlandı (${createdCount}/${TOTAL_PROJECTS}) - ${batchTime}ms`);
  }

  const totalTime = Date.now() - startTime;

  console.log(`\n✨ Tamamlandı!`);
  console.log(`📊 Toplam: ${createdCount} proje oluşturuldu`);
  console.log(`📊 Translation: ${createdCount * 2} kayıt`);
  console.log(`⏱️  Süre: ${(totalTime / 1000).toFixed(2)} saniye`);
  console.log(`⚡ Hız: ${(createdCount / (totalTime / 1000)).toFixed(2)} kayıt/saniye`);

  // Veritabanı istatistikleri
  const totalProjects = await prisma.project.count();
  const totalTranslations = await prisma.projectTranslation.count();

  console.log(`\n📈 Veritabanı Durumu:`);
  console.log(`   - Toplam Projeler: ${totalProjects}`);
  console.log(`   - Toplam Translations: ${totalTranslations}`);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
