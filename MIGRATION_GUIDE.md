# Campaign to Project Migration Guide

## 📋 Özet

**Sorun:** DonationCampaign modeliyle Project modeli arasında gereksiz bir ilişki vardı. Projeler zaten kampanya işlevi görüyordu.

**Çözüm:** DonationCampaign modelini tamamen kaldırıp, tüm campaign özelliklerini Project modeline taşıdık.

---

## ✅ Tamamlanan Adımlar

### 1. ✅ Prisma Schema Güncellemeleri

**Değişiklikler:**
- `Project` modeline campaign özellikleri eklendi (`donorCount`, `targetAmount`, `collectedAmount`, vb.)
- `DonationCampaign` modeli tamamen kaldırıldı
- `CampaignTranslation` modeli tamamen kaldırıldı
- `CampaignSettings` → `ProjectSettings` olarak yeniden adlandırıldı
- `Donation.campaignId` → `Donation.projectId` olarak değiştirildi
- `RecurringDonation.campaignId` → `RecurringDonation.projectId` olarak değiştirildi
- `CartItem.campaignId` → `CartItem.projectId` olarak değiştirildi
- `Brochure` ve `SuccessStory` modellerinden `campaignId` ilişkisi kaldırıldı

**Dosya:** `prisma/schema.prisma`

### 2. ✅ Veri Migration Script'i Oluşturuldu

Migration script'i mevcut DonationCampaign verilerini Project'lere taşıyacak.

**Dosya:** `prisma/migrations/migrate-campaigns-to-projects.js`

**Script şunları yapıyor:**
1. Tüm mevcut campaign'leri alıyor
2. Eğer campaign'in bir projesi varsa → o projeye merge ediyor
3. Eğer campaign'in projesi yoksa → yeni proje oluşturuyor
4. Campaign translations'ları → Project translations'larına taşıyor
5. CampaignSettings → ProjectSettings'e dönüştürüyor
6. Tüm ilişkili tabloları güncelliyor (Donation, RecurringDonation, CartItem)

---

## 🔜 Yapılması Gerekenler

### 3. ⏳ Backend Kodlarını Güncelle

**Güncellenmesi Gereken Dosyalar:**

#### a) `src/api/modules/donations/donation.service.js`
- `campaignId` → `projectId` değiştir
- `getAllCampaigns()` fonksiyonunu kaldır veya `getAllProjects()` ile değiştir
- `getCampaignById()`, `getCampaignBySlug()` fonksiyonlarını kaldır
- `createCampaign()`, `updateCampaign()`, `deleteCampaign()` fonksiyonlarını kaldır
- `updateCampaignTotal()` fonksiyonunu `updateProjectTotal()` olarak değiştir

#### b) `src/api/modules/donations/donation.repository.js`
- Aynı değişiklikleri repository'de de yap
- Campaign ile ilgili tüm query'leri kaldır

#### c) `src/api/modules/donations/donation.controller.js`
- Campaign controller fonksiyonlarını kaldır
- `createDonation` fonksiyonunda `campaignId` → `projectId`

#### d) `src/api/modules/donations/donation.routes.js`
- Campaign route'larını tamamen kaldır:
  - `GET /api/donations/campaigns/public`
  - `GET /api/donations/campaigns/slug/:slug`
  - `GET /api/donations/campaigns`
  - `POST /api/donations/campaigns`
  - `PUT /api/donations/campaigns/:id`
  - `DELETE /api/donations/campaigns/:id`

#### e) `src/api/modules/projects/project.service.js`
- Zaten mevcut, ek güncelleme gerekmeyebilir
- `updateProjectTotal()` fonksiyonu ekle (campaign total yerine)

#### f) `src/api/modules/recurring-donations/` ve `src/api/modules/cart/`
- `campaignId` → `projectId` değiştir

#### g) `src/api/modules/campaign-settings/` klasörünü → `project-settings/` olarak yeniden adlandır
- Tüm dosyalardaki `CampaignSettings` → `ProjectSettings`
- Route'ları `/api/campaign-settings` → `/api/project-settings` olarak değiştir

### 4. ⏳ Database Migration Çalıştır

**⚠️ ÇOK ÖNEMLİ: ÖNCE YEDEK ALIN!**

```bash
# 1. Veritabanı yedeği al
pg_dump yyd_db > backup_before_migration.sql

# 2. Data migration script'ini çalıştır (DonationCampaign verilerini Project'e taşı)
node prisma/migrations/migrate-campaigns-to-projects.js

# 3. Prisma schema migration'ı çalıştır (tabloları sil)
npx prisma migrate dev --name remove-donation-campaign

# 4. Prisma client'ı yeniden generate et
npx prisma generate
```

### 5. ⏳ Frontend Güncellemeleri

**Güncellenmesi Gereken Sayfalar:**

#### Kaldırılacak Sayfalar:
- `src/pages/admin/campaigns/index.tsx`
- `src/pages/admin/campaigns/create.tsx`
- `src/pages/admin/campaigns/edit/[id].tsx`

#### Güncellenecek Sayfalar:
- `src/pages/admin/projects/index.tsx` - Campaign listesi buraya merge edilecek
- `src/pages/admin/projects/create.tsx` - Campaign form alanları eklenecek
- `src/pages/admin/projects/edit/[id].tsx` - Campaign düzenleme buraya taşınacak
- `src/pages/admin/campaign-settings/index.tsx` → `project-settings/index.tsx` olarak yeniden adlandır

#### API Çağrılarını Güncelle:
- `/api/donations/campaigns` → `/api/projects` olarak değiştir
- `campaignId` → `projectId` olarak değiştir

#### Menu Güncellemesi:
- `src/layout/Sidebar/menu.tsx` - "Kampanyalar" menü öğesini kaldır veya "Projeler" ile birleştir

### 6. ⏳ Test Et

```bash
# Backend testleri
npm test

# Manuel test senaryoları:
# 1. Proje oluştur
# 2. Projeye bağış yap
# 3. Tekrarlayan bağış oluştur
# 4. Sepete ekle
# 5. Dashboard'da istatistikleri kontrol et
```

---

## 📊 Değişiklik Özeti

| Eski | Yeni |
|------|------|
| `DonationCampaign` model | Kaldırıldı → `Project` |
| `CampaignTranslation` model | Kaldırıldı → `ProjectTranslation` |
| `CampaignSettings` model | `ProjectSettings` |
| `Donation.campaignId` | `Donation.projectId` |
| `RecurringDonation.campaignId` | `RecurringDonation.projectId` |
| `CartItem.campaignId` | `CartItem.projectId` |
| `GET /api/donations/campaigns` | `GET /api/projects` |
| `POST /api/donations/campaigns` | `POST /api/projects` |
| `/admin/campaigns` | `/admin/projects` |
| `/admin/campaign-settings` | `/admin/project-settings` |

---

## 🚨 Dikkat Edilmesi Gerekenler

1. **Veritabanı Yedeği:** Migration'dan önce mutlaka tam yedek alın
2. **Staging Test:** Önce staging/test ortamında deneyin
3. **Downtime:** Migration sırasında sistemin çalışmayacağını kullanıcılara bildirin
4. **Rollback Planı:** Hata durumunda geri alma planı hazırlayın
5. **Data Validation:** Migration sonrası veri bütünlüğünü kontrol edin

---

## 🔄 Rollback Planı

Eğer bir şeyler ters giderse:

```bash
# 1. Veritabanını geri yükle
psql yyd_db < backup_before_migration.sql

# 2. Git'te eski commit'e dön
git checkout <önceki-commit-hash>

# 3. Prisma client'ı eski haline getir
npx prisma generate
```

---

## ✨ Faydalar

Bu değişiklikten sonra:
- ✅ Daha basit ve anlaşılır veri modeli
- ✅ Gereksiz JOIN'ler kaldırıldı → Daha hızlı sorgular
- ✅ Daha az kod → Daha kolay bakım
- ✅ Frontend'de tek endpoint → Daha tutarlı API
- ✅ Kavramsal netlik → Proje = Kampanya

---

## 📝 Notlar

- Campaign tablosu kaldırıldıktan sonra geri getirilemez
- Tüm campaign verileri project'lere taşınacak
- Eski campaign ID'leri artık kullanılmayacak
- API endpoint'leri değiştiğinden frontend de güncellenmeli

---

**Hazırlayan:** Claude Code
**Tarih:** 2025-10-31
