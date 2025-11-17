const fs = require('fs');

// parseValues fonksiyonu
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

const sqlContent = fs.readFileSync('C:\\Temp\\projects_insert.sql', 'utf16le');
const insertPattern = /INSERT\s+\[dbo\]\.\[YeryuzuDoktorlari_Project\]\s+\((.*?)\)\s+VALUES\s+\((.*?)\)/gis;

const matches = [...sqlContent.matchAll(insertPattern)];

// İkinci satırı parse et (CHAD DONATION - içerik var)
if (matches.length > 1) {
  const match = matches[1];
  const columns = match[1].split(',').map(c => c.trim().replace(/\[|\]/g, ''));
  const values = parseValues(match[2]);

  console.log('Parsed Values Count:', values.length);
  console.log('Columns Count:', columns.length);

  const summaryIndex = columns.indexOf('Summary');
  const contentIndex = columns.indexOf('Content');
  const titleIndex = columns.indexOf('Title');

  console.log('\nTitle:', values[titleIndex]);
  console.log('\nSummary (first 100 chars):');
  console.log(values[summaryIndex] ? values[summaryIndex].substring(0, 100) : 'NULL');
  console.log('\nContent (first 100 chars):');
  console.log(values[contentIndex] ? values[contentIndex].substring(0, 100) : 'NULL');
}
