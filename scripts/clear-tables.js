const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
  console.log('🗑️  Clearing tables...');

  await prisma.bankAccountTranslation.deleteMany({});
  console.log('✅ BankAccountTranslation cleared');

  await prisma.bankAccount.deleteMany({});
  console.log('✅ BankAccount cleared');

  await prisma.homeSliderTranslation.deleteMany({});
  console.log('✅ HomeSliderTranslation cleared');

  await prisma.homeSlider.deleteMany({});
  console.log('✅ HomeSlider cleared');

  await prisma.binCode.deleteMany({});
  console.log('✅ BinCode cleared');

  await prisma.volunteer.deleteMany({});
  console.log('✅ Volunteer cleared');

  await prisma.contactMessage.deleteMany({});
  console.log('✅ ContactMessage cleared');

  // Verify counts
  const counts = await Promise.all([
    prisma.bankAccount.count(),
    prisma.homeSlider.count(),
    prisma.binCode.count(),
  ]);

  console.log('\n📊 Final counts:', counts);

  await prisma.$disconnect();
}

clear().catch(console.error);
