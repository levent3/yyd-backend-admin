# MSSQL → PostgreSQL Migration Özeti

## 📊 Genel Bakış

MSSQL veritabanından PostgreSQL'e toplam **6 tablo** ve **~14,000 kayıt** migrate edildi.

### Migration Tarihi
- Başlangıç: 2025-11-17
- Tamamlanma: 2025-11-17

---

## 🗂️ Migrate Edilen Tablolar

### 1. **Project** (Projeler)
- **MSSQL**: `YeryuzuDoktorlari_Project`
- **PostgreSQL**: `Project` + `ProjectTranslation`
- **Kayıt Sayısı**: 57 proje
- **Özellikler**:
  - Multi-language support (TR, EN, AR)
  - Thumbnail ve cover image desteği
  - Bağış hedefi ve toplanan miktar tracking
  - Kurban bağışı desteği

**Kolonlar**:
```
Project:
- id, shortCode, targetAmount, collectedAmount
- thumbnailUrl, coverImageUrl, videoUrl
- projectType, status, priority, displayOrder
- startDate, endDate, isActive, isFeatured
- sacrificeType, sacrificeSharePrice, sacrificeShareCount
- createdAt, updatedAt

ProjectTranslation:
- id, projectId, language (TR/EN/AR)
- title, slug, summary, description, location
```

---

### 2. **News** (Haberler)
- **MSSQL**: `YeryuzuDoktorlari_News`
- **PostgreSQL**: `News` + `NewsTranslation`
- **Kayıt Sayısı**: 5 haber
- **Özellikler**:
  - Multi-language support (TR, EN, AR)
  - Yazar ilişkisi (User)
  - Yayın tarihi kontrolü
  - Slug-based routing

**Kolonlar**:
```
News:
- id, imageUrl, status, publishedAt
- authorId (User referansı)
- createdAt, updatedAt

NewsTranslation:
- id, newsId, language (TR/EN/AR)
- title, slug, summary, content
```

---

### 3. **HomeSlider** (Anasayfa Slider'ları)
- **MSSQL**: `YeryuzuDoktorlari_Slider`
- **PostgreSQL**: `HomeSlider` + `HomeSliderTranslation`
- **Kayıt Sayısı**: 4 slider
- **Özellikler**:
  - Multi-language support (TR, EN, AR)
  - Desktop ve mobile image desteği
  - Video URL desteği
  - Tarihe göre gösterim kontrolü
  - Proje bağlantısı (opsiyonel)

**Kolonlar**:
```
HomeSlider:
- id, imageUrl, mobileImageUrl, videoUrl
- displayOrder, isActive, showTitle
- startDate, endDate, projectId
- createdAt, updatedAt

HomeSliderTranslation:
- id, sliderId, language (TR/EN/AR)
- title, subtitle, summary
- buttonText, buttonLink
```

---

### 4. **BankAccount** (Banka Hesapları)
- **MSSQL**: `YeryuzuDoktorlari_BankAccountInformation`
- **PostgreSQL**: `BankAccount` + `BankAccountTranslation`
- **Kayıt Sayısı**: 21 hesap
- **Özellikler**:
  - Multi-language support (TR, EN, AR)
  - IBAN unique constraint
  - SWIFT, şube bilgileri
  - Para birimi desteği

**Kolonlar**:
```
BankAccount:
- id, iban (unique), swift, accountNumber
- branch, branchCode, currency
- isActive, displayOrder
- createdAt, updatedAt

BankAccountTranslation:
- id, accountId, language (TR/EN/AR)
- accountName, bankName
```

**Özel İşlem**: `accountName` alanından banka adı çıkarıldı
- Örnek: "Kuveyt Türk 1" → bankName: "Kuveyt Türk"

---

### 5. **Volunteer** (Gönüllüler)
- **MSSQL**: `YeryuzuDoktorlari_Volunteer`
- **PostgreSQL**: `Volunteer`
- **Kayıt Sayısı**: 8,683 gönüllü
- **Özellikler**:
  - Tam ad, email, telefon
  - Meslek, uzmanlık alanı
  - Çalışma tercihi (remote/onsite/both)
  - CV upload desteği

**Kolonlar**:
```
Volunteer:
- id, fullName, email, phone
- profession, expertise
- workPreference, availability
- cvUrl, message, isActive, isApproved
- createdAt, updatedAt
```

---

### 6. **ContactMessage** (İletişim Mesajları)
- **MSSQL**: `YeryuzuDoktorlari_ContactForm`
- **PostgreSQL**: `ContactMessage`
- **Kayıt Sayısı**: 1,957 mesaj
- **Özellikler**:
  - İsim, email, telefon
  - Konu ve mesaj
  - Okundu/cevaplandı durumu

**Kolonlar**:
```
ContactMessage:
- id, fullName, email, phone
- subject, message
- isRead, isReplied
- createdAt, updatedAt
```

---

## 🏦 Yardımcı Tablolar

### 7. **Bank** (Bankalar)
- **Kayıt Sayısı**: 13 banka
- **Özellikler**: Sanal POS aktif/pasif durumu

### 8. **BinCode** (BIN Kodları)
- **Kayıt Sayısı**: 2,362 BIN kodu
- **Özellikler**: Banka ilişkilendirmesi (Bank → BinCode)

---

## 🔄 Multi-Language Yapı

Tüm **görsel içerik** (Project, News, HomeSlider, BankAccount) **3 dil** destekliyor:
- 🇹🇷 **TR** (Türkçe) - `bf2689d9-071e-4a20-9450-b1dbdd39778f`
- 🇬🇧 **EN** (English) - `7c35f456-9403-4c21-80b6-941129d14086`
- 🇸🇦 **AR** (Arabic) - `8fab2bf3-f2e1-4d54-b668-8dd588575fe4`

### Yapı:
```
Ana Tablo (Base Entity)       Translation Tablosu
├─ id                          ├─ id
├─ imageUrl                    ├─ entityId (FK)
├─ isActive                    ├─ language (tr/en/ar)
├─ displayOrder                ├─ title
├─ createdAt                   ├─ slug
└─ updatedAt                   ├─ summary
                               └─ content/description
```

---

## 📈 İstatistikler

| Tablo | MSSQL Kayıt | PostgreSQL (Unique) | Çeviri Sayısı |
|-------|-------------|---------------------|---------------|
| Project | 171 | 57 | 171 |
| News | 15 | 5 | 15 |
| HomeSlider | 11 | 4 | 11 |
| BankAccount | 63 | 21 | 63 |
| Volunteer | 8,683 | 8,683 | - |
| ContactMessage | 1,957 | 1,957 | - |
| Bank | 13 | 13 | - |
| BinCode | 2,362 | 2,362 | - |
| **TOPLAM** | **~13,275** | **~13,115** | **260** |

---

## 🛠️ Teknik Detaylar

### MSSQL → PostgreSQL Mapping

#### Veri Tipleri:
- `NVARCHAR` → `TEXT` / `STRING`
- `DATETIME` → `TIMESTAMP` / `DateTime`
- `BIT` → `BOOLEAN`
- `INT` → `INTEGER`
- `DECIMAL` → `FLOAT` / `Decimal`
- `UNIQUEIDENTIFIER (GUID)` → Dil mapping veya skip

#### ContentId Grouping:
MSSQL'de aynı içeriğin farklı dillerdeki kayıtları **aynı ContentId** ile gruplanmış:
```sql
-- MSSQL
ContentId: '0e065155-...'
  ├─ SiteLanguageId: 'bf2689d9-...' (TR) → Title: "Gazze Krizi"
  ├─ SiteLanguageId: '7c35f456-...' (EN) → Title: "Gaza Emergency"
  └─ SiteLanguageId: '8fab2bf3-...' (AR) → Title: "طوارئ غزة"

-- PostgreSQL
Project (id: 1)
  ├─ ProjectTranslation (language: 'tr', title: "Gazze Krizi")
  ├─ ProjectTranslation (language: 'en', title: "Gaza Emergency")
  └─ ProjectTranslation (language: 'ar', title: "طوارئ غزة")
```

### Duplicate Handling:
- **IBAN**: Duplicate IBAN'lar skip edildi (her hesap unique)
- **Slug**: Unique constraint ile korunuyor
- **Email**: Volunteer ve ContactMessage'da unique değil (aynı kişi birden fazla başvuru yapabilir)

---

## 📁 Migration Script Konumu

### Ana Script:
```
/scripts/migrate-all-tables.js
```

### Diğer Scriptler:
- `/scripts/parse-and-migrate-projects.js` - İlk proje migration'ı
- `/scripts/parse-and-migrate-news.js` - İlk news migration'ı
- `/scripts/verify-migration.js` - Verification scripti
- `/scripts/clear-tables.js` - Tablo temizleme

---

## ⚙️ Sunucuda Çalıştırma

### Ön Gereksinimler:
```bash
# 1. MSSQL export dosyasını sunucuya kopyala
scp C:/Temp/all_tables_insert.sql server:/tmp/

# 2. Prisma schema'yı güncelle
cd /path/to/backend
npx prisma db push

# 3. Migration scriptini çalıştır
node scripts/migrate-all-tables.js
```

### Doğrulama:
```bash
# Kayıt sayılarını kontrol et
node scripts/verify-migration.js
```

---

## ⚠️ Önemli Notlar

1. **Image URL'ler**: Görsel dosyaları fiziksel olarak migrate edilmedi, sadece URL'ler kopyalandı
2. **User Referanslar**: News tablosundaki `authorId` şu an NULL (kullanıcılar henüz migrate edilmedi)
3. **Slug Uniqueness**: Her dil için slug unique olmalı (composite index: `[language, slug]`)
4. **IBAN Unique**: Bir IBAN sadece bir BankAccount'a ait olabilir
5. **Duplicate İçerik**: MSSQL'de bazı duplicate içerikler vardı, bunlar ContentId ile gruplanarak tek kayda indirildi

---

## 🚀 Sonraki Adımlar

### Backend:
- [ ] BankAccount API'yi multi-language yapıya güncelle
- [ ] HomeSlider API'yi multi-language yapıya güncelle
- [ ] Translation helper kullanımını yaygınlaştır

### Frontend:
- [ ] BankAccount sayfalarını multi-language için güncelle
- [ ] HomeSlider sayfalarını multi-language için güncelle
- [ ] Dil seçimi UI'ını implement et

### Production:
- [ ] Tüm görselleri `/documents/` klasöründen yeni sunucuya kopyala
- [ ] Backup stratejisi oluştur
- [ ] Migration scriptini production'da test et

---

## 📞 İletişim

Migration ile ilgili sorular için:
- Script Konumu: `/scripts/migrate-all-tables.js`
- Verification: `/scripts/verify-migration.js`
- Schema: `/prisma/schema.prisma`

---

**Son Güncelleme**: 2025-11-17
**Migration Versiyonu**: 1.0
