/**
 * Clear all ActivityArea data
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearActivityAreas() {
  try {
    console.log('🗑️  ActivityArea verilerini temizliyorum...\n');

    // Önce translations, sonra ana tablo (cascade olsa da güvenlik için)
    const deletedTranslations = await prisma.activityAreaTranslation.deleteMany({});
    console.log(`✅ ${deletedTranslations.count} ActivityAreaTranslation silindi`);

    const deletedAreas = await prisma.activityArea.deleteMany({});
    console.log(`✅ ${deletedAreas.count} ActivityArea silindi`);

    console.log('\n✨ Temizlik tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  clearActivityAreas()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { clearActivityAreas };
