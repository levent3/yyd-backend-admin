const fs = require('fs');

// parseValuesImproved fonksiyonunu kopyala
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
        values.push(current.trim());
        current = '';
        i++;
        continue;
      }
    }

    current += char;
    i++;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  while (values.length < expectedCount) {
    values.push(null);
  }

  return values;
}

// Test
const sqlContent = fs.readFileSync('C:\\Temp\\projects_insert.sql', 'utf16le');
const lines = sqlContent.split('\n');

let found = false;
let valueBuffer = '';
let columnsList = null;

for (const line of lines) {
  const insertMatch = line.match(/INSERT\s+\[dbo\]\.\[YeryuzuDoktorlari_Project\]\s+\(([^)]+)\)\s+VALUES\s+\((.*)$/i);

  if (insertMatch && line.includes('CHAD DONATION')) {
    columnsList = insertMatch[1].split(',').map(c => c.trim().replace(/\[|\]/g, ''));
    valueBuffer = insertMatch[2];
    found = true;
  } else if (found) {
    valueBuffer += '\n' + line;
    if (line.trim().endsWith(')')) {
      valueBuffer = valueBuffer.trim().slice(0, -1);
      break;
    }
  }
}

if (found) {
  console.log('Columns Count:', columnsList.length);
  const values = parseValuesImproved(valueBuffer, columnsList.length);
  console.log('Values Count:', values.length);

  const summaryIndex = columnsList.indexOf('Summary');
  const contentIndex = columnsList.indexOf('Content');
  const titleIndex = columnsList.indexOf('Title');

  console.log('\nTitle:', values[titleIndex]);
  console.log('\nSummary (first 150 chars):');
  const summary = values[summaryIndex] || 'NULL';
  console.log(summary.substring(0, 150));

  console.log('\nContent (first 150 chars):');
  const content = values[contentIndex] || 'NULL';
  console.log(content.substring(0, 150));
}
