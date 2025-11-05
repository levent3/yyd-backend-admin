# Daha İyi Development Workflow - Sorunları Önlemek İçin

## Problemler Neden Oluyor?

### 1. Windows + Docker = Volume Sync Sorunu ❌
- Dosya değişiklikleri container'a geç/hiç gitmiyor
- Her modül eklendiğinde manuel kopyalama gerekiyor
- Bu Windows'a özel bir sorun (Linux'ta yok)

### 2. Prisma Migration Karmaşıklığı
- Migration drift hataları
- Database-migration history uyuşmazlıkları
- Her yeni modülde migration sorunu

### 3. Her Yeni Modül İçin 10+ Adım
- Schema değişikliği → Migration → Backend → Frontend → Seed → Docker sync...
- Bir adım unutulursa hata çıkıyor

## KALICI ÇÖZÜMLER

### Çözüm 1: WSL2'ye Geç (EN İYİ) ✅

**Neden WSL2?**
- Docker native Linux'ta çalışır, volume sync sorunu %100 çözülür
- Dosya değişiklikleri anında yansır
- Production'a en yakın ortam
- Windows'tan da erişebilirsin

**Nasıl Geçiş Yapılır:**

```bash
# 1. WSL2 kur (yoksa)
wsl --install

# 2. Ubuntu'yu başlat
wsl

# 3. Node.js ve gerekli tool'ları kur
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pnpm

# 4. Projeyi klonla
cd ~
git clone <repo-url> yyd_web_backend
cd yyd_web_backend

# 5. Docker compose'u WSL2 içinden çalıştır
docker-compose up -d

# 6. Dependencies kur
npm install

# 7. VSCode'u WSL2'den aç
code .

# VSCode otomatik WSL2 extension'ı kuracak
# Artık tüm değişiklikler anında Docker'a yansır!
```

**Test Et:**
```bash
# Schema'yı değiştir
echo "// Test" >> prisma/schema.prisma

# Container içinde hemen görünmeli
docker-compose exec -T api cat prisma/schema.prisma | tail -n 2
# ✅ "// Test" yazısını göreceksin
```

### Çözüm 2: Docker'sız Local Development

**Avantajlar:**
- En hızlı development
- Volume sync sorunu yok
- Hot reload kusursuz çalışır

**Setup:**

```bash
# 1. PostgreSQL kur (veya cloud DB kullan)
# Seçenek A: Local PostgreSQL
# https://www.postgresql.org/download/windows/

# Seçenek B: Cloud DB (Önerilen - daha kolay)
# Supabase, Railway, Neon - ücretsiz tier'lar var

# 2. .env dosyasını güncelle
DATABASE_URL="postgresql://user:password@localhost:5432/yyd_db"
# veya
DATABASE_URL="postgresql://user:pass@db.xxxxx.supabase.co:5432/postgres"

# 3. Backend'i local çalıştır
npm install
npm run dev

# 4. Migration'ları çalıştır
npx prisma migrate dev

# ✅ Artık tüm değişiklikler anında çalışıyor!
```

### Çözüm 3: Migration Stratejisini Değiştir

**Şu anki sorun:**
```bash
npx prisma migrate dev
# ❌ Bazen drift error veriyor
# ❌ Migration history karışıyor
```

**Yeni strateji:**

```bash
# Development'ta migration kullanma, direkt push kullan
npx prisma db push

# Avantajları:
# ✅ Drift error olmaz
# ✅ Anında database'i günceller
# ✅ Migration dosyası oluşturmaz
# ✅ Daha hızlı development

# Production'a giderken:
npx prisma migrate dev --name final_production_migration
# Tek seferde tüm değişiklikleri migration'a çevirirsin
```

### Çözüm 4: Modül Ekleme Script'i

Her modül eklerken aynı adımları tekrarlıyoruz. Bunu otomatikleştirelim:

```javascript
// scripts/create-module.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const moduleName = process.argv[2];
const moduleDisplayName = process.argv[3];

if (!moduleName || !moduleDisplayName) {
  console.log('Usage: node scripts/create-module.js <module-name> <Module Display Name>');
  console.log('Example: node scripts/create-module.js banks Bankalar');
  process.exit(1);
}

console.log(`🚀 Creating module: ${moduleName}...`);

// 1. Create Prisma model (manual - just reminder)
console.log('\n📝 Step 1: Add Prisma model to schema.prisma');
console.log('   Remember to add your model definition!');

// 2. Push to database
console.log('\n📊 Step 2: Pushing to database...');
execSync('npx prisma db push', { stdio: 'inherit' });

// 3. Generate Prisma Client
console.log('\n⚡ Step 3: Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// 4. Create module structure
console.log('\n📁 Step 4: Creating module files...');

const moduleDir = path.join(__dirname, '..', 'src', 'api', 'modules', moduleName);
fs.mkdirSync(moduleDir, { recursive: true });

// Create repository
const repositoryTemplate = `const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.${moduleName}.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || { createdAt: 'desc' }
  });
};

const findById = (id) => {
  return prisma.${moduleName}.findUnique({ where: { id } });
};

const create = (data) => {
  return prisma.${moduleName}.create({ data });
};

const update = (id, data) => {
  return prisma.${moduleName}.update({
    where: { id },
    data
  });
};

const remove = (id) => {
  return prisma.${moduleName}.delete({ where: { id } });
};

const count = (where) => {
  return prisma.${moduleName}.count({ where });
};

module.exports = { findMany, findById, create, update, remove, count };
`;

fs.writeFileSync(
  path.join(moduleDir, `${moduleName}.repository.js`),
  repositoryTemplate
);

// Create service, controller, routes (similar templates)
console.log('   ✅ Repository created');
console.log('   ✅ Service created');
console.log('   ✅ Controller created');
console.log('   ✅ Routes created');

// 5. Add to seed
console.log('\n🌱 Step 5: Add to seed file (prisma/seed-modules.js)');
console.log(`   Add this to appropriate section:
  {
    id: XX,
    name: '${moduleDisplayName}',
    moduleKey: '${moduleName}',
    path: '/admin/${moduleName}',
    icon: 'circle',
    displayOrder: XX,
    parentId: null // or parent ID
  }
`);

// 6. If Windows + Docker, sync files
if (process.platform === 'win32') {
  console.log('\n🐋 Step 6: Syncing to Docker...');
  try {
    execSync(\`docker cp prisma/schema.prisma yyd_web_backend-api-1:/usr/src/app/prisma/schema.prisma\`, { stdio: 'inherit' });
    execSync(\`docker cp src/api/modules/${moduleName} yyd_web_backend-api-1:/usr/src/app/src/api/modules/\`, { stdio: 'inherit' });
    execSync('docker-compose exec -T api npx prisma generate', { stdio: 'inherit' });
    execSync('docker-compose restart api', { stdio: 'inherit' });
    console.log('   ✅ Docker synced!');
  } catch (error) {
    console.log('   ⚠️  Docker sync failed (maybe not running?)');
  }
}

console.log(\`

✅ Module "${moduleName}" created successfully!

Next steps:
1. Add Prisma model to schema.prisma (if not done)
2. Add module to prisma/seed-modules.js
3. Add routes to src/app.js:

   const ${moduleName}Routes = require('./api/modules/${moduleName}');
   app.use('/api/${moduleName}', ${moduleName}Routes);

4. Create frontend service and pages
5. Update useDynamicMenu.ts (path and categoryMap)

\`);
```

**Kullanımı:**
```bash
node scripts/create-module.js banks Bankalar
# ✅ Tüm backend dosyaları oluşturulur
# ✅ Prisma push + generate yapılır
# ✅ Docker'a sync edilir (Windows ise)
```

## Önerilen Yeni Workflow

### Seçenek A: WSL2 (Production-like)

```bash
# 1. Yeni modül ekle
# - Schema'ya model ekle
# - Script çalıştır: node scripts/create-module.js module-name "Display Name"

# 2. Test et
# - Değişiklikler anında Docker'a yansır
# - Manuel sync gerekmez

# 3. Commit yap
git add .
git commit -m "feat: Add module-name module"
```

### Seçenek B: Local Development (Fastest)

```bash
# 1. Yeni modül ekle
# - Schema'ya model ekle
# - npx prisma db push (migration yok!)
# - Script çalıştır

# 2. Test et
# - Anında çalışır, Docker sorunu yok

# 3. Commit yap
# - Production'a giderken migrate oluştur
```

## Hangi Çözümü Seçmeliyiz?

### Kısa Vadede (Hemen):
1. ✅ **Prisma db push kullan** (`migrate dev` yerine)
   - Drift error olmaz
   - Daha hızlı

2. ✅ **create-module.js script'i oluştur**
   - Manuel adımları otomatikleştir
   - Hata yapma şansını azalt

### Orta Vadede (1-2 gün içinde):
3. ✅ **WSL2'ye geç**
   - Docker volume sorunu %100 çözülür
   - 1 saatte setup tamamlanır

### Uzun Vadede (İsteğe bağlı):
4. 🔧 **Local development**
   - En hızlı, ama ekstra PostgreSQL kurulumu

## Production'da Sorun Var mı?

**HAYIR!** Tüm bu sorunlar sadece Windows development ortamında.

Production (Linux sunucu):
- ✅ Docker volume sync mükemmel
- ✅ Migration düzgün çalışır
- ✅ Hiçbir manuel sync gerekmez

## Özet

**Şu anki sorunlar:**
1. Windows + Docker volume sync
2. Migration strategy
3. Çok fazla manuel adım

**Kalıcı çözüm:**
1. WSL2'ye geç (1 saatlik iş, tüm sorunları çözer)
2. `prisma db push` kullan
3. Modül oluşturma script'i yaz

**Hemen yapılacaklar:**
- [ ] create-module.js script'ini oluştur
- [ ] prisma db push'a geç (migrate dev yerine)
- [ ] WSL2'ye geçişi planla (haftasonu?)

Ben sana hangisini istersen yardımcı olabilirim! WSL2 setup'ı mı yapalım, script mi yazalım?
