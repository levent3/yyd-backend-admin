const bankRepo = require('./bank.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllBanks = async (queryParams = {}) => {
  const { page, limit, isActive, isOurBank, isVirtualPosActive } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (isOurBank !== undefined) where.isOurBank = isOurBank === 'true';
  if (isVirtualPosActive !== undefined) where.isVirtualPosActive = isVirtualPosActive === 'true';

  const [banks, total] = await Promise.all([
    bankRepo.findMany({ skip, take, where }),
    bankRepo.count(where),
  ]);

  return createPaginatedResponse(banks, total, parseInt(page) || 1, take);
};

const getBankById = async (id) => {
  const bank = await bankRepo.findById(id);
  if (!bank) {
    const error = new Error('Banka bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  return bank;
};

const createBank = async (data) => {
  // Check if bank with same name already exists
  const existingBank = await bankRepo.findByName(data.name);
  if (existingBank) {
    const error = new Error('Bu isimde bir banka zaten mevcut');
    error.statusCode = 400;
    throw error;
  }

  const mappedData = {
    name: data.name,
    isOurBank: data.isOurBank !== undefined ? data.isOurBank : false,
    isVirtualPosActive: data.isVirtualPosActive !== undefined ? data.isVirtualPosActive : false,
    isActive: data.isActive !== undefined ? data.isActive : true,
    displayOrder: data.displayOrder !== undefined ? parseInt(data.displayOrder) : 0
  };

  return await bankRepo.create(mappedData);
};

const updateBank = async (id, data) => {
  // Check if bank exists
  const existingBank = await bankRepo.findById(id);
  if (!existingBank) {
    const error = new Error('Banka bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  // If name is being updated, check for duplicates
  if (data.name && data.name !== existingBank.name) {
    const bankWithSameName = await bankRepo.findByName(data.name);
    if (bankWithSameName) {
      const error = new Error('Bu isimde bir banka zaten mevcut');
      error.statusCode = 400;
      throw error;
    }
  }

  const mappedData = {};
  if (data.name !== undefined) mappedData.name = data.name;
  if (data.isOurBank !== undefined) mappedData.isOurBank = data.isOurBank;
  if (data.isVirtualPosActive !== undefined) mappedData.isVirtualPosActive = data.isVirtualPosActive;
  if (data.isActive !== undefined) mappedData.isActive = data.isActive;
  if (data.displayOrder !== undefined) mappedData.displayOrder = parseInt(data.displayOrder);

  return await bankRepo.update(id, mappedData);
};

const deleteBank = async (id) => {
  // Check if bank exists
  const existingBank = await bankRepo.findById(id);
  if (!existingBank) {
    const error = new Error('Banka bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  // Check if bank has any bin codes
  if (existingBank.binCodes && existingBank.binCodes.length > 0) {
    const error = new Error('Bu bankaya ait BIN kodları bulunmaktadır. Önce BIN kodlarını silmelisiniz.');
    error.statusCode = 400;
    throw error;
  }

  return await bankRepo.deleteById(id);
};

module.exports = {
  getAllBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank
};
