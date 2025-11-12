# Kurban Bağışı API Dokümantasyonu

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Database Yapısı](#database-yapısı)
3. [API Kullanımı](#api-kullanımı)
4. [Frontend Entegrasyonu](#frontend-entegrasyonu)
5. [Test Senaryoları](#test-senaryoları)

---

## 🎯 Genel Bakış

Kurban bağışı sistemi, kullanıcıların kurban bağışı yaparken **7 hisse** üzerinden seçim yapmasını ve her hisse için hissedar bilgilerini girmesini sağlar.

### Temel Özellikler:
- ✅ Her kurban = **7 hisse** (sabit)
- ✅ Kullanıcı 1-7 arası hisse seçebilir
- ✅ Her hisse için hissedar bilgisi girilebilir (opsiyonel)
- ✅ Aynı kişiye birden fazla hisse verilebilir
- ✅ Hissedar bilgileri JSON formatında saklanır

---

## 📊 Database Yapısı

### Donation Modeli (Kurban Özgü Alanlar)

```prisma
model Donation {
  // ... diğer alanlar

  // Kurban Bağışı
  isSacrifice         Boolean   @default(false)   // Kurban bağışı mı?
  sacrificeType       String?                     // "nafile", "vacip", "akika", "adak"
  shareCount          Int?      @default(1)       // Kaç hisse? (1-7)
  sharePrice          Float?                      // Hisse başı fiyat
  shareholders        Json?                       // Hissedar bilgileri (JSON array)

  // ... diğer alanlar
}
```

---

## 📡 API Kullanımı

### Endpoint:
```
POST /api/donations/initiate
POST /api/donations/albaraka/initiate
```

### Request Body:

```json
{
  // Temel Bağış Bilgileri
  "amount": 28000,
  "projectId": 5,
  "donorName": "Ali Veli",
  "donorEmail": "ali@example.com",
  "donorPhone": "+905551234567",

  // Kart Bilgileri
  "cardNo": "5400619340701616",
  "cvv": "000",
  "expiry": "0728",
  "cardHolder": "ALI VELI",

  // Ödeme Ayarları
  "currency": "TRY",
  "installment": "00",
  "isAnonymous": false,
  "message": "Rahmetli babam adına",

  // ============ KURBAN ÖZGÜ ============
  "isSacrifice": true,
  "sacrificeType": "nafile",
  "shareCount": 2,
  "sharePrice": 4000,
  "shareholders": [
    {
      "shareNumber": 1,
      "fullName": "Ahmet Yılmaz",
      "phoneNumber": "+905551234567",
      "address": "İstanbul/Kadıköy",
      "note": "Babam adına"
    },
    {
      "shareNumber": 2,
      "fullName": "Mehmet Demir",
      "phoneNumber": "+905559876543",
      "address": "Ankara/Çankaya",
      "note": "Kayınpederim adına"
    }
  ]
}
```

---

## 🔍 Shareholders JSON Şeması

### Zorunlu Alanlar:
- ✅ `shareNumber` (1-7 arası, integer)
- ✅ `fullName` (string, boş olamaz)

### Opsiyonel Alanlar:
- `phoneNumber` (string)
- `address` (string)
- `city` (string)
- `note` (string) - Örn: "Babam adına", "Kayınpederim adına"

### TypeScript Interface:

```typescript
interface Shareholder {
  shareNumber: number;    // 1-7 arası (zorunlu)
  fullName: string;       // Hissedarın adı-soyadı (zorunlu)
  phoneNumber?: string;   // Telefon numarası (opsiyonel)
  address?: string;       // Adres (opsiyonel)
  city?: string;          // Şehir (opsiyonel)
  note?: string;          // Not (opsiyonel, örn: "Babam adına")
}

interface SacrificeDonationRequest {
  // ... diğer bağış alanları

  isSacrifice: boolean;
  sacrificeType?: 'nafile' | 'vacip' | 'akika' | 'adak';
  shareCount: number;     // 1-7 arası
  sharePrice?: number;    // Hisse başı fiyat
  shareholders?: Shareholder[];
}
```

---

## 🎨 Frontend Entegrasyonu

### Örnek React Kodu:

```jsx
import { useState } from 'react';

const SacrificeDonationForm = () => {
  const [shareCount, setShareCount] = useState(1);
  const [shareholders, setShareholders] = useState([]);

  const handleShareCountChange = (count) => {
    setShareCount(count);
    // Hissedar sayısını ayarla
    const newShareholders = Array.from({ length: count }, (_, i) => ({
      shareNumber: i + 1,
      fullName: '',
      phoneNumber: '',
      address: '',
      note: ''
    }));
    setShareholders(newShareholders);
  };

  const handleShareholderChange = (index, field, value) => {
    const updated = [...shareholders];
    updated[index][field] = value;
    setShareholders(updated);
  };

  const handleSubmit = async () => {
    const donationData = {
      amount: shareCount * 4000, // Örnek: 4000 TL/hisse
      projectId: 5,
      donorName: "Ali Veli",
      donorEmail: "ali@example.com",
      donorPhone: "+905551234567",
      cardNo: "5400619340701616",
      cvv: "000",
      expiry: "0728",
      cardHolder: "ALI VELI",

      // Kurban özgü
      isSacrifice: true,
      sacrificeType: "nafile",
      shareCount: shareCount,
      sharePrice: 4000,
      shareholders: shareholders.filter(s => s.fullName.trim() !== '')
    };

    const response = await fetch('/api/donations/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData)
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <div>
      <h2>Kurban Bağışı</h2>

      {/* Hisse Seçimi */}
      <div>
        <label>Hisse Sayısı (1-7):</label>
        <input
          type="number"
          min="1"
          max="7"
          value={shareCount}
          onChange={(e) => handleShareCountChange(parseInt(e.target.value))}
        />
      </div>

      {/* Hissedarlar */}
      {shareholders.map((shareholder, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
          <h3>Hisse #{shareholder.shareNumber}</h3>

          <input
            placeholder="Ad-Soyad *"
            value={shareholder.fullName}
            onChange={(e) => handleShareholderChange(index, 'fullName', e.target.value)}
          />

          <input
            placeholder="Telefon"
            value={shareholder.phoneNumber}
            onChange={(e) => handleShareholderChange(index, 'phoneNumber', e.target.value)}
          />

          <input
            placeholder="Adres"
            value={shareholder.address}
            onChange={(e) => handleShareholderChange(index, 'address', e.target.value)}
          />

          <input
            placeholder="Not (örn: Babam adına)"
            value={shareholder.note}
            onChange={(e) => handleShareholderChange(index, 'note', e.target.value)}
          />
        </div>
      ))}

      <button onClick={handleSubmit}>Bağış Yap (₺{shareCount * 4000})</button>
    </div>
  );
};

export default SacrificeDonationForm;
```

---

## 🧪 Test Senaryoları

### Senaryo 1: Normal Kurban Bağışı (Hissedarsız)

```json
POST /api/donations/initiate
{
  "amount": 28000,
  "projectId": 5,
  "donorName": "Ali Veli",
  "donorEmail": "ali@example.com",
  "donorPhone": "+905551234567",
  "cardNo": "5400619340701616",
  "cvv": "000",
  "expiry": "0728",
  "cardHolder": "ALI VELI",
  "isSacrifice": true,
  "sacrificeType": "nafile",
  "shareCount": 7,
  "sharePrice": 4000,
  "shareholders": null
}
```

**Beklenen Sonuç:** ✅ Başarılı, hissedarlar NULL

---

### Senaryo 2: 2 Hisseli Kurban (2 Farklı Hissedar)

```json
POST /api/donations/initiate
{
  "amount": 8000,
  "projectId": 5,
  "donorName": "Ali Veli",
  "donorEmail": "ali@example.com",
  "donorPhone": "+905551234567",
  "cardNo": "5400619340701616",
  "cvv": "000",
  "expiry": "0728",
  "cardHolder": "ALI VELI",
  "isSacrifice": true,
  "sacrificeType": "nafile",
  "shareCount": 2,
  "sharePrice": 4000,
  "shareholders": [
    {
      "shareNumber": 1,
      "fullName": "Ahmet Yılmaz",
      "phoneNumber": "+905551234567",
      "address": "İstanbul/Kadıköy",
      "note": "Babam adına"
    },
    {
      "shareNumber": 2,
      "fullName": "Mehmet Demir",
      "phoneNumber": "+905559876543",
      "address": "Ankara/Çankaya",
      "note": null
    }
  ]
}
```

**Beklenen Sonuç:** ✅ Başarılı, shareholders dizisi kaydedilir

---

### Senaryo 3: 2 Hisseli Kurban (Aynı Hissedar)

```json
POST /api/donations/initiate
{
  "amount": 8000,
  "projectId": 5,
  "donorName": "Ali Veli",
  "donorEmail": "ali@example.com",
  "donorPhone": "+905551234567",
  "cardNo": "5400619340701616",
  "cvv": "000",
  "expiry": "0728",
  "cardHolder": "ALI VELI",
  "isSacrifice": true,
  "sacrificeType": "vacip",
  "shareCount": 2,
  "sharePrice": 4000,
  "shareholders": [
    {
      "shareNumber": 1,
      "fullName": "Ahmet Yılmaz",
      "phoneNumber": "+905551234567",
      "note": "Hisse 1"
    },
    {
      "shareNumber": 2,
      "fullName": "Ahmet Yılmaz",
      "phoneNumber": "+905551234567",
      "note": "Hisse 2"
    }
  ]
}
```

**Beklenen Sonuç:** ✅ Başarılı, aynı kişi 2 hisse alabilir

---

### Senaryo 4: Hata - Hisse Sayısı Geçersiz

```json
POST /api/donations/initiate
{
  "amount": 32000,
  "isSacrifice": true,
  "shareCount": 8,
  "shareholders": []
}
```

**Beklenen Sonuç:** ❌ 400 Bad Request
```json
{
  "success": false,
  "message": "Hisse sayısı 1 ile 7 arasında olmalıdır"
}
```

---

### Senaryo 5: Hata - Hissedar Bilgileri Eksik

```json
POST /api/donations/initiate
{
  "amount": 4000,
  "isSacrifice": true,
  "shareCount": 1,
  "shareholders": [
    {
      "shareNumber": 1,
      "fullName": "",
      "phoneNumber": "+905551234567"
    }
  ]
}
```

**Beklenen Sonuç:** ❌ 400 Bad Request
```json
{
  "success": false,
  "message": "Her hissedar için hisse numarası ve ad-soyad zorunludur"
}
```

---

## 📌 Validasyon Kuralları

### Backend Validasyonu:

1. **isSacrifice = true ise:**
   - ✅ `shareCount` 1-7 arası olmalı
   - ✅ `sharePrice` pozitif sayı olmalı

2. **shareholders varsa:**
   - ✅ Array formatında olmalı
   - ✅ Hissedar sayısı `shareCount`'tan fazla olamaz
   - ✅ Her hissedar için `shareNumber` ve `fullName` zorunlu
   - ✅ `shareNumber` 1-7 arası olmalı

3. **Database'de:**
   - ✅ `shareholders` JSON olarak saklanır
   - ✅ NULL değer alabilir (hissedarsız kurban için)

---

## 🎯 Sonuç

✅ Kurban bağışı sistemi başarıyla entegre edildi!
✅ Hissedar bilgileri JSON formatında saklanıyor
✅ Frontend entegrasyonu hazır
✅ Validasyon kuralları aktif

**Sıradaki Adımlar:**
1. Frontend'de kurban bağış formu oluşturun
2. Test senaryolarını çalıştırın
3. Production'a deploy edin

---

## 📞 Destek

Sorularınız için: `leventkurt@example.com`

**Dokümantasyon Tarihi:** 12 Ocak 2025
