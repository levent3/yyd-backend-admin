# Bank ve BinCode Migration Rehberi

## 📋 Genel Bakış

Bu script sadece **Bank** ve **BinCode** tablolarını MSSQL'den PostgreSQL'e migrate eder.
Diğer tablolara (Slider, Volunteer, ContactMessage, vs.) dokunmaz.

## 🎯 Beklenen Sonuç

- ✅ **Bank**: 13 kayıt
- ✅ **BinCode**: 2,362 kayıt

---

## 🖥️ Lokal (Windows) Kullanım

### Adım 1: Dosya Hazır mı Kontrol Et

```bash
# all_tables_insert.sql dosyasını kontrol et
dir C:\Temp\all_tables_insert.sql
```

### Adım 2: Script'i Çalıştır

```bash
cd C:\Users\leventkurt\Desktop\yyd_web_backend

# Migration'ı çalıştır
node scripts/migrate-banks-and-bincodes.js
```

### Beklenen Çıktı:

```
╔═══════════════════════════════════════════╗
║   Bank ve BinCode Migration Script      ║
╚═══════════════════════════════════════════╝

🏦 Bank ve BinCode Migration Başlıyor...

📖 MSSQL dosyası okunuyor: C:\Temp\all_tables_insert.sql
🔍 INSERT satırları parse ediliyor...

📊 Parse Tamamlandı!

  Bank: 13
  BinCode: 2362

📋 Mevcut Kayıtlar:
  Bank: 0
  BinCode: 0

🏦 Bank Migration Başlıyor...
  ✅ Bank: Kuveyt Türk (ID: 1)
  ✅ Bank: Ziraat Bankası (ID: 2)
  ...
  ✅ 13 bank migrate edildi

🔢 BinCode Migration Başlıyor...
  ✅ 100 BinCode migrate edildi...
  ✅ 200 BinCode migrate edildi...
  ...
  ✅ 2362 BinCode migrate edildi

✅ Migration Tamamlandı!

📊 Sonuç:
  Bank: 13
  BinCode: 2362

🎉 İşlem Başarıyla Tamamlandı!
```

---

## 🚀 Sunucu (Ubuntu/Linux) Kullanım

### Adım 1: Dosyayı Sunucuya Gönder

```bash
# Local Windows'tan sunucuya SCP ile gönder
scp C:/Temp/all_tables_insert.sql kullanici@sunucu_ip:/tmp/all_tables_insert.sql

# Veya WinSCP/FileZilla ile upload et
```

### Adım 2: Script'i Sunucuya Gönder

```bash
# Backend kodlarını git pull yap
cd /var/www/yyd_backend
git pull origin main
```

**VEYA** script'i manuel olarak gönder:
```bash
scp scripts/migrate-banks-and-bincodes.js kullanici@sunucu:/var/www/yyd_backend/scripts/
```

### Adım 3: Dosya Yolunu Değiştir

Sunucuda script'i düzenle:

```bash
nano scripts/migrate-banks-and-bincodes.js
```

**39. satırı bul:**
```javascript
const filePath = 'C:\\Temp\\all_tables_insert.sql'; // Windows
// const filePath = '/tmp/all_tables_insert.sql'; // Linux/Ubuntu (Sunucu)
```

**Şöyle değiştir:**
```javascript
// const filePath = 'C:\\Temp\\all_tables_insert.sql'; // Windows
const filePath = '/tmp/all_tables_insert.sql'; // Linux/Ubuntu (Sunucu)
```

Kaydet ve çık: `Ctrl+X`, `Y`, `Enter`

### Adım 4: Script'i Çalıştır

```bash
cd /var/www/yyd_backend

# Node modules yüklü mü kontrol et
npm install

# Prisma client generate et
npx prisma generate

# Migration'ı çalıştır
node scripts/migrate-banks-and-bincodes.js
```

---

## ⚙️ Özellikler

### ✅ Duplicate Kontrolü

- **Bank**: Aynı isimde banka varsa skip eder
- **BinCode**: Aynı BIN kodu varsa skip eder (unique constraint)

### ✅ Bank-BinCode İlişkisi

Script otomatik olarak:
1. Bank'leri önce oluşturur
2. MSSQL ContentId → PostgreSQL ID mapping yapar
3. BinCode'ları doğru Bank ID'si ile ekler

### ✅ Hata Yönetimi

- Dosya bulunamazsa: Açık hata mesajı verir
- Parse hatası: Hangi satırda hata olduğunu gösterir
- Duplicate: Skip eder, devam eder
- Foreign key hatası: Mapping yoksa skip eder

---

## 🔍 Verification (Doğrulama)

Migration sonrası kontrol et:

```bash
# Prisma Studio'yu aç (web browser'da açılır)
npx prisma studio

# Veya direkt veritabanında kontrol et
psql -U postgres -d yyd_database

# Kayıt sayılarını kontrol et
SELECT COUNT(*) FROM "Bank";
-- Beklenen: 13

SELECT COUNT(*) FROM "BinCode";
-- Beklenen: 2362

# Banka başına BIN sayısı
SELECT
  b.name,
  COUNT(bc.id) as bin_count
FROM "Bank" b
LEFT JOIN "BinCode" bc ON bc."bankId" = b.id
GROUP BY b.id, b.name
ORDER BY bin_count DESC;
```

---

## ⚠️ Sorun Giderme

### Problem 1: "Dosya bulunamadı"

**Hata:**
```
❌ Dosya bulunamadı: /tmp/all_tables_insert.sql
```

**Çözüm:**
```bash
# Dosyanın varlığını kontrol et
ls -lh /tmp/all_tables_insert.sql

# Yoksa tekrar upload et
scp C:/Temp/all_tables_insert.sql kullanici@sunucu:/tmp/
```

### Problem 2: "Prisma client not generated"

**Çözüm:**
```bash
npx prisma generate
```

### Problem 3: "Already migrated" (Zaten migrate edilmiş)

**Çözüm:**

Script duplicate'leri otomatik skip eder. Tekrar çalıştırmak güvenlidir:

```bash
node scripts/migrate-banks-and-bincodes.js
```

Çıktı:
```
⏭️  13 bank atlandı (duplicate)
⏭️  2362 BinCode atlandı (duplicate)
```

### Problem 4: Tabloları Tamamen Sıfırla

**UYARI**: Bu işlem tüm Bank ve BinCode kayıtlarını siler!

```bash
node scripts/clear-tables.js
```

VEYA manuel:
```sql
DELETE FROM "BinCode";
DELETE FROM "Bank";
```

---

## 📊 MSSQL → PostgreSQL Mapping

### Bank Tablosu

| MSSQL Column | PostgreSQL Column | Tip |
|--------------|-------------------|-----|
| ContentId (GUID) | - | (Mapping için kullanılır) |
| Title | name | TEXT |
| UseAlternativeVPOS | isVirtualPosActive | BOOLEAN |
| CreateDate | createdAt | TIMESTAMP |
| UpdateDate | updatedAt | TIMESTAMP |

### BinCode Tablosu

| MSSQL Column | PostgreSQL Column | Tip |
|--------------|-------------------|-----|
| ContentId (GUID) | - | (Mapping için kullanılır) |
| Title | binCode | TEXT (6 digit) |
| BankId (GUID) | bankId | INTEGER (Foreign Key) |
| CreateDate | createdAt | TIMESTAMP |
| UpdateDate | updatedAt | TIMESTAMP |

---

## 📞 Yardım

Sorun yaşarsan:

1. **Log'u kaydet:**
   ```bash
   node scripts/migrate-banks-and-bincodes.js 2>&1 | tee migration.log
   ```

2. **Dosya içeriğini kontrol et:**
   ```bash
   head -100 /tmp/all_tables_insert.sql
   ```

3. **Veritabanı bağlantısını test et:**
   ```bash
   npx prisma db pull
   ```

---

**Oluşturulma Tarihi**: 2025-11-18
**Versiyon**: 1.0
**Script**: `scripts/migrate-banks-and-bincodes.js`
