const fs = require('fs');

let content = fs.readFileSync('C:/Temp/YeryuzuDoktorlari_Schema.sql', 'utf16le').replace(/\0/g, '');
const lines = content.split(/\r?\n/);

let inNews = false;
let columns = [];

for (let line of lines) {
  if (line.includes('YeryuzuDoktorlari_Plugin_News')) {
    inNews = true;
  }

  if (inNews && line.includes('[') && line.includes(']') && !line.includes('CONSTRAINT')) {
    const match = line.match(/\[([^\]]+)\]/);
    if (match) {
      columns.push(match[1]);
    }
  }

  if (inNews && line.includes('PRIMARY KEY')) {
    break;
  }
}

console.log('\n📋 YeryuzuDoktorlari_Plugin_News Columns:\n');
columns.forEach((c, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${c}`);
});
console.log(`\nTotal: ${columns.length} columns`);
