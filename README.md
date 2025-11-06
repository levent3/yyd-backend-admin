# YYD Web Backend

Yardımlaşma ve Dayanışma Derneği (YYD) web sitesi için backend API servisi.

## 🚀 Teknolojiler

- **Node.js** & **Express.js** - REST API
- **Prisma ORM** - Veritabanı yönetimi
- **PostgreSQL** - Ana veritabanı
- **Redis** - Cache ve oturum yönetimi
- **Docker** & **Docker Compose** - Containerization
- **JWT** - Authentication
- **Swagger** - API dokümantasyonu

## 📋 Özellikler

- ✅ Kullanıcı ve rol yönetimi
- ✅ Proje yönetimi (CRUD)
- ✅ Bağış kampanyaları yönetimi
- ✅ Galeri yönetimi
- ✅ Haber yönetimi
- ✅ İletişim formu
- ✅ Gönüllü başvuruları
- ✅ Kariyer başvuruları
- ✅ Redis cache ile performans optimizasyonu
- ✅ Rate limiting ve güvenlik
- ✅ Resim optimizasyonu (Sharp + WebP)

## 🛠️ Kurulum

### 1. Gereksinimler

- Docker & Docker Compose
- Node.js 18+ (opsiyonel, Docker kullanıyorsanız gerekmez)

### 2. Hızlı Başlangıç (Otomatik Deployment)

```bash
# 1. Repository'yi klonlayın
git clone <repository-url>
cd yyd_web_backend

# 2. .env dosyasını oluşturun
cp .env.example .env
# .env dosyasındaki değerleri düzenleyin

# 3. Otomatik deployment script'ini çalıştırın
npm run deploy:dev
```

Bu komut otomatik olarak:
- ✅ .env dosyasını kontrol eder
- ✅ Docker container'ları başlatır
- ✅ Migration'ları çalıştırır
- ✅ Database'i seed eder
- ✅ Servislerin sağlığını kontrol eder

### 3. Manuel Kurulum

```bash
# Repository'yi klonlayın
git clone <repository-url>
cd yyd_web_backend

# .env dosyasını oluşturun
cp .env.example .env

# .env dosyasındaki değerleri düzenleyin:
# - JWT_SECRET: Güvenli bir anahtar oluşturun
# - POSTGRES_PASSWORD: Güvenli bir şifre belirleyin
# - Diğer ayarları ihtiyacınıza göre düzenleyin

# Docker container'ları başlatın
npm run docker:dev:build

# Migration'lar otomatik çalışır (docker-entrypoint.sh sayesinde)
# Logları kontrol edin
npm run docker:dev:logs
```

### 3. API Erişimi

- **API Base URL**: http://localhost:5000/api
- **Swagger Dokümantasyonu**: http://localhost:5000/api-docs
- **Public API Dokümantasyonu**: [PUBLIC_API_DOCUMENTATION.md](./PUBLIC_API_DOCUMENTATION.md)
- **Prisma Studio**: http://localhost:5555 (docker-compose up ile başlatılır)

## 📁 Proje Yapısı

```
src/
├── api/
│   ├── middlewares/      # Auth, cache, rate limit, upload
│   └── modules/          # Domain modülleri (projects, donations, vb.)
├── config/               # Konfigürasyon (multer, swagger)
├── utils/                # Yardımcı fonksiyonlar
└── server.js            # Ana giriş noktası
prisma/
├── schema.prisma        # Veritabanı şeması
└── migrations/          # Migration dosyaları
```

## 🔒 Güvenlik

⚠️ **ÖNEMLİ**: `.env` dosyası asla GitHub'a yüklenmemelidir!

- JWT secret key'inizi güvenli bir şekilde oluşturun
- Production'da güçlü şifreler kullanın
- CORS ayarlarını production için düzenleyin
- Rate limiting ayarlarını ihtiyacınıza göre ayarlayın

## 📝 Environment Variables

Tüm environment variable'lar `.env.example` dosyasında açıklanmıştır.

## 🧪 Test

```bash
# Unit testler (henüz eklenmedi)
npm test

# Linting
npm run lint
```

## 📦 Deployment ve Docker Komutları

### Otomatik Deployment (Önerilen)

```bash
# Development deployment
npm run deploy:dev

# Production deployment
npm run deploy:prod

# Sunucu güncelleme (production)
npm run update:server
```

### Migration Yönetimi

```bash
# İnteraktif migration helper
npm run migration:helper

# Migration komutları
npm run db:migrate           # Yeni migration oluştur
npm run db:migrate:deploy    # Migration'ları uygula
npm run db:migrate:status    # Migration durumunu kontrol et
npm run db:generate          # Prisma Client oluştur
npm run db:seed              # Seed çalıştır
npm run db:reset             # Database'i sıfırla (⚠️ Dikkat!)
npm run db:studio            # Prisma Studio aç
```

### Docker Komutları

#### Development

```bash
# Container'ları başlat
npm run docker:dev

# Build ile başlat
npm run docker:dev:build

# Container'ları durdur
npm run docker:dev:down

# Logları görüntüle
npm run docker:dev:logs
```

#### Production

```bash
# Container'ları başlat
npm run docker:prod

# Build ile başlat
npm run docker:prod:build

# Container'ları durdur
npm run docker:prod:down

# Logları görüntüle
npm run docker:prod:logs
```

#### Diğer Komutlar

```bash
# Belirli container'ın logları
docker-compose logs -f api
docker-compose logs -f postgres

# Container'a bağlan
docker-compose exec api sh

# Database backup
docker-compose exec -T postgres pg_dump -U yyd_user yyd_db > backup.sql

# Database restore
docker-compose exec -T postgres psql -U yyd_user yyd_db < backup.sql
```

> **Not**: Tüm komutlar `package.json`'da tanımlıdır. Script dosyaları `scripts/` klasöründedir.

## 📚 Dokümantasyon

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detaylı deployment rehberi (development, production, sunucu güncelleme)
- **[.env.example](./.env.example)** - Environment variables ve açıklamaları
- **Swagger API Docs** - http://localhost:5000/api-docs (uygulama çalıştığında)

## 🚀 Production Deployment

Detaylı production deployment için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

**Hızlı özet:**

```bash
# Sunucuda
cd /var/www/yyd_web_backend

# .env dosyasını production için yapılandır
cp .env.example .env
nano .env

# Production deployment
npm run deploy:prod

# Güncelleme (lokalden push'ladıktan sonra)
npm run update:server
```

## ⚙️ Available NPM Scripts

| Script | Açıklama |
|--------|----------|
| `npm start` | Production mode'da uygulamayı başlat |
| `npm run dev` | Development mode (nodemon ile) |
| `npm run deploy:dev` | Development deployment (otomatik) |
| `npm run deploy:prod` | Production deployment (otomatik) |
| `npm run update:server` | Sunucu güncelleme (otomatik backup + deploy) |
| `npm run migration:helper` | İnteraktif migration menüsü |
| `npm run db:migrate` | Yeni migration oluştur |
| `npm run db:migrate:deploy` | Migration'ları uygula (production) |
| `npm run db:migrate:status` | Migration durumunu kontrol et |
| `npm run db:generate` | Prisma Client oluştur |
| `npm run db:seed` | Seed data ekle |
| `npm run db:reset` | Database'i sıfırla |
| `npm run db:studio` | Prisma Studio aç |
| `npm run docker:dev` | Development container'ları başlat |
| `npm run docker:dev:build` | Development container'ları build et ve başlat |
| `npm run docker:prod` | Production container'ları başlat |
| `npm run docker:prod:build` | Production container'ları build et ve başlat |

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
