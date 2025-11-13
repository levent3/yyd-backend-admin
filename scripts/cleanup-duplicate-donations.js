/**
 * Clean Up Duplicate Donations Script
 *
 * Bu script, duplicate donation kayıtlarını temizler.
 * Aynı donor + aynı tutar + aynı projeler + farklı orderId = duplicate
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('🔍 Duplicate donation kayıtları aranıyor...\n');

  try {
    // Son 24 saatteki pending donations
    const recentDonations = await prisma.donation.findMany({
      where: {
        paymentStatus: 'pending',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Son 24 saat
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        donor: true
      }
    });

    console.log(`📊 Toplam ${recentDonations.length} pending donation bulundu\n`);

    // OrderId'ye göre grupla
    const orderGroups = {};
    recentDonations.forEach(d => {
      if (!orderGroups[d.orderId]) {
        orderGroups[d.orderId] = [];
      }
      orderGroups[d.orderId].push(d);
    });

    console.log(`📦 ${Object.keys(orderGroups).length} farklı orderId grubu bulundu\n`);

    // Aynı donor + benzer tutar kombinasyonlarını bul
    const donorAmountGroups = {};
    recentDonations.forEach(d => {
      const key = `${d.donorEmail}-${d.amount}-${d.isSacrifice}-${d.shareCount}`;
      if (!donorAmountGroups[key]) {
        donorAmountGroups[key] = [];
      }
      donorAmountGroups[key].push(d);
    });

    // Duplicate grupları
    const duplicates = Object.entries(donorAmountGroups).filter(([key, donations]) => donations.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ Duplicate kayıt bulunamadı!');
      return;
    }

    console.log(`⚠️  ${duplicates.length} duplicate grup bulundu:\n`);

    let totalToDelete = 0;

    duplicates.forEach(([key, donations], index) => {
      console.log(`\n--- Duplicate Grup ${index + 1} ---`);
      console.log(`Key: ${key}`);
      console.log(`Toplam kayıt: ${donations.length}`);

      // En son oluşturulanı tut, diğerlerini sil
      const sorted = donations.sort((a, b) => b.createdAt - a.createdAt);
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);

      console.log(`✅ Tutulacak: ${toKeep.orderId} (${toKeep.createdAt.toISOString()})`);
      toDelete.forEach(d => {
        console.log(`❌ Silinecek: ${d.orderId} (${d.createdAt.toISOString()})`);
        totalToDelete++;
      });
    });

    console.log(`\n\n📋 Özet:`);
    console.log(`   Toplam silinecek kayıt: ${totalToDelete}`);
    console.log(`   Tutulacak kayıt: ${duplicates.length}`);

    // Kullanıcıdan onay al
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\n⚠️  Bu kayıtları silmek istediğinize emin misiniz? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        console.log('\n🗑️  Silme işlemi başlatılıyor...\n');

        let deletedCount = 0;

        for (const [key, donations] of duplicates) {
          const sorted = donations.sort((a, b) => b.createdAt - a.createdAt);
          const toDelete = sorted.slice(1);

          for (const d of toDelete) {
            await prisma.donation.delete({
              where: { id: d.id }
            });
            console.log(`✅ Silindi: ${d.orderId} (${d.id})`);
            deletedCount++;
          }
        }

        console.log(`\n✅ ${deletedCount} duplicate kayıt başarıyla silindi!`);
      } else {
        console.log('\n❌ İşlem iptal edildi.');
      }

      readline.close();
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

cleanupDuplicates();
