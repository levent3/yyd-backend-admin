# 🏦 Türkiye Finans VPOS Entegrasyonu - Kullanım Kılavuzu

**Versiyon:** 1.0.0
**Tarih:** 13 Kasım 2025
**Yazar:** YYD Development Team

---

## 📋 İçindekiler

1. [Giriş](#giriş)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Kullanıcı Senaryosu (Adım Adım)](#kullanıcı-senaryosu)
4. [API Endpoint'leri](#api-endpointleri)
5. [Request/Response Formatları](#requestresponse-formatları)
6. [3D Secure Akışı](#3d-secure-akışı)
7. [Callback İşleme](#callback-i̇şleme)
8. [Hata Yönetimi](#hata-yönetimi)
9. [Test Kartları](#test-kartları)
10. [Güvenlik](#güvenlik)
11. [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## 🎯 Giriş

Bu doküman, YYD (Yardım Yönetim Derneği) web sitesinde **Türkiye Finans VPOS** entegrasyonunun nasıl kullanılacağını detaylı olarak açıklar.

### Özellikler

- ✅ Dual VPOS sistemi (Albaraka + Türkiye Finans)
- ✅ BIN-based otomatik routing
- ✅ 3D Secure ödeme desteği
- ✅ Toplu bağış (sepet) sistemi
- ✅ Kurban bağışı hissedar yönetimi
- ✅ Düzenli ödeme (recurring) desteği
- ✅ Atomic transaction garantisi

---

## 🏗️ Sistem Mimarisi

### VPOS Routing Mantığı

```
                        TOPLU BAĞIŞ ENDPOINT
                     POST /api/donations/bulk-initiate
                                  |
                                  v
                      [VPOS ROUTER SERVICE]
                      vposRouterService.js
                    selectVPOS(cardNo, isRecurring)
                                  |
                    +-------------+-------------+
                    |                           |
         BIN: 540061                    BIN: 521848
    isVirtualPosActive=true      isVirtualPosActive=false
                    |                           |
                    v                           v
          [ALBARAKA VPOS]              [TÜRKİYE FİNANS VPOS]
        Yapıkredi Altyapısı              Payten/Asseco EST 3D
     epostest.albarakaturk.com.tr    torus-stage-tfkb.asseco-see.com.tr
```

### Routing Kuralları

| Durum | VPOS Seçimi | Açıklama |
|-------|-------------|----------|
| `isRecurring=true` | **Türkiye Finans** | Düzenli ödemeler HER ZAMAN TF'den yapılır |
| BIN bulunamadı | **Türkiye Finans** | Default/fallback VPOS |
| `isVirtualPosActive=true` | **Albaraka** | Özel BIN listesindeki kartlar |
| `isVirtualPosActive=false` | **Türkiye Finans** | Normal kartlar |

---

## 👤 Kullanıcı Senaryosu

### 🎬 Senaryo: Kullanıcı Toplu Bağış Yapıyor

**Kullanıcı:** Ali Veli
**Bağışlar:** Kurban (12.000 TL) + Genel Bağış (500 TL)
**Toplam:** 12.500 TL
**Kart:** Türkiye Finans (BIN: 521848)

---

### ADIM 1: Proje Seçimi ve Sepete Ekleme

Kullanıcı projeleri geziniyor ve sepetine ekliyor:

```
┌─────────────────────────────────────────────┐
│  🛒 Bağış Sepetiniz                         │
├─────────────────────────────────────────────┤
│  📦 Kurban Bağışı 2024                      │
│     • 3 Hisse x 4.000 TL = 12.000 TL       │
│     • Hissedarlar: Ali Veli, Ayşe Y., ...  │
│                                             │
│  📦 Genel Bağış                             │
│     • 500 TL                                │
├─────────────────────────────────────────────┤
│  💰 TOPLAM: 12.500 TL                       │
│                                             │
│  [Ödemeye Geç] ──────────────────────────>  │
└─────────────────────────────────────────────┘
```

**Frontend State:**

```javascript
const [cart, setCart] = useState([
  {
    projectId: 5,
    projectName: "Kurban Bağışı 2024",
    amount: 12000,
    isSacrifice: true,
    sacrificeType: "kurban",
    shareCount: 3,
    sharePrice: 4000,
    shareholders: [
      { fullName: "Ali Veli", share: 1, shareAmount: 4000 },
      { fullName: "Ayşe Yılmaz", share: 1, shareAmount: 4000 },
      { fullName: "Mehmet Demir", share: 1, shareAmount: 4000 }
    ]
  },
  {
    projectId: 1,
    projectName: "Genel Bağış",
    amount: 500,
    isSacrifice: false
  }
]);
```

---

### ADIM 2: Ödeme Formu

Kullanıcı "Ödemeye Geç" butonuna tıklıyor:

```
┌────────────────────────────────────────────────┐
│  💳 Ödeme Bilgileri                            │
├────────────────────────────────────────────────┤
│                                                │
│  👤 Bağışçı Bilgileri                          │
│  ─────────────────────                         │
│  Ad:        [Ali________]                      │
│  Soyad:     [Veli_______]                      │
│  Email:     [ali@example.com__]                │
│  Telefon:   [+90 555 123 4567_]               │
│                                                │
│  💳 Kart Bilgileri                             │
│  ─────────────────────                         │
│  Kart No:   [5218 4879 6245 9752]  [💳 MCard] │
│  İsim:      [ALI VELI___________]              │
│  SKT:       [12] / [25]                        │
│  CVV:       [000]  [ℹ️]                        │
│                                                │
│  ☐ Düzenli bağış yap (Aylık tekrarlayan)      │
│                                                │
│  [❌ İptal]  [✅ Ödemeyi Tamamla] ───────>     │
└────────────────────────────────────────────────┘
```

---

### ADIM 3: Frontend - API İsteği

Kullanıcı "Ödemeyi Tamamla" butonuna bastı!

**Frontend Kodu:**

```javascript
const handlePayment = async () => {
  // 1. Form verilerini topla
  const paymentData = {
    donations: cart.map(item => ({
      projectId: item.projectId,
      amount: item.amount,
      isSacrifice: item.isSacrifice || false,
      sacrificeType: item.sacrificeType,
      shareCount: item.shareCount,
      sharePrice: item.sharePrice,
      shareholders: item.shareholders
    })),
    donor: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone
    },
    card: {
      cardNo: formData.cardNo.replace(/\s/g, ''), // Boşlukları kaldır
      cvv: formData.cvv,
      expiry: formData.expiry,
      cardHolder: formData.cardHolder
    },
    isRecurring: formData.isRecurring || false
  };

  try {
    // 2. API isteği at
    const response = await fetch('http://localhost:5000/api/donations/bulk-initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (result.success) {
      // 3. 3D Secure form'unu oluştur ve submit et
      submit3DSecureForm(result.data.formData);
    } else {
      // Hata göster
      showError(result.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    showError('Ödeme işlemi başlatılamadı');
  }
};
```

**API Request:**

```http
POST /api/donations/bulk-initiate HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "donations": [
    {
      "projectId": 5,
      "amount": 12000,
      "isSacrifice": true,
      "sacrificeType": "kurban",
      "shareCount": 3,
      "sharePrice": 4000,
      "shareholders": [
        {
          "fullName": "Ali Veli",
          "share": 1,
          "shareAmount": 4000
        },
        {
          "fullName": "Ayşe Yılmaz",
          "share": 1,
          "shareAmount": 4000
        },
        {
          "fullName": "Mehmet Demir",
          "share": 1,
          "shareAmount": 4000
        }
      ]
    },
    {
      "projectId": 1,
      "amount": 500,
      "isSacrifice": false
    }
  ],
  "donor": {
    "firstName": "Ali",
    "lastName": "Veli",
    "email": "ali@example.com",
    "phone": "+905551234567"
  },
  "card": {
    "cardNo": "5218487962459752",
    "cvv": "000",
    "expiry": "12/25",
    "cardHolder": "ALI VELI"
  },
  "isRecurring": false
}
```

---

### ADIM 4: Backend - BIN Routing

Backend otomatik olarak kartın BIN kodunu analiz ediyor:

**1. BIN Kodu Çıkartma:**

```javascript
const cardNo = "5218487962459752";
const binCode = cardNo.substring(0, 6);  // "521848"
```

**2. Database Lookup:**

```sql
SELECT
  bc."binCode",
  b.id,
  b.name,
  b."isVirtualPosActive"
FROM "BinCode" bc
INNER JOIN "Bank" b ON bc."bankId" = b.id
WHERE bc."binCode" = '521848'
  AND bc."isActive" = true;
```

**Sonuç:**

```
binCode: 521848
bankId: 4
name: "Türkiye Finans Katılım Bankası"
isVirtualPosActive: false
```

**3. VPOS Kararı:**

```javascript
// isVirtualPosActive = false olduğu için:
vposType = 'turkiye_finans' ✅
```

**Console Log:**

```javascript
[VPOS Selection - Bulk] {
  vposType: 'turkiye_finans',
  bankName: 'Türkiye Finans Katılım Bankası',
  reason: 'Türkiye Finans Katılım Bankası bankası için varsayılan VPOS (Türkiye Finans) kullanılıyor'
}
```

---

### ADIM 5: Backend - Database Kayıt

Backend, bağışları **atomic transaction** ile database'e kaydediyor:

```javascript
// Prisma Transaction
await prisma.$transaction([
  // Donation 1: Kurban
  prisma.donation.create({
    data: {
      orderId: 'YYD-1763031234567-ABC123',
      amount: 12000,
      projectId: 5,
      donorId: donor.id,
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      paymentGateway: 'turkiye_finans',  // ← VPOS routing sonucu
      cardBin: '521848',
      cardLastFour: '9752',
      isSacrifice: true,
      shareCount: 3,
      shareholders: [...]
    }
  }),
  // Donation 2: Genel Bağış
  prisma.donation.create({
    data: {
      orderId: 'YYD-1763031234567-ABC123',  // Aynı order ID
      amount: 500,
      projectId: 1,
      donorId: donor.id,
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      paymentGateway: 'turkiye_finans',  // ← Aynı VPOS
      cardBin: '521848',
      cardLastFour: '9752',
      isSacrifice: false
    }
  })
]);
```

**Database Kayıtları:**

| id | orderId | amount | cardBin | paymentGateway | paymentStatus |
|----|---------|--------|---------|----------------|---------------|
| abc123... | YYD-1763031234567-ABC123 | 12000 | 521848 | turkiye_finans | pending |
| def456... | YYD-1763031234567-ABC123 | 500 | 521848 | turkiye_finans | pending |

---

### ADIM 6: Backend - 3D Secure Form Oluşturma

Backend, Türkiye Finans için 3D Secure form parametreleri oluşturuyor:

**1. Random String Oluştur:**

```javascript
const rnd = crypto.randomBytes(16).toString('hex');
// "156eb2bf9a18263a21fc355d7b29212c"
```

**2. Hash Hesapla:**

```javascript
const hashData = `${clientId}${orderId}${amount}${okUrl}${failUrl}${rnd}${storeKey}`;
// "280000048YYD-1763031234567-ABC12312500.00http://localhost:5000/...156eb2bf...TEST1234"

const hash = crypto
  .createHash('sha1')
  .update(hashData, 'utf8')
  .digest('base64');
// "1wkqbuM5ikhvQT/SPku6F2ORqhc="
```

**3. Form Data Oluştur:**

```javascript
const formData = {
  action: 'https://torus-stage-tfkb.asseco-see.com.tr/fim/est3Dgate',
  method: 'POST',
  fields: {
    clientid: '280000048',
    storetype: '3d_pay_hosting',
    amount: '12500.00',
    oid: 'YYD-1763031234567-ABC123',
    okUrl: 'http://localhost:5000/api/donations/turkiye-finans/callback',
    failUrl: 'http://localhost:5000/api/donations/turkiye-finans/callback',
    currency: '949',  // TRY
    rnd: '156eb2bf9a18263a21fc355d7b29212c',
    hash: '1wkqbuM5ikhvQT/SPku6F2ORqhc=',
    lang: 'tr',
    email: 'ali@example.com',
    userid: 'ali@example.com'
  }
};
```

---

### ADIM 7: Backend - API Response

Backend frontend'e response döndürüyor:

```json
{
  "success": true,
  "message": "Sepet ödemesi için 3D Secure formu oluşturuldu",
  "data": {
    "orderId": "YYD-1763031234567-ABC123",
    "totalAmount": 12500,
    "donationCount": 2,
    "donations": [
      {
        "id": "abc123-uuid-...",
        "projectId": 5,
        "amount": 12000,
        "isSacrifice": true,
        "shareCount": 3
      },
      {
        "id": "def456-uuid-...",
        "projectId": 1,
        "amount": 500,
        "isSacrifice": false,
        "shareCount": 1
      }
    ],
    "formData": {
      "action": "https://torus-stage-tfkb.asseco-see.com.tr/fim/est3Dgate",
      "method": "POST",
      "fields": {
        "clientid": "280000048",
        "storetype": "3d_pay_hosting",
        "amount": "12500.00",
        "oid": "YYD-1763031234567-ABC123",
        "okUrl": "http://localhost:5000/api/donations/turkiye-finans/callback",
        "failUrl": "http://localhost:5000/api/donations/turkiye-finans/callback",
        "currency": "949",
        "rnd": "156eb2bf9a18263a21fc355d7b29212c",
        "hash": "1wkqbuM5ikhvQT/SPku6F2ORqhc=",
        "lang": "tr",
        "email": "ali@example.com",
        "userid": "ali@example.com"
      }
    }
  },
  "timestamp": "2025-11-13T10:52:52.548Z"
}
```

---

### ADIM 8: Frontend - 3D Secure Form Submit

**⚠️ KRİTİK ADIM: Bu kısım çok önemli!**

Frontend, gelen form data ile dinamik HTML form oluşturup VPOS'a submit ediyor:

```javascript
function submit3DSecureForm(formData) {
  // 1. Dinamik HTML form oluştur
  const form = document.createElement('form');
  form.method = formData.method;  // "POST"
  form.action = formData.action;  // VPOS URL'i

  // 2. Tüm hidden field'ları ekle
  Object.keys(formData.fields).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = formData.fields[key];
    form.appendChild(input);
  });

  // 3. Body'ye ekle
  document.body.appendChild(form);

  // 4. Kullanıcıya bilgi ver
  showLoadingMessage('3D Secure sayfasına yönlendiriliyorsunuz...');

  // 5. Form'u submit et (otomatik redirect)
  form.submit();

  // ⚠️ DİKKAT: Bu noktadan sonra kullanıcı VPOS'un sayfasına gidecek!
}
```

**React Örneği:**

```jsx
function PaymentPage() {
  const [formData, setFormData] = useState(null);
  const formRef = useRef(null);

  const handlePayment = async (paymentData) => {
    const response = await fetch('/api/donations/bulk-initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (result.success) {
      setFormData(result.data.formData);
    }
  };

  // Form data hazırlandığında otomatik submit
  useEffect(() => {
    if (formData && formRef.current) {
      formRef.current.submit();
    }
  }, [formData]);

  return (
    <div>
      {formData && (
        <form
          ref={formRef}
          method={formData.method}
          action={formData.action}
        >
          {Object.keys(formData.fields).map(key => (
            <input
              key={key}
              type="hidden"
              name={key}
              value={formData.fields[key]}
            />
          ))}
        </form>
      )}

      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>3D Secure sayfasına yönlendiriliyorsunuz...</p>
        <p>Lütfen bekleyiniz...</p>
      </div>
    </div>
  );
}
```

---

### ADIM 9: VPOS - 3D Secure Sayfası

**Kullanıcı şimdi Türkiye Finans'ın 3D Secure sayfasında!**

```
┌─────────────────────────────────────────────────┐
│  🏦 Türkiye Finans - 3D Secure Doğrulama        │
├─────────────────────────────────────────────────┤
│                                                 │
│  İşlem Bilgileri:                               │
│  • Tutar: 12.500,00 TL                         │
│  • Sipariş No: YYD-1763031234567-ABC123        │
│  • Tarih: 13.11.2025 10:52                     │
│                                                 │
│  Kart Bilgileri:                                │
│  • Kart: 5218 48** **** 9752                   │
│                                                 │
│  ─────────────────────────────────────────      │
│                                                 │
│  📱 Cep telefonunuza gönderilen                 │
│      SMS şifresini giriniz:                     │
│                                                 │
│      [_][_][_][_][_][_]                        │
│                                                 │
│  ⏱️ Kalan süre: 02:45                          │
│                                                 │
│  [❌ İptal]  [✅ Onayla] ─────────>            │
└─────────────────────────────────────────────────┘
```

**Kullanıcının Telefonu:**

```
📱 SMS Mesajı:

Türkiye Finans
3D Güvenlik Kodu: 123456

Tutar: 12.500,00 TL
İşlem: YYD-1763031234567-ABC123

Bu kodu kimseyle paylaşmayınız.
```

**Kullanıcı Aksiyon:**
1. ✅ SMS'i alıyor
2. ✅ Kodu giriyor: `123456`
3. ✅ "Onayla" butonuna basıyor

---

### ADIM 10: VPOS - İşlem İşleniyor

Türkiye Finans backend'inde (bizim göremediğimiz):

```javascript
// VPOS Backend (Görünmez)

// 1. SMS kodunu doğrula
validateSmsCode(smsCode);

// 2. Kart bilgilerini kontrol et
validateCard(cardNo, cvv, expiry);

// 3. Bakiye kontrolü
checkBalance(cardNo, amount);

// 4. İşlemi gerçekleştir (para çekme)
const transaction = processPayment({
  cardNo: '5218487962459752',
  amount: 12500.00,
  merchantId: '280000048',
  orderId: 'YYD-1763031234567-ABC123'
});

// 5. Başarılı response hazırla
return {
  Response: 'Approved',
  ProcReturnCode: '00',
  mdStatus: '1',
  AuthCode: 'TF123456',
  TransId: 'TF-20251113-789456',
  HostRefNum: 'REF123456789',
  orderId: 'YYD-1763031234567-ABC123',
  amount: '12500.00'
};
```

---

### ADIM 11: VPOS - Callback Redirect

VPOS, kullanıcıyı bizim callback URL'imize yönlendiriyor:

**VPOS otomatik oluşturuyor:**

```html
<form
  method="POST"
  action="http://localhost:5000/api/donations/turkiye-finans/callback"
>
  <input type="hidden" name="Response" value="Approved" />
  <input type="hidden" name="ProcReturnCode" value="00" />
  <input type="hidden" name="mdStatus" value="1" />
  <input type="hidden" name="AuthCode" value="TF123456" />
  <input type="hidden" name="TransId" value="TF-20251113-789456" />
  <input type="hidden" name="HostRefNum" value="REF123456789" />
  <input type="hidden" name="orderId" value="YYD-1763031234567-ABC123" />
  <input type="hidden" name="amount" value="12500.00" />
</form>

<script>
  document.forms[0].submit(); // Otomatik submit
</script>
```

**Backend'e gelen request:**

```http
POST /api/donations/turkiye-finans/callback HTTP/1.1
Host: localhost:5000
Content-Type: application/x-www-form-urlencoded

Response=Approved&ProcReturnCode=00&mdStatus=1&AuthCode=TF123456&TransId=TF-20251113-789456&HostRefNum=REF123456789&orderId=YYD-1763031234567-ABC123&amount=12500.00
```

---

### ADIM 12: Backend - Callback İşleme

Backend callback'i işliyor ve database'i güncelliyor:

```javascript
// donation.controller.js - handleTurkiyeFinansCallback

exports.handleTurkiyeFinansCallback = async (req, res) => {
  console.log('=== TÜRKIYE FINANS CALLBACK RECEIVED ===');
  console.log('Body:', req.body);

  const callbackData = { ...req.body, ...req.query };

  // 1. Validate callback
  const validation = turkiyeFinansService.validate3DCallback(callbackData);

  if (validation.success) {
    // 2. Database'i güncelle
    await prisma.donation.updateMany({
      where: { orderId: callbackData.orderId },
      data: {
        paymentStatus: 'completed',
        completedAt: new Date(),
        authCode: callbackData.AuthCode,
        transactionId: callbackData.TransId,
        hostRefNum: callbackData.HostRefNum,
        gatewayResponse: callbackData
      }
    });

    console.log(`✅ Payment completed: ${callbackData.orderId}`);

    // 3. Başarı sayfasına redirect
    return res.redirect(
      `http://localhost:3000/bagis/basarili?orderId=${callbackData.orderId}`
    );

  } else {
    console.error(`❌ Payment failed: ${validation.message}`);

    // 4. Hata sayfasına redirect
    return res.redirect(
      `http://localhost:3000/bagis/basarisiz?error=${encodeURIComponent(validation.message)}`
    );
  }
};
```

**Database Güncellemesi:**

```sql
UPDATE "Donation"
SET
  "paymentStatus" = 'completed',
  "completedAt" = NOW(),
  "authCode" = 'TF123456',
  "transactionId" = 'TF-20251113-789456',
  "hostRefNum" = 'REF123456789',
  "gatewayResponse" = '{"Response":"Approved",...}'::jsonb
WHERE "orderId" = 'YYD-1763031234567-ABC123';

-- 2 satır güncellendi ✅
```

---

### ADIM 13: Frontend - Başarı Sayfası

Kullanıcı başarı sayfasına yönlendiriliyor:

**URL:**
```
http://localhost:3000/bagis/basarili?orderId=YYD-1763031234567-ABC123
```

**Frontend Kodu:**

```jsx
// pages/bagis/basarili.jsx

function SuccessPage() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');

    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/donations/order/${orderId}`);
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!orderDetails) {
    return <div>Sipariş bulunamadı</div>;
  }

  return (
    <div className="success-page">
      <div className="success-icon">✅</div>
      <h1>Bağışınız Başarıyla Tamamlandı!</h1>

      <div className="order-summary">
        <h2>İşlem Detayları</h2>

        <div className="info-row">
          <span>Sipariş No:</span>
          <strong>{orderDetails.orderId}</strong>
        </div>

        <div className="info-row">
          <span>Toplam Tutar:</span>
          <strong>{orderDetails.totalAmount.toLocaleString('tr-TR')} TL</strong>
        </div>

        <div className="info-row">
          <span>Tarih:</span>
          <strong>{new Date(orderDetails.completedAt).toLocaleString('tr-TR')}</strong>
        </div>

        <div className="info-row">
          <span>Ödeme Yöntemi:</span>
          <strong>Kredi Kartı (**** {orderDetails.cardLastFour})</strong>
        </div>

        <h3>Bağışlarınız:</h3>
        <ul className="donations-list">
          {orderDetails.donations.map(donation => (
            <li key={donation.id}>
              <span>{donation.projectName}</span>
              <strong>{donation.amount.toLocaleString('tr-TR')} TL</strong>
              {donation.isSacrifice && <span className="badge">Kurban</span>}
            </li>
          ))}
        </ul>
      </div>

      <p className="receipt-info">
        ✉️ Dekont e-posta adresinize gönderilecektir.
      </p>

      <div className="actions">
        <button onClick={downloadReceipt} className="btn-secondary">
          📄 Dekontu İndir
        </button>
        <button onClick={() => window.location.href = '/'} className="btn-primary">
          🏠 Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
```

**Kullanıcı Gördüğü Ekran:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│               ✅ BAŞARILI!                      │
│                                                 │
│     Bağışınız Başarıyla Tamamlandı!            │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  📋 İşlem Detayları                             │
│  ───────────────────                            │
│  Sipariş No: YYD-1763031234567-ABC123          │
│  Toplam Tutar: 12.500 TL                       │
│  Tarih: 13.11.2025 10:53                       │
│  Ödeme Yöntemi: Kredi Kartı (**** 9752)       │
│                                                 │
│  📦 Bağışlarınız:                               │
│  • Kurban Bağışı 2024: 12.000 TL [Kurban]     │
│  • Genel Bağış: 500 TL                         │
│                                                 │
│  ✉️ Dekont e-posta adresinize gönderilecektir. │
│                                                 │
│  [📄 Dekontu İndir]  [🏠 Ana Sayfaya Dön]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📊 Tam Akış Diyagramı

```
KULLANICI            FRONTEND              BACKEND              VPOS              DATABASE
    │                   │                     │                  │                   │
    │ 1. Sepete ekle    │                     │                  │                   │
    ├──────────────────>│                     │                  │                   │
    │                   │ (state'de tutuluyor)│                  │                   │
    │                   │                     │                  │                   │
    │ 2. Ödemeye geç    │                     │                  │                   │
    ├──────────────────>│                     │                  │                   │
    │                   │                     │                  │                   │
    │ 3. Bilgileri gir  │                     │                  │                   │
    ├──────────────────>│                     │                  │                   │
    │                   │                     │                  │                   │
    │ 4. Ödeme tamamla  │                     │                  │                   │
    ├──────────────────>│ 5. POST /bulk-init  │                  │                   │
    │                   ├────────────────────>│                  │                   │
    │                   │                     │ 6. BIN Lookup    │                   │
    │                   │                     ├─────────────────────────────────────>│
    │                   │                     │<─────────────────────────────────────┤
    │                   │                     │ (Türkiye Finans) │                   │
    │                   │                     │                  │                   │
    │                   │                     │ 7. Create Donations (Transaction)    │
    │                   │                     ├─────────────────────────────────────>│
    │                   │                     │<─────────────────────────────────────┤
    │                   │                     │                  │                   │
    │                   │                     │ 8. Generate 3D Form                  │
    │                   │<────────────────────┤                  │                   │
    │                   │ (formData)          │                  │                   │
    │                   │                     │                  │                   │
    │                   │ 9. Create HTML form │                  │                   │
    │                   │    & Submit         │                  │                   │
    │                   │────────────────────────────────────────>│                   │
    │                   │                     │ 10. POST to VPOS │                   │
    │                   │                     │                  │                   │
    │ 11. 3D Secure     │                     │                  │                   │
    │<──────────────────────────────────────────────────────────┤                   │
    │    sayfası        │                     │                  │                   │
    │                   │                     │                  │                   │
    │ 12. SMS kodu gir  │                     │                  │                   │
    ├──────────────────────────────────────────────────────────>│                   │
    │                   │                     │ 13. Process Payment                  │
    │                   │                     │                  │ (Kart limit çek) │
    │                   │                     │                  │                   │
    │                   │                     │ 14. Callback POST│                   │
    │                   │                     │<─────────────────┤                   │
    │                   │                     │                  │                   │
    │                   │                     │ 15. Update DB    │                   │
    │                   │                     ├─────────────────────────────────────>│
    │                   │                     │ (paymentStatus   │                   │
    │                   │                     │  = completed)    │                   │
    │                   │                     │                  │                   │
    │ 16. Redirect      │                     │                  │                   │
    │<──────────────────────────────────────┤                  │                   │
    │ /bagis/basarili   │                     │                  │                   │
    │                   │                     │                  │                   │
    │ 17. Başarı sayfası│                     │                  │                   │
    ├──────────────────>│ 18. GET order details                 │                   │
    │                   ├────────────────────>│ 19. Query DB     │                   │
    │                   │                     ├─────────────────────────────────────>│
    │                   │                     │<─────────────────────────────────────┤
    │                   │<────────────────────┤                  │                   │
    │ 20. Dekont göster │                     │                  │                   │
    │<──────────────────┤                     │                  │                   │
```

---

## 🔌 API Endpoint'leri

### 1. Toplu Bağış Başlatma

**Endpoint:**
```
POST /api/donations/bulk-initiate
```

**Request Body:**

```typescript
interface BulkPaymentRequest {
  donations: Array<{
    projectId: number;
    amount: number;
    isSacrifice?: boolean;
    sacrificeType?: string;
    shareCount?: number;
    sharePrice?: number;
    shareholders?: Array<{
      fullName: string;
      share: number;
      shareAmount: number;
    }>;
  }>;
  donor: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  card: {
    cardNo: string;        // Boşluksuz, 16 hane
    cvv: string;           // 3-4 hane
    expiry: string;        // Format: MM/YY
    cardHolder: string;
  };
  isRecurring?: boolean;   // Default: false
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Sepet ödemesi için 3D Secure formu oluşturuldu",
  "data": {
    "orderId": "YYD-1763031234567-ABC123",
    "totalAmount": 12500,
    "donationCount": 2,
    "donations": [...],
    "formData": {
      "action": "https://torus-stage-tfkb.asseco-see.com.tr/fim/est3Dgate",
      "method": "POST",
      "fields": {...}
    }
  },
  "timestamp": "2025-11-13T10:52:52.548Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Bağışçı bilgileri eksik",
  "error": "firstName, lastName, email, phone gerekli"
}
```

---

### 2. Türkiye Finans Callback

**Endpoint:**
```
POST /api/donations/turkiye-finans/callback
```

**⚠️ Bu endpoint VPOS tarafından çağrılır, frontend'den çağrılmaz!**

**Request (VPOS'tan gelen):**

```
Response=Approved
ProcReturnCode=00
mdStatus=1
AuthCode=TF123456
TransId=TF-20251113-789456
HostRefNum=REF123456789
orderId=YYD-1763031234567-ABC123
amount=12500.00
```

**Response:**

```
HTTP 302 Found
Location: http://localhost:3000/bagis/basarili?orderId=YYD-1763031234567-ABC123
```

---

### 3. Sipariş Detayları (Opsiyonel)

**Endpoint:**
```
GET /api/donations/order/:orderId
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "YYD-1763031234567-ABC123",
    "totalAmount": 12500,
    "paymentStatus": "completed",
    "completedAt": "2025-11-13T10:53:12.000Z",
    "cardLastFour": "9752",
    "cardBin": "521848",
    "paymentGateway": "turkiye_finans",
    "donor": {
      "fullName": "Ali Veli",
      "email": "ali@example.com",
      "phone": "+905551234567"
    },
    "donations": [
      {
        "id": "abc123...",
        "projectId": 5,
        "projectName": "Kurban Bağışı 2024",
        "amount": 12000,
        "isSacrifice": true,
        "shareCount": 3
      },
      {
        "id": "def456...",
        "projectId": 1,
        "projectName": "Genel Bağış",
        "amount": 500,
        "isSacrifice": false
      }
    ]
  }
}
```

---

## 🔒 Güvenlik

### 1. Kart Bilgileri Güvenliği

**❌ ASLA YAPILMAMASI GEREKENLER:**

```javascript
// ❌ Kart bilgilerini database'e kaydetmek
await db.card.create({
  cardNo: '5218487962459752',    // YASAK!
  cvv: '000',                    // YASAK!
  expiry: '12/25'                // YASAK!
});

// ❌ Kart bilgilerini log'lamak
console.log('Card:', cardNo, cvv);  // YASAK!

// ❌ Kart bilgilerini cache'lemek
localStorage.setItem('card', cardNo);  // YASAK!
```

**✅ DOĞRU YAKLAŞIM:**

- Kart bilgileri sadece form submit sırasında VPOS'a gönderilir
- Backend'de hiç saklanmaz
- Sadece BIN (ilk 6 hane) ve son 4 hane saklanır

```javascript
// ✅ Sadece bunlar saklanır:
{
  cardBin: '521848',        // İlk 6 hane (BIN routing için)
  cardLastFour: '9752'      // Son 4 hane (gösterim için)
}
```

---

### 2. Hash Doğrulama

Backend'de hash hesaplaması:

```javascript
// SHA1 + Base64
const hashData = `${clientId}${orderId}${amount}${okUrl}${failUrl}${rnd}${storeKey}`;
const hash = crypto
  .createHash('sha1')
  .update(hashData, 'utf8')
  .digest('base64');
```

---

### 3. HTTPS Zorunluluğu

**⚠️ Production'da mutlaka HTTPS kullanın:**

```javascript
// .env - Production
TURKIYE_FINANS_CALLBACK_URL=https://yourdomain.com/api/donations/turkiye-finans/callback
TURKIYE_FINANS_SUCCESS_URL=https://yourdomain.com/bagis/basarili
TURKIYE_FINANS_FAIL_URL=https://yourdomain.com/bagis/basarisiz
```

---

### 4. CORS ve CSP

**Backend CORS ayarları:**

```javascript
app.use(cors({
  origin: ['https://yourdomain.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

**Content Security Policy:**

```javascript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    formAction: [
      "'self'",
      'https://torus-stage-tfkb.asseco-see.com.tr',
      'https://epostest.albarakaturk.com.tr'
    ]
  }
});
```

---

## 🧪 Test Kartları

### Türkiye Finans Test Kartları

| Kart Numarası | CVV | Son Kullanma | Sonuç |
|--------------|-----|--------------|-------|
| 5218487962459752 | 000 | 12/25 | ✅ Başarılı |
| 4446763125813623 | 000 | 12/25 | ✅ Başarılı |
| 5200190005138652 | 000 | 12/25 | ✅ Başarılı |

**SMS Şifresi:** Test ortamında otomatik onaylanır

---

### Albaraka Test Kartları

| Kart Numarası | CVV | Son Kullanma | SMS Şifre |
|--------------|-----|--------------|-----------|
| 5400619340701616 | 000 | 07/28 | 34020 |
| 5400611063484835 | 000 | 05/28 | 34020 |
| 5400611072814659 | 000 | 08/29 | 34020 |

---

## ❌ Hata Yönetimi

### Frontend Hata Yakalama

```javascript
const handlePayment = async (paymentData) => {
  try {
    const response = await fetch('/api/donations/bulk-initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!result.success) {
      // Backend'den gelen hata
      showError(result.message);
      return;
    }

    // Form submit
    submit3DSecureForm(result.data.formData);

  } catch (error) {
    // Network hatası
    console.error('Payment error:', error);
    showError('Bağlantı hatası. Lütfen tekrar deneyin.');
  }
};
```

---

### Hata Mesajları

| Hata Kodu | Mesaj | Açıklama |
|-----------|-------|----------|
| `400` | "En az 1 bağış seçilmelidir" | Sepet boş |
| `400` | "Bağışçı bilgileri eksik" | Donor bilgileri eksik |
| `400` | "Kart bilgileri eksik" | Card bilgileri eksik |
| `400` | "Toplam tutar 0 TL olamaz" | Amount validation |
| `500` | "Ödeme işlemi başlatılamadı" | Transaction hatası |
| `501` | "VPOS entegrasyonu tamamlanmadı" | VPOS routing hatası |

---

### VPOS Hata Kodları

**Türkiye Finans:**

| ProcReturnCode | Açıklama |
|---------------|----------|
| `00` | Başarılı |
| `01` | Kartı veren bankayı arayın |
| `05` | İşlem onaylanmadı |
| `12` | Geçersiz işlem |
| `51` | Yetersiz bakiye |
| `54` | Kartın son kullanma tarihi geçmiş |
| `57` | Karta izin verilmeyen işlem |

---

## 💡 Önemli Notlar

### 1. Order ID Yapısı

```javascript
const orderId = `YYD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
// Örnek: YYD-1763031234567-ABC123
```

- **YYD-** : Prefix (sabit)
- **1763031234567** : Timestamp
- **ABC123** : Random string (7 karakter)

---

### 2. Tutar Formatı

**Türkiye Finans:** Noktalı format, 2 ondalık
```javascript
amount: "12500.00"  // ✅ Doğru
```

**Albaraka:** Kuruş cinsinden
```javascript
amount: "1250000"   // 12500.00 TL = 1.250.000 kuruş
```

---

### 3. Atomic Transaction

Tüm bağışlar **tek transaction**'da oluşturulur:

```javascript
await prisma.$transaction([
  prisma.donation.create({ /* Bağış 1 */ }),
  prisma.donation.create({ /* Bağış 2 */ }),
  prisma.donation.create({ /* Bağış 3 */ })
]);
```

**Avantajları:**
- Hepsi başarılı olursa commit
- Biri başarısız olursa hepsi rollback
- Veri tutarlılığı garantili

---

### 4. Callback URL'ler

**⚠️ Callback URL'ler public olmalı (auth middleware yok):**

```javascript
// ✅ DOĞRU - Public routes
router.post('/turkiye-finans/callback', donationController.handleTurkiyeFinansCallback);

// ❌ YANLIŞ - Protected routes (VPOS erişemez)
router.use(authMiddleware);
router.post('/turkiye-finans/callback', ...);
```

---

### 5. Test vs Production

**Environment Variables:**

```bash
# Test Mode
TURKIYE_FINANS_TEST_MODE=true
TURKIYE_FINANS_CLIENT_ID=280000048
TURKIYE_FINANS_STORE_KEY=TEST1234
TURKIYE_FINANS_3DS_URL=https://torus-stage-tfkb.asseco-see.com.tr/fim/est3Dgate

# Production Mode (TODO: Payten'den alınacak)
TURKIYE_FINANS_TEST_MODE=false
TURKIYE_FINANS_CLIENT_ID=<PROD_CLIENT_ID>
TURKIYE_FINANS_STORE_KEY=<PROD_STORE_KEY>
TURKIYE_FINANS_3DS_URL=https://torus-prod-tfkb.asseco-see.com.tr/fim/est3Dgate
```

---

## ❓ Sık Sorulan Sorular

### S1: Kart bilgileri nerede saklanıyor?

**Cevap:** Hiçbir yerde! Kart bilgileri sadece form submit sırasında direkt VPOS'a gönderilir. Backend'de sadece BIN (ilk 6 hane) ve son 4 hane saklanır.

---

### S2: Hangi kart hangi VPOS'a gidiyor?

**Cevap:** BIN koduna göre otomatik routing yapılıyor:

- **BIN 540061** → Albaraka (isVirtualPosActive=true)
- **BIN 521848** → Türkiye Finans (isVirtualPosActive=false)
- **Düzenli ödeme** → Her zaman Türkiye Finans
- **BIN bulunamadı** → Default: Türkiye Finans

---

### S3: Callback URL'e nasıl erişiliyor?

**Cevap:** VPOS, 3D Secure işlemi tamamlandıktan sonra otomatik olarak callback URL'e POST request atıyor. Bu nedenle callback URL public olmalı (authentication gerektirmemeli).

---

### S4: Sepetteki tüm bağışlar tek transaction mı?

**Cevap:** Evet! Tüm bağışlar Prisma transaction ile atomik olarak oluşturuluyor. Biri başarısız olursa hepsi rollback ediliyor.

---

### S5: Test ortamında SMS kodu gerekli mi?

**Cevap:** Hayır, test ortamında SMS doğrulaması otomatik onaylanıyor. Production'da gerçek SMS gönderilir.

---

### S6: Recurring payment nasıl çalışıyor?

**Cevap:** İlk işlem 3D Secure ile yapılır. Sonraki aylarda backend, XML API ile recurring payment update eder (3D Secure gerekmez).

---

### S7: Callback başarısız olursa ne olur?

**Cevap:** VPOS callback'e birkaç kez tekrar dener. Eğer hala başarısız olursa, manuel kontrol gerekir. Bu nedenle callback endpoint her zaman çalışır durumda olmalı.

---

### S8: Production'a geçiş için ne gerekli?

**Cevap:**
1. Payten'den production credentials al
2. `.env` dosyasını güncelle
3. `TURKIYE_FINANS_TEST_MODE=false` yap
4. Callback URL'leri HTTPS yap
5. SSL sertifikası kur
6. Gerçek kart ile test et

---

## 📞 Destek

**Teknik Sorular:**
- Email: dev@yyd.org.tr
- Slack: #yyd-payments

**VPOS Sorunları:**
- Türkiye Finans: support@payten.com
- Payten Dökümanlar: https://developer.payten.com

**Acil Durumlar:**
- On-call: +90 555 XXX XXXX

---

## 📚 Ek Kaynaklar

- [Payten EST 3D Dökümanları](https://developer.payten.com)
- [PCI DSS Compliance Guide](./GL-61-PCI-DSS-Guide.pdf)
- [Security Integration Guide](./GL-58-Security-Guide.pdf)
- [API Postman Collection](./postman/YYD-VPOS-Collection.json)

---

## 📝 Versiyon Geçmişi

| Versiyon | Tarih | Değişiklikler |
|----------|-------|---------------|
| 1.0.0 | 13.11.2025 | İlk release - Türkiye Finans entegrasyonu |
| 0.9.0 | 10.11.2025 | Beta - Test ortamı tamamlandı |
| 0.5.0 | 05.11.2025 | Alpha - İlk implementasyon |

---

**Son Güncelleme:** 13 Kasım 2025
**Yazar:** YYD Development Team
**Lisans:** Internal Use Only

---

