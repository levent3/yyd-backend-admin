# Production Deployment Stratejisi

## Problem: Development vs Production

### Development (Local):
- Hızlı değişiklik yapmak istiyoruz
- Migration drift hataları canımızı sıkıyor
- Windows + Docker sync sorunları var

### Production (Sunucu):
- Güvenli deployment gerekli
- Migration history tutulmalı
- Rollback yapılabilmeli
- Data kaybı riski olmamalı

## ✅ DOĞRU ÇÖZÜM: Hybrid Yaklaşım

### 1. Development Ortamında (Local)

**db push kullan** - Hızlı development için:

```bash
# Yeni modül eklerken
# 1. schema.prisma'yı düzenle
# 2. Hemen push et
npx prisma db push

# ✅ Migration dosyası oluşturmaz (daha az karmaşa)
# ✅ Drift error olmaz
# ✅ Hızlı development
# ✅ Windows Docker sync sorunlarından etkilenmez
```

**Migration oluşturma zamanı:**

```bash
# Feature tamamlandığında (commit öncesi):
npx prisma migrate dev --name add_banks_and_bin_codes

# Bu komut:
# ✅ Schema değişikliklerini migration dosyasına çevirir
# ✅ Git'e commit edilecek migration dosyası oluşturur
# ✅ Production'da çalıştırılacak SQL'leri hazırlar
```

### 2. Git Workflow

```bash
# Development sırasında
git add .
git commit -m "feat: Add banks module"
git push origin main

# Migration dosyaları da commit ediliyor:
# prisma/migrations/20241105_add_banks_and_bin_codes/migration.sql ✅
```

### 3. Production Deployment (Sunucuda)

**docker-compose.yml veya Dockerfile'da:**

```yaml
# Production'da SADECE migrate deploy kullan
services:
  api:
    command: sh -c "npx prisma migrate deploy && npm start"
    # migrate deploy:
    # ✅ Sadece migration dosyalarını çalıştırır
    # ✅ Güvenli
    # ✅ İdempotent (tekrar çalıştırılabilir)
```

**veya CI/CD pipeline'ında:**

```bash
# GitHub Actions, GitLab CI, vb.
- name: Deploy Database
  run: |
    npx prisma migrate deploy

- name: Start Application
  run: |
    docker-compose up -d --build
```

## Tam Workflow Örneği

### Scenario: Yeni "Banks" Modülü Ekliyoruz

#### Local Development:

```bash
# 1. Schema'ya Bank modelini ekle
# prisma/schema.prisma düzenle

# 2. Hızlı test için push et (migration oluşturmadan)
npx prisma db push
npx prisma generate

# Windows ise Docker'a sync et
docker cp prisma/schema.prisma yyd_web_backend-api-1:/usr/src/app/prisma/schema.prisma
docker-compose exec -T api npx prisma generate
docker-compose restart api

# 3. Backend kod yaz, test et
# repository, service, controller, routes...

# 4. Frontend kod yaz, test et
# service, pages...

# 5. Her şey çalışıyor mu? ✅

# 6. Migration oluştur (commit öncesi)
npx prisma migrate dev --name add_banks_module

# Bu komut:
# - prisma/migrations/20241105_add_banks_module/ klasörü oluşturur
# - migration.sql dosyası oluşturur
# - Database'i günceller (zaten push etmiştik, bu sefer sadece migration history'yi güncelliyor)

# 7. Git'e commit et
git add .
git commit -m "feat: Add banks module with CRUD operations"
git push origin main
```

#### Production Deployment:

```bash
# Sunucuda (otomatik veya manuel):

# 1. Kodu çek
git pull origin main

# 2. Migration'ları çalıştır
npx prisma migrate deploy

# 3. Docker'ı yeniden başlat
docker-compose up -d --build

# ✅ Migration dosyaları çalıştı
# ✅ Database güncellendi
# ✅ Uygulama yeni kodla başladı
```

## Migration History Nasıl Tutulur?

```bash
# Migration dosyaları Git'te:
prisma/migrations/
├── 20241101_initial/
│   └── migration.sql
├── 20241103_add_activity_areas/
│   └── migration.sql
├── 20241105_add_banks_module/
│   └── migration.sql
└── migration_lock.toml

# Her migration dosyası:
# ✅ SQL komutlarını içerir
# ✅ Timestamp ile sıralıdır
# ✅ Production'da otomatik çalışır
# ✅ Rollback için referans noktasıdır
```

## Rollback Nasıl Yapılır?

```bash
# Production'da sorun çıktıysa:

# Seçenek 1: Git'te geri dön
git revert HEAD
git push

# Seçenek 2: Migration rollback (manuel SQL)
# prisma/migrations/20241105_add_banks_module/migration.sql
# dosyasına bakıp, reverse SQL'leri yaz:

# migration.sql'de:
CREATE TABLE "Bank" ...

# Rollback SQL:
DROP TABLE "Bank";

# Production'da çalıştır:
psql $DATABASE_URL < rollback.sql
```

## Özet: Ne Zaman Neyi Kullanmalı?

| Durum | Komut | Neden? |
|-------|-------|--------|
| **Development (local)** | `npx prisma db push` | Hızlı, drift error yok |
| **Development (commit öncesi)** | `npx prisma migrate dev --name xxx` | Migration dosyası oluştur |
| **Production (sunucu)** | `npx prisma migrate deploy` | Güvenli, sadece migration dosyalarını çalıştır |
| **Production (CI/CD)** | `npx prisma migrate deploy` | Otomatik deployment |

## Docker Compose ile Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    command: >
      sh -c "
        echo 'Running migrations...'
        npx prisma migrate deploy &&
        echo 'Starting application...'
        npm start
      "
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## CI/CD Pipeline Örneği (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npx prisma migrate deploy

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/yyd_web_backend
            git pull origin main
            docker-compose up -d --build
```

## Sorunları Önlemek İçin Checklist

### Development'ta Her Modül Eklerken:

- [ ] 1. schema.prisma'yı düzenle
- [ ] 2. `npx prisma db push` ile hızlı test et
- [ ] 3. Backend kodları yaz ve test et
- [ ] 4. Frontend kodları yaz ve test et
- [ ] 5. Her şey çalışınca: `npx prisma migrate dev --name add_xxx`
- [ ] 6. Migration dosyasını kontrol et
- [ ] 7. Git'e commit ve push et
- [ ] 8. Production'da `migrate deploy` otomatik çalışsın

### Production'da:

- [ ] Migration dosyaları Git'te var mı?
- [ ] `migrate deploy` komutu Dockerfile/docker-compose'da mı?
- [ ] Backup aldın mı? (önemli değişikliklerde)
- [ ] Rollback planın var mı?

## Önemli: Data Kaybı Risklerini Önle

```prisma
// ❌ YANLIŞ: Sütunu direkt sil
model User {
  id    Int    @id
  // email String (silindi)
  name  String
}

// ✅ DOĞRU: Önce optional yap, sonra sil
model User {
  id    Int     @id
  email String? // Önce optional
  name  String
}

// Deployment sonrası, data migrate et
// Sonra başka migration'da sil
```

## Sonuç

**Development**: `db push` kullan (hızlı)
**Commit öncesi**: `migrate dev` çalıştır (migration dosyası oluştur)
**Production**: `migrate deploy` kullan (güvenli)

Bu şekilde:
- ✅ Development hızlı
- ✅ Production güvenli
- ✅ Migration history tutuluyor
- ✅ Rollback yapılabilir
- ✅ Windows Docker sorunlarından etkilenmiyoruz
