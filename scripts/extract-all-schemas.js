/**
 * Extract all table schemas from MSSQL
 */

const fs = require('fs');

let content = fs.readFileSync('C:/Temp/YeryuzuDoktorlari_Schema.sql', 'utf16le').replace(/\0/g, '');
const lines = content.split(/\r?\n/);

const tables = [
  'YeryuzuDoktorlari_Slider',
  'YeryuzuDoktorlari_Volunteer',
  'YeryuzuDoktorlari_Donation',
  'YeryuzuDoktorlari_ContactForm',
  'YeryuzuDoktorlari_Bank',
  'YeryuzuDoktorlari_BankAccountInformation',
  'YeryuzuDoktorlari_BankIdentificationNumber'
];

tables.forEach(tableName => {
  let inTable = false;
  let columns = [];

  for (let line of lines) {
    if (line.includes(`[${tableName}]`) && line.includes('CREATE TABLE')) {
      inTable = true;
      continue;
    }

    if (inTable && line.includes('[') && line.includes(']') && !line.includes('CONSTRAINT')) {
      const match = line.match(/\[([^\]]+)\]/);
      if (match) {
        columns.push(match[1]);
      }
    }

    if (inTable && line.includes('PRIMARY KEY')) {
      break;
    }
  }

  console.log(`\n📋 ${tableName}:`);
  console.log(`   Columns (${columns.length}):`);
  columns.forEach((c, i) => {
    console.log(`   ${(i+1).toString().padStart(2)}. ${c}`);
  });
});
