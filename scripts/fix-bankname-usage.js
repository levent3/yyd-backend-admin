const fs = require('fs');

let content = fs.readFileSync('migrate-all-tables.js', 'utf8');

// Line 571'deki bankName atamasını düzelt
const oldBlock = `        await prisma.bankAccountTranslation.create({
          data: {
            accountId: account.id,
            language: language,
            accountName: cleanString(row.Title) || 'Bank Account',
            bankName: cleanString(row.Bank) || 'Unknown Bank',
          },
        });`;

const newBlock = `        const accountName = cleanString(row.Title) || 'Bank Account';
        const bankName = extractBankName(accountName);

        await prisma.bankAccountTranslation.create({
          data: {
            accountId: account.id,
            language: language,
            accountName: accountName,
            bankName: bankName,
          },
        });`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('migrate-all-tables.js', content);

console.log('✅ Fixed bankName extraction usage');
