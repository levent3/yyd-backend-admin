const fs = require('fs');

// Aynı parse fonksiyonları
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

let sqlContent = fs.readFileSync('C:/Temp/news_insert.sql', 'utf16le').replace(/\0/g, '');
const lines = sqlContent.split(/\r?\n/);

let columnsList = null;
let valueBuffer = '';
let inValues = false;
let newsItems = [];

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
      valueBuffer = '';
      inValues = false;
    }
  }
}

// SiteLanguageId değerlerini topla
const languageIds = new Set();
newsItems.forEach(news => {
  if (news.SiteLanguageId) {
    languageIds.add(news.SiteLanguageId.toLowerCase());
  }
});

console.log('\n📋 MSSQL News SiteLanguageId Değerleri:\n');
Array.from(languageIds).forEach(id => {
  console.log(`  ${id}`);
});

console.log(`\nTotal unique language IDs: ${languageIds.size}`);

// Birkaç örnek göster
console.log('\n📝 Sample News Items:\n');
newsItems.slice(0, 5).forEach((news, i) => {
  console.log(`${i+1}. ${news.Title}`);
  console.log(`   SiteLanguageId: ${news.SiteLanguageId}`);
  console.log('');
});
