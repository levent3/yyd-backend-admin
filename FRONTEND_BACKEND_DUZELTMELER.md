# Frontend & Backend Düzeltmeler - Özet Rapor

**Tarih:** 23 Ekim 2024
**Sorun:** Proje ve Kampanya ekleme/düzenleme işlemlerinde hatalar
**Çözüm Durumu:** ✅ TAMAMLANDI

---

## 🎯 Ana Sorun

Sistem **çok dilli (i18n) yapıya** geçmiş. Artık `title`, `slug`, `description`, `content` gibi alanlar doğrudan ana tabloda değil, **translations** tablosunda tutuluyor.

### Eski Format ❌
```json
{
  "title": "Proje Başlığı",
  "description": "Açıklama"
}
```

### Yeni Format ✅
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Proje Başlığı",
      "description": "Açıklama"
    }
  ]
}
```

---

## 🔧 Backend Düzeltmeleri

### 1. Geriye Dönük Uyumluluk Eklendi

**Dosya:** `src/api/modules/projects/project.controller.js`
**Satırlar:** 61-82

```javascript
beforeCreate: async (req, data) => {
  // Eğer translations yoksa, eski formatı yeni formata dönüştür
  if (!data.translations && (data.title || data.description || data.content)) {
    data.translations = [{
      language: 'tr',
      title: data.title || 'Yeni Proje',
      slug: data.slug || null,
      description: data.description || null,
      content: data.content || null
    }];
    // Eski field'ları sil
    delete data.title;
    delete data.slug;
    delete data.description;
    delete data.content;
  }

  return {
    ...data,
    authorId: req.user?.userId || req.user?.id || null,
  };
}
```

**Dosya:** `src/api/modules/donations/donation.controller.js`
**Satırlar:** 62-78

Aynı mekanizma kampanyalar için de eklendi.

### 2. Geliştirilmiş Hata Mesajları

**Dosya:** `src/api/modules/projects/project.service.js`
**Satırlar:** 75-86

```javascript
if (!translations || translations.length === 0) {
  const error = new Error('Proje oluşturmak için en az bir çeviri gereklidir. translations array\'i boş olamaz.');
  error.statusCode = 400;
  throw error;
}

// Türkçe çeviri kontrolü
const hasTurkish = translations.some(t => t.language === 'tr');
if (!hasTurkish) {
  const error = new Error('Türkçe çeviri zorunludur. translations array\'inde language: "tr" olan bir öğe bulunmalıdır.');
  error.statusCode = 400;
  throw error;
}
```

**Dosya:** `src/api/modules/donations/donation.repository.js`
**Satırlar:** 258-269

Aynı validasyon kampanyalar için de eklendi.

### 3. Dokümantasyon

**Dosya:** `PROJE_VE_KAMPANYA_EKLEME_ORNEKLERI.md`

Kapsamlı örnekler ve kullanım senaryoları içeren dokümantasyon oluşturuldu.

---

## 🎨 Frontend Düzeltmeleri

### 1. TypeScript Interface Güncellemeleri

**Dosya:** `src/services/projectService.ts`
**Satırlar:** 31-67

```typescript
export interface ProjectTranslation {
  language: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
}

export interface CreateProjectData {
  // YENİ: Çok dilli yapı
  translations: ProjectTranslation[];

  // Eski alanlar (geriye dönük uyumluluk için opsiyonel)
  title?: string;
  description?: string;
  content?: string;

  // Diğer alanlar...
}
```

**Dosya:** `src/services/donationService.ts`
**Satırlar:** 168-201

```typescript
export interface CampaignTranslation {
  language: string;
  title: string;
  slug?: string;
  description?: string;
}

export interface CreateCampaignData {
  // YENİ: Çok dilli yapı
  translations: CampaignTranslation[];

  // Eski alanlar (geriye dönük uyumluluk için opsiyonel)
  title?: string;
  slug?: string;
  description?: string;

  // Diğer alanlar...
}
```

### 2. Response Interface Güncellemeleri

**Dosya:** `src/services/projectService.ts`
**Satırlar:** 5-37

```typescript
export interface Project {
  id: number;
  // YENİ: Çok dilli yapı - Backend'den gelen response
  translations?: ProjectTranslation[];

  // Mapped fields (backend'de formatlanmış hali)
  title: string;
  slug: string;
  description?: string;
  content?: string;
  // ... diğer alanlar
}
```

**Dosya:** `src/services/donationService.ts`
**Satırlar:** 49-83

Aynı yapı kampanyalar için de eklendi.

### 3. Create Sayfaları - ZATEN DOĞRU!

**Dosya:** `src/pages/admin/projects/create.tsx`
**Dosya:** `src/pages/admin/campaigns/create.tsx`

Bu sayfalar zaten doğru formatta çalışıyordu! ✅
- Tab-based dil desteği mevcut
- translations array'i doğru gönderiliyor
- Slug otomatik oluşturuluyor

### 4. Edit Sayfası Düzeltildi

**Dosya:** `src/pages/admin/campaigns/edit/[id].tsx`

**Değişiklikler:**

1. **State Yapısı (Satır 14-29):**
```typescript
const [activeTab, setActiveTab] = useState('tr');
const [formData, setFormData] = useState({
  translations: [
    { language: 'tr', title: '', slug: '', description: '' },
    { language: 'en', title: '', slug: '', description: '' }
  ],
  // ... diğer alanlar
});
```

2. **Data Fetch (Satır 54-87):**
```typescript
const fetchCampaign = async () => {
  const campaign = await donationService.getCampaignById(Number(id));

  // Backend'den gelen translations varsa kullan
  const translations = campaign.translations || [
    { language: 'tr', title: campaign.title || '', ... },
    { language: 'en', title: '', ... }
  ];

  setFormData({ translations, ... });
};
```

3. **Handle Change (Satır 89-130):**
```typescript
const handleChange = (e) => {
  const { name, value } = e.target;

  // Dil-bağımsız alanlar
  if (name !== 'title' && name !== 'slug' && name !== 'description') {
    setFormData(prev => ({ ...prev, [name]: value }));
    return;
  }

  // Dil-bağımlı alanlar - translations array güncelle
  setFormData(prev => {
    const updatedTranslations = prev.translations.map(trans => {
      if (trans.language === activeTab) {
        const updated = { ...trans, [name]: value };
        if (name === 'title') {
          updated.slug = generateSlug(value);
        }
        return updated;
      }
      return trans;
    });
    return { ...prev, translations: updatedTranslations };
  });
};
```

4. **Form Submit (Satır 132-168):**
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();

  const hasValidTranslation = formData.translations.some(t => t.title.trim() && t.slug.trim());
  if (!hasValidTranslation) {
    toast.error('En az bir dilde kampanya başlığı girmelisiniz');
    return;
  }

  const validTranslations = formData.translations.filter(t => t.title.trim() && t.slug.trim());

  await donationService.updateCampaign(Number(id), {
    translations: validTranslations,
    // ... diğer alanlar
  });
};
```

5. **Form UI (Satır 198-268):**
- Tab-based dil seçimi eklendi
- Her dil için ayrı input field'lar
- Slug otomatik oluşturma

---

## ✅ Düzeltilen Dosyalar - Özet

### Backend (4 dosya)
1. ✅ `src/api/modules/projects/project.controller.js` - beforeCreate hook
2. ✅ `src/api/modules/donations/donation.controller.js` - beforeCreate hook
3. ✅ `src/api/modules/projects/project.service.js` - Geliştirilmiş validasyon
4. ✅ `src/api/modules/donations/donation.repository.js` - Geliştirilmiş validasyon

### Frontend (3 dosya)
1. ✅ `src/services/projectService.ts` - TypeScript interfaces
2. ✅ `src/services/donationService.ts` - TypeScript interfaces
3. ✅ `src/pages/admin/campaigns/edit/[id].tsx` - Tam revizyon

### Dokümantasyon (2 dosya)
1. ✅ `PROJE_VE_KAMPANYA_EKLEME_ORNEKLERI.md` - Kullanım kılavuzu
2. ✅ `FRONTEND_BACKEND_DUZELTMELER.md` - Bu dosya

---

## 🚀 Artık Çalışan Senaryolar

### ✅ Senaryo 1: Yeni Proje Ekleme
**Frontend:** `POST /api/projects`
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Test Projesi",
      "description": "Test açıklaması"
    }
  ],
  "category": "Eğitim",
  "status": "active"
}
```
**Sonuç:** ✅ Başarıyla oluşturulur

### ✅ Senaryo 2: Eski Format (Geriye Dönük Uyumluluk)
**Frontend/Postman:** `POST /api/projects`
```json
{
  "title": "Test Projesi",
  "description": "Test açıklaması",
  "category": "Eğitim"
}
```
**Backend:** Otomatik olarak yeni formata dönüştürülür
**Sonuç:** ✅ Başarıyla oluşturulur

### ✅ Senaryo 3: Kampanya Düzenleme
**Frontend:** `PUT /api/donations/campaigns/5`
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Güncellenmiş Kampanya",
      "slug": "guncellenmis-kampanya",
      "description": "Yeni açıklama"
    },
    {
      "language": "en",
      "title": "Updated Campaign",
      "slug": "updated-campaign",
      "description": "New description"
    }
  ],
  "targetAmount": 100000
}
```
**Sonuç:** ✅ Başarıyla güncellenir, her iki dil de kaydedilir

### ✅ Senaryo 4: Çok Dilli Proje
**Frontend:** `POST /api/projects`
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Su Kuyusu Projesi",
      "description": "Afrika'da su kuyusu açma projesi"
    },
    {
      "language": "en",
      "title": "Water Well Project",
      "description": "Water well project in Africa"
    },
    {
      "language": "ar",
      "title": "مشروع بئر المياه",
      "description": "مشروع حفر بئر مياه في أفريقيا"
    }
  ],
  "category": "Altyapı"
}
```
**Sonuç:** ✅ 3 dilde başarıyla oluşturulur

---

## 🔍 Test Checklist

### Backend Test
- [x] Proje ekleme (yeni format)
- [x] Proje ekleme (eski format - backward compatibility)
- [x] Kampanya ekleme (yeni format)
- [x] Kampanya ekleme (eski format - backward compatibility)
- [x] Hata mesajları (translations boş)
- [x] Hata mesajları (Türkçe eksik)
- [x] authorId otomatik ekleme

### Frontend Test
- [x] TypeScript compile (hata yok)
- [x] Proje create sayfası
- [x] Kampanya create sayfası
- [x] Kampanya edit sayfası
- [x] Dil tabları çalışıyor
- [x] Slug otomatik oluşturuluyor
- [x] Validasyon mesajları

---

## 📋 Kullanım Örnekleri

Detaylı örnekler için bakınız:
- `PROJE_VE_KAMPANYA_EKLEME_ORNEKLERI.md`

**Hızlı Örnek:**
```bash
# Proje Ekleme
curl -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "translations": [
      {
        "language": "tr",
        "title": "Test Projesi",
        "description": "Test"
      }
    ],
    "category": "Test"
  }'

# Kampanya Ekleme
curl -X POST http://localhost:5001/api/donations/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "translations": [
      {
        "language": "tr",
        "title": "Test Kampanyası",
        "description": "Test"
      }
    ],
    "targetAmount": 50000
  }'
```

---

## 🎓 Önemli Notlar

1. **Türkçe Zorunlu:** En az bir `language: "tr"` çevirisi olmalı
2. **Slug Opsiyonel:** Belirtilmezse otomatik oluşturulur
3. **Geriye Dönük Uyumluluk:** Eski format hala çalışır
4. **Çok Dilli Destek:** Sınırsız dil eklenebilir
5. **TypeScript Tipi:** Interface'ler güncel

---

## 🏆 Sonuç

✅ **Backend:** Tam uyumlu, geriye dönük uyumluluk mevcut
✅ **Frontend:** TypeScript interface'leri güncel
✅ **Create Pages:** Zaten doğru çalışıyordu
✅ **Edit Pages:** Kampanya edit sayfası düzeltildi
✅ **Dokümantasyon:** Kapsamlı örnekler eklendi

**Proje ve kampanya ekleme/düzenleme işlemleri artık HATASIZ çalışıyor!** 🎉

---

## 📞 Sorun Olursa

1. Backend loglarını kontrol edin
2. `PROJE_VE_KAMPANYA_EKLEME_ORNEKLERI.md` dosyasına bakın
3. Request body'nin JSON formatında geçerli olduğundan emin olun
4. Authentication token'ının geçerli olduğunu doğrulayın
5. Browser Console'da hata varsa kontrol edin
