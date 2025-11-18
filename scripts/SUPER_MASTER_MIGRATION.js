/**
 * SUPER MASTER MIGRATION SCRIPT
 *
 * Tüm MSSQL verilerini PostgreSQL'e migrate eder.
 *
 * Sıralama:
 * 1. Projects (YeryuzuDoktorlari_Project) → Project + ProjectTranslation
 * 2. News (YeryuzuDoktorlari_Plugin_News) → News + NewsTranslation
 * 3. Diğer Tablolar:
 *    - Slider → HomeSlider
 *    - Volunteer → Volunteer
 *    - Donation → Donation
 *    - ContactForm → ContactMessage
 *    - Bank → Bank
 *    - BankAccountInformation → BankAccount
 *    - BankIdentificationNumber → BinCode
 *
 * Kullanım:
 * - Windows: node scripts/SUPER_MASTER_MIGRATION.js
 * - Linux: node scripts/SUPER_MASTER_MIGRATION.js
 *
 * Gerekli Dosyalar:
 * - Windows: C:\Temp\projects_insert.sql, C:\Temp\news_insert.sql, C:\Temp\all_tables_insert.sql
 * - Linux: /tmp/projects_insert.sql, /tmp/news_insert.sql, /tmp/all_tables_insert.sql
 */

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Platform-specific paths
const isWindows = process.platform === 'win32';
const TEMP_DIR = isWindows ? 'C:\\Temp' : '/tmp';

const FILES = {
  projects: `${TEMP_DIR}${isWindows ? '\\' : '/'}projects_insert.sql`,
  news: `${TEMP_DIR}${isWindows ? '\\' : '/'}news_insert.sql`,
  all: `${TEMP_DIR}${isWindows ? '\\' : '/'}all_tables_insert.sql`,
};

// Dil Mapping
const LANGUAGE_MAP = {
  'bf2689d9-071e-4a20-9450-b1dbdd39778f': 'tr',
  '7c35f456-9403-4c21-80b6-941129d14086': 'en',
  '8fab2bf3-f2e1-4d54-b668-8dd588575fe4': 'ar',
};

// ============= HELPER FUNCTIONS =============

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

function extractBankName(accountName) {
  if (!accountName) return 'Unknown Bank';
  const bankName = accountName.replace(/\s*\d+\s*$/, '').trim();
  return bankName || accountName;
}

// ============= MIGRATION 1: PROJECTS =============

async function migrateProjects() {
  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│   1/3 PROJECTS MIGRATION BAŞLIYOR      │');
  console.log('└─────────────────────────────────────────┘\n');

  try {
    console.log(`📖 Reading: ${FILES.projects}`);
    if (!fs.existsSync(FILES.projects)) {
      throw new Error(`❌ Dosya bulunamadı: ${FILES.projects}`);
    }

    let sqlContent = fs.readFileSync(FILES.projects, 'utf16le');
    sqlContent = sqlContent.replace(/\0/g, '');

    console.log('🔍 Parsing INSERT statements...\n');

    const lines = sqlContent.split(/\r?\n/);
    const projects = [];
    let columnsList = null;
    let valueBuffer = '';
    let inValues = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const insertMatch = line.match(/INSERT\s+\[dbo\]\.\[YeryuzuDoktorlari_Project\]\s+\(([^)]+)\)\s+VALUES\s+\((.*)$/i);

      if (insertMatch) {
        if (inValues && valueBuffer) {
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const projectData = {};
          columnsList.forEach((col, index) => {
            projectData[col] = values[index];
          });
          projects.push(projectData);
        }

        columnsList = insertMatch[1].split(',').map(c => c.trim().replace(/[\[\]]/g, ''));
        valueBuffer = insertMatch[2];
        inValues = true;

        if (valueBuffer.endsWith(')')) {
          const finalValues = parseValuesImproved(valueBuffer.slice(0, -1), columnsList.length);
          const projectData = {};
          columnsList.forEach((col, index) => {
            projectData[col] = finalValues[index];
          });
          projects.push(projectData);
          inValues = false;
          valueBuffer = '';
        }
      } else if (inValues) {
        valueBuffer += '\n' + line;
        if (line.trim().endsWith(')')) {
          const finalValues = parseValuesImproved(valueBuffer.slice(0, -1), columnsList.length);
          const projectData = {};
          columnsList.forEach((col, index) => {
            projectData[col] = finalValues[index];
          });
          projects.push(projectData);
          inValues = false;
          valueBuffer = '';
        }
      }
    }

    console.log(`✅ ${projects.length} projects parsed\n`);
    console.log('💾 Migrating to PostgreSQL...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const proj of projects) {
      try {
        const language = LANGUAGE_MAP[proj.LanguageId] || 'tr';

        await prisma.project.create({
          data: {
            guid: proj.Id,
            slug: cleanString(proj.Slug) || `project-${proj.Id.substring(0, 8)}`,
            thumbnail: cleanString(proj.Thumbnail),
            coverImage: cleanString(proj.CoverImage),
            videoUrl: cleanString(proj.VideoUrl),
            isActive: parseBool(proj.IsActive),
            isFeatured: parseBool(proj.IsFeatured),
            displayOrder: parseInt32(proj.DisplayOrder) || 0,
            translations: {
              create: {
                language,
                title: cleanString(proj.Title) || 'Untitled Project',
                description: cleanString(proj.Description),
                content: cleanString(proj.Content),
              }
            },
            createdAt: parseDate(proj.CreatedOn) || new Date(),
            updatedAt: parseDate(proj.ModifiedOn) || new Date(),
          }
        });

        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✓ ${successCount}/${projects.length} projects migrated...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Error migrating project ${proj.Id}: ${error.message}`);
      }
    }

    console.log(`\n✅ Projects Migration Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}\n`);

  } catch (error) {
    console.error('❌ Projects Migration Failed:', error.message);
    throw error;
  }
}

// ============= MIGRATION 2: NEWS =============

async function migrateNews() {
  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│     2/3 NEWS MIGRATION BAŞLIYOR        │');
  console.log('└─────────────────────────────────────────┘\n');

  try {
    console.log(`📖 Reading: ${FILES.news}`);
    if (!fs.existsSync(FILES.news)) {
      throw new Error(`❌ Dosya bulunamadı: ${FILES.news}`);
    }

    let sqlContent = fs.readFileSync(FILES.news, 'utf16le');
    sqlContent = sqlContent.replace(/\0/g, '');

    console.log('🔍 Parsing INSERT statements...\n');

    const lines = sqlContent.split(/\r?\n/);
    const newsItems = [];
    let columnsList = null;
    let valueBuffer = '';
    let inValues = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const insertMatch = line.match(/INSERT\s+\[dbo\]\.\[YeryuzuDoktorlari_Plugin_News\]\s+\(([^)]+)\)\s+VALUES\s+\((.*)$/i);

      if (insertMatch) {
        if (inValues && valueBuffer) {
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const newsData = {};
          columnsList.forEach((col, index) => {
            newsData[col] = values[index];
          });
          newsItems.push(newsData);
        }

        columnsList = insertMatch[1].split(',').map(c => c.trim().replace(/[\[\]]/g, ''));
        valueBuffer = insertMatch[2];
        inValues = true;

        if (valueBuffer.endsWith(')')) {
          const finalValues = parseValuesImproved(valueBuffer.slice(0, -1), columnsList.length);
          const newsData = {};
          columnsList.forEach((col, index) => {
            newsData[col] = finalValues[index];
          });
          newsItems.push(newsData);
          inValues = false;
          valueBuffer = '';
        }
      } else if (inValues) {
        valueBuffer += '\n' + line;
        if (line.trim().endsWith(')')) {
          const finalValues = parseValuesImproved(valueBuffer.slice(0, -1), columnsList.length);
          const newsData = {};
          columnsList.forEach((col, index) => {
            newsData[col] = finalValues[index];
          });
          newsItems.push(newsData);
          inValues = false;
          valueBuffer = '';
        }
      }
    }

    console.log(`✅ ${newsItems.length} news items parsed\n`);
    console.log('💾 Migrating to PostgreSQL...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const news of newsItems) {
      try {
        const language = LANGUAGE_MAP[news.LanguageId] || 'tr';

        await prisma.news.create({
          data: {
            guid: news.Id,
            slug: cleanString(news.Slug) || `news-${news.Id.substring(0, 8)}`,
            thumbnail: cleanString(news.Thumbnail),
            isActive: parseBool(news.IsActive),
            displayOrder: parseInt32(news.DisplayOrder) || 0,
            translations: {
              create: {
                language,
                title: cleanString(news.Title) || 'Untitled News',
                summary: cleanString(news.Summary),
                content: cleanString(news.Content),
              }
            },
            createdAt: parseDate(news.CreatedOn) || new Date(),
            updatedAt: parseDate(news.ModifiedOn) || new Date(),
          }
        });

        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✓ ${successCount}/${newsItems.length} news migrated...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Error migrating news ${news.Id}: ${error.message}`);
      }
    }

    console.log(`\n✅ News Migration Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}\n`);

  } catch (error) {
    console.error('❌ News Migration Failed:', error.message);
    throw error;
  }
}

// ============= MIGRATION 3: OTHER TABLES =============

async function migrateOtherTables() {
  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│   3/3 OTHER TABLES MIGRATION BAŞLIYOR  │');
  console.log('└─────────────────────────────────────────┘\n');

  try {
    console.log(`📖 Reading: ${FILES.all}`);
    if (!fs.existsSync(FILES.all)) {
      throw new Error(`❌ Dosya bulunamadı: ${FILES.all}`);
    }

    let sqlContent = fs.readFileSync(FILES.all, 'utf16le');
    sqlContent = sqlContent.replace(/\0/g, '');

    console.log('🔍 Parsing INSERT statements...\n');

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

      // Detect table
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

        columnsList = insertMatch[2].split(',').map(c => c.trim().replace(/[\[\]]/g, ''));
        valueBuffer = insertMatch[3];
        inValues = true;

        if (valueBuffer.endsWith(')')) {
          const finalValues = parseValuesImproved(valueBuffer.slice(0, -1), columnsList.length);
          const itemData = {};
          columnsList.forEach((col, index) => {
            itemData[col] = finalValues[index];
          });
          if (currentTable) {
            allItems[currentTable].push(itemData);
          }
          inValues = false;
          valueBuffer = '';
        }
      } else if (inValues) {
        valueBuffer += '\n' + line;
        if (line.trim().endsWith(')')) {
          const finalValues = parseValuesImproved(valueBuffer.slice(0, -1), columnsList.length);
          const itemData = {};
          columnsList.forEach((col, index) => {
            itemData[col] = finalValues[index];
          });
          if (currentTable) {
            allItems[currentTable].push(itemData);
          }
          inValues = false;
          valueBuffer = '';
        }
      }
    }

    console.log('✅ Parsing complete:\n');
    console.log(`   Slider: ${allItems.slider.length}`);
    console.log(`   Volunteer: ${allItems.volunteer.length}`);
    console.log(`   Donation: ${allItems.donation.length}`);
    console.log(`   ContactForm: ${allItems.contactForm.length}`);
    console.log(`   Bank: ${allItems.bank.length}`);
    console.log(`   BankAccount: ${allItems.bankAccount.length}`);
    console.log(`   BinCode: ${allItems.binCode.length}\n`);

    // Migrate HomeSlider
    console.log('📸 Migrating Sliders...');
    let sliderCount = 0;
    for (const item of allItems.slider) {
      try {
        const language = LANGUAGE_MAP[item.LanguageId] || 'tr';
        await prisma.homeSlider.create({
          data: {
            guid: item.Id,
            imageUrl: cleanString(item.ImageUrl),
            isActive: parseBool(item.IsActive),
            displayOrder: parseInt32(item.DisplayOrder) || 0,
            translations: {
              create: {
                language,
                title: cleanString(item.Title),
                description: cleanString(item.Description),
                buttonText: cleanString(item.ButtonText),
                buttonLink: cleanString(item.ButtonLink),
              }
            },
            createdAt: parseDate(item.CreatedOn) || new Date(),
          }
        });
        sliderCount++;
      } catch (error) {
        console.error(`  ✗ Slider error: ${error.message}`);
      }
    }
    console.log(`✅ ${sliderCount}/${allItems.slider.length} sliders migrated\n`);

    // Migrate Volunteers
    console.log('👥 Migrating Volunteers...');
    let volunteerCount = 0;
    for (const item of allItems.volunteer) {
      try {
        await prisma.volunteer.create({
          data: {
            guid: item.Id,
            fullName: cleanString(item.FullName) || 'Unknown',
            email: cleanString(item.Email),
            phone: cleanString(item.Phone),
            address: cleanString(item.Address),
            city: cleanString(item.City),
            country: cleanString(item.Country),
            birthDate: parseDate(item.BirthDate),
            profession: cleanString(item.Profession),
            skills: cleanString(item.Skills),
            experience: cleanString(item.Experience),
            motivation: cleanString(item.Motivation),
            availability: cleanString(item.Availability),
            isApproved: parseBool(item.IsApproved),
            createdAt: parseDate(item.CreatedOn) || new Date(),
          }
        });
        volunteerCount++;
      } catch (error) {
        console.error(`  ✗ Volunteer error: ${error.message}`);
      }
    }
    console.log(`✅ ${volunteerCount}/${allItems.volunteer.length} volunteers migrated\n`);

    // Migrate Donations
    console.log('💰 Migrating Donations...');
    let donationCount = 0;
    for (const item of allItems.donation) {
      try {
        await prisma.donation.create({
          data: {
            guid: item.Id,
            donorName: cleanString(item.DonorName),
            donorEmail: cleanString(item.DonorEmail),
            donorPhone: cleanString(item.DonorPhone),
            amount: parseFloat64(item.Amount) || 0,
            currency: cleanString(item.Currency) || 'TRY',
            paymentMethod: cleanString(item.PaymentMethod),
            transactionId: cleanString(item.TransactionId),
            status: cleanString(item.Status) || 'pending',
            message: cleanString(item.Message),
            isAnonymous: parseBool(item.IsAnonymous),
            createdAt: parseDate(item.CreatedOn) || new Date(),
          }
        });
        donationCount++;
      } catch (error) {
        console.error(`  ✗ Donation error: ${error.message}`);
      }
    }
    console.log(`✅ ${donationCount}/${allItems.donation.length} donations migrated\n`);

    // Migrate ContactForms
    console.log('📧 Migrating Contact Messages...');
    let contactCount = 0;
    for (const item of allItems.contactForm) {
      try {
        await prisma.contactMessage.create({
          data: {
            guid: item.Id,
            fullName: cleanString(item.FullName) || 'Unknown',
            email: cleanString(item.Email),
            phone: cleanString(item.Phone),
            subject: cleanString(item.Subject),
            message: cleanString(item.Message) || '',
            isRead: parseBool(item.IsRead),
            createdAt: parseDate(item.CreatedOn) || new Date(),
          }
        });
        contactCount++;
      } catch (error) {
        console.error(`  ✗ Contact error: ${error.message}`);
      }
    }
    console.log(`✅ ${contactCount}/${allItems.contactForm.length} contact messages migrated\n`);

    // Migrate Banks
    console.log('🏦 Migrating Banks...');
    let bankCount = 0;
    for (const item of allItems.bank) {
      try {
        await prisma.bank.create({
          data: {
            guid: item.Id,
            name: cleanString(item.Name) || 'Unknown Bank',
            code: cleanString(item.Code),
            swiftCode: cleanString(item.SwiftCode),
            isActive: parseBool(item.IsActive),
            createdAt: parseDate(item.CreatedOn) || new Date(),
          }
        });
        bankCount++;
      } catch (error) {
        console.error(`  ✗ Bank error: ${error.message}`);
      }
    }
    console.log(`✅ ${bankCount}/${allItems.bank.length} banks migrated\n`);

    // Migrate BankAccounts
    console.log('💳 Migrating Bank Accounts...');
    let bankAccountCount = 0;
    for (const item of allItems.bankAccount) {
      try {
        const bankName = extractBankName(cleanString(item.AccountName));
        let bank = await prisma.bank.findFirst({ where: { name: bankName } });

        if (!bank) {
          bank = await prisma.bank.create({
            data: {
              name: bankName,
              isActive: true,
            }
          });
        }

        const language = LANGUAGE_MAP[item.LanguageId] || 'tr';

        await prisma.bankAccount.create({
          data: {
            guid: item.Id,
            bankId: bank.id,
            accountName: cleanString(item.AccountName) || 'Unknown Account',
            iban: cleanString(item.IBAN),
            accountNumber: cleanString(item.AccountNumber),
            branch: cleanString(item.Branch),
            currency: cleanString(item.Currency) || 'TRY',
            isActive: parseBool(item.IsActive),
            displayOrder: parseInt32(item.DisplayOrder) || 0,
            translations: {
              create: {
                language,
                accountName: cleanString(item.AccountName) || 'Unknown Account',
              }
            },
            createdAt: parseDate(item.CreatedOn) || new Date(),
          }
        });
        bankAccountCount++;
      } catch (error) {
        console.error(`  ✗ BankAccount error: ${error.message}`);
      }
    }
    console.log(`✅ ${bankAccountCount}/${allItems.bankAccount.length} bank accounts migrated\n`);

    // Migrate BinCodes
    console.log('🔢 Migrating BIN Codes...');
    let binCodeCount = 0;
    for (const item of allItems.binCode) {
      try {
        await prisma.binCode.create({
          data: {
            guid: item.Id,
            binNumber: cleanString(item.BinNumber) || '000000',
            cardType: cleanString(item.CardType),
            cardBrand: cleanString(item.CardBrand),
            bankName: cleanString(item.BankName),
            isActive: parseBool(item.IsActive),
            createdAt: parseDate(item.CreatedOn) || new Date(),
          }
        });
        binCodeCount++;
      } catch (error) {
        console.error(`  ✗ BinCode error: ${error.message}`);
      }
    }
    console.log(`✅ ${binCodeCount}/${allItems.binCode.length} bin codes migrated\n`);

    console.log('✅ Other Tables Migration Complete!\n');

  } catch (error) {
    console.error('❌ Other Tables Migration Failed:', error.message);
    throw error;
  }
}

// ============= MAIN FUNCTION =============

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     SUPER MASTER MIGRATION - MSSQL → PostgreSQL           ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Dosyaları kontrol et
  console.log('📋 Checking required files...\n');
  const missingFiles = [];
  for (const [key, path] of Object.entries(FILES)) {
    if (fs.existsSync(path)) {
      const stats = fs.statSync(path);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   ✓ ${key.padEnd(12)} : ${path} (${sizeMB} MB)`);
    } else {
      console.log(`   ✗ ${key.padEnd(12)} : ${path} (MISSING)`);
      missingFiles.push(path);
    }
  }

  if (missingFiles.length > 0) {
    console.error('\n❌ Missing files! Please copy the following files:\n');
    missingFiles.forEach(f => console.error(`   - ${f}`));
    console.error('\n');
    process.exit(1);
  }

  console.log('\n✅ All files found!\n');

  const startTime = Date.now();

  try {
    // 1. Projects
    await migrateProjects();

    // 2. News
    await migrateNews();

    // 3. Other Tables
    await migrateOtherTables();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║              ✨ MIGRATION COMPLETED! ✨                   ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n⏱️  Duration: ${duration} seconds\n`);

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
