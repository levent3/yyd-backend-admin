/**
 * List all MSSQL tables with their columns
 */

const fs = require('fs');

console.log('📖 Reading MSSQL Schema...\n');
let content = fs.readFileSync('C:/Temp/YeryuzuDoktorlari_Schema.sql', 'utf16le').replace(/\0/g, '');
const lines = content.split(/\r?\n/);

const tables = {};
let currentTable = null;
let inTable = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // CREATE TABLE satırını yakala
  const createMatch = line.match(/CREATE TABLE \[dbo\]\.\[([^\]]+)\]/);
  if (createMatch) {
    currentTable = createMatch[1];
    tables[currentTable] = [];
    inTable = true;
    continue;
  }

  // Kolon isimlerini yakala
  if (inTable && line.includes('[') && line.includes(']') && !line.includes('CONSTRAINT')) {
    const colMatch = line.match(/\[([^\]]+)\]\s+\[([^\]]+)\]/);
    if (colMatch) {
      const columnName = colMatch[1];
      const columnType = colMatch[2];
      tables[currentTable].push({ name: columnName, type: columnType });
    }
  }

  // Tablo bitişi
  if (inTable && line.includes('PRIMARY KEY')) {
    inTable = false;
  }
}

// Sadece YeryuzuDoktorlari ile başlayanları ve User, Role gibi önemli olanları göster
console.log('📊 MSSQL Database Tables:\n');
console.log('═'.repeat(80));

const sortedTables = Object.keys(tables).sort();

sortedTables.forEach(tableName => {
  const columns = tables[tableName];
  console.log(`\n📋 ${tableName} (${columns.length} columns)`);
  console.log('─'.repeat(80));

  columns.forEach((col, idx) => {
    console.log(`  ${(idx + 1).toString().padStart(2)}. ${col.name.padEnd(30)} [${col.type}]`);
  });
});

console.log('\n═'.repeat(80));
console.log(`\n✅ Total: ${Object.keys(tables).length} tables found`);
