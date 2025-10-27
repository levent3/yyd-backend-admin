# YYD Public Website - API Dokümantasyonu

Bu dokümantasyon, public website için kullanılacak **authentication gerektirmeyen** API endpoint'lerini içerir.

**Base URL**: `http://localhost:5001/api` (Production'da değişecek)

---

## 📋 İÇİNDEKİLER

1. [Projeler API](#projeler-api)
2. [Haberler API](#haberler-api)
3. [Galeri API](#galeri-api)
4. [Bağış Kampanyaları API](#bağış-kampanyaları-api)
5. [Banka Hesapları API](#banka-hesapları-api)
6. [İletişim API](#iletişim-api)
7. [Gönüllü Başvuru API](#gönüllü-başvuru-api)
8. [Kariyer Başvuru API](#kariyer-başvuru-api)
9. [Açık İş Pozisyonları API](#açık-iş-pozisyonları-api)
10. [Sepet API](#sepet-api)
11. [Sistem Ayarları API](#sistem-ayarları-api)

---

## 1. PROJELER API

### 1.1. Tüm Projeleri Listele

**Endpoint**: `GET /api/projects/public`

**Query Parameters**:
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına kayıt sayısı (default: 10, max: 50)
- `category` (optional): Kategori filtresi ("Sağlık", "Eğitim", "Acil Yardım" vb.)
- `country` (optional): Ülke filtresi ("Yemen", "Gazze", "Tanzanya" vb.)
- `status` (optional): Durum filtresi ("active", "completed", "paused")
- `isFeatured` (optional): Öne çıkan projeler (true/false)

**Response**:
```json
{
  "success": true,
  "message": "Projeler başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "title": "Gazze'de Sağlık Destek Projesi",
      "slug": "gazze-saglik-destek",
      "description": "Gazze'deki hastanelere tıbbi malzeme desteği",
      "content": "Detaylı proje açıklaması...",
      "coverImage": "http://localhost:5001/uploads/projects/abc123.jpg",
      "category": "Sağlık",
      "location": "Gazze",
      "country": "Filistin",
      "status": "active",
      "priority": "urgent",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "targetAmount": 500000,
      "collectedAmount": 245000,
      "beneficiaryCount": 10000,
      "isFeatured": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "donationCampaigns": [
        {
          "id": 5,
          "title": "Gazze Sağlık Kampanyası",
          "slug": "gazze-saglik-kampanyasi"
        }
      ],
      "galleryItems": [
        {
          "id": 10,
          "title": "Proje Görseli 1",
          "mediaType": "image",
          "fileUrl": "http://localhost:5001/uploads/gallery/xyz789.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2025-10-16T12:00:00.000Z"
}
```

**Kullanım Örneği**:
```javascript
// Tüm aktif projeleri getir
fetch('http://localhost:5001/api/projects/public?status=active&page=1&limit=12')
  .then(res => res.json())
  .then(data => console.log(data.data));

// Öne çıkan projeleri getir
fetch('http://localhost:5001/api/projects/public?isFeatured=true')
  .then(res => res.json())
  .then(data => console.log(data.data));

// Sağlık kategorisindeki projeleri getir
fetch('http://localhost:5001/api/projects/public?category=Sağlık')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

---

### 1.2. Proje Detayı Getir (Slug ile)

**Endpoint**: `GET /api/projects/public/:slug`

**Response**:
```json
{
  "success": true,
  "message": "Proje detayı başarıyla getirildi",
  "data": {
    "id": 1,
    "title": "Gazze'de Sağlık Destek Projesi",
    "slug": "gazze-saglik-destek",
    "description": "Kısa açıklama",
    "content": "Çok detaylı proje açıklaması... (HTML içerebilir)",
    "coverImage": "http://localhost:5001/uploads/projects/abc123.jpg",
    "category": "Sağlık",
    "location": "Gazze",
    "country": "Filistin",
    "status": "active",
    "priority": "urgent",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T00:00:00.000Z",
    "budget": 500000,
    "targetAmount": 500000,
    "collectedAmount": 245000,
    "beneficiaryCount": 10000,
    "isFeatured": true,
    "displayOrder": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "donationCampaigns": [
      {
        "id": 5,
        "title": "Gazze Sağlık Kampanyası",
        "slug": "gazze-saglik-kampanyasi",
        "targetAmount": 500000,
        "collectedAmount": 245000,
        "isActive": true
      }
    ],
    "galleryItems": [
      {
        "id": 10,
        "title": "Proje Görseli 1",
        "mediaType": "image",
        "fileUrl": "http://localhost:5001/uploads/gallery/xyz789.jpg"
      },
      {
        "id": 11,
        "title": "Proje Videosu",
        "mediaType": "video",
        "fileUrl": "http://localhost:5001/uploads/gallery/video123.mp4"
      }
    ]
  },
  "timestamp": "2025-10-16T12:00:00.000Z"
}
```

**Kullanım Örneği**:
```javascript
// Proje detayını getir
fetch('http://localhost:5001/api/projects/public/gazze-saglik-destek')
  .then(res => res.json())
  .then(data => {
    const project = data.data;
    console.log('Proje:', project.title);
    console.log('Toplanan:', project.collectedAmount);
    console.log('Hedef:', project.targetAmount);
    console.log('Progress:', (project.collectedAmount / project.targetAmount * 100).toFixed(2) + '%');
  });
```

---

## 2. HABERLER API

### 2.1. Tüm Haberleri Listele (Yayında Olanlar)

**Endpoint**: `GET /api/news/public`

**Query Parameters**:
- `page` (optional): Sayfa numarası
- `limit` (optional): Sayfa başına kayıt sayısı

**Response**:
```json
{
  "success": true,
  "message": "Haberler başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "title": "Gazze'de Yeni Hastane Açıldı",
      "slug": "gazze-yeni-hastane",
      "summary": "Yeryüzü Doktorları destekleriyle...",
      "imageUrl": "http://localhost:5001/uploads/news/news123.jpg",
      "publishedAt": "2025-10-15T10:00:00.000Z",
      "author": {
        "id": 2,
        "fullName": "Ahmet Yılmaz"
      }
    }
  ],
  "pagination": {...},
  "timestamp": "2025-10-16T12:00:00.000Z"
}
```

**Kullanım Örneği**:
```javascript
fetch('http://localhost:5001/api/news/public?page=1&limit=6')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

---

### 2.2. Haber Detayı (Slug ile)

**Endpoint**: `GET /api/news/public/:slug`

**Response**:
```json
{
  "success": true,
  "message": "Haber detayı başarıyla getirildi",
  "data": {
    "id": 1,
    "title": "Gazze'de Yeni Hastane Açıldı",
    "slug": "gazze-yeni-hastane",
    "summary": "Yeryüzü Doktorları destekleriyle...",
    "content": "<p>Detaylı haber içeriği HTML formatında...</p>",
    "imageUrl": "http://localhost:5001/uploads/news/news123.jpg",
    "publishedAt": "2025-10-15T10:00:00.000Z",
    "author": {
      "id": 2,
      "fullName": "Ahmet Yılmaz",
      "email": "ahmet@yyd.org.tr"
    },
    "createdAt": "2025-10-15T09:00:00.000Z",
    "updatedAt": "2025-10-15T10:00:00.000Z"
  },
  "timestamp": "2025-10-16T12:00:00.000Z"
}
```

---

## 3. GALERİ API

### 3.1. Tüm Galeri Öğelerini Listele

**Endpoint**: `GET /api/gallery/public`

**Query Parameters**:
- `page`, `limit`
- `mediaType` (optional): "image" veya "video"
- `projectId` (optional): Belirli bir projeye ait görseller

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Gazze Hastanesi",
      "mediaType": "image",
      "fileUrl": "http://localhost:5001/uploads/gallery/img001.jpg",
      "createdAt": "2025-10-10T00:00:00.000Z",
      "project": {
        "id": 5,
        "title": "Gazze Sağlık Projesi",
        "slug": "gazze-saglik"
      }
    }
  ],
  "pagination": {...}
}
```

---

## 4. BAĞIŞ KAMPANYALARI API

### 4.1. Tüm Kampanyaları Listele

**Endpoint**: `GET /api/donations/campaigns`

**Query Parameters**:
- `page`, `limit`
- `category` (optional): Kategori filtresi
- `isActive` (optional): true/false
- `isFeatured` (optional): true/false

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Gazze Acil Yardım Kampanyası",
      "slug": "gazze-acil-yardim",
      "description": "Gazze'ye acil yardım...",
      "targetAmount": 1000000,
      "collectedAmount": 450000,
      "imageUrl": "http://localhost:5001/uploads/campaigns/camp001.jpg",
      "category": "Acil Yardım",
      "isActive": true,
      "isFeatured": true,
      "donorCount": 1250,
      "beneficiaryCount": 5000,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "project": {
        "id": 5,
        "title": "Gazze Destek Projesi",
        "slug": "gazze-destek"
      },
      "settings": {
        "presetAmounts": [100, 250, 500, 1000],
        "minAmount": 10,
        "maxAmount": 100000,
        "allowDedication": true,
        "allowAnonymous": true
      }
    }
  ],
  "pagination": {...}
}
```

---

### 4.2. Kampanya Detayı (Slug ile)

**Endpoint**: `GET /api/donations/campaigns/:slug`

**Response**: Yukarıdaki ile aynı formatta, tek kampanya bilgisi

---

### 4.3. Bağış Oluştur (Public - AUTH GEREKMİYOR!)

**Endpoint**: `POST /api/donations/public/donate`

**Request Body**:
```json
{
  "campaignId": 1,
  "amount": 500,
  "currency": "TRY",
  "paymentMethod": "credit_card",
  "donorName": "Ali Veli",
  "donorEmail": "ali@example.com",
  "donorPhone": "+905551234567",
  "message": "Allah kabul etsin",
  "isAnonymous": false,
  "isDedicated": false,
  "dedicatedTo": null,
  "dedicationType": null,
  "dedicationMessage": null,
  "repeatCount": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bağış başarıyla oluşturuldu",
  "data": {
    "id": "uuid-123-456",
    "amount": 500,
    "currency": "TRY",
    "paymentStatus": "pending",
    "transactionId": "TXN-123456",
    "createdAt": "2025-10-16T12:00:00.000Z"
  }
}
```

---

## 5. BANKA HESAPLARI API

### 5.1. Aktif Banka Hesaplarını Listele

**Endpoint**: `GET /api/donations/bank-accounts`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bankName": "Ziraat Bankası",
      "accountName": "Yeryüzü Doktorları Derneği",
      "iban": "TR12 0001 0000 1234 5678 9012 34",
      "swift": "TCZBTR2A",
      "accountNumber": "12345678",
      "branch": "Ankara Kızılay Şubesi",
      "currency": "TRY",
      "displayOrder": 1
    }
  ]
}
```

---

## 6. İLETİŞİM API

### 6.1. İletişim Formu Gönder

**Endpoint**: `POST /api/contact`

**Request Body**:
```json
{
  "fullName": "Mehmet Yılmaz",
  "email": "mehmet@example.com",
  "phoneNumber": "+905551234567",
  "subject": "Proje Hakkında Bilgi",
  "message": "Merhaba, projeleriniz hakkında detaylı bilgi almak istiyorum..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
  "data": {
    "id": 42,
    "submittedAt": "2025-10-16T12:00:00.000Z"
  }
}
```

---

## 7. GÖNÜLLÜ BAŞVURU API

### 7.1. Gönüllü Başvurusu Yap

**Endpoint**: `POST /api/volunteers/apply`

**Request Body**:
```json
{
  "fullName": "Ayşe Demir",
  "email": "ayse@example.com",
  "phoneNumber": "+905551234567",
  "message": "Doktor olarak projelerinizde gönüllü olarak çalışmak istiyorum..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Başvurunuz alındı. En kısa sürede sizinle iletişime geçeceğiz.",
  "data": {
    "id": 15,
    "submittedAt": "2025-10-16T12:00:00.000Z"
  }
}
```

---

## 8. KARİYER BAŞVURU API

### 8.1. Kariyer Başvurusu Yap

**Endpoint**: `POST /api/careers/apply`

**Request Body** (multipart/form-data):
```
fullName: "Fatma Yılmaz"
email: "fatma@example.com"
phoneNumber: "+905551234567"
position: "Proje Koordinatörü"
coverLetter: "Merhaba, proje koordinatörü pozisyonu için başvuruyorum..."
cv: [FILE] (PDF, DOCX, max 5MB)
```

**Response**:
```json
{
  "success": true,
  "message": "Başvurunuz alındı",
  "data": {
    "id": 8,
    "cvUrl": "http://localhost:5001/uploads/cvs/cv-uuid-123.pdf",
    "submittedAt": "2025-10-16T12:00:00.000Z"
  }
}
```

---

## 9. AÇIK İŞ POZİSYONLARI API

### 9.1. Tüm Aktif Pozisyonları Listele

**Endpoint**: `GET /api/job-positions/public`

**Query Parameters**:
- `department` (opsiyonel): Departmana göre filtrele (örn: "Teknoloji", "İletişim")
- `location` (opsiyonel): Lokasyona göre filtrele (örn: "İstanbul")
- `employmentType` (opsiyonel): Çalışma tipine göre filtrele (örn: "Tam Zamanlı")

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Full-Stack Developer",
      "slug": "full-stack-developer",
      "description": "Yeryüzü Doktorları olarak geliştirdiğimiz web uygulamaları...",
      "requirements": "- En az 3 yıl profesyonel yazılım geliştirme deneyimi\n- Node.js, React.js/Next.js konusunda ileri seviye bilgi",
      "responsibilities": "- Web uygulamalarının frontend ve backend geliştirmesi\n- Veritabanı tasarımı ve optimizasyonu",
      "qualifications": "- Bilgisayar Mühendisliği, Yazılım Mühendisliği veya ilgili alanlarda lisans derecesi",
      "department": "Teknoloji",
      "location": "İstanbul (Hibrit)",
      "employmentType": "Tam Zamanlı",
      "isFeatured": true,
      "deadline": null,
      "createdAt": "2025-10-27T11:14:23.267Z",
      "_count": {
        "applications": 5
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 6,
    "itemsPerPage": 10
  }
}
```

---

### 9.2. Pozisyon Detayını Getir (Slug ile)

**Endpoint**: `GET /api/job-positions/slug/{slug}`

**Örnek**: `GET /api/job-positions/slug/full-stack-developer`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Full-Stack Developer",
    "slug": "full-stack-developer",
    "description": "Yeryüzü Doktorları olarak geliştirdiğimiz web uygulamaları ve sistemlerin tasarımı, geliştirilmesi ve bakımı için ekibimize katılacak deneyimli bir Full-Stack Developer arıyoruz.",
    "requirements": "- En az 3 yıl profesyonel yazılım geliştirme deneyimi\n- Node.js, React.js/Next.js konusunda ileri seviye bilgi\n- PostgreSQL veya benzeri veritabanı yönetim sistemleri deneyimi\n- RESTful API tasarımı ve geliştirme deneyimi\n- Git versiyon kontrol sistemi kullanımı\n- Agile/Scrum metodolojileri hakkında bilgi",
    "responsibilities": "- Web uygulamalarının frontend ve backend geliştirmesi\n- Veritabanı tasarımı ve optimizasyonu\n- API entegrasyonları\n- Kod kalitesi ve güvenlik standartlarının sağlanması\n- Ekip üyeleri ile işbirliği içinde çalışma",
    "qualifications": "- Bilgisayar Mühendisliği, Yazılım Mühendisliği veya ilgili alanlarda lisans derecesi\n- Problem çözme ve analitik düşünme becerileri\n- İngilizce bilgisi (teknik dokümantasyon okuyabilme)",
    "department": "Teknoloji",
    "location": "İstanbul (Hibrit)",
    "employmentType": "Tam Zamanlı",
    "isActive": true,
    "isFeatured": true,
    "displayOrder": 1,
    "deadline": null,
    "createdAt": "2025-10-27T11:14:23.267Z",
    "updatedAt": "2025-10-27T11:14:23.267Z",
    "_count": {
      "applications": 0
    }
  }
}
```

---

## 10. SEPET API

### 10.1. Sepete Bağış Ekle

**Endpoint**: `POST /api/cart`

**Request Body**:
```json
{
  "sessionId": "browser-session-uuid-123",
  "campaignId": 5,
  "amount": 250,
  "currency": "TRY",
  "donationType": "one_time",
  "repeatCount": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sepete eklendi",
  "data": {
    "id": "cart-item-uuid",
    "amount": 250,
    "expiresAt": "2025-10-16T12:30:00.000Z"
  }
}
```

---

### 9.2. Sepeti Getir

**Endpoint**: `GET /api/cart/:sessionId`

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-uuid-1",
        "amount": 250,
        "currency": "TRY",
        "donationType": "one_time",
        "campaign": {
          "id": 5,
          "title": "Gazze Kampanyası",
          "imageUrl": "..."
        },
        "expiresAt": "2025-10-16T12:30:00.000Z"
      }
    ],
    "total": 250,
    "itemCount": 1
  }
}
```

---

### 9.3. Sepeti Doğrula

**Endpoint**: `POST /api/cart/validate`

**Request Body**:
```json
{
  "sessionId": "browser-session-uuid-123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "invalidItems": [],
    "validItems": [...]
  }
}
```

---

### 9.4. Sepeti Temizle

**Endpoint**: `DELETE /api/cart/:sessionId`

**Response**:
```json
{
  "success": true,
  "message": "Sepet temizlendi"
}
```

---

## 10. SİSTEM AYARLARI API

### 10.1. Public Sistem Ayarlarını Getir

**Endpoint**: `GET /api/system-settings/public`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "settingKey": "default_currency",
      "settingValue": {
        "code": "TRY",
        "symbol": "₺",
        "name": "Türk Lirası"
      },
      "category": "general"
    },
    {
      "settingKey": "payment_gateways",
      "settingValue": {
        "enabled": ["iyzico", "paytr"],
        "default": "iyzico"
      },
      "category": "payment"
    }
  ]
}
```

---

## 🔍 ÖNEMLİ NOTLAR

### 1. CORS
Backend CORS yapılandırması şu origin'lere izin veriyor:
- `http://localhost:3000` (Admin panel - development)
- `http://localhost:3001` (Public website - development)
- Production URL'leri `.env` dosyasından okunuyor

### 2. Rate Limiting
Public endpoint'ler için rate limit: **15 dakikada 200 istek**

### 3. Tarih Formatı
Tüm tarihler **ISO 8601** formatında döner: `2025-10-16T12:00:00.000Z`

### 4. Görsel URL'leri
Tüm görsel URL'leri tam URL olarak döner:
```
http://localhost:5001/uploads/projects/image.jpg
```

Production'da:
```
https://api.yyd.org.tr/uploads/projects/image.jpg
```

### 5. Pagination
Tüm liste endpoint'lerinde pagination bilgisi döner:
```json
{
  "currentPage": 1,
  "totalPages": 10,
  "totalItems": 95,
  "itemsPerPage": 10,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### 6. Error Handling
Hata durumlarında dönen format:
```json
{
  "success": false,
  "message": "Hata mesajı",
  "errors": {
    "field": "Detaylı hata"
  },
  "timestamp": "2025-10-16T12:00:00.000Z"
}
```

### 7. Session ID Oluşturma (Frontend için)
Sepet işlemleri için frontend'de benzersiz session ID oluştur:
```javascript
// Browser'da sessionId oluştur
let sessionId = localStorage.getItem('yyd_session_id');
if (!sessionId) {
  sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('yyd_session_id', sessionId);
}
```

---

## 🚀 SWAGGER DOKÜMANTASYONU

Daha detaylı API dokümantasyonu için Swagger UI:

**URL**: http://localhost:5001/api-docs

Swagger'da tüm endpoint'leri test edebilirsiniz!

---

## 📞 DESTEK

Backend ile ilgili sorunlar için: backend-team@yyd.org.tr

API endpoint'leri hakkında sorular için Swagger dokümantasyonuna bakın veya yukarıdaki örnekleri kullanın.
