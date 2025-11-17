/**
 * Master Migration Script - Migrate All Remaining Tables
 *
 * Tables to migrate:
 * 1. YeryuzuDoktorlari_Slider (11) → HomeSlider
 * 2. YeryuzuDoktorlari_Volunteer (8683) → Volunteer
 * 3. YeryuzuDoktorlari_Donation (1341) → Donation
 * 4. YeryuzuDoktorlari_ContactForm (1957) → ContactMessage
 * 5. YeryuzuDoktorlari_Bank (13) → Bank
 * 6. YeryuzuDoktorlari_BankAccountInformation (63) → BankAccount
 * 7. YeryuzuDoktorlari_BankIdentificationNumber (2362) → BinCode
 *
 * Total: 14,430 records
 */

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dil Mapping
const LANGUAGE_MAP = {
  'bf2689d9-071e-4a20-9450-b1dbdd39778f': 'tr',
  '7c35f456-9403-4c21-80b6-941129d14086': 'en',
  '8fab2bf3-f2e1-4d54-b668-8dd588575fe4': 'ar',
};

// Helper fonksiyonlar (project ve news migration'dan)
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

function parseInt32(val) {
  if (!val || val === 'NULL') return null;
  return parseInt(val);
}

function parseFloat64(val) {
  if (!val || val === 'NULL') return null;
  return parseFloat(val);
}

// accountName'den bankName çıkar: "Kuveyt Türk 1" → "Kuveyt Türk"
function extractBankName(accountName) {
  if (!accountName) return 'Unknown Bank';
  const bankName = accountName.replace(/\s*\d+\s*$/, '').trim();
  return bankName || accountName;
}
// Main migration function
async function migrateAllTables() {
  try {
    console.log('📖 MSSQL all_tables_insert.sql okunuyor...');
    let sqlContent = fs.readFileSync('C:\\Temp\\all_tables_insert.sql', 'utf16le');
    sqlContent = sqlContent.replace(/\0/g, '');

    console.log('🔍 INSERT satırları parse ediliyor...\n');

    const lines = sqlContent.split(/\r?\n/);

    const allItems = {
      slider: [],
      volunteer: [],
      donation: [],
      contactForm: [],
      bank: [],
      bankAccount: [],
      binCode: []
    };

    let currentTable = null;
    let columnsList = null;
    let valueBuffer = '';
    let inValues = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Hangi tabloya INSERT yapılıyor?
      if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_Slider]')) {
        currentTable = 'slider';
      } else if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_Volunteer]')) {
        currentTable = 'volunteer';
      } else if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_Donation]')) {
        currentTable = 'donation';
      } else if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_ContactForm]')) {
        currentTable = 'contactForm';
      } else if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_Bank]')) {
        currentTable = 'bank';
      } else if (line.includes('INSERT [dbo].[YeryuzuDoktorlari_BankAccountInformation]')) {
        currentTable = 'bankAccount';
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
          if (currentTable) {
            allItems[currentTable].push(itemData);
          }
        }

        columnsList = insertMatch[2].split(',').map(c => c.trim().replace(/\[|\]/g, ''));
        valueBuffer = insertMatch[3];
        inValues = true;

        if (valueBuffer.trim().endsWith(')')) {
          valueBuffer = valueBuffer.trim().slice(0, -1);
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const itemData = {};
          columnsList.forEach((col, index) => {
            itemData[col] = values[index];
          });
          if (currentTable) {
            allItems[currentTable].push(itemData);
          }
          valueBuffer = '';
          inValues = false;
        }
      } else if (inValues) {
        valueBuffer += '\n' + line;

        if (line.trim().endsWith(')')) {
          valueBuffer = valueBuffer.trim().slice(0, -1);
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const itemData = {};
          columnsList.forEach((col, index) => {
            itemData[col] = values[index];
          });
          if (currentTable) {
            allItems[currentTable].push(itemData);
          }
          valueBuffer = '';
          inValues = false;
        }
      }

      if ((i + 1) % 1000 === 0) {
        console.log(`  📝 ${i + 1} satır işlendi...`);
      }
    }

    console.log('\n📊 Parse edilen veriler:');
    console.log(`  Slider: ${allItems.slider.length}`);
    console.log(`  Volunteer: ${allItems.volunteer.length}`);
    console.log(`  Donation: ${allItems.donation.length}`);
    console.log(`  ContactForm: ${allItems.contactForm.length}`);
    console.log(`  Bank: ${allItems.bank.length}`);
    console.log(`  BankAccount: ${allItems.bankAccount.length}`);
    console.log(`  BinCode: ${allItems.binCode.length}`);

    // Her tablo için migration fonksiyonunu çağır
    await migrateSliders(allItems.slider);
    await migrateVolunteers(allItems.volunteer);
    await migrateDonations(allItems.donation);
    await migrateContactForms(allItems.contactForm);

    // Bank'leri migrate et ve mapping al
    const bankMapping = await migrateBanks(allItems.bank);

    await migrateBankAccounts(allItems.bankAccount);

    // BinCode'ları mapping ile migrate et
    await migrateBinCodes(allItems.binCode, bankMapping);

    console.log('\n✅ Tüm tablolar başarıyla migrate edildi!');

  } catch (error) {
    console.error('❌ Migration hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 PostgreSQL bağlantısı kapatıldı');
  }
}

// Migration fonksiyonları (her tablo için)
async function migrateSliders(sliders) {
  console.log('\n🎨 HomeSlider migration başlıyor...');

  let migratedCount = 0;
  let skippedCount = 0;

  // ContentId bazında grupla (çok dilli)
  const slidersByContentId = {};
  sliders.forEach(slider => {
    const contentId = slider.ContentId ? slider.ContentId.toLowerCase() : null;
    if (!contentId) {
      skippedCount++;
      return;
    }
    if (!slidersByContentId[contentId]) {
      slidersByContentId[contentId] = [];
    }
    slidersByContentId[contentId].push(slider);
  });

  for (const [contentId, sliderRows] of Object.entries(slidersByContentId)) {
    try {
      const mainRow = sliderRows[0];

      // HomeSlider oluştur (dil-bağımsız)
      const slider = await prisma.homeSlider.create({
        data: {
          imageUrl: cleanString(mainRow.Image) || '/default-slider.jpg',
          mobileImageUrl: cleanString(mainRow.MobileImage),
          videoUrl: cleanString(mainRow.Video),
          displayOrder: parseInt32(mainRow.OrderNo) || 0,
          isActive: true,
          showTitle: parseBool(mainRow.IsShowTitle),
          startDate: parseDate(mainRow.StartDate),
          endDate: parseDate(mainRow.EndDate),
          createdAt: parseDate(mainRow.CreateDate) || new Date(),
          updatedAt: parseDate(mainRow.UpdateDate) || new Date(),
        },
      });

      // Her dil için translation ekle
      for (const row of sliderRows) {
        const siteLanguageId = (row.SiteLanguageId || '').toString().toLowerCase().replace(/^n/, '');
        const language = LANGUAGE_MAP[siteLanguageId];

        if (!language) {
          console.log(`   ⚠️  Bilinmeyen dil: ${row.SiteLanguageId}, atlanıyor`);
          continue;
        }

        await prisma.homeSliderTranslation.create({
          data: {
            sliderId: slider.id,
            language: language,
            title: cleanString(row.Title) || 'Slider',
            subtitle: cleanString(row.SubTitle),
            summary: cleanString(row.Summary),
            buttonText: cleanString(row.ButtonTitle),
            buttonLink: cleanString(row.Url),
          },
        });

        console.log(`   ✅ Translation: ${language} - ${row.Title}`);
      }

      migratedCount++;
    } catch (error) {
      console.error(`  ❌ Slider migration hatası (${contentId}):`, error.message);
      skippedCount++;
    }
  }

  console.log(`\n  ✅ ${migratedCount} slider migrate edildi`);
  console.log(`  ⚠️  ${skippedCount} slider atlandı`);
}

async function migrateVolunteers(volunteers) {
  console.log('\n👥 Volunteer migration başlıyor...');

  let migratedCount = 0;
  let skippedCount = 0;

  // ContentId bazında grupla - aynı kişinin farklı dillerdeki kayıtları
  const volunteersByContentId = {};
  volunteers.forEach(vol => {
    const contentId = vol.ContentId ? vol.ContentId.toLowerCase() : null;
    if (!contentId) {
      skippedCount++;
      return;
    }
    if (!volunteersByContentId[contentId]) {
      volunteersByContentId[contentId] = [];
    }
    volunteersByContentId[contentId].push(vol);
  });

  // Her ContentId için bir kez ekle (ilk dil)
  for (const [contentId, volRows] of Object.entries(volunteersByContentId)) {
    try {
      const mainRow = volRows[0]; // İlk dili al

      await prisma.volunteer.create({
        data: {
          fullName: cleanString(mainRow.Name) + ' ' + cleanString(mainRow.Surname),
          email: cleanString(mainRow.EmailAddress) || 'unknown@example.com',
          phoneNumber: cleanString(mainRow.PhoneNumber),
          message: cleanString(mainRow.Note),
          status: 'new',
          submittedAt: parseDate(mainRow.CreateDate) || new Date(),
        },
      });

      migratedCount++;
      if (migratedCount % 100 === 0) {
        console.log(`  ✅ ${migratedCount} volunteer migrate edildi...`);
      }
    } catch (error) {
      console.error(`  ❌ Volunteer migration hatası (${contentId}):`, error.message);
      skippedCount++;
    }
  }

  console.log(`\n  ✅ ${migratedCount} volunteer migrate edildi`);
  console.log(`  ⚠️  ${skippedCount} volunteer atlandı`);
}

async function migrateDonations(donations) {
  console.log('\n💰 Donation migration başlıyor...');
  // TODO: Implement (çok dilli, Donor tablosu gerekli)
  console.log('  ⏭️  Donation migration atlandı (şimdilik)');
}

async function migrateContactForms(contactForms) {
  console.log('\n✉️  ContactMessage migration başlıyor...');

  let migratedCount = 0;
  let skippedCount = 0;

  // ContentId bazında grupla
  const contactsByContentId = {};
  contactForms.forEach(contact => {
    const contentId = contact.ContentId ? contact.ContentId.toLowerCase() : null;
    if (!contentId) {
      skippedCount++;
      return;
    }
    if (!contactsByContentId[contentId]) {
      contactsByContentId[contentId] = [];
    }
    contactsByContentId[contentId].push(contact);
  });

  for (const [contentId, contactRows] of Object.entries(contactsByContentId)) {
    try {
      const mainRow = contactRows[0];

      await prisma.contactMessage.create({
        data: {
          fullName: cleanString(mainRow.NameAndSurname) || 'Unknown',
          email: cleanString(mainRow.EmailAddress) || 'unknown@example.com',
          phoneNumber: cleanString(mainRow.PhoneNumber),
          subject: cleanString(mainRow.Title) || 'Contact Form',
          message: cleanString(mainRow.Message) || '',
          status: 'new',
          submittedAt: parseDate(mainRow.CreateDate) || new Date(),
          updatedAt: parseDate(mainRow.UpdateDate) || new Date(),
        },
      });

      migratedCount++;
      if (migratedCount % 100 === 0) {
        console.log(`  ✅ ${migratedCount} contact message migrate edildi...`);
      }
    } catch (error) {
      console.error(`  ❌ ContactMessage migration hatası (${contentId}):`, error.message);
      skippedCount++;
    }
  }

  console.log(`\n  ✅ ${migratedCount} contact message migrate edildi`);
  console.log(`  ⚠️  ${skippedCount} contact message atlandı`);
}

async function migrateBanks(banks) {
  console.log('\n🏦 Bank migration başlıyor...');

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
      console.log(`  ✅ Bank: ${bank.name} (ID: ${bank.id}, ContentId: ${contentId.substring(0, 8)}...)`);
    } catch (error) {
      console.error(`  ❌ Bank migration hatası (${contentId}):`, error.message);
      skippedCount++;
    }
  }

  console.log(`\n  ✅ ${migratedCount} bank migrate edildi`);
  console.log(`  ⚠️  ${skippedCount} bank atlandı`);

  // Mapping'i return et
  return bankContentIdMapping;
}

async function migrateBankAccounts(bankAccounts) {
  console.log('\n💳 BankAccount migration başlıyor...');

  let migratedCount = 0;
  let skippedCount = 0;
  let duplicateIbanCount = 0;

  // IBAN tracking - duplicate'leri skip et
  const processedIbans = new Set();

  // ContentId bazında grupla (çok dilli)
  const accountsByContentId = {};
  bankAccounts.forEach(account => {
    const contentId = account.ContentId ? account.ContentId.toLowerCase() : null;
    if (!contentId) {
      skippedCount++;
      return;
    }
    if (!accountsByContentId[contentId]) {
      accountsByContentId[contentId] = [];
    }
    accountsByContentId[contentId].push(account);
  });

  for (const [contentId, accountRows] of Object.entries(accountsByContentId)) {
    try {
      const mainRow = accountRows[0];

      // IBAN kontrolü - duplicate ise skip et
      const iban = cleanString(mainRow.Iban) || 'UNKNOWN';
      if (processedIbans.has(iban)) {
        duplicateIbanCount++;
        skippedCount++;
        console.log(`   ⚠️  Duplicate IBAN skipped: ${iban}`);
        continue;
      }
      processedIbans.add(iban);

      // BankAccount oluştur (dil-bağımsız)
      const account = await prisma.bankAccount.create({
        data: {
          iban: cleanString(mainRow.Iban) || 'UNKNOWN',
          swift: cleanString(mainRow.SwiftCode),
          accountNumber: cleanString(mainRow.AccountNumber),
          branch: cleanString(mainRow.Branch),
          branchCode: cleanString(mainRow.BranchCode),
          currency: 'TRY', // ExchangeRate GUID'den çevrilecek (şimdilik TRY)
          isActive: parseBool(mainRow.IsActive),
          displayOrder: 0,
          createdAt: parseDate(mainRow.CreateDate) || new Date(),
          updatedAt: parseDate(mainRow.UpdateDate) || new Date(),
        },
      });

      // Her dil için translation ekle
      for (const row of accountRows) {
        const siteLanguageId = (row.SiteLanguageId || '').toString().toLowerCase().replace(/^n/, '');
        const language = LANGUAGE_MAP[siteLanguageId];

        if (!language) {
          console.log(`   ⚠️  Bilinmeyen dil: ${row.SiteLanguageId}, atlanıyor`);
          continue;
        }

        const accountName = cleanString(row.Title) || 'Bank Account';
        const bankName = extractBankName(accountName);

        await prisma.bankAccountTranslation.create({
          data: {
            accountId: account.id,
            language: language,
            accountName: accountName,
            bankName: bankName,
          },
        });

        console.log(`   ✅ Translation: ${language} - ${row.Title}`);
      }

      migratedCount++;
    } catch (error) {
      console.error(`  ❌ BankAccount migration hatası (${contentId}):`, error.message);
      skippedCount++;
    }
  }

  console.log(`\n  ✅ ${migratedCount} bank account migrate edildi`);
  console.log(`  ⚠️  ${skippedCount} bank account atlandı (${duplicateIbanCount} duplicate IBAN)`);
}

async function migrateBinCodes(binCodes, bankMapping) {
  console.log('\n🔢 BinCode migration başlıyor...');

  let migratedCount = 0;
  let skippedCount = 0;
  let noMappingCount = 0;

  // ContentId bazında grupla (ama BinCode için Title kullanıyoruz)
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
          console.log(`  ⚠️  BinCode ${binCodeValue} için Bank mapping bulunamadı (BankId: ${normalizedBankId ? normalizedBankId.substring(0, 8) + '...' : 'null'})`);
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
      // Unique constraint hatası
      if (error.code === 'P2002') {
        // BinCode zaten var, skip
        skippedCount++;
      } else {
        console.error(`  ❌ BinCode migration hatası (${contentId}):`, error.message);
        skippedCount++;
      }
    }
  }

  console.log(`\n  ✅ ${migratedCount} binCode migrate edildi`);
  console.log(`  ⚠️  ${skippedCount} binCode atlandı (${noMappingCount} mapping yok)`);
}

// Script'i çalıştır
if (require.main === module) {
  migrateAllTables()
    .then(() => {
      console.log('\n🎉 İşlem tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 İşlem başarısız:', error);
      process.exit(1);
    });
}

module.exports = { migrateAllTables };
