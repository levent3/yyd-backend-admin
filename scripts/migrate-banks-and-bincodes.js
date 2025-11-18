/**
 * Migrate Banks and BinCodes Only
 *
 * Bu script sadece Bank ve BinCode tablolarını migrate eder.
 * Diğer tablolara (Slider, Volunteer, etc.) dokunmaz.
 *
 * Kaynak: C:\Temp\all_tables_insert.sql (MSSQL export)
 *
 * Beklenen Sonuç:
 * - Bank: 13 kayıt
 * - BinCode: 2,362 kayıt
 */

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper fonksiyonlar
function parseValuesImproved(valuesString, expectedCount) {
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = null;
  let depth = 0;
  let i = 0;

  while (i < valuesString.length) {
    const char = valuesString[i];
    const prevChar = i > 0 ? valuesString[i - 1] : '';
    const nextChar = i < valuesString.length - 1 ? valuesString[i + 1] : '';

    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (char === stringChar) {
        if (nextChar === stringChar) {
          current += char + nextChar;
          i += 2;
          continue;
        } else {
          inString = false;
          stringChar = null;
          current += char;
        }
      } else {
        current += char;
      }
      i++;
      continue;
    }

    if (!inString) {
      if (char === '(') depth++;
      if (char === ')') depth--;

      if (char === ',' && depth === 0) {
        values.push(cleanValue(current.trim()));
        current = '';
        i++;
        continue;
      }
    }

    current += char;
    i++;
  }

  if (current.trim()) {
    values.push(cleanValue(current.trim()));
  }

  while (values.length < expectedCount) {
    values.push(null);
  }

  return values;
}

function cleanValue(value) {
  if (value === 'NULL') return null;

  const castMatch = value.match(/CAST\s*\(\s*N'([^']+)'\s+AS\s+DateTime\s*\)/i);
  if (castMatch) {
    return castMatch[1];
  }

  if (value.startsWith("N'") && value.endsWith("'")) {
    return value.slice(2, -1).replace(/''/g, "'");
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }

  return value;
}

function cleanString(str) {
  if (!str || str === 'NULL') return null;
  return str.replace(/\r\n/g, '\n').trim();
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NULL') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function parseBool(val) {
  if (val === null || val === 'NULL' || val === undefined) return false;
  return parseInt(val) === 1;
}

// Main migration function
async function migrateBanksAndBinCodes() {
  try {
    console.log('🏦 Bank ve BinCode Migration Başlıyor...\n');

    // Dosya yolu - Sunucuda değiştir!
    const filePath = 'C:\\Temp\\all_tables_insert.sql'; // Windows
    // const filePath = '/tmp/all_tables_insert.sql'; // Linux/Ubuntu (Sunucu)

    console.log(`📖 MSSQL dosyası okunuyor: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Dosya bulunamadı: ${filePath}\n\nSunucuda dosya yolunu kontrol edin!`);
    }

    let sqlContent = fs.readFileSync(filePath, 'utf16le');
    sqlContent = sqlContent.replace(/\0/g, '');

    console.log('🔍 INSERT satırları parse ediliyor...\n');

    const lines = sqlContent.split(/\r?\n/);

    const allItems = {
      bank: [],
      binCode: []
    };

    let currentTable = null;
    let columnsList = null;
    let valueBuffer = '';
    let inValues = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Hangi tabloya INSERT yapılıyor?
      if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_Bank]')) {
        currentTable = 'bank';
      } else if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_BankIdentificationNumber]')) {
        currentTable = 'binCode';
      }

      // Column listesini parse et
      const insertMatch = line.match(/INSERT\s+\[dbo\]\.\[([^\]]+)\]\s+\(([^)]+)\)\s+VALUES\s+\((.*)$/i);

      if (insertMatch) {
        if (inValues && valueBuffer) {
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const itemData = {};
          columnsList.forEach((col, index) => {
            itemData[col] = values[index];
          });
          if (currentTable && (currentTable === 'bank' || currentTable === 'binCode')) {
            allItems[currentTable].push(itemData);
          }
        }

        columnsList = insertMatch[2].split(',').map(col => col.trim().replace(/[\[\]]/g, ''));
        valueBuffer = insertMatch[3];
        inValues = true;
        continue;
      }

      if (inValues) {
        valueBuffer += ' ' + line;

        if (line.trim().endsWith(')') || line.trim().endsWith('),')) {
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const itemData = {};
          columnsList.forEach((col, index) => {
            itemData[col] = values[index];
          });
          if (currentTable && (currentTable === 'bank' || currentTable === 'binCode')) {
            allItems[currentTable].push(itemData);
          }

          valueBuffer = '';
          inValues = false;
        }
      }
    }

    console.log('📊 Parse Tamamlandı!\n');
    console.log(`  Bank: ${allItems.bank.length}`);
    console.log(`  BinCode: ${allItems.binCode.length}\n`);

    // Önce mevcut kayıtları kontrol et
    const existingBanks = await prisma.bank.count();
    const existingBinCodes = await prisma.binCode.count();

    console.log('📋 Mevcut Kayıtlar:');
    console.log(`  Bank: ${existingBanks}`);
    console.log(`  BinCode: ${existingBinCodes}\n`);

    if (existingBanks > 0 || existingBinCodes > 0) {
      console.log('⚠️  UYARI: Veritabanında zaten kayıt var!');
      console.log('⚠️  Duplicate kayıtlar skip edilecek.\n');
    }

    // Bank'leri migrate et ve mapping al
    console.log('🏦 Bank Migration Başlıyor...');
    const bankMapping = await migrateBanks(allItems.bank);

    // BinCode'ları mapping ile migrate et
    console.log('\n🔢 BinCode Migration Başlıyor...');
    await migrateBinCodes(allItems.binCode, bankMapping);

    console.log('\n✅ Migration Tamamlandı!');
    console.log('\n📊 Sonuç:');
    const finalBanks = await prisma.bank.count();
    const finalBinCodes = await prisma.binCode.count();
    console.log(`  Bank: ${finalBanks}`);
    console.log(`  BinCode: ${finalBinCodes}`);

  } catch (error) {
    console.error('\n❌ Migration Hatası:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateBanks(banks) {
  let migratedCount = 0;
  let skippedCount = 0;

  // ContentId → PostgreSQL ID mapping
  const bankContentIdMapping = {};

  // ContentId bazında grupla
  const banksByContentId = {};
  banks.forEach(bank => {
    const contentId = bank.ContentId ? bank.ContentId.toLowerCase() : null;
    if (!contentId) {
      skippedCount++;
      return;
    }
    if (!banksByContentId[contentId]) {
      banksByContentId[contentId] = [];
    }
    banksByContentId[contentId].push(bank);
  });

  for (const [contentId, bankRows] of Object.entries(banksByContentId)) {
    try {
      const mainRow = bankRows[0];

      // Önce kontrol et, varsa skip
      const existingBank = await prisma.bank.findFirst({
        where: {
          name: cleanString(mainRow.Title) || 'Unknown Bank'
        }
      });

      if (existingBank) {
        bankContentIdMapping[contentId] = existingBank.id;
        skippedCount++;
        continue;
      }

      const bank = await prisma.bank.create({
        data: {
          name: cleanString(mainRow.Title) || 'Unknown Bank',
          isVirtualPosActive: parseBool(mainRow.UseAlternativeVPOS),
          isActive: true,
          displayOrder: 0,
          createdAt: parseDate(mainRow.CreateDate) || new Date(),
          updatedAt: parseDate(mainRow.UpdateDate) || new Date(),
        },
      });

      // Mapping'i kaydet
      bankContentIdMapping[contentId] = bank.id;

      migratedCount++;
      console.log(`  ✅ Bank: ${bank.name} (ID: ${bank.id})`);
    } catch (error) {
      console.error(`  ❌ Bank migration hatası (${contentId.substring(0, 8)}...):`, error.message);
      skippedCount++;
    }
  }

  console.log(`\n  ✅ ${migratedCount} bank migrate edildi`);
  console.log(`  ⏭️  ${skippedCount} bank atlandı (duplicate veya hatalı)`);

  return bankContentIdMapping;
}

async function migrateBinCodes(binCodes, bankMapping) {
  let migratedCount = 0;
  let skippedCount = 0;
  let noMappingCount = 0;

  // ContentId bazında grupla
  const binCodesByContentId = {};
  binCodes.forEach(bin => {
    const contentId = bin.ContentId ? bin.ContentId.toLowerCase() : null;
    if (!contentId) {
      skippedCount++;
      return;
    }
    if (!binCodesByContentId[contentId]) {
      binCodesByContentId[contentId] = [];
    }
    binCodesByContentId[contentId].push(bin);
  });

  for (const [contentId, binRows] of Object.entries(binCodesByContentId)) {
    try {
      const mainRow = binRows[0];
      const binCodeValue = cleanString(mainRow.Title); // BIN kodu Title'da

      if (!binCodeValue || binCodeValue.length < 6) {
        skippedCount++;
        continue;
      }

      // BankId GUID formatında - mapping'den PostgreSQL ID'yi bul
      const bankContentId = cleanString(mainRow.BankId);
      const normalizedBankId = bankContentId ? bankContentId.toLowerCase() : null;

      if (!normalizedBankId || !bankMapping[normalizedBankId]) {
        noMappingCount++;
        if (noMappingCount <= 5) {
          console.log(`  ⚠️  BinCode ${binCodeValue} için Bank mapping bulunamadı`);
        }
        skippedCount++;
        continue;
      }

      const postgresqlBankId = bankMapping[normalizedBankId];

      await prisma.binCode.create({
        data: {
          binCode: binCodeValue,
          bankId: postgresqlBankId,
          isActive: true,
          createdAt: parseDate(mainRow.CreateDate) || new Date(),
          updatedAt: parseDate(mainRow.UpdateDate) || new Date(),
        },
      });

      migratedCount++;
      if (migratedCount % 100 === 0) {
        console.log(`  ✅ ${migratedCount} BinCode migrate edildi...`);
      }

    } catch (error) {
      // Unique constraint hatası (BinCode zaten var)
      if (error.code === 'P2002') {
        skippedCount++;
      } else {
        console.error(`  ❌ BinCode migration hatası:`, error.message);
        skippedCount++;
      }
    }
  }

  console.log(`\n  ✅ ${migratedCount} BinCode migrate edildi`);
  console.log(`  ⏭️  ${skippedCount} BinCode atlandı (${noMappingCount} mapping yok, duplicate)`);
}

// Script'i çalıştır
if (require.main === module) {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   Bank ve BinCode Migration Script      ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  migrateBanksAndBinCodes()
    .then(() => {
      console.log('\n🎉 İşlem Başarıyla Tamamlandı!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 İşlem Başarısız!\n');
      console.error('Hata:', error.message);
      console.error('\nStack:', error.stack);
      process.exit(1);
    });
}

module.exports = { migrateBanksAndBinCodes };
