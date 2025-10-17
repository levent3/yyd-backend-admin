/**
 * Standardize API Response Helper
 * Tüm API response'larını tek bir formatta döndürmek için kullanılır
 */

/**
 * Başarılı response oluşturur
 * @param {Object} res - Express response objesi
 * @param {*} data - Döndürülecek veri
 * @param {string} message - Başarı mesajı (opsiyonel)
 * @param {number} statusCode - HTTP status kodu (default: 200)
 * @returns {Object} - Express response
 */
const successResponse = (res, data = null, message = 'İşlem başarılı', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Başarılı response (paginated data için)
 * @param {Object} res - Express response objesi
 * @param {Array} data - Döndürülecek veri dizisi
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Başarı mesajı (opsiyonel)
 * @param {number} statusCode - HTTP status kodu (default: 200)
 * @returns {Object} - Express response
 */
const paginatedResponse = (res, data = [], pagination = {}, message = 'İşlem başarılı', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Hata response oluşturur
 * @param {Object} res - Express response objesi
 * @param {string} message - Hata mesajı
 * @param {number} statusCode - HTTP status kodu (default: 400)
 * @param {*} errors - Detaylı hata bilgileri (opsiyonel)
 * @returns {Object} - Express response
 */
const errorResponse = (res, message = 'Bir hata oluştu', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation error response oluşturur
 * @param {Object} res - Express response objesi
 * @param {Array} errors - Validation hataları dizisi
 * @param {string} message - Hata mesajı (opsiyonel)
 * @returns {Object} - Express response
 */
const validationErrorResponse = (res, errors = [], message = 'Geçersiz veri') => {
  const response = {
    success: false,
    message,
    errors: errors.map(err => ({
      field: err.param || err.field,
      message: err.msg || err.message,
      value: err.value,
    })),
    timestamp: new Date().toISOString(),
  };

  return res.status(422).json(response);
};

/**
 * Not Found response oluşturur
 * @param {Object} res - Express response objesi
 * @param {string} message - Hata mesajı
 * @returns {Object} - Express response
 */
const notFoundResponse = (res, message = 'Kayıt bulunamadı') => {
  return errorResponse(res, message, 404);
};

/**
 * Unauthorized response oluşturur
 * @param {Object} res - Express response objesi
 * @param {string} message - Hata mesajı
 * @returns {Object} - Express response
 */
const unauthorizedResponse = (res, message = 'Yetkisiz erişim') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response oluşturur
 * @param {Object} res - Express response objesi
 * @param {string} message - Hata mesajı
 * @returns {Object} - Express response
 */
const forbiddenResponse = (res, message = 'Bu işlem için yetkiniz yok') => {
  return errorResponse(res, message, 403);
};

/**
 * Server error response oluşturur
 * @param {Object} res - Express response objesi
 * @param {string} message - Hata mesajı
 * @param {Error} error - Error objesi (opsiyonel)
 * @returns {Object} - Express response
 */
const serverErrorResponse = (res, message = 'Sunucu hatası', error = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Development ortamında error stack'i göster
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = {
      message: error.message,
      stack: error.stack,
    };
  }

  return res.status(500).json(response);
};

/**
 * Created response (201) oluşturur
 * @param {Object} res - Express response objesi
 * @param {*} data - Oluşturulan kayıt
 * @param {string} message - Başarı mesajı
 * @returns {Object} - Express response
 */
const createdResponse = (res, data = null, message = 'Kayıt başarıyla oluşturuldu') => {
  return successResponse(res, data, message, 201);
};

/**
 * No Content response (204) oluşturur
 * @param {Object} res - Express response objesi
 * @returns {Object} - Express response
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  createdResponse,
  noContentResponse,
};
