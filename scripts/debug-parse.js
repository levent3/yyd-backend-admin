const fs = require('fs');

const sqlContent = fs.readFileSync('C:\\Temp\\projects_insert.sql', 'utf16le');
const insertPattern = /INSERT\s+\[dbo\]\.\[YeryuzuDoktorlari_Project\]\s+\((.*?)\)\s+VALUES\s+\((.*?)\)/gis;

const matches = [...sqlContent.matchAll(insertPattern)];
console.log(`Found ${matches.length} INSERT statements\n`);

// İlk match'i detaylı incele
if (matches.length > 1) {
  const match = matches[1]; // İkinci satırı al (CHAD DONATION - içerik var)

  const columns = match[1].split(',').map(c => c.trim().replace(/\[|\]/g, ''));

  console.log('COLUMNS:');
  columns.forEach((col, i) => {
    console.log(`  ${i}: ${col}`);
  });

  console.log('\nColumn Indexes:');
  console.log('  Summary index:', columns.indexOf('Summary'));
  console.log('  Content index:', columns.indexOf('Content'));
  console.log('  Title index:', columns.indexOf('Title'));
}
