# YYD Web Backend - Production Deployment Guide

## 🚀 Menü Sistemi ve Faaliyet Alanları Kurulumu

### 📦 Yapılan Değişiklikler

1. **Faaliyet Alanları Modülü (8 adet)**
2. **Menü Sistemi Güncellemeleri**
3. **Medya Alt Menüleri (7 adet)**

---

## 🎯 Production'a Deploy Adımları

### Adım 1: Git Pull

```bash
cd /path/to/yyd_web_backend
git pull origin main
```

### Adım 2: Dependencies

```bash
npm install
```

### Adım 3: Database Migration

```bash
# Migrations çalıştır
npx prisma migrate deploy

# Prisma client'ı yeniden oluştur
npx prisma generate
```

### Adım 4: Seed Data

```bash
# Menü sistemi ve faaliyet alanlarını yükle
node prisma/seed-menu-system.js
```

**Bu script:**
- ✅ 8 faaliyet alanı ekler (yoksa)
- ✅ Faaliyet alanları menü öğelerini oluşturur
- ✅ Medya menü öğelerini oluşturur
- ✅ Mevcut verileri korur (idempotent)

### Adım 5: Restart

```bash
# PM2 kullanıyorsanız
pm2 restart yyd-api

# Docker kullanıyorsanız
docker-compose restart api
```

---

## ✅ Doğrulama

### API Test

```bash
# Menü yapısını kontrol et
curl https://your-domain.com/api/menu/slug/main-menu/public | jq

# Faaliyet alanlarını kontrol et
curl https://your-domain.com/api/activity-areas/active | jq
```

### Beklenen Sonuç

```json
{
  "menuItems": [
    {
      "title": "Faaliyet Alanları",
      "children": [
        {"title": "Beslenme Sağlığı", "linkType": "activityArea"},
        {"title": "Göz Sağlığı", "linkType": "activityArea"}
      ]
    },
    {
      "title": "Medya",
      "children": [
        {"title": "Haberler", "customUrl": "/haberler"},
        {"title": "Galeri", "customUrl": "/galeri"}
      ]
    }
  ]
}
```

---

## 📝 Notlar

- Seed script tekrar çalıştırılabilir
- Mevcut verileri silmez
- Production'da zaten veri varsa ekleme yapmaz

---

## 🆘 Sorun Giderme

### Problem: PostgreSQL Sequence Hatası

```bash
# Sequence'i manuel resetle
psql -d yyd_db -c "SELECT setval(pg_get_serial_sequence('\"MenuItem\"', 'id'), COALESCE((SELECT MAX(id) FROM \"MenuItem\"), 1), true);"
```

### Problem: Duplicate Entries

Script tekrar çalıştır, otomatik kontrol eder:
```bash
node prisma/seed-menu-system.js
```

