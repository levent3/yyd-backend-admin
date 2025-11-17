function extractBankName(accountName) {
  if (!accountName) return 'Unknown Bank';
  const bankName = accountName.replace(/\s*\d+\s*$/, '').trim();
  return bankName || accountName;
}

console.log('Test 1:', extractBankName('Kuveyt Türk 1'));
console.log('Test 2:', extractBankName('Ziraat Bankası 2'));
console.log('Test 3:', extractBankName('AlBaraka3'));
console.log('Test 4:', extractBankName('Akbank1'));
