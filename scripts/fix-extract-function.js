const fs = require('fs');

let content = fs.readFileSync('migrate-all-tables.js', 'utf8');

// Line 138'deki regex'i düzelt
const oldLine = "  const bankName = accountName.replace(/s*d+s*$/, '').trim();";
const newLine = "  const bankName = accountName.replace(/\\s*\\d+\\s*$/, '').trim();";

content = content.replace(oldLine, newLine);

fs.writeFileSync('migrate-all-tables.js', content);

console.log('✅ Fixed extractBankName regex');
