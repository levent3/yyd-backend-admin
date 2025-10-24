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

### 2. Kurulum Adımları

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
docker-compose up -d

# Prisma migration'ları çalıştırın
docker exec yyd_web_backend-api-1 npx prisma migrate deploy

# (Opsiyonel) Seed data ekleyin
docker exec yyd_web_backend-api-1 npx prisma db seed
```

### 3. API Erişimi

- **API Base URL**: http://localhost:5001/api
- **Swagger Dokümantasyonu**: http://localhost:5001/api-docs
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

## 📦 Docker Komutları

```bash
# Container'ları başlat
docker-compose up -d

# Container'ları durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f api

# API container'ına bash ile bağlan
docker exec -it yyd_web_backend-api-1 bash

# Veritabanını sıfırla (DİKKATLİ!)
docker-compose down -v
docker-compose up -d
```

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
