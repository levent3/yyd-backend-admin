const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixModules() {
  console.log('\n🔧 Fixing module relationships...\n');

  // 1. Fix job-positions: should be under careers (ID 10), not pages (ID 11)
  console.log('1. Fixing "Açık Pozisyonlar" - moving from Sayfalar to Kariyer Başvuruları...');
  await prisma.adminModule.update({
    where: { moduleKey: 'job-positions' },
    data: { parentId: 10 } // Kariyer Başvuruları
  });
  console.log('   ✅ job-positions now under careers (ID 10)');

  // 2. Fix media children: they point to parentId 23 (career-applications) but should point to 15 (media)
  console.log('\n2. Fixing Medya Yönetimi children - updating all media sub-modules...');
  const mediaChildren = ['brand-assets', 'brochures', 'public-spots', 'success-stories', 'media-coverage'];

  for (const key of mediaChildren) {
    await prisma.adminModule.update({
      where: { moduleKey: key },
      data: { parentId: 15 } // Medya Yönetimi
    });
    console.log(`   ✅ ${key} now under media (ID 15)`);
  }

  console.log('\n✅ All fixes completed!\n');

  // Show updated relationships
  const modules = await prisma.adminModule.findMany({
    orderBy: { id: 'asc' }
  });

  console.log('=== UPDATED PARENT-CHILD RELATIONSHIPS ===\n');

  const parents = modules.filter(m => !m.parentId);
  parents.forEach(parent => {
    console.log(`${parent.id}. ${parent.name} (${parent.moduleKey})`);
    const children = modules.filter(m => m.parentId === parent.id);
    children.forEach(child => {
      console.log(`   └─ ${child.id}. ${child.name} (${child.moduleKey})`);
    });
  });
}

fixModules()
  .catch(e => console.error('❌ Error:', e))
  .finally(() => prisma.$disconnect());
