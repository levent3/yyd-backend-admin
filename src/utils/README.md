# Utilities Documentation

## Response Formatter

Tüm API endpoint'lerinde tutarlı response formatı kullanmak için `responseFormatter.js` kullanılır.

### Kullanım Örnekleri

#### 1. Success Response (200)

```javascript
const { successResponse } = require('../../utils/responseFormatter');

// Controller içinde
const getDonation = async (req, res) => {
  const donation = await donationService.getDonationById(req.params.id);
  return successResponse(res, donation, 'Bağış bilgisi başarıyla getirildi');
};
```

**Response Format:**
```json
{
  "success": true,
  "message": "Bağış bilgisi başarıyla getirildi",
  "data": { ... },
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

#### 2. Created Response (201)

```javascript
const { createdResponse } = require('../../utils/responseFormatter');

const createDonation = async (req, res) => {
  const donation = await donationService.createDonation(req.body);
  return createdResponse(res, donation, 'Bağış başarıyla oluşturuldu');
};
```

#### 3. Paginated Response

```javascript
const { paginatedResponse } = require('../../utils/responseFormatter');
const { parsePagination, createPaginationMeta } = require('../../utils/pagination');

const getAllDonations = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query.page, req.query.limit);

  const donations = await donationService.findMany({ skip, take: limit });
  const total = await donationService.count();

  const pagination = createPaginationMeta(total, page, limit);

  return paginatedResponse(res, donations, pagination, 'Bağışlar başarıyla getirildi');
};
```

**Response Format:**
```json
{
  "success": true,
  "message": "Bağışlar başarıyla getirildi",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

#### 4. Not Found Response (404)

```javascript
const { notFoundResponse } = require('../../utils/responseFormatter');

const getDonation = async (req, res) => {
  const donation = await donationService.getDonationById(req.params.id);

  if (!donation) {
    return notFoundResponse(res, 'Bağış bulunamadı');
  }

  return successResponse(res, donation);
};
```

#### 5. Validation Error Response (422)

```javascript
const { validationErrorResponse } = require('../../utils/responseFormatter');
const { validationResult } = require('express-validator');

const createDonation = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array(), 'Geçersiz veri girişi');
  }

  // ... create logic
};
```

**Response Format:**
```json
{
  "success": false,
  "message": "Geçersiz veri girişi",
  "errors": [
    {
      "field": "amount",
      "message": "Miktar pozitif bir sayı olmalıdır",
      "value": -100
    }
  ],
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

#### 6. Unauthorized Response (401)

```javascript
const { unauthorizedResponse } = require('../../utils/responseFormatter');

// Middleware veya controller içinde
if (!token) {
  return unauthorizedResponse(res, 'Token bulunamadı');
}
```

#### 7. Forbidden Response (403)

```javascript
const { forbiddenResponse } = require('../../utils/responseFormatter');

if (!hasPermission) {
  return forbiddenResponse(res, 'Bu işlem için yetkiniz yok');
}
```

#### 8. Error Response (Custom Status Code)

```javascript
const { errorResponse } = require('../../utils/responseFormatter');

if (insufficientFunds) {
  return errorResponse(res, 'Yetersiz bakiye', 402);
}
```

#### 9. Server Error Response (500)

```javascript
const { serverErrorResponse } = require('../../utils/responseFormatter');

try {
  // ... some operation
} catch (error) {
  return serverErrorResponse(res, 'İşlem sırasında bir hata oluştu', error);
}
```

**Development Response Format:**
```json
{
  "success": false,
  "message": "İşlem sırasında bir hata oluştu",
  "error": {
    "message": "Cannot read property 'id' of null",
    "stack": "Error: Cannot read property 'id' of null\n    at ..."
  },
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

**Production Response Format:**
```json
{
  "success": false,
  "message": "İşlem sırasında bir hata oluştu",
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

#### 10. No Content Response (204)

```javascript
const { noContentResponse } = require('../../utils/responseFormatter');

const deleteDonation = async (req, res) => {
  await donationService.deleteDonation(req.params.id);
  return noContentResponse(res);
};
```

### Best Practices

1. **Tutarlılık**: Tüm controller'larda bu response formatter'ları kullanın
2. **Mesajlar**: Anlamlı ve kullanıcı dostu hata mesajları yazın
3. **Status Kodları**: Doğru HTTP status kodlarını kullanın
4. **Validation**: Validation hatalarında `validationErrorResponse` kullanın
5. **Error Handling**: Try-catch bloklarında `serverErrorResponse` kullanın

## Pagination

Sayfalandırma işlemleri için `pagination.js` kullanılır.

### Kullanım

```javascript
const { parsePagination, createPaginationMeta } = require('../../utils/pagination');

const getAllRecords = async (req, res) => {
  // Query params'tan page ve limit al, parse et
  const { page, limit, skip } = parsePagination(req.query.page, req.query.limit);

  // Veritabanından kayıtları getir
  const records = await repository.findMany({ skip, take: limit });
  const total = await repository.count();

  // Pagination metadata oluştur
  const pagination = createPaginationMeta(total, page, limit);

  // Paginated response döndür
  return paginatedResponse(res, records, pagination);
};
```

### Limitler

- **Minimum**: 1 kayıt/sayfa
- **Maksimum**: 100 kayıt/sayfa
- **Default**: 10 kayıt/sayfa
