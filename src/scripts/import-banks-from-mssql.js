const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

/**
 * MSSQL veritabanından Bank ve BinCode verilerini PostgreSQL'e import eder
 * Kaynak dosya: C:\Temp\all_tables_insert.sql
 */
async function importBanksFromMSSQL() {
  console.log('🚀 MSSQL Bank ve BIN Code Import Başlıyor...\n');

  try {
    // 1. SQL dosyasını UTF-8'e çevir
    console.log('📄 SQL dosyası okunuyor...');
    const sqlFilePath = process.env.SQL_FILE_PATH || '/tmp/all_tables_insert.sql';
    const sqlContent = execSync(`iconv -f UTF-16LE -t UTF-8 ${sqlFilePath}`, {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer
    });

    // 2. Bank kayıtlarını parse et
    console.log('🏦 Banka kayıtları parse ediliyor...');
    const bankPattern = /INSERT \[dbo\]\.\[YeryuzuDoktorlari_Bank\] \(\[Id\], \[ContentId\].*?\) VALUES \((\d+), N'([^']+)', N'[^']+', N'([^']+)', N'[^']+',.*?\)/g;
    const banks = [];
    const guidToBankIdMap = {}; // MSSQL GUID -> PostgreSQL ID mapping

    let bankMatch;
    while ((bankMatch = bankPattern.exec(sqlContent)) !== null) {
      const mssqlId = parseInt(bankMatch[1]);
      const guid = bankMatch[2];
      const name = bankMatch[3];

      // Sadece ID 61-73 arası bankaları al
      if (mssqlId >= 61 && mssqlId <= 73) {
        banks.push({ guid, name, mssqlId });
      }
    }

    console.log(`✅ ${banks.length} banka bulundu\n`);

    // 3. Bankaları PostgreSQL'e ekle
    console.log('💾 Bankalar veritabanına ekleniyor...');
    for (const bank of banks) {
      const createdBank = await prisma.bank.create({
        data: {
          name: bank.name,
          isOurBank: false,
          isVirtualPosActive: true, // UseAlternativeVPOS = 1 tüm bankalarda
          isActive: true,
          displayOrder: 0
        }
      });

      guidToBankIdMap[bank.guid] = createdBank.id;
      console.log(`  ✓ ${createdBank.id}: ${bank.name}`);
    }

    console.log('\n🔢 BIN kodları parse ediliyor...');

    // 4. BIN Code kayıtlarını parse et
    const binPattern = /INSERT \[dbo\]\.\[YeryuzuDoktorlari_BankIdentificationNumber\] \(\[Id\].*?\) VALUES \(\d+, N'[^']+', N'[^']+', N'(\d{6,8})', N'\d{6,8}',.*?N'([^']+)'\)$/gm;
    const binCodes = [];

    let binMatch;
    while ((binMatch = binPattern.exec(sqlContent)) !== null) {
      const binCode = binMatch[1];
      const bankGuid = binMatch[2];

      // Sadece bizim bankalarımıza ait BIN kodları al
      if (guidToBankIdMap[bankGuid]) {
        binCodes.push({
          binCode,
          bankId: guidToBankIdMap[bankGuid]
        });
      }
    }

    console.log(`✅ ${binCodes.length} BIN kod bulundu\n`);

    // 5. BIN kodlarını batch olarak ekle
    console.log('💾 BIN kodları veritabanına ekleniyor...');

    // Batch insert (100'lük gruplar halinde)
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < binCodes.length; i += batchSize) {
      const batch = binCodes.slice(i, i + batchSize);
      await prisma.binCode.createMany({
        data: batch.map(bc => ({
          binCode: bc.binCode,
          bankId: bc.bankId,
          isActive: true
        })),
        skipDuplicates: true
      });
      insertedCount += batch.length;
      process.stdout.write(`\r  ${insertedCount} / ${binCodes.length} BIN kod eklendi...`);
    }

    console.log('\n');

    // 6. Özet bilgi
    const finalBankCount = await prisma.bank.count();
    const finalBinCodeCount = await prisma.binCode.count();

    console.log('\n✅ Import Tamamlandı!\n');
    console.log('📊 Özet:');
    console.log(`  - Toplam Banka: ${finalBankCount}`);
    console.log(`  - Toplam BIN Kod: ${finalBinCodeCount}`);

    // Her banka için BIN kod sayısını göster
    console.log('\n📋 Banka Bazında BIN Kod Dağılımı:');
    const banksWithCount = await prisma.bank.findMany({
      include: {
        _count: {
          select: { binCodes: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    banksWithCount.forEach(bank => {
      console.log(`  ${bank.id}. ${bank.name}: ${bank._count.binCodes} BIN kod`);
    });

    return {
      success: true,
      banks: finalBankCount,
      binCodes: finalBinCodeCount
    };

  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI kullanımı için
if (require.main === module) {
  importBanksFromMSSQL()
    .then(() => {
      console.log('\n✨ İşlem başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 İşlem başarısız:', error);
      process.exit(1);
    });
}

module.exports = { importBanksFromMSSQL };
