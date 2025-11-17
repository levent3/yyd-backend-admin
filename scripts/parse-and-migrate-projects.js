/**
 * Parse MSSQL INSERT script and migrate to PostgreSQL
 *
 * Bu script:
 * 1. MSSQL INSERT script'ini okur (C:\Temp\projects_insert.sql)
 * 2. Her INSERT satırını parse eder
 * 3. PostgreSQL'e uygun formata çevirir
 * 4. Project ve ProjectTranslation tablolarına ekler
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

async function parseAndMigrate() {
  try {
    console.log('📖 MSSQL INSERT script okunuyor...');
    let sqlContent = fs.readFileSync('C:\\Temp\\projects_insert.sql', 'utf16le'); // MSSQL UTF-16 LE encoding

    // UTF-16 LE dosyasında bazen ekstra boşluklar olabilir, temizle
    sqlContent = sqlContent.replace(/\0/g, ''); // Null bytes kaldır

    console.log('🔍 INSERT satırları parse ediliyor (satır satır)...');

    // Satır satır işle - büyük HTML içerikler için daha güvenli
    const lines = sqlContent.split(/\r?\n/);
    const projects = [];
    let columnsList = null;
    let valueBuffer = '';
    let inValues = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // INSERT satırını yakala
      const insertMatch = line.match(/INSERT\s+\[dbo\]\.\[YeryuzuDoktorlari_Project\]\s+\(([^)]+)\)\s+VALUES\s+\((.*)$/i);

      if (insertMatch) {
        // Eğer önceki INSERT varsa kaydet
        if (inValues && valueBuffer) {
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const projectData = {};
          columnsList.forEach((col, index) => {
            projectData[col] = values[index];
          });
          projects.push(projectData);
          if (projects.length % 10 === 0) {
            console.log(`  📝 ${projects.length} proje parse edildi...`);
          }
        }

        // Yeni INSERT için hazırlık
        columnsList = insertMatch[1].split(',').map(c => c.trim().replace(/\[|\]/g, ''));
        valueBuffer = insertMatch[2];
        inValues = true;

        // Eğer satır ) ile bitiyorsa, bu INSERT tek satırda tamamlandı
        if (valueBuffer.trim().endsWith(')')) {
          valueBuffer = valueBuffer.trim().slice(0, -1);
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const projectData = {};
          columnsList.forEach((col, index) => {
            projectData[col] = values[index];
          });
          projects.push(projectData);
          if (projects.length % 10 === 0) {
            console.log(`  📝 ${projects.length} proje parse edildi...`);
          }
          valueBuffer = '';
          inValues = false;
        }
      } else if (inValues) {
        // VALUES devam ediyor (multi-line content)
        valueBuffer += '\n' + line;

        // Eğer satır ) ile bitiyorsa, VALUES tamamlandı
        if (line.trim().endsWith(')')) {
          valueBuffer = valueBuffer.trim().slice(0, -1);
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const projectData = {};
          columnsList.forEach((col, index) => {
            projectData[col] = values[index];
          });
          projects.push(projectData);
          if (projects.length % 10 === 0) {
            console.log(`  📝 ${projects.length} proje parse edildi...`);
          }
          valueBuffer = '';
          inValues = false;
        }
      }
    }

    console.log(`\n📦 ${projects.length} proje parse edildi`);

    // ContentId bazında grupla
    const projectsByContentId = {};
    projects.forEach(proj => {
      const contentId = proj.ContentId.toLowerCase();
      if (!projectsByContentId[contentId]) {
        projectsByContentId[contentId] = [];
      }
      projectsByContentId[contentId].push(proj);
    });

    const uniqueProjects = Object.keys(projectsByContentId).length;
    console.log(`\n🎯 ${uniqueProjects} unique proje bulundu`);

    // PostgreSQL'e migrate et
    let migratedCount = 0;
    let skippedCount = 0;

    for (const [contentId, projectRows] of Object.entries(projectsByContentId)) {
      try {
        const mainRow = projectRows[0];

        console.log(`\n📝 Migrate ediliyor: ${mainRow.Title} (${projectRows.length} dil)`);

        // a) Project tablosuna ekle
        const project = await prisma.project.create({
          data: {
            imageUrl: cleanString(mainRow.ThumbnailImage || mainRow.Image),
            coverImage: cleanString(mainRow.Image),
            budget: parseFloat(mainRow.Budget || mainRow.TotalBudget || 0),
            targetAmount: parseFloat(mainRow.Budget || mainRow.TotalBudget || 0),
            startDate: parseDate(mainRow.StartDate),
            endDate: parseDate(mainRow.EndDate),
            displayOrder: parseInt(mainRow.OrderNo || 0),
            isFeatured: parseBool(mainRow.IsShowedHomePage),
            status: 'active',
            isActive: true,
            createdAt: parseDate(mainRow.CreateDate) || new Date(),
            updatedAt: parseDate(mainRow.UpdateDate) || new Date(),
          },
        });

        console.log(`   ✅ Project oluşturuldu: ID=${project.id}`);

        // b) Her dil için ProjectTranslation ekle
        for (const row of projectRows) {
          // SiteLanguageId'yi temizle ve lowercase yap
          const siteLanguageId = (row.SiteLanguageId || '').toString().toLowerCase().replace(/^n/, '');
          const language = LANGUAGE_MAP[siteLanguageId];

          if (!language) {
            console.log(`   ⚠️  Bilinmeyen dil: ${row.SiteLanguageId} (temizlenmiş: ${siteLanguageId}), atlanıyor`);
            continue;
          }

          await prisma.projectTranslation.create({
            data: {
              projectId: project.id,
              language: language,
              title: cleanString(row.Title),
              slug: cleanString(row.Slug) || `project-${project.id}-${language}`,
              description: cleanString(row.ThumbnailSummary),
              content: cleanString(row.Content),
            },
          });

          console.log(`   ✅ Translation eklendi: ${language} - ${row.Title}`);
        }

        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Hata: ${error.message}`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Migration tamamlandı!`);
    console.log(`   📊 Başarılı: ${migratedCount}`);
    console.log(`   ⚠️  Atlanan: ${skippedCount}`);

  } catch (error) {
    console.error('❌ Migration hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 PostgreSQL bağlantısı kapatıldı');
  }
}

// Helper: Geliştirilmiş VALUES parser - uzun HTML içerik için
function parseValuesImproved(valuesString, expectedCount) {
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = null; // ' veya "
  let depth = 0;
  let i = 0;

  while (i < valuesString.length) {
    const char = valuesString[i];
    const prevChar = i > 0 ? valuesString[i - 1] : '';
    const nextChar = i < valuesString.length - 1 ? valuesString[i + 1] : '';

    // String başlangıcı/bitişi kontrolü
    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        // String başlıyor
        inString = true;
        stringChar = char;
        current += char;
      } else if (char === stringChar) {
        // Çift quote kontrolü ('' escaped single quote)
        if (nextChar === stringChar) {
          // Escaped quote, devam et
          current += char + nextChar;
          i += 2;
          continue;
        } else {
          // String bitiyor
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

    // Parantez derinliği (sadece string dışında)
    if (!inString) {
      if (char === '(') depth++;
      if (char === ')') depth--;

      // Virgül bulundu ve string dışındayız, depth 0
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

  // Son değer
  if (current.trim()) {
    values.push(cleanValue(current.trim()));
  }

  // Eğer beklenen sayıda değer yoksa, eksik kalan değerleri null olarak ekle
  while (values.length < expectedCount) {
    values.push(null);
  }

  return values;
}

// Helper: VALUES içindeki değerleri parse et (eski versiyon - backup)
function parseValues(valuesString) {
  const values = [];
  let current = '';
  let inString = false;
  let depth = 0;

  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];

    if (char === "'" && valuesString[i - 1] !== '\\') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (char === ',' && depth === 0) {
        values.push(cleanValue(current.trim()));
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    values.push(cleanValue(current.trim()));
  }

  return values;
}

// Helper: Değeri temizle
function cleanValue(value) {
  if (value === 'NULL') return null;

  // CAST(N'...' AS DateTime) formatını parse et
  const castMatch = value.match(/CAST\s*\(\s*N'([^']+)'\s+AS\s+DateTime\s*\)/i);
  if (castMatch) {
    return castMatch[1];
  }

  // N'...' formatını temizle
  if (value.startsWith("N'") && value.endsWith("'")) {
    return value.slice(2, -1).replace(/''/g, "'");
  }

  // '...' formatını temizle
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }

  return value;
}

// Helper: String temizle
function cleanString(str) {
  if (!str || str === 'NULL') return null;
  return str.replace(/\r\n/g, '\n').trim();
}

// Helper: Tarih parse et
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NULL') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Helper: Boolean parse et
function parseBool(val) {
  if (val === null || val === 'NULL' || val === undefined) return false;
  return parseInt(val) === 1;
}

// Script'i çalıştır
if (require.main === module) {
  parseAndMigrate()
    .then(() => {
      console.log('\n🎉 İşlem başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 İşlem başarısız:', error);
      process.exit(1);
    });
}

module.exports = { parseAndMigrate };
