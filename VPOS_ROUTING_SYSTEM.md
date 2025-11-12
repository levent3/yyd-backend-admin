# 🏦 VPOS ROUTING SİSTEMİ - Teknik Dokümantasyon

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [VPOS Seçim Mantığı](#vpos-seçim-mantığı)
4. [Frontend Entegrasyonu](#frontend-entegrasyonu)
5. [API Endpoint'leri](#api-endpointleri)
6. [Test Senaryoları](#test-senaryoları)
7. [Hata Yönetimi](#hata-yönetimi)

---

## 🎯 Genel Bakış

### Sorun
Önceki sistemde frontend, hangi kartın hangi VPOS'a gideceğine karar veriyordu. Bu:
- ❌ Frontend'e gereksiz yük bindiriyordu
- ❌ BIN listesi her değiştiğinde frontend'i güncellemek gerekiyordu
- ❌ Business logic frontend'e sızmıştı
- ❌ Güvenlik riski oluşturuyordu

### Çözüm
**Backend tarafında akıllı VPOS routing sistemi:**
- ✅ Frontend sadece tek bir endpoint'e istek atar
- ✅ Backend, kart BIN koduna göre otomatik VPOS seçimi yapar
- ✅ BIN listesi değişikliklerinde frontend güncelleme gerektirmez
- ✅ Business logic backend'de kalır
- ✅ Merkezi yönetim ve güvenlik

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Next.js)               │
│                                                             │
│  Kullanıcı kart bilgilerini girer                          │
│         ↓                                                   │
│  POST /api/donations/initiate                              │
│  {                                                          │
│    cardNo: "5400619360964581",                             │
│    amount: 100,                                            │
│    isRecurring: false,                                     │
│    ...                                                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  1. Unified Payment Controller                     │    │
│  │     - Request validation                           │    │
│  │     - Donor bilgileri kontrolü                     │    │
│  └───────────────────────────────────────────────────┘    │
│                            ↓                                │
│  ┌───────────────────────────────────────────────────┐    │
│  │  2. VPOS Router Service                           │    │
│  │     - BIN extraction (ilk 6 hane)                 │    │
│  │     - isRecurring kontrolü                        │    │
│  │     - Database'de BIN lookup                      │    │
│  │     - Bank.isVirtualPosActive kontrolü            │    │
│  └───────────────────────────────────────────────────┘    │
│                            ↓                                │
│         ┌─────────────────┴──────────────────┐            │
│         ↓                                     ↓            │
│  ┌──────────────────┐              ┌──────────────────┐   │
│  │ Albaraka VPOS    │              │ Türkiye Finans   │   │
│  │ Service          │              │ VPOS Service     │   │
│  │ (Alternatif)     │              │ (Ana/Default)    │   │
│  └──────────────────┘              └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     3D SECURE FLOW                          │
│                                                             │
│  Frontend → 3D Form render → Banka 3D sayfası →            │
│  SMS doğrulama → Callback → Payment completed              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 VPOS Seçim Mantığı

### Karar Akış Şeması

```
Kullanıcı kart bilgilerini girer
        ↓
    ┌───────────────────┐
    │ isRecurring = true? │
    └───────────────────┘
         ↓ Evet         ↓ Hayır
         ↓              ↓
    ┌─────────┐    ┌──────────────┐
    │ Türkiye │    │ BIN Lookup   │
    │ Finans  │    │ (Database)   │
    │ VPOS    │    └──────────────┘
    └─────────┘         ↓
                   ┌──────────────┐
                   │ BIN bulundu? │
                   └──────────────┘
                    ↓ Hayır    ↓ Evet
                    ↓          ↓
               ┌─────────┐  ┌──────────────────────┐
               │ Türkiye │  │ Bank.isVirtualPos    │
               │ Finans  │  │ Active = true?       │
               │ VPOS    │  └──────────────────────┘
               └─────────┘   ↓ Evet      ↓ Hayır
                             ↓           ↓
                        ┌──────────┐ ┌─────────┐
                        │ Albaraka │ │ Türkiye │
                        │ VPOS     │ │ Finans  │
                        └──────────┘ └─────────┘
```

### Kurallar

#### 1️⃣ Düzenli Ödeme Kontrolü (Öncelikli)
```javascript
if (isRecurring === true) {
  return "Türkiye Finans VPOS"; // HER ZAMAN!
}
```
**Neden?** Düzenli ödemeler için Türkiye Finans VPOS altyapısı kullanılıyor.

#### 2️⃣ BIN Lookup
```javascript
const binCode = cardNo.substring(0, 6); // İlk 6 hane
const binInfo = await findBinInDatabase(binCode);
```

#### 3️⃣ Bank Kontrolü
```javascript
if (binInfo.bank.isVirtualPosActive === true) {
  return "Albaraka VPOS"; // Alternatif VPOS
} else {
  return "Türkiye Finans VPOS"; // Default
}
```

#### 4️⃣ BIN Bulunamadı
```javascript
if (!binInfo) {
  return "Türkiye Finans VPOS"; // Güvenli default
}
```

---

## 👨‍💻 Frontend Entegrasyonu

### Eski Yöntem (Kullanılmamalı ❌)
```javascript
// Frontend'de BIN kontrolü yapılıyordu (YANLIŞ!)
const binCode = cardNumber.substring(0, 6);

if (binCode === '540061' || binCode === '424242') {
  // Albaraka'ya gönder
  await fetch('/api/donations/albaraka/initiate', {...});
} else {
  // Türkiye Finans'a gönder
  await fetch('/api/donations/turkiye-finans/initiate', {...});
}
```

### Yeni Yöntem (Önerilen ✅)
```javascript
// Frontend sadece tek endpoint kullanır, backend karar verir!
const response = await fetch('/api/donations/initiate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    // Kart bilgileri
    cardNo: '5400619360964581',
    cvv: '123',
    expiry: '2512',
    cardHolder: 'AHMET YILMAZ',

    // Bağış bilgileri
    amount: 100,
    currency: 'TRY',
    installment: '00', // Peşin

    // Bağışçı bilgileri
    donorName: 'Ahmet Yılmaz',
    donorEmail: 'ahmet@example.com',
    donorPhone: '+90 555 123 4567',

    // Proje bilgisi
    projectId: 1,

    // Özel alanlar
    isRecurring: false, // Düzenli ödeme mi?
    isAnonymous: false,
    message: 'Hayırlı olsun'
  })
});

const data = await response.json();

if (data.success) {
  // 3D Secure form'u render et
  render3DSecureForm(data.data.formData);
} else {
  // Hata göster
  showError(data.message);
}
```

### 3D Secure Form Rendering
```javascript
function render3DSecureForm(formData) {
  const { action, method, fields } = formData;

  // Dinamik form oluştur
  const form = document.createElement('form');
  form.action = action;
  form.method = method;

  // Hidden input'ları ekle
  Object.keys(fields).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = fields[key];
    form.appendChild(input);
  });

  // Form'u DOM'a ekle ve submit et
  document.body.appendChild(form);
  form.submit(); // Banka 3D Secure sayfasına yönlenir
}
```

---

## 🔌 API Endpoint'leri

### 1. Unified Payment Initiation (Ana Endpoint)

**Endpoint:** `POST /api/donations/initiate`

**Açıklama:** Akıllı VPOS routing ile ödeme başlatma. Frontend bu endpoint'i kullanmalı.

**Request Body:**
```json
{
  "amount": 100,
  "currency": "TRY",
  "installment": "00",
  "projectId": 1,

  "donorName": "Ahmet Yılmaz",
  "donorEmail": "ahmet@example.com",
  "donorPhone": "+90 555 123 4567",

  "cardNo": "5400619360964581",
  "cvv": "123",
  "expiry": "2512",
  "cardHolder": "AHMET YILMAZ",

  "isRecurring": false,
  "isAnonymous": false,
  "message": "Hayırlı olsun"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "3D Secure ödeme formu oluşturuldu",
  "data": {
    "donationId": "uuid-here",
    "orderId": "YYD-1762931179265-LJW0UIQ",
    "formData": {
      "action": "https://epostest.albarakaturk.com.tr/...",
      "method": "POST",
      "fields": {
        "MerchantNo": "6700950031",
        "OrderId": "YYD-...",
        "Amount": "10000",
        "CardNo": "5400619360964581",
        ...
      }
    }
  },
  "timestamp": "2025-11-12T07:06:19.275Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Kart bilgileri eksik",
  "errors": [...]
}
```

### 2. Albaraka Callback

**Endpoint:** `POST /api/donations/albaraka/callback`

**Açıklama:** Albaraka 3D Secure doğrulaması sonrası callback. Bu endpoint Albaraka tarafından çağrılır.

**Not:** Frontend bu endpoint'i direkt çağırmaz. Albaraka'dan otomatik gelir.

### 3. Albaraka Direct Initiate (Opsiyonel)

**Endpoint:** `POST /api/donations/albaraka/initiate`

**Açıklama:** Direkt Albaraka VPOS'a yönlendirme (BIN kontrolü yapılmaz).

**Kullanım Durumu:** Test veya özel senaryolar için. Normal kullanımda `/api/donations/initiate` tercih edilmeli.

### 4. Türkiye Finans Initiate (Placeholder)

**Endpoint:** `POST /api/donations/turkiye-finans/initiate`

**Açıklama:** Direkt Türkiye Finans VPOS'a yönlendirme.

**Durum:** Henüz implement edilmedi (501 Not Implemented döner).

---

## 🧪 Test Senaryoları

### Senaryo 1: Albaraka VPOS'a Yönlendirme

**Test Kartı:** `5400619360964581` (BIN: 540061)

**Koşullar:**
- BIN database'de kayıtlı
- Bank: Ziraat Bankası
- Bank.isVirtualPosActive = `true`
- isRecurring = `false`

**Beklenen Sonuç:** ✅ Albaraka VPOS

**Test:**
```bash
curl -X POST http://localhost:5000/api/donations/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "cardNo": "5400619360964581",
    "amount": 100,
    "donorName": "Test User",
    "donorEmail": "test@example.com",
    "cvv": "000",
    "expiry": "2512",
    "cardHolder": "TEST USER",
    "isRecurring": false
  }'
```

### Senaryo 2: Türkiye Finans VPOS (Düzenli Ödeme)

**Test Kartı:** `5400619360964581` (BIN: 540061)

**Koşullar:**
- isRecurring = `true` (Düzenli ödeme)

**Beklenen Sonuç:** ✅ Türkiye Finans VPOS (BIN'e bakmadan!)

**Test:**
```bash
curl -X POST http://localhost:5000/api/donations/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "cardNo": "5400619360964581",
    "amount": 100,
    "isRecurring": true
  }'
```

### Senaryo 3: Türkiye Finans VPOS (BIN Bulunamadı)

**Test Kartı:** `9999999999999999` (BIN: 999999)

**Koşullar:**
- BIN database'de kayıtlı değil

**Beklenen Sonuç:** ✅ Türkiye Finans VPOS (Default)

**Test:**
```bash
curl -X POST http://localhost:5000/api/donations/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "cardNo": "9999999999999999",
    "amount": 100,
    "isRecurring": false
  }'
```

### Senaryo 4: Türkiye Finans VPOS (isVirtualPosActive = false)

**Test Kartı:** `4242424242424242` (BIN: 424242)

**Koşullar:**
- BIN database'de kayıtlı
- Bank: İş Bankası
- Bank.isVirtualPosActive = `false`

**Beklenen Sonuç:** ✅ Türkiye Finans VPOS

---

## ⚠️ Hata Yönetimi

### Validation Hataları

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Geçerli bir bağış tutarı giriniz"
}
```

**Yaygın Hatalar:**
- Amount <= 0
- Kart bilgileri eksik (cardNo, cvv, expiry, cardHolder)
- Bağışçı bilgileri eksik (donorName, donorEmail)

### VPOS Hataları

**501 Not Implemented:** (Türkiye Finans henüz hazır değil)
```json
{
  "success": false,
  "message": "Türkiye Finans VPOS entegrasyonu henüz tamamlanmadı",
  "vposType": "turkiye_finans"
}
```

### Network Hataları

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Ödeme işlemi sırasında bir hata oluştu",
  "error": "..."
}
```

**Frontend Tarafında Handling:**
```javascript
try {
  const response = await fetch('/api/donations/initiate', {...});
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ödeme başlatılamadı');
  }

  if (data.success) {
    render3DSecureForm(data.data.formData);
  }
} catch (error) {
  console.error('Payment Error:', error);
  showErrorMessage('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
}
```

---

## 📊 Database Yapısı

### Bank Tablosu
```sql
CREATE TABLE "Bank" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "isVirtualPosActive" BOOLEAN DEFAULT false, -- VPOS seçimi için kritik!
  "isActive" BOOLEAN DEFAULT true,
  "displayOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### BinCode Tablosu
```sql
CREATE TABLE "BinCode" (
  "id" SERIAL PRIMARY KEY,
  "binCode" TEXT UNIQUE NOT NULL, -- 6 haneli kart BIN
  "bankId" INTEGER REFERENCES "Bank"("id") ON DELETE CASCADE,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "BinCode_binCode_idx" ON "BinCode"("binCode");
CREATE INDEX "BinCode_bankId_idx" ON "BinCode"("bankId");
```

### Örnek Data
```sql
-- Ziraat Bankası (Albaraka VPOS kullanacak)
INSERT INTO "Bank" (name, "isVirtualPosActive") VALUES ('Ziraat Bankası', true);

-- İş Bankası (Türkiye Finans VPOS kullanacak)
INSERT INTO "Bank" (name, "isVirtualPosActive") VALUES ('İş Bankası', false);

-- BIN Kodları
INSERT INTO "BinCode" ("binCode", "bankId") VALUES ('540061', 1); -- Ziraat
INSERT INTO "BinCode" ("binCode", "bankId") VALUES ('424242', 2); -- İş Bankası
```

---

## 🔐 Güvenlik Notları

### 1. Kart Bilgileri
- ✅ Kart numarasının sadece ilk 6 hanesi (BIN) ve son 4 hanesi database'e kaydedilir
- ✅ Tam kart numarası, CVV ve expiry asla database'e yazılmaz
- ✅ Hassas bilgiler sadece VPOS'a iletilir

### 2. PCI-DSS Compliance
- ✅ Backend kart bilgilerini geçici olarak işler, saklamaz
- ✅ HTTPS zorunlu (production'da)
- ✅ Logging'de kart bilgileri maskelenir

### 3. Rate Limiting
- ✅ Endpoint'lerde rate limiting aktif
- ✅ Brute force saldırılarına karşı koruma

---

## 📈 Monitoring & Logging

### Console Logs (Development)
```javascript
VPOS Selection: {
  vposType: 'albaraka',
  bankName: 'Ziraat Bankası',
  reason: 'Ziraat Bankası bankası için alternatif VPOS (Albaraka) kullanılıyor'
}
```

### Database Logs
Her donation için:
- `paymentGateway`: 'albaraka' veya 'turkiye_finans'
- `cardBin`: İlk 6 hane (örn: '540061')
- `cardLastFour`: Son 4 hane (örn: '4581')

### Metrics (Production)
- VPOS seçim dağılımı (Albaraka vs Türkiye Finans)
- BIN başarı oranları
- Ortalama işlem süreleri

---

## 🚀 Deployment Checklist

### Backend Hazırlık
- [ ] Türkiye Finans VPOS entegrasyonu tamamlandı mı?
- [ ] Environment variables set edildi mi? (`.env.production`)
- [ ] Database migration çalıştırıldı mı?
- [ ] BIN listesi database'e yüklendi mi?
- [ ] Production URL'leri güncellendi mi? (callback, success, fail)

### Frontend Hazırlık
- [ ] Unified endpoint entegrasyonu yapıldı mı?
- [ ] 3D Secure form rendering test edildi mi?
- [ ] Error handling implement edildi mi?
- [ ] Loading states eklendi mi?
- [ ] Success/Fail sayfaları hazır mı?

### Testing
- [ ] Albaraka VPOS test senaryoları başarılı mı?
- [ ] Türkiye Finans VPOS test senaryoları başarılı mı?
- [ ] Düzenli ödeme senaryoları test edildi mi?
- [ ] BIN bulunamama durumu test edildi mi?
- [ ] Callback flow end-to-end test edildi mi?

---

## 📞 Destek & İletişim

### Teknik Sorular
- Backend Team: backend-team@example.com
- Frontend Team: frontend-team@example.com

### VPOS Entegrasyon Sorunları
- Albaraka: albaraka-support@albarakaturk.com.tr
- Türkiye Finans: vpos-support@turkiyefinans.com.tr

### Dokümantasyon
- Albaraka API Docs: `/docs/ALBARAKA_API.md`
- Türkiye Finans API Docs: `/docs/TURKIYE_FINANS_API.md` (TODO)
- Postman Collection: `/postman/VPOS_Routes.json`

---

## 📝 Changelog

### Version 1.0.0 (2025-11-12)
- ✅ Unified payment endpoint (`/api/donations/initiate`)
- ✅ VPOS Router Service
- ✅ BIN-based routing logic
- ✅ Albaraka VPOS integration
- ✅ Database schema for Bank & BinCode
- ✅ Comprehensive error handling
- ⏳ Türkiye Finans VPOS (Placeholder)

### Upcoming (v1.1.0)
- [ ] Türkiye Finans VPOS implementation
- [ ] Recurring payment support
- [ ] Admin panel for BIN management
- [ ] Real-time VPOS health monitoring
- [ ] Advanced analytics dashboard

---

**Son Güncelleme:** 12 Kasım 2025
**Doküman Versiyonu:** 1.0.0
**Hazırlayan:** Backend Team

---

## 💡 Özet (TL;DR)

### Frontend Developer İçin:
1. **Sadece bu endpoint'i kullan:** `POST /api/donations/initiate`
2. **BIN kontrolü yapma!** Backend halleder.
3. **Response'daki formData'yı render et** ve submit et.
4. **Callback'i bekle**, başarı/hata sayfalarına yönlendir.

### Backend Developer İçin:
1. **VPOS Router Service** BIN'e göre karar verir.
2. **isRecurring = true** ise her zaman Türkiye Finans.
3. **Bank.isVirtualPosActive = true** ise Albaraka.
4. **Default:** Türkiye Finans VPOS.

### Product Owner İçin:
1. **Tek endpoint, akıllı yönlendirme.**
2. **BIN listesi değişikliklerinde frontend güncellemesi gerekmez.**
3. **Merkezi yönetim, kolay bakım.**
4. **Güvenli ve ölçeklenebilir.**
