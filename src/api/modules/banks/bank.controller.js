const bankService = require('./bank.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// Helper to map bank to frontend format
const mapBankToFrontend = (bank) => ({
  id: bank.id,
  name: bank.name,
  isOurBank: bank.isOurBank,
  isVirtualPosActive: bank.isVirtualPosActive,
  isActive: bank.isActive,
  displayOrder: bank.displayOrder,
  binCodes: bank.binCodes || [],
  createdAt: bank.createdAt,
  updatedAt: bank.updatedAt
});

// Service adapter for CRUD factory
const bankServiceAdapter = {
  getAll: (query) => bankService.getAllBanks(query),
  getById: (id) => bankService.getBankById(id),
  create: (data) => bankService.createBank(data),
  update: (id, data) => bankService.updateBank(id, data),
  delete: (id) => bankService.deleteBank(id),
};

const crudController = createCRUDController(bankServiceAdapter, {
  entityName: 'Banka',
  entityNamePlural: 'Bankalar',
  transformData: mapBankToFrontend
});

// Get our banks for dropdown (isOurBank=true)
const getOurBanks = async (req, res, next) => {
  try {
    const banks = await bankService.getOurBanks();
    const simplifiedBanks = banks.map(bank => ({
      id: bank.id,
      name: bank.name
    }));
    res.status(200).json(simplifiedBanks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBanks: crudController.getAll,
  getBankById: crudController.getById,
  createBank: crudController.create,
  updateBank: crudController.update,
  deleteBank: crudController.delete,
  getOurBanks
};
