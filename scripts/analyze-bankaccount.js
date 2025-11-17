const fs = require('fs');

const content = fs.readFileSync('C:/Temp/all_tables_insert.sql', 'utf16le').replace(/\0/g, '');
const lines = content.split(/\r?\n/);

const bankAccountLines = lines.filter(l => l.includes('YeryuzuDoktorlari_BankAccountInformation')).slice(0, 5);

console.log('📊 MSSQL BankAccountInformation Analizi:\n');

bankAccountLines.forEach((line, i) => {
  console.log(`\n--- Bank Account ${i+1} ---`);
  const match = line.match(/VALUES \((.*?)\)(?:,|\s*$)/);
  if (match) {
    const values = match[1].split(',').map(v => v.trim());
    console.log('Title (values[1]):', values[1]);
    console.log('Bank (values[2]):', values[2]);
    console.log('IBAN (values[3]):', values[3]);
    console.log('AccountNumber (values[4]):', values[4]);
    console.log('SiteLanguageId (values[12]):', values[12]);
  }
});
