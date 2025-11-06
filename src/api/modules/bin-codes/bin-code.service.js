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

const bulkUploadBinCodes = async (data) => {
  const { bankId, binCodes } = data;

  // Validate bank exists
  const bank = await bankRepo.findById(bankId);
  if (!bank) {
    const error = new Error('Belirtilen banka bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  // Parse and clean BIN codes
  let binCodeList = [];
  if (typeof binCodes === 'string') {
    // Split by comma, space, newline, or semicolon
    binCodeList = binCodes
      .split(/[,;\s\n\r]+/)
      .map(code => code.trim())
      .filter(code => code.length > 0);
  } else if (Array.isArray(binCodes)) {
    binCodeList = binCodes.map(code => String(code).trim()).filter(code => code.length > 0);
  } else {
    const error = new Error('BIN kodları string veya array formatında olmalıdır');
    error.statusCode = 400;
    throw error;
  }

  // Remove duplicates from input
  binCodeList = [...new Set(binCodeList)];

  // Results tracking
  const results = {
    total: binCodeList.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    details: {
      created: [],
      duplicates: [],
      invalid: []
    }
  };

  // Check existing BIN codes in database
  const existingBinCodes = await binCodeRepo.findByBankId(bankId);
  const existingBinCodesSet = new Set(existingBinCodes.map(bc => bc.binCode));

  // Also check all existing BIN codes across all banks
  const prisma = require('../../../config/prismaClient');
  const allExistingBinCodes = await prisma.binCode.findMany({
    select: { binCode: true }
  });
  const allExistingBinCodesSet = new Set(allExistingBinCodes.map(bc => bc.binCode));

  // Prepare data for bulk insert
  const validBinCodes = [];

  for (const binCode of binCodeList) {
    // Validate format (6 digits)
    if (!/^\d{6}$/.test(binCode)) {
      results.failed++;
      results.details.invalid.push(binCode);
      continue;
    }

    // Check if already exists in database
    if (allExistingBinCodesSet.has(binCode)) {
      results.skipped++;
      results.details.duplicates.push(binCode);
      continue;
    }

    // Add to valid list
    validBinCodes.push({
      binCode: binCode,
      bankId: parseInt(bankId),
      isActive: true
    });
  }

  // Bulk insert using transaction
  if (validBinCodes.length > 0) {
    try {
      await prisma.$transaction(async (tx) => {
        // Use createMany for bulk insert
        const result = await tx.binCode.createMany({
          data: validBinCodes,
          skipDuplicates: true
        });

        results.successful = result.count;
        results.details.created = validBinCodes.map(bc => bc.binCode);
      });
    } catch (error) {
      console.error('Bulk insert error:', error);
      const err = new Error('Toplu ekleme sırasında bir hata oluştu');
      err.statusCode = 500;
      throw err;
    }
  }

  return results;
};

module.exports = {
  getAllBinCodes,
  getBinCodeById,
  getBinCodeByCode,
  createBinCode,
  updateBinCode,
  deleteBinCode,
  bulkUploadBinCodes
};
