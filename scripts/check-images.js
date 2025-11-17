const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    const projects = await prisma.project.findMany({
      where: { id: { gte: 67 } },
      include: { translations: { take: 1 } },
      take: 10
    });

    console.log('\n📷 IMAGE CHECK:\n');

    projects.forEach(p => {
      const title = p.translations[0]?.title || 'No title';
      console.log(`Project: ${title}`);
      console.log(`  ID: ${p.id}`);
      console.log(`  imageUrl: ${p.imageUrl || 'NULL'}`);
      console.log(`  coverImage: ${p.coverImage || 'NULL'}`);
      console.log('');
    });

    const withImage = await prisma.project.count({
      where: {
        id: { gte: 67 },
        imageUrl: { not: null }
      }
    });

    const total = await prisma.project.count({
      where: { id: { gte: 67 } }
    });

    console.log('📊 Stats:');
    console.log(`  Projects with imageUrl: ${withImage} / ${total}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
