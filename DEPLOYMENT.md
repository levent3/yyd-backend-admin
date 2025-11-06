# 🚀 YYD BACKEND - DEPLOYMENT KILAVUZU

**Sunucu IP:** `10.200.3.110`
**SSH Kullanıcı:** `yyddev`

> **YENİ:** Bu proje artık otomatik deployment script'leri ile gelir! Detaylar aşağıda.

---

## 📚 İçindekiler

1. [Ön Hazırlık (Sunucuda Yapılacak)](#-ön-hazirlik-sunucuda-yapilacak)
2. [Otomatik Deployment (Önerilen)](#-otomatik-deployment-önerilen)
3. [Manuel Deployment](#-manuel-deployment)
4. [Güncelleme İşlemleri](#-güncelleme-i̇şlemleri)
5. [Migration Yönetimi](#-migration-yönetimi)
6. [Monitoring ve Logging](#-monitoring-ve-logging)
7. [Troubleshooting](#-troubleshooting)

---

## 📋 ÖN HAZIRLIK (Sunucuda Yapılacak)

### **1. SSH ile Sunucuya Bağlan**

```bash
ssh yyddev@10.200.3.110
```

### **2. Sistem Güncellemesi**

```bash
sudo apt update && sudo apt upgrade -y
```

### **3. Docker Kurulumu**

```bash
# Docker kurulum scripti
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker'ı sudo'suz kullan
sudo usermod -aG docker $USER

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker servisini başlat
sudo systemctl start docker
sudo systemctl enable docker

# Kurulum kontrolü
docker --version
docker-compose --version

# ÖNEMLI: Yeni grup için çıkış yap ve tekrar gir
exit
ssh yyddev@10.200.3.110
```

### **4. Git Kurulumu**

```bash
sudo apt install git -y
git --version
```

### **5. Proje Klasörü Oluştur**

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
```

---

## 📦 PROJEYİ SUNUCUYA AKTAR

### **Seçenek A: Git Clone (Önerilen)**

```bash
cd /var/www

# Backend
git clone https://github.com/KULLANICI_ADINIZ/yyd_web_backend.git
cd yyd_web_backend

# Frontend (ayrı terminal veya sonra)
cd /var/www
git clone https://github.com/KULLANICI_ADINIZ/yyd_web_frontend.git
```

### **Seçenek B: SCP ile Manuel Yükleme**

Kendi bilgisayarınızdan:

```bash
# Backend
scp -r C:\Users\leventkurt\Desktop\yyd_web_backend yyddev@10.200.3.110:/var/www/

# Frontend
scp -r C:\Users\leventkurt\Desktop\yyd_web_frontend yyddev@10.200.3.110:/var/www/
```

---

## 🚀 OTOMATIK DEPLOYMENT (Önerilen)

Projeniz artık otomatik deployment script'leri ile geliyor! Bu method en kolay ve güvenli yöntemdir.

### **Development Ortamında (Localhost)**

```bash
cd yyd_web_backend

# 1. .env dosyasını oluştur
cp .env.example .env

# 2. Development deployment script'ini çalıştır
npm run deploy:dev
```

Bu komut otomatik olarak:
- ✅ .env dosyasını kontrol eder
- ✅ Docker container'ları durdurur
- ✅ Image'ları build eder
- ✅ Container'ları başlatır
- ✅ Migration'ları çalıştırır
- ✅ Database'i seed eder

### **Production Ortamında (Sunucu)**

```bash
cd /var/www/yyd_web_backend

# 1. .env dosyasını oluştur ve düzenle
cp .env.example .env
nano .env  # Aşağıdaki bölümdeki ayarları yap

# 2. Production deployment script'ini çalıştır
npm run deploy:prod
```

Production script size bir checklist soracaktır:
- ✅ .env dosyası production için yapılandırıldı mı?
- ✅ Database backup'ı alındı mı?
- ✅ Kod repository'den çekildi mi?
- ✅ Tüm testler geçti mi?

### **Sunucu Güncelleme (En Kolay Yöntem)**

Lokalinizde kod değişikliği yaptıktan sonra:

```bash
# 1. Kodu Git'e push et (lokalinizde)
git add .
git commit -m "Değişiklikler"
git push origin main

# 2. Sunucuda güncelleme script'ini çalıştır
cd /var/www/yyd_web_backend
npm run update:server
```

Bu script otomatik olarak:
- ✅ Database backup alır
- ✅ Uploads backup alır
- ✅ Yeni kodu Git'ten çeker
- ✅ Container'ları rebuild eder
- ✅ Zero-downtime restart yapar
- ✅ Health check yapar
- ✅ Sorun varsa rollback için talimat verir

---

## 🛠️ MANUEL DEPLOYMENT

Otomatik script'leri kullanmak istemiyorsanız manuel deployment yapabilirsiniz.

### **1. Environment Dosyasını Oluştur**

```bash
cd /var/www/yyd_web_backend
cp .env.example .env
nano .env
```

---

## 🔐 BACKEND - PRODUCTION AYARLARI

### **1. .env.production Dosyasını Oluştur**

```bash
cd /var/www/yyd_web_backend

# Template'i kopyala
cp .env.production.example .env.production

# Düzenle
nano .env.production
```

### **2. ŞİFRELERİ GÜNCELLEYECEĞİN SATIRLAR:**

```bash
# Satır 19: PostgreSQL Şifresi (güçlü şifre)
POSTGRES_PASSWORD=BURAYA_GERCEK_SIFRE_YAZ

# Satır 23: Database URL'deki şifreyi de değiştir
DATABASE_URL="postgresql://yyd_prod_user:BURAYA_GERCEK_SIFRE_YAZ@postgres:5432/..."

# Satır 29: JWT Secret (random 32+ karakter)
JWT_SECRET="BURAYA_32_KARAKTER_RANDOM_YAZ"
```

### **3. RANDOM JWT SECRET OLUŞTUR:**

```bash
# Terminal'de çalıştır:
openssl rand -base64 32

# Çıktıyı kopyala ve JWT_SECRET'a yapıştır
```

### **4. KAYDET VE ÇIK:**

```
Ctrl + O (kaydet)
Enter (onayla)
Ctrl + X (çık)
```

---

## 🐳 DOCKER CONTAINER'LARI BAŞLAT

### **1. Backend Container'ları Başlat**

```bash
cd /var/www/yyd_web_backend

# Container'ları arka planda başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f

# Container durumu
docker-compose ps
```

### **2. Database Migration**

```bash
# Veritabanı şemasını oluştur
docker-compose exec api npx prisma migrate deploy

# (Opsiyonel) Test verisi ekle
docker-compose exec api npm run seed
```

### **3. Container'ların Çalıştığını Kontrol Et**

```bash
docker-compose ps

# Beklenen çıktı:
# yyd_web_backend-api-1       running
# yyd_web_backend-postgres-1  running
# yyd_web_backend-redis-1     running
```

---

## ⚛️ FRONTEND - PRODUCTION AYARLARI

### **1. .env.production Dosyasını Oluştur**

```bash
cd /var/www/yyd_web_frontend

# Template'i kopyala
cp .env.production.example .env.production

# Düzenle (IP adresi zaten doğru olmalı)
nano .env.production
```

### **2. Dependencies Kur ve Build Al**

```bash
cd /var/www/yyd_web_frontend

# Dependencies
npm install

# Production build
npm run build

# Build kontrolü
ls -la .next
```

### **3. PM2 ile Frontend'i Başlat**

```bash
# PM2 kur (global)
sudo npm install -g pm2

# Frontend'i başlat
pm2 start npm --name "yyd-frontend" -- start

# PM2 durumu
pm2 status

# Logları izle
pm2 logs yyd-frontend

# Sistem boot'ta otomatik başlasın
pm2 startup
pm2 save
```

---

## 🌐 ERİŞİM TEST ET

### **Backend API Test:**

```bash
# Sunucu içinden:
curl http://localhost:5000/api/health

# Dışarıdan:
curl http://10.200.3.110:5000/api/health
```

### **Frontend Test:**

```bash
# Sunucu içinden:
curl http://localhost:3000

# Tarayıcıdan:
http://10.200.3.110:3000
```

---

## 🔥 FIREWALL AYARLARI

```bash
# UFW Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp  # Backend API
sudo ufw allow 3000/tcp  # Frontend
sudo ufw enable

# Firewall durumu
sudo ufw status
```

---

## 📊 MONİTORİNG

### **Container Logları:**

```bash
# Backend API
docker-compose logs -f api

# PostgreSQL
docker-compose logs -f postgres

# Redis
docker-compose logs -f redis
```

### **PM2 Monitoring:**

```bash
pm2 monit
pm2 logs yyd-frontend
pm2 status
```

### **Sistem Kaynakları:**

```bash
# CPU, RAM kullanımı
htop

# Disk kullanımı
df -h

# Docker kaynakları
docker stats
```

---

## 🔧 MIGRATION YÖNETİMİ

Projede migration işlemleri için kullanışlı araçlar bulunuyor.

### **Migration Helper (İnteraktif)**

```bash
# İnteraktif migration menüsü
npm run migration:helper
```

Bu komut size bir menü sunar:
1. Yeni migration oluştur
2. Migration durumunu kontrol et
3. Bekleyen migration'ları uygula
4. Database'i sıfırla (⚠️ DİKKAT!)
5. Prisma Client oluştur
6. Seed çalıştır
7. Prisma Studio aç
8. Drift kontrolü yap

### **Migration Komutları**

```bash
# Migration durumunu kontrol et
npm run db:migrate:status

# Yeni migration oluştur (development)
npm run db:migrate

# Migration'ları uygula (production)
npm run db:migrate:deploy

# Prisma Client'ı yeniden oluştur
npm run db:generate

# Database'i sıfırla ve seed et (⚠️ Tüm veri silinir!)
npm run db:reset

# Sadece seed çalıştır
npm run db:seed

# Prisma Studio aç
npm run db:studio
```

### **Migration Drift Sorunları**

Eğer schema ile database arasında uyumsuzluk (drift) varsa:

```bash
# 1. Schema'yı database'e push et (development için hızlı çözüm)
npm run db:push

# 2. Veya yeni migration oluştur (production için önerilen)
npm run db:migrate
```

---

## 🔄 GÜNCELLEME (Yeni Kod Geldiğinde)

### **Otomatik Güncelleme (Önerilen):**

```bash
cd /var/www/yyd_web_backend
npm run update:server
```

### **Manuel Backend Güncelleme:**

```bash
cd /var/www/yyd_web_backend

# Backup al
docker-compose exec -T postgres pg_dump -U yyd_prod_user yyd_production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Yeni kodu çek
git pull

# Container'ları yeniden başlat
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Migration (varsa)
docker-compose -f docker-compose.prod.yml exec api npm run db:migrate:deploy
```

### **Frontend Güncelleme:**

```bash
cd /var/www/yyd_web_frontend

# Yeni kodu çek
git pull

# Dependencies güncelle
npm install

# Yeniden build
npm run build

# PM2'yi restart et
pm2 restart yyd-frontend
```

---

## 🛠️ TROUBLESHOOTING

### **Container çalışmıyorsa:**

```bash
docker-compose down
docker-compose up -d
docker-compose logs -f
```

### **Database bağlantı hatası:**

```bash
# .env.production şifresini kontrol et
cat .env.production | grep POSTGRES_PASSWORD

# Container yeniden başlat
docker-compose restart postgres
```

### **Frontend build hatası:**

```bash
# Node modules sil ve yeniden kur
rm -rf node_modules
npm install
npm run build
```

### **Port zaten kullanımda:**

```bash
# Port kontrol
sudo netstat -tuln | grep -E ':5000|:3000'

# İşlemi öldür
sudo lsof -ti:3000 | xargs kill -9
```

---

## 📝 ÖNEMLI NOTLAR

1. ✅ `.env.production` dosyası asla GitHub'a pushlama!
2. ✅ Güçlü şifreler kullan (min 16 karakter)
3. ✅ Düzenli backup al (database ve uploads)
4. ✅ Logları kontrol et
5. ✅ Domain aldığında URL'leri güncelle ve SSL ekle

---

## 📞 YARDIM

Sorun olursa:
1. Container loglarını kontrol et: `docker-compose logs -f`
2. PM2 loglarını kontrol et: `pm2 logs`
3. .env.production dosyasını kontrol et
4. Firewall ayarlarını kontrol et: `sudo ufw status`
