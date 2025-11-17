/**
 * Check Bank GUIDs in MSSQL data
 */

const fs = require('fs');

const content = fs.readFileSync('C:/Temp/all_tables_insert.sql', 'utf16le').replace(/\0/g, '');
const lines = content.split(/\r?\n/);

// YeryuzuDoktorlari_Bank tablosundaki INSERT'leri bul
const bankLines = lines.filter(l => l.includes('YeryuzuDoktorlari_Bank') && l.includes('INSERT'));

console.log('📊 MSSQL Bank Tablosu:\n');

// İlk 15 bank kaydını göster
bankLines.slice(0, 15).forEach((line, idx) => {
  const match = line.match(/VALUES\s*\(([^)]+)\)/i);
  if (match) {
    const values = match[1].split(',').map(v => v.trim().replace(/^N'|'$/g, ''));
    // Bank tablosu: Id, ContentId, SiteLanguageId, Title, Slug, ...
    console.log(`Bank ${idx + 1}:`);
    console.log(`  ContentId: ${values[1]}`);
    console.log(`  Title: ${values[3]}`);
    console.log('');
  }
});
