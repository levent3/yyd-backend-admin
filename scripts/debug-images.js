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

// Test
let sqlContent = fs.readFileSync('C:\\Temp\\projects_insert.sql', 'utf16le');
sqlContent = sqlContent.replace(/\0/g, '');

const lines = sqlContent.split(/\r?\n/);

let columnsList = null;
let valueBuffer = '';
let inValues = false;
let projectCount = 0;

for (let i = 0; i < lines.length && projectCount < 3; i++) {
  const line = lines[i];

  const insertMatch = line.match(/INSERT\s+\[dbo\]\.\[YeryuzuDoktorlari_Project\]\s+\(([^)]+)\)\s+VALUES\s+\((.*)$/i);

  if (insertMatch) {
    if (inValues && valueBuffer) {
      // Parse previous
      const values = parseValuesImproved(valueBuffer, columnsList.length);

      const thumbnailImageIndex = columnsList.indexOf('ThumbnailImage');
      const imageIndex = columnsList.indexOf('Image');
      const titleIndex = columnsList.indexOf('Title');

      console.log(`\nProject ${projectCount + 1}:`);
      console.log('  Title:', cleanValue(values[titleIndex]));
      console.log('  ThumbnailImage:', cleanValue(values[thumbnailImageIndex]));
      console.log('  Image:', cleanValue(values[imageIndex]));

      projectCount++;
    }

    columnsList = insertMatch[1].split(',').map(c => c.trim().replace(/\[|\]/g, ''));
    valueBuffer = insertMatch[2];
    inValues = true;

    if (valueBuffer.trim().endsWith(')')) {
      valueBuffer = valueBuffer.trim().slice(0, -1);
      const values = parseValuesImproved(valueBuffer, columnsList.length);

      const thumbnailImageIndex = columnsList.indexOf('ThumbnailImage');
      const imageIndex = columnsList.indexOf('Image');
      const titleIndex = columnsList.indexOf('Title');

      console.log(`\nProject ${projectCount + 1}:`);
      console.log('  Title:', cleanValue(values[titleIndex]));
      console.log('  ThumbnailImage:', cleanValue(values[thumbnailImageIndex]));
      console.log('  Image:', cleanValue(values[imageIndex]));

      projectCount++;
      valueBuffer = '';
      inValues = false;
    }
  } else if (inValues) {
    valueBuffer += '\n' + line;

    if (line.trim().endsWith(')')) {
      valueBuffer = valueBuffer.trim().slice(0, -1);
      const values = parseValuesImproved(valueBuffer, columnsList.length);

      const thumbnailImageIndex = columnsList.indexOf('ThumbnailImage');
      const imageIndex = columnsList.indexOf('Image');
      const titleIndex = columnsList.indexOf('Title');

      console.log(`\nProject ${projectCount + 1}:`);
      console.log('  Title:', cleanValue(values[titleIndex]));
      console.log('  ThumbnailImage:', cleanValue(values[thumbnailImageIndex]));
      console.log('  Image:', cleanValue(values[imageIndex]));

      projectCount++;
      valueBuffer = '';
      inValues = false;
    }
  }
}

console.log('\n📊 Column Indexes:');
console.log('  ThumbnailImage:', columnsList.indexOf('ThumbnailImage'));
console.log('  Image:', columnsList.indexOf('Image'));
console.log('  Title:', columnsList.indexOf('Title'));
