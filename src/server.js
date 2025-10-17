// src/server.js
const app = require('./app');
const config = require('./config'); // Henüz oluşturmadık, şimdi oluşturacağız.

const port = config.port;

app.listen(port, () => {
  console.log(`🚀 Sunucu http://localhost:${port} adresinde başarıyla başlatıldı.`);
});