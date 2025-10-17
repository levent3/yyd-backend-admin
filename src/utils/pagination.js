/**
 * Pagination helper fonksiyonları
 */

/**
 * Sayfa ve limit değerlerini parse eder ve geçerli değerler döndürür
 * @param {number|string} page - Sayfa numarası (1'den başlar)
 * @param {number|string} limit - Sayfa başına kayıt sayısı
 * @param {number} maxLimit - Maximum limit (default: 50)
 * @returns {Object} - {page, limit, skip}
 */
const parsePagination = (page = 1, limit = 10, maxLimit = 50) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
};

/**
 * Pagination metadata oluşturur
 * @param {number} total - Toplam kayıt sayısı
 * @param {number} page - Mevcut sayfa
 * @param {number} limit - Sayfa başına kayıt sayısı
 * @returns {Object} - Pagination metadata
 */
const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

/**
 * Paginated response oluşturur
 * @param {Array} data - Veri dizisi
 * @param {number} total - Toplam kayıt sayısı
 * @param {number} page - Mevcut sayfa
 * @param {number} limit - Sayfa başına kayıt sayısı
 * @returns {Object} - Paginated response
 */
const createPaginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: createPaginationMeta(total, page, limit),
  };
};

module.exports = {
  parsePagination,
  createPaginationMeta,
  createPaginatedResponse,
};
