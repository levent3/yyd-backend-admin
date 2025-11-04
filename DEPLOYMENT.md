# 🚀 YYD BACKEND - DEPLOYMENT KILAVUZU

**Sunucu IP:** `10.200.3.110`
**SSH Kullanıcı:** `yyddev`

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

## 🔄 GÜNCELLEME (Yeni Kod Geldiğinde)

### **Backend Güncelleme:**

```bash
cd /var/www/yyd_web_backend

# Yeni kodu çek
git pull

# Container'ları yeniden başlat
docker-compose down
docker-compose up -d --build

# Migration (varsa)
docker-compose exec api npx prisma migrate deploy
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
