const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('📊 Migration Sonuçları:\n');

    const homeSliderCount = await prisma.homeSlider.count();
    const homeSliderTransCount = await prisma.homeSliderTranslation.count();
    console.log(`✅ HomeSlider: ${homeSliderCount}`);
    console.log(`✅ HomeSliderTranslation: ${homeSliderTransCount}`);

    const bankAccountCount = await prisma.bankAccount.count();
    const bankAccountTransCount = await prisma.bankAccountTranslation.count();
    console.log(`✅ BankAccount: ${bankAccountCount}`);
    console.log(`✅ BankAccountTranslation: ${bankAccountTransCount}`);

    const bankCount = await prisma.bank.count();
    const binCodeCount = await prisma.binCode.count();
    console.log(`✅ Bank: ${bankCount}`);
    console.log(`✅ BinCode: ${binCodeCount}`);

    const volunteerCount = await prisma.volunteer.count();
    const contactMessageCount = await prisma.contactMessage.count();
    console.log(`✅ Volunteer: ${volunteerCount}`);
    console.log(`✅ ContactMessage: ${contactMessageCount}`);

    console.log('\n🔍 Örnek HomeSlider (çevirileriyle):');
    const slider = await prisma.homeSlider.findFirst({
      include: { translations: true }
    });

    if (slider) {
      console.log(`  ID: ${slider.id}`);
      console.log(`  Translations: ${slider.translations.length}`);
      slider.translations.forEach(t => {
        console.log(`    [${t.language.toUpperCase()}] ${t.title}`);
      });
    }

    console.log('\n🔍 Örnek BankAccount (çevirileriyle):');
    const accounts = await prisma.bankAccount.findMany({
      take: 3,
      include: { translations: true }
    });

    accounts.forEach((account, idx) => {
      console.log(`\n  Account ${idx + 1}:`);
      console.log(`    ID: ${account.id}`);
      console.log(`    IBAN: ${account.iban}`);
      console.log(`    Account Number: ${account.accountNumber}`);
      console.log(`    Branch: ${account.branch || 'N/A'}`);
      console.log(`    Translations: ${account.translations.length}`);
      account.translations.forEach(t => {
        console.log(`      [${t.language.toUpperCase()}] accountName="${t.accountName}" | bankName="${t.bankName}"`);
      });
    });

    console.log('\n🔍 BinCode → Bank İlişkisi:');
    const binCodeSample = await prisma.binCode.findFirst({
      include: { bank: true }
    });

    if (binCodeSample) {
      console.log(`  BinCode: ${binCodeSample.binCode}`);
      console.log(`  Bank: ${binCodeSample.bank.name}`);
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
