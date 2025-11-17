const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function viewProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { id: { gte: 25 } },
      include: {
        translations: {
          orderBy: { language: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    console.log('\n📦 MIGRATED PROJECTS\n');
    console.log(`Total Projects: ${projects.length}`);
    console.log('='.repeat(80));

    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. Project ID: ${project.id}`);
      console.log(`   Status: ${project.status} | Featured: ${project.isFeatured ? 'Yes' : 'No'}`);
      console.log(`   Budget: ${project.budget} TL | Target: ${project.targetAmount} TL`);
      console.log(`   Created: ${project.createdAt.toLocaleDateString('tr-TR')}`);
      console.log(`   Translations (${project.translations.length}):`);

      project.translations.forEach(trans => {
        console.log(`     [${trans.language.toUpperCase()}] ${trans.title}`);
        console.log(`          Slug: ${trans.slug}`);
        if (trans.description) {
          const desc = trans.description.substring(0, 60);
          console.log(`          Desc: ${desc}${trans.description.length > 60 ? '...' : ''}`);
        }
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total: ${projects.length} projects with ${projects.reduce((sum, p) => sum + p.translations.length, 0)} translations\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewProjects();
