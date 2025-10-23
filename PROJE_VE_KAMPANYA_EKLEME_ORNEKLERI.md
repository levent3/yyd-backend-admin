# Proje ve Kampanya Ekleme Örnekleri

Bu dosya, proje ve bağış kampanyası ekleme işlemleri için örnek request body'leri içerir.

## Sorun Neydi?

Sistem **çok dilli (i18n) yapıya** geçmiş durumda. Artık `title`, `slug`, `description`, `content` gibi alanlar doğrudan ana tabloda değil, **translations** tablosunda tutuluyor.

### Eski Format (ÇALIŞMAZ ❌)
```json
{
  "title": "Proje Başlığı",
  "slug": "proje-basligi",
  "description": "Açıklama",
  "content": "İçerik"
}
```

### Yeni Format (ÇALIŞIR ✅)
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Proje Başlığı",
      "slug": "proje-basligi",
      "description": "Açıklama",
      "content": "İçerik"
    }
  ]
}
```

---

## 1. PROJE EKLEME (POST /api/projects)

### Minimum Örnek (Sadece Türkçe)
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Gazzeli Çocuklara Yardım",
      "description": "Gazze'deki çocuklara acil yardım kampanyası",
      "content": "Detaylı içerik burada..."
    }
  ],
  "category": "Acil Yardım",
  "location": "Gazze",
  "country": "Filistin",
  "status": "active"
}
```

### Tam Örnek (Çok Dilli + Tüm Alanlar)
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Su Kuyusu Projesi",
      "slug": "su-kuyusu-projesi",
      "description": "Afrika'da temiz su sağlama projesi",
      "content": "Bu proje kapsamında 50 adet su kuyusu açılacaktır..."
    },
    {
      "language": "en",
      "title": "Water Well Project",
      "slug": "water-well-project",
      "description": "Clean water project in Africa",
      "content": "Under this project, 50 water wells will be drilled..."
    },
    {
      "language": "ar",
      "title": "مشروع بئر المياه",
      "slug": "mashruu-biir-almiyah",
      "description": "مشروع توفير المياه النظيفة في أفريقيا",
      "content": "في إطار هذا المشروع، سيتم حفر 50 بئر مياه..."
    }
  ],
  "coverImage": "https://example.com/images/water-well.jpg",
  "category": "Altyapı",
  "location": "Tanzanya",
  "country": "Tanzanya",
  "status": "active",
  "priority": "high",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "budget": 500000,
  "targetAmount": 500000,
  "collectedAmount": 0,
  "beneficiaryCount": 5000,
  "isActive": true,
  "isFeatured": true,
  "displayOrder": 1
}
```

### Not: slug Opsiyonel
`slug` belirtmezseniz, otomatik olarak `title` alanından üretilir:
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Yetim Çocuklara Eğitim",
      // slug otomatik: "yetim-cocuklara-egitim"
      "description": "Yetim çocuklara eğitim desteği"
    }
  ],
  "category": "Eğitim"
}
```

---

## 2. BAĞIŞ KAMPANYASI EKLEME (POST /api/donations/campaigns)

### Minimum Örnek (Sadece Türkçe)
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Ramazan Yardım Kampanyası",
      "description": "Ramazan ayı boyunca ihtiyaç sahiplerine yardım"
    }
  ],
  "targetAmount": 100000
}
```

### Tam Örnek (Çok Dilli + Tüm Alanlar)
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Kurban Kampanyası 2024",
      "slug": "kurban-kampanyasi-2024",
      "description": "2024 yılı Kurban Bayramı bağış kampanyası"
    },
    {
      "language": "en",
      "title": "Qurban Campaign 2024",
      "slug": "qurban-campaign-2024",
      "description": "2024 Eid al-Adha donation campaign"
    },
    {
      "language": "ar",
      "title": "حملة الأضحى 2024",
      "slug": "hamlat-al-adha-2024",
      "description": "حملة تبرعات عيد الأضحى 2024"
    }
  ],
  "targetAmount": 1000000,
  "imageUrl": "https://example.com/images/qurban-2024.jpg",
  "category": "Kurban",
  "isActive": true,
  "isFeatured": true,
  "displayOrder": 1,
  "startDate": "2024-06-01",
  "endDate": "2024-06-20",
  "projectId": null
}
```

### Projeye Bağlı Kampanya
Eğer kampanyanızı bir projeye bağlamak isterseniz:
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Su Kuyusu Bağış Kampanyası",
      "description": "Su kuyusu projesi için bağış toplama"
    }
  ],
  "targetAmount": 500000,
  "projectId": 5,  // Mevcut bir proje ID'si
  "category": "Altyapı"
}
```

---

## 3. GERİYE DÖNÜK UYUMLULUK (Backward Compatibility)

Sistemde **otomatik dönüştürme** mekanizması eklendi. Eski formatta gönderseniz bile çalışacak:

### Eski Format (Hala Çalışır ✅)
```json
{
  "title": "Test Projesi",
  "description": "Test açıklaması",
  "content": "Test içeriği",
  "category": "Test"
}
```

Bu otomatik olarak şuna dönüştürülecek:
```json
{
  "translations": [
    {
      "language": "tr",
      "title": "Test Projesi",
      "description": "Test açıklaması",
      "content": "Test içeriği"
    }
  ],
  "category": "Test"
}
```

---

## 4. HATA MESAJLARI VE ÇÖZÜMLER

### Hata: "En az bir çeviri gereklidir"
```json
// ❌ YANLIŞ
{
  "category": "Eğitim"
}

// ✅ DOĞRU
{
  "translations": [
    {
      "language": "tr",
      "title": "Eğitim Projesi"
    }
  ],
  "category": "Eğitim"
}
```

### Hata: "Türkçe çeviri zorunludur"
```json
// ❌ YANLIŞ
{
  "translations": [
    {
      "language": "en",
      "title": "Project Title"
    }
  ]
}

// ✅ DOĞRU
{
  "translations": [
    {
      "language": "tr",
      "title": "Proje Başlığı"
    },
    {
      "language": "en",
      "title": "Project Title"
    }
  ]
}
```

### Hata: "authorId is required"
Bu hata **authentication** ile ilgilidir. İstek yaparken:
- Bearer Token gönderdiğinizden emin olun
- Veya Cookie ile authentication yapın
- Token'ın geçerli olduğundan emin olun

```bash
# Authorization header'ı eklemeyi unutmayın
curl -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"translations": [...]}'
```

---

## 5. POSTMAN / THUNDER CLIENT AYARLARI

### Headers
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept-Language: tr
```

### Body (raw JSON)
Yukarıdaki örneklerden birini kullanın.

---

## 6. CURL ÖRNEKLERİ

### Proje Ekleme
```bash
curl -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "translations": [
      {
        "language": "tr",
        "title": "Test Projesi",
        "description": "Test açıklaması"
      }
    ],
    "category": "Test",
    "status": "active"
  }'
```

### Kampanya Ekleme
```bash
curl -X POST http://localhost:5001/api/donations/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "translations": [
      {
        "language": "tr",
        "title": "Test Kampanyası",
        "description": "Test açıklaması"
      }
    ],
    "targetAmount": 50000
  }'
```

---

## 7. DİĞER DİLLER EKLEME

Var olan bir projeye başka dil eklemek için **PUT** isteği:

```json
PUT /api/projects/5

{
  "translations": [
    {
      "language": "tr",
      "title": "Mevcut Türkçe Başlık"
    },
    {
      "language": "en",
      "title": "New English Title",
      "description": "English description"
    },
    {
      "language": "ar",
      "title": "العنوان العربي الجديد",
      "description": "الوصف بالعربية"
    }
  ]
}
```

---

## 8. ÖZET

✅ **YENİ FORMAT:** `translations` array'i kullanın
✅ **ESKİ FORMAT:** Hala çalışır (otomatik dönüştürülür)
✅ **TÜRKÇE ZORUNLU:** En az bir `language: "tr"` çevirisi olmalı
✅ **SLUG OPSİYONEL:** Belirtmezseniz otomatik üretilir
✅ **AUTH GEREKLİ:** Bearer token veya cookie ile authentication yapın

---

## İletişim

Sorun devam ederse:
1. Backend loglarını kontrol edin
2. Request body'nin JSON formatında geçerli olduğundan emin olun
3. Authentication token'ının geçerli olduğunu doğrulayın
4. Prisma schema'yı kontrol edin (`prisma/schema.prisma`)
