const binCodeService = require('./bin-code.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// Helper to map BIN code to frontend format
const mapBinCodeToFrontend = (binCode) => ({
  id: binCode.id,
  binCode: binCode.binCode,
  bankId: binCode.bankId,
  bank: binCode.bank || null,
  isActive: binCode.isActive,
  createdAt: binCode.createdAt,
  updatedAt: binCode.updatedAt
});

// Service adapter for CRUD factory
const binCodeServiceAdapter = {
  getAll: (query) => binCodeService.getAllBinCodes(query),
  getById: (id) => binCodeService.getBinCodeById(id),
  create: (data) => binCodeService.createBinCode(data),
  update: (id, data) => binCodeService.updateBinCode(id, data),
  delete: (id) => binCodeService.deleteBinCode(id),
};

const crudController = createCRUDController(binCodeServiceAdapter, {
  entityName: 'BIN Kodu',
  entityNamePlural: 'BIN Kodları',
  transformData: mapBinCodeToFrontend
});

// Public endpoint to get BIN code info (for card validation)
const getBinCodeInfo = async (req, res, next) => {
  try {
    const { binCode } = req.params;

    // Validate format
    if (!/^\d{6}$/.test(binCode)) {
      return res.status(400).json({
        success: false,
        message: 'BIN kodu 6 haneli sayı olmalıdır',
        timestamp: new Date().toISOString()
      });
    }

    const result = await binCodeService.getBinCodeByCode(binCode);

    // Only return active BIN codes for public endpoint
    if (!result.isActive || !result.bank.isActive) {
      return res.status(404).json({
        success: false,
        message: 'BIN kodu bulunamadı',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'BIN kodu bilgileri getirildi',
      data: mapBinCodeToFrontend(result),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBinCodes: crudController.getAll,
  getBinCodeById: crudController.getById,
  createBinCode: crudController.create,
  updateBinCode: crudController.update,
  deleteBinCode: crudController.delete,
  getBinCodeInfo
};
