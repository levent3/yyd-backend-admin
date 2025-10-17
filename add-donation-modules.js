const prisma = require('./src/config/prismaClient');

async function addDonationModules() {
  try {
    // Önce Bağış Yönetimi parent modülüne icon ekle
    await prisma.adminModule.update({
      where: { id: 6 },
      data: { icon: 'heart' }
    });
    console.log('✓ Bağış Yönetimi icon güncellendi');

    // Kampanyalar
    const campaigns = await prisma.adminModule.upsert({
      where: { moduleKey: 'campaigns' },
      update: { parentId: 6, displayOrder: 1 },
      create: {
        name: 'Bağış Kampanyaları',
        moduleKey: 'campaigns',
        path: '/admin/campaigns',
        icon: 'target',
        displayOrder: 1,
        parentId: 6
      }
    });
    console.log('✓ Kampanyalar modülü eklendi');

    // Tüm Bağışlar
    const donationsList = await prisma.adminModule.upsert({
      where: { moduleKey: 'donations-list' },
      update: { parentId: 6, displayOrder: 2 },
      create: {
        name: 'Tüm Bağışlar',
        moduleKey: 'donations-list',
        path: '/admin/donations',
        icon: 'list',
        displayOrder: 2,
        parentId: 6
      }
    });
    console.log('✓ Tüm Bağışlar modülü eklendi');

    // Düzenli Bağışlar
    const recurring = await prisma.adminModule.upsert({
      where: { moduleKey: 'recurring-donations' },
      update: { parentId: 6, displayOrder: 3 },
      create: {
        name: 'Düzenli Bağışlar',
        moduleKey: 'recurring-donations',
        path: '/admin/recurring-donations',
        icon: 'repeat',
        displayOrder: 3,
        parentId: 6
      }
    });
    console.log('✓ Düzenli Bağışlar modülü eklendi');

    // Ödeme İşlemleri
    const payments = await prisma.adminModule.upsert({
      where: { moduleKey: 'payment-transactions' },
      update: { parentId: 6, displayOrder: 4 },
      create: {
        name: 'Ödeme İşlemleri',
        moduleKey: 'payment-transactions',
        path: '/admin/payment-transactions',
        icon: 'credit-card',
        displayOrder: 4,
        parentId: 6
      }
    });
    console.log('✓ Ödeme İşlemleri modülü eklendi');

    // Banka Hesapları
    const banks = await prisma.adminModule.upsert({
      where: { moduleKey: 'bank-accounts' },
      update: { parentId: 6, displayOrder: 5 },
      create: {
        name: 'Banka Hesapları',
        moduleKey: 'bank-accounts',
        path: '/admin/bank-accounts',
        icon: 'dollar-sign',
        displayOrder: 5,
        parentId: 6
      }
    });
    console.log('✓ Banka Hesapları modülü eklendi');

    // Kampanya Ayarları
    const settings = await prisma.adminModule.upsert({
      where: { moduleKey: 'campaign-settings' },
      update: { parentId: 6, displayOrder: 6 },
      create: {
        name: 'Kampanya Ayarları',
        moduleKey: 'campaign-settings',
        path: '/admin/campaign-settings',
        icon: 'sliders',
        displayOrder: 6,
        parentId: 6
      }
    });
    console.log('✓ Kampanya Ayarları modülü eklendi');

    // Diğer parent modüllere icon ekle
    await prisma.adminModule.update({
      where: { id: 7 },
      data: { icon: 'file-text' }
    });
    await prisma.adminModule.update({
      where: { id: 8 },
      data: { icon: 'image' }
    });
    await prisma.adminModule.update({
      where: { id: 9 },
      data: { icon: 'mail' }
    });
    await prisma.adminModule.update({
      where: { id: 10 },
      data: { icon: 'user-check' }
    });
    await prisma.adminModule.update({
      where: { id: 11 },
      data: { icon: 'briefcase' }
    });
    console.log('✓ Diğer modüllerin icon\'ları güncellendi');

    console.log('\n✅ Tüm bağış modülleri başarıyla eklendi!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDonationModules();
