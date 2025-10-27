const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Media modülleri ekleniyor...\n');

  // Media Management parent module
  const mediaParent = await prisma.adminModule.upsert({
    where: { id: 23 },
    update: {},
    create: {
      id: 23,
      name: 'Medya Yönetimi',
      moduleKey: 'media',
      path: null,
      icon: 'folder',
      displayOrder: 16,
      parentId: null
    }
  });
  console.log('✅ Parent module: Medya Yönetimi');

  // Child modules
  const modules = [
    {
      id: 24,
      name: 'Kurumsal Kimlik',
      moduleKey: 'brand-assets',
      path: '/admin/brand-assets',
      icon: 'award',
      displayOrder: 1,
      parentId: 23
    },
    {
      id: 25,
      name: 'Broşürler',
      moduleKey: 'brochures',
      path: '/admin/brochures',
      icon: 'file-text',
      displayOrder: 2,
      parentId: 23
    },
    {
      id: 26,
      name: 'Tanıtım Videoları',
      moduleKey: 'public-spots',
      path: '/admin/public-spots',
      icon: 'video',
      displayOrder: 3,
      parentId: 23
    },
    {
      id: 27,
      name: 'Başarı Hikayeleri',
      moduleKey: 'success-stories',
      path: '/admin/success-stories',
      icon: 'star',
      displayOrder: 4,
      parentId: 23
    },
    {
      id: 28,
      name: 'Basında Biz',
      moduleKey: 'media-coverage',
      path: '/admin/media-coverage',
      icon: 'tv',
      displayOrder: 5,
      parentId: 23
    }
  ];

  for (const moduleData of modules) {
    await prisma.adminModule.upsert({
      where: { id: moduleData.id },
      update: {},
      create: moduleData
    });
    console.log(`✅ Added: ${moduleData.name}`);
  }

  console.log('\n📋 Adding permissions...\n');

  // Get all roles
  const roles = await prisma.role.findMany();

  // Add permissions for all media modules (parent + children)
  const allModuleIds = [23, 24, 25, 26, 27, 28];

  for (const role of roles) {
    for (const moduleId of allModuleIds) {
      const permissions = role.name === 'superadmin'
        ? { read: true, create: true, update: true, delete: true }
        : { read: true, create: false, update: false, delete: false };

      await prisma.roleModulePermission.upsert({
        where: {
          roleId_moduleId: {
            roleId: role.id,
            moduleId: moduleId
          }
        },
        update: { permissions },
        create: {
          roleId: role.id,
          moduleId: moduleId,
          permissions
        }
      });
    }
    console.log(`✅ Permissions added for role: ${role.name}`);
  }

  console.log('\n✨ Tamamlandı!\n');

  // Verify
  const addedModules = await prisma.adminModule.findMany({
    where: {
      id: { gte: 23, lte: 28 }
    },
    orderBy: { id: 'asc' }
  });

  console.log('📊 Eklenen modüller:');
  addedModules.forEach(m => {
    const indent = m.parentId ? '  └─ ' : '';
    console.log(`${indent}${m.id}. ${m.name} (${m.moduleKey})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
