/**
 * Parse MSSQL INSERT script and migrate News to PostgreSQL
 *
 * MSSQL: YeryuzuDoktorlari_Plugin_News
 * PostgreSQL: News + NewsTranslation
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
    console.log('📖 MSSQL News INSERT script okunuyor...');
    const isWindows = process.platform === 'win32';
    const filePath = isWindows ? 'C:\\Temp\\news_insert.sql' : '/tmp/news_insert.sql';
    let sqlContent = fs.readFileSync(filePath, 'utf16le');
    sqlContent = sqlContent.replace(/\0/g, '');

    console.log('🔍 INSERT satırları parse ediliyor (satır satır)...');

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
          if (newsItems.length % 10 === 0) {
            console.log(`  📝 ${newsItems.length} haber parse edildi...`);
          }
        }

        columnsList = insertMatch[1].split(',').map(c => c.trim().replace(/\[|\]/g, ''));
        valueBuffer = insertMatch[2];
        inValues = true;

        if (valueBuffer.trim().endsWith(')')) {
          valueBuffer = valueBuffer.trim().slice(0, -1);
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const newsData = {};
          columnsList.forEach((col, index) => {
            newsData[col] = values[index];
          });
          newsItems.push(newsData);
          if (newsItems.length % 10 === 0) {
            console.log(`  📝 ${newsItems.length} haber parse edildi...`);
          }
          valueBuffer = '';
          inValues = false;
        }
      } else if (inValues) {
        valueBuffer += '\n' + line;

        if (line.trim().endsWith(')')) {
          valueBuffer = valueBuffer.trim().slice(0, -1);
          const values = parseValuesImproved(valueBuffer, columnsList.length);
          const newsData = {};
          columnsList.forEach((col, index) => {
            newsData[col] = values[index];
          });
          newsItems.push(newsData);
          if (newsItems.length % 10 === 0) {
            console.log(`  📝 ${newsItems.length} haber parse edildi...`);
          }
          valueBuffer = '';
          inValues = false;
        }
      }
    }

    console.log(`\n📦 ${newsItems.length} haber parse edildi`);

    // ContentId bazında grupla
    const newsByContentId = {};
    newsItems.forEach(news => {
      const contentId = news.ContentId.toLowerCase();
      if (!newsByContentId[contentId]) {
        newsByContentId[contentId] = [];
      }
      newsByContentId[contentId].push(news);
    });

    const uniqueNews = Object.keys(newsByContentId).length;
    console.log(`\n🎯 ${uniqueNews} unique haber bulundu`);

    // PostgreSQL'e migrate et
    let migratedCount = 0;
    let skippedCount = 0;

    for (const [contentId, newsRows] of Object.entries(newsByContentId)) {
      try {
        const mainRow = newsRows[0];

        console.log(`\n📝 Migrate ediliyor: ${mainRow.Title} (${newsRows.length} dil)`);

        // a) News tablosuna ekle
        const news = await prisma.news.create({
          data: {
            imageUrl: cleanString(mainRow.Image),
            status: parseBool(mainRow.IsActive) ? 'published' : 'draft',
            publishedAt: parseDate(mainRow.PublishDate),
            createdAt: parseDate(mainRow.CreateDate) || new Date(),
            updatedAt: parseDate(mainRow.UpdateDate) || new Date(),
          },
        });

        console.log(`   ✅ News oluşturuldu: ID=${news.id}`);

        // b) Her dil için NewsTranslation ekle
        for (const row of newsRows) {
          const siteLanguageId = (row.SiteLanguageId || '').toString().toLowerCase().replace(/^n/, '');
          const language = LANGUAGE_MAP[siteLanguageId];

          if (!language) {
            console.log(`   ⚠️  Bilinmeyen dil: ${row.SiteLanguageId}, atlanıyor`);
            continue;
          }

          await prisma.newsTranslation.create({
            data: {
              newsId: news.id,
              language: language,
              title: cleanString(row.Title),
              slug: cleanString(row.Slug) || `news-${news.id}-${language}`,
              summary: cleanString(row.Summary),
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

// Helper: Geliştirilmiş VALUES parser
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

// Helper: Değeri temizle
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
