const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImages() {
  try {
    console.log('🔧 Fixing invalid image URLs...\n');

    // İlk projenin hatalı imageUrl'ini temizle
    const project67 = await prisma.project.findUnique({ where: { id: 67 } });

    if (project67 && project67.imageUrl === 'Hızlı bağış') {
      await prisma.project.update({
        where: { id: 67 },
        data: { imageUrl: null }
      });
      console.log('✅ Project ID 67: Hatalı imageUrl (\"Hızlı bağış\") temizlendi → NULL');
    }

    // Tüm projeleri kontrol et - eğer imageUrl path değilse (/ ile başlamıyorsa) temizle
    const allProjects = await prisma.project.findMany({
      where: { id: { gte: 67 } }
    });

    let fixedCount = 0;

    for (const project of allProjects) {
      if (project.imageUrl && !project.imageUrl.startsWith('/')) {
        await prisma.project.update({
          where: { id: project.id },
          data: { imageUrl: null }
        });
        console.log(`✅ Project ID ${project.id}: Hatalı imageUrl temizlendi`);
        fixedCount++;
      }
    }

    console.log(`\n📊 Total fixed: ${fixedCount}`);

    // Sonuçları göster
    const withImage = await prisma.project.count({
      where: {
        id: { gte: 67 },
        imageUrl: { not: null }
      }
    });

    const total = await prisma.project.count({
      where: { id: { gte: 67 } }
    });

    console.log(`\n✅ Projects with valid images: ${withImage} / ${total}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImages();
