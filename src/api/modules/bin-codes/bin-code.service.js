const binCodeRepo = require('./bin-code.repository');
const bankRepo = require('../banks/bank.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllBinCodes = async (queryParams = {}) => {
  const { page, limit, isActive, bankId } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (bankId) where.bankId = parseInt(bankId);

  const [binCodes, total] = await Promise.all([
    binCodeRepo.findMany({ skip, take, where }),
    binCodeRepo.count(where),
  ]);

  return createPaginatedResponse(binCodes, total, parseInt(page) || 1, take);
};

const getBinCodeById = async (id) => {
  const binCode = await binCodeRepo.findById(id);
  if (!binCode) {
    const error = new Error('BIN kodu bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  return binCode;
};

const getBinCodeByCode = async (binCode) => {
  const result = await binCodeRepo.findByBinCode(binCode);
  if (!result) {
    const error = new Error('BIN kodu bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  return result;
};

const createBinCode = async (data) => {
  // Validate bank exists
  const bank = await bankRepo.findById(data.bankId);
  if (!bank) {
    const error = new Error('Belirtilen banka bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  // Check if BIN code already exists
  const existingBinCode = await binCodeRepo.findByBinCode(data.binCode);
  if (existingBinCode) {
    const error = new Error('Bu BIN kodu zaten kayıtlı');
    error.statusCode = 400;
    throw error;
  }

  // Validate BIN code format (should be 6 digits)
  if (!/^\d{6}$/.test(data.binCode)) {
    const error = new Error('BIN kodu 6 haneli sayı olmalıdır');
    error.statusCode = 400;
    throw error;
  }

  const mappedData = {
    binCode: data.binCode,
    bankId: parseInt(data.bankId),
    isActive: data.isActive !== undefined ? data.isActive : true
  };

  return await binCodeRepo.create(mappedData);
};

const updateBinCode = async (id, data) => {
  // Check if BIN code exists
  const existingBinCode = await binCodeRepo.findById(id);
  if (!existingBinCode) {
    const error = new Error('BIN kodu bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  const mappedData = {};

  // If binCode is being updated
  if (data.binCode && data.binCode !== existingBinCode.binCode) {
    // Validate format
    if (!/^\d{6}$/.test(data.binCode)) {
      const error = new Error('BIN kodu 6 haneli sayı olmalıdır');
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicates
    const binCodeWithSameCode = await binCodeRepo.findByBinCode(data.binCode);
    if (binCodeWithSameCode) {
      const error = new Error('Bu BIN kodu zaten kayıtlı');
      error.statusCode = 400;
      throw error;
    }

    mappedData.binCode = data.binCode;
  }

  // If bankId is being updated
  if (data.bankId && parseInt(data.bankId) !== existingBinCode.bankId) {
    const bank = await bankRepo.findById(parseInt(data.bankId));
    if (!bank) {
      const error = new Error('Belirtilen banka bulunamadı');
      error.statusCode = 404;
      throw error;
    }
    mappedData.bankId = parseInt(data.bankId);
  }

  if (data.isActive !== undefined) {
    mappedData.isActive = data.isActive;
  }

  return await binCodeRepo.update(id, mappedData);
};

const deleteBinCode = async (id) => {
  // Check if BIN code exists
  const existingBinCode = await binCodeRepo.findById(id);
  if (!existingBinCode) {
    const error = new Error('BIN kodu bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  return await binCodeRepo.deleteById(id);
};

module.exports = {
  getAllBinCodes,
  getBinCodeById,
  getBinCodeByCode,
  createBinCode,
  updateBinCode,
  deleteBinCode
};
