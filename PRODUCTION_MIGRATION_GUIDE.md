# Production Sunucuda Migration Rehberi

## 🎯 Genel Bakış

Bu rehber, MSSQL veritabanından PostgreSQL'e geçiş için production sunucuda yapılması gereken adımları içerir.

---

## 📋 Ön Hazırlık (Local)

### 1. MSSQL Export Dosyası Hazırla

MSSQL Server Management Studio'da:

```sql
-- Tüm tabloları export et
-- Right Click on Database → Tasks → Generate Scripts
--
-- Ayarlar:
-- ✓ Script data (Data only değil, schema + data)
-- ✓ UTF-16 LE encoding
-- ✓ Output: Single file
--
-- Dosya: all_tables_insert.sql
```

### 2. Dosyayı Sunucuya Kopyala

```bash
# Local'den sunucuya kopyala
scp C:/Temp/all_tables_insert.sql user@server:/tmp/all_tables_insert.sql

# Veya WinSCP/FileZilla ile upload et
```

---

## 🚀 Production Sunucuda Adımlar

### ADIM 1: Backup Al

```bash
# PostgreSQL backup
pg_dump -U postgres -d yyd_database > /backup/yyd_backup_$(date +%Y%m%d_%H%M%S).sql

# Veya Prisma ile
cd /var/www/yyd_backend
npx prisma db seed --preview-feature
```

### ADIM 2: Gerekli Paketleri Kontrol Et

```bash
cd /var/www/yyd_backend

# Node modules yüklü mü?
npm install

# Prisma client generate edilmiş mi?
npx prisma generate
```

### ADIM 3: Schema Migration'ı Uygula

```bash
# Prisma schema'yı veritabanına uygula
npx prisma db push

# VEYA migration kullan (production için önerilen)
npx prisma migrate deploy
```

Bu komut şu tabloları oluşturacak:
- `Project` + `ProjectTranslation`
- `News` + `NewsTranslation`
- `HomeSlider` + `HomeSliderTranslation`
- `BankAccount` + `BankAccountTranslation`
- `Volunteer`
- `ContactMessage`
- `Bank`
- `BinCode`

### ADIM 4: Migration Scriptini Çalıştır

```bash
cd /var/www/yyd_backend

# MSSQL export dosyasının yolunu kontrol et
ls -lh /tmp/all_tables_insert.sql

# Migration scriptini çalıştır
node scripts/MASTER_MIGRATION_MSSQL_TO_POSTGRESQL.js

# Log'u kaydet
node scripts/MASTER_MIGRATION_MSSQL_TO_POSTGRESQL.js 2>&1 | tee /var/log/migration_$(date +%Y%m%d_%H%M%S).log
```

**Beklenen Süre**: ~5-10 dakika (14,000+ kayıt için)

### ADIM 5: Verification

```bash
# Migration sonuçlarını kontrol et
node scripts/verify-migration.js

# Kayıt sayılarını kontrol et
npx prisma studio  # Web browser'da açılır
```

Beklenen sonuçlar:
```
✅ Project: 57
✅ ProjectTranslation: 171
✅ News: 5
✅ NewsTranslation: 15
✅ HomeSlider: 4
✅ HomeSliderTranslation: 11
✅ BankAccount: 21
✅ BankAccountTranslation: 63
✅ Volunteer: 8,683
✅ ContactMessage: 1,957
✅ Bank: 13
✅ BinCode: 2,362
```

---

## 🖼️ Görsel Dosyaları Migrate Et

### Eski Sunucudan Yeni Sunucuya Kopyala

```bash
# Eski sunucuda ZIP oluştur
cd /old_server/public
tar -czf documents.tar.gz documents/

# Yeni sunucuya kopyala
scp documents.tar.gz user@new_server:/tmp/

# Yeni sunucuda aç
cd /var/www/yyd_backend/public
tar -xzf /tmp/documents.tar.gz
chown -R www-data:www-data documents/
```

**Dosya Yolları**:
- Project images: `/documents/project/`
- News images: `/documents/news/`
- Slider images: `/documents/slider/`
- Volunteer CVs: `/documents/cv/`

---

## ⚠️ Troubleshooting

### Problem 1: "IBAN unique constraint failed"

**Sebep**: Veritabanında eski veriler var.

**Çözüm**:
```bash
cd /var/www/yyd_backend
node scripts/clear-tables.js
node scripts/MASTER_MIGRATION_MSSQL_TO_POSTGRESQL.js
```

### Problem 2: "Cannot read file all_tables_insert.sql"

**Sebep**: Dosya yolu yanlış veya dosya yok.

**Çözüm**:
```bash
# Migration scriptindeki dosya yolunu düzenle
nano scripts/MASTER_MIGRATION_MSSQL_TO_POSTGRESQL.js

# Line 139'u bul:
let sqlContent = fs.readFileSync('C:\\Temp\\all_tables_insert.sql', 'utf16le');

# Linux path'e çevir:
let sqlContent = fs.readFileSync('/tmp/all_tables_insert.sql', 'utf16le');
```

### Problem 3: "Out of memory"

**Sebep**: Node.js heap boyutu yetersiz.

**Çözüm**:
```bash
# Heap size artır
NODE_OPTIONS="--max-old-space-size=4096" node scripts/MASTER_MIGRATION_MSSQL_TO_POSTGRESQL.js
```

### Problem 4: "Prisma client not generated"

**Çözüm**:
```bash
npx prisma generate
npm run build  # TypeScript projesi ise
```

---

## 🔄 Rollback (Geri Alma)

Eğer migration başarısız olursa:

```bash
# 1. Veritabanını temizle
cd /var/www/yyd_backend
node scripts/clear-tables.js

# 2. Backup'tan geri yükle
psql -U postgres -d yyd_database < /backup/yyd_backup_TIMESTAMP.sql

# 3. Hataları düzelt ve tekrar dene
```

---

## ✅ Post-Migration Checklist

- [ ] Tüm tablo kayıt sayıları doğru
- [ ] Multi-language içerikler düzgün gösteriliyor
- [ ] Görseller erişilebilir (404 yok)
- [ ] API endpoint'leri çalışıyor
- [ ] Frontend doğru veri çekiyor
- [ ] IBAN'lar unique
- [ ] Slug'lar unique
- [ ] Foreign key ilişkileri sağlam (Bank → BinCode)

---

## 📊 Performance Optimizasyonları (Opsiyonel)

Migration sonrası index'leri optimize et:

```sql
-- Index'leri yeniden oluştur
REINDEX TABLE "Project";
REINDEX TABLE "News";
REINDEX TABLE "BankAccount";

-- Vacuum analyze
VACUUM ANALYZE;

-- Statistics güncelle
ANALYZE "Project";
ANALYZE "ProjectTranslation";
```

---

## 📞 Destek

Sorun yaşarsan:

1. **Log dosyasını kontrol et**: `/var/log/migration_TIMESTAMP.log`
2. **Prisma log'ları**: `DEBUG="prisma:*" node scripts/MASTER_MIGRATION_MSSQL_TO_POSTGRESQL.js`
3. **Verification script**: `node scripts/verify-migration.js`

---

## 🎉 Migration Tamamlandı!

Başarılı migration sonrası:

```bash
# Backend'i restart et
pm2 restart yyd-backend

# Nginx'i reload et (cache temizle)
sudo nginx -s reload

# Frontend build al (gerekirse)
cd /var/www/yyd_frontend
npm run build
pm2 restart yyd-frontend
```

---

**Son Güncelleme**: 2025-11-17
**Versiyon**: 1.0
