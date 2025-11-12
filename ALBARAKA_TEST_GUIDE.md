# ALBARAKA ÖDEME SİSTEMİ TEST KILAVUZU

## ✅ Test Sonuçları

**Tarih:** 11 Kasım 2025
**Durum:** TÜM TESTLER BAŞARILI ✅

---

## 📋 Yapılan Testler

### 1. **Albaraka Servis Başlatma**
- ✅ Environment değişkenleri yüklendi
- ✅ Albaraka servisi başarıyla initialize edildi
- ✅ Konfigürasyon validasyonu çalışıyor

### 2. **MAC Hash Generation**
- ✅ SHA256 hash doğru oluşturuluyor
- ✅ Merchant bilgileri ve kart bilgileri ile hash üretimi başarılı
- ✅ Base64 encoding çalışıyor

### 3. **3D Secure Form Oluşturma**
- ✅ Form action URL doğru
- ✅ Form fields tamamlanıyor
- ✅ Albaraka test ortamına yönlendirme hazır

### 4. **API Endpoint Testi**
- ✅ POST `/api/donations/albaraka/initiate` endpoint çalışıyor
- ✅ Donation kaydı oluşturuluyor
- ✅ Donor otomatik oluşturuluyor
- ✅ 3D Secure form parametreleri döndürülüyor

---

## 🧪 Manuel Test Adımları

### Test 1: API Endpoint Test (Docker içinde)

```bash
docker exec yyd_api_dev node -e "
const axios = require('axios');

const testData = {
  amount: 100,
  donorName: 'Test Kullanıcı',
  donorEmail: 'test@example.com',
  donorPhone: '+90 555 123 4567',
  cardNo: '5400619360964581',
  cvv: '000',
  expiry: '2512',
  cardHolder: 'TEST KULLANICI',
  projectId: 1
};

axios.post('http://localhost:5000/api/donations/albaraka/initiate', testData)
  .then(response => {
    console.log('✅ BAŞARILI!');
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.log('❌ HATA:', error.response ? error.response.data : error.message);
  });
"
```

### Test 2: Postman/Insomnia ile Test

**Endpoint:** `POST http://localhost:5000/api/donations/albaraka/initiate`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 100,
  "donorName": "Ahmet Yılmaz",
  "donorEmail": "ahmet@example.com",
  "donorPhone": "+90 555 123 4567",
  "cardNo": "5400619360964581",
  "cvv": "000",
  "expiry": "2512",
  "cardHolder": "AHMET YILMAZ",
  "projectId": 1,
  "isAnonymous": false,
  "message": "Hayırlı olsun"
}
```

**Beklenen Response (200 OK):**
```json
{
  "success": true,
  "message": "3D Secure ödeme formu oluşturuldu",
  "data": {
    "donationId": "uuid-buraya-gelecek",
    "orderId": "YYD-1762861460327-4ZKXH23",
    "formData": {
      "action": "https://epostest.albarakaturk.com.tr/ALBSecurePaymentUI/SecureProcess/SecureVerification.aspx",
      "method": "POST",
      "fields": {
        "MerchantNo": "6700950031",
        "TerminalNo": "67540050",
        "PosnetID": "1010028724242434",
        "OrderId": "YYD-...",
        "Amount": "10000",
        "Currency": "TRY",
        "Installment": "00",
        "CardNo": "5400619360964581",
        "Cvv": "000",
        "ExpireDate": "2512",
        "CardHolder": "AHMET YILMAZ",
        "Mac": "base64-hash-burada",
        "MerchantReturnURL": "http://localhost:5000/api/donations/3d-callback",
        "SuccessURL": "http://localhost:3000/bagis/basarili",
        "FailURL": "http://localhost:3000/bagis/basarisiz",
        "Email": "ahmet@example.com",
        "Phone": "+90 555 123 4567",
        "OpenANewWindow": "0"
      }
    }
  },
  "timestamp": "2025-11-11T11:44:20.344Z"
}
```

---

## 💳 Test Kartları (Albaraka Test Ortamı)

| Kart Bilgisi | Değer |
|-------------|-------|
| **Kart No** | `5400619360964581` |
| **CVV** | `000` |
| **Son Kullanma Tarihi** | `25/12` (YYMM: `2512`) |
| **SMS Şifresi** | `34020` |

---

## 🔄 3D Secure Flow Test (Frontend ile)

### Adım 1: Payment Initiation
Frontend'den `/api/donations/albaraka/initiate` endpoint'ine POST isteği at.

### Adım 2: 3D Form Render
Response'dan gelen `formData`'yı kullanarak HTML form oluştur:

```javascript
const { action, method, fields } = response.data.data.formData;

const form = document.createElement('form');
form.action = action;
form.method = method;

Object.keys(fields).forEach(key => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = key;
  input.value = fields[key];
  form.appendChild(input);
});

document.body.appendChild(form);
form.submit(); // Albaraka 3D Secure sayfasına gider
```

### Adım 3: 3D Secure Doğrulama
- Albaraka test sayfasında SMS şifresi iste: `34020`
- Doğrulama sonrası otomatik callback'e yönlendirilir

### Adım 4: Callback Handling
- Başarılı: `http://localhost:3000/bagis/basarili?orderId=...&amount=...`
- Başarısız: `http://localhost:3000/bagis/basarisiz?error=...`

---

## 📊 Database Kontrolü

Donation kaydını kontrol etmek için:

```bash
docker exec yyd_api_dev npx prisma studio
```

Tarayıcıda `http://localhost:5555` adresine git ve:
1. **Donation** tablosunu aç
2. Son oluşturulan donation'ı kontrol et:
   - ✅ `orderId` unique olmalı
   - ✅ `paymentStatus: pending` olmalı (ilk başta)
   - ✅ `cardBin` (ilk 6 hane) kaydedilmeli
   - ✅ `cardLastFour` (son 4 hane) kaydedilmeli
3. Callback sonrası:
   - ✅ `paymentStatus: completed` olmalı
   - ✅ `authCode` dolu olmalı
   - ✅ `hostRefNum` dolu olmalı

---

## 🐛 Sorun Giderme

### Problem: "Empty reply from server"
**Çözüm:** Server çalışmıyor olabilir.
```bash
docker logs yyd_api_dev --tail 50
docker restart yyd_api_dev
```

### Problem: "Albaraka Config Error: merchantNo is required"
**Çözüm:** Environment değişkenleri yüklenmemiş.
```bash
# .env dosyasını container'a kopyala
docker cp .env yyd_api_dev:/usr/src/app/.env
docker restart yyd_api_dev
```

### Problem: "Cannot find module 'axios'"
**Çözüm:** Axios yükle
```bash
docker exec yyd_api_dev npm install axios
```

---

## ✨ Test Başarı Kriterleri

- [x] API endpoint 200 OK döndürüyor
- [x] Donation kaydı database'de oluşuyor
- [x] Donor otomatik oluşuyor (eğer yoksa)
- [x] OrderId unique ve doğru formatta
- [x] MAC hash doğru oluşuyor
- [x] 3D Secure form fields eksiksiz
- [x] Albaraka test URL'i doğru
- [x] Callback URL'leri doğru ayarlanmış

---

## 📝 Sonraki Adımlar

1. **Frontend Entegrasyonu**
   - Frontend developerı ile payment form implementasyonu
   - 3D Secure redirect flow testi
   - Başarı/Hata sayfaları

2. **Production Hazırlığı**
   - Gerçek Albaraka credentials (`.env.production`)
   - SSL sertifikası kontrolü
   - Callback URL'leri production domain ile güncelle

3. **Ek Testler**
   - Başarısız ödeme senaryoları
   - Network timeout testleri
   - Concurrent payment testleri

---

**Test Eden:** Claude Code AI
**Test Ortamı:** Docker (yyd_api_dev container)
**Node.js Version:** v18.20.8
**Database:** PostgreSQL
