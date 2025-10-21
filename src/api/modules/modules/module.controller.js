/**
 * Module Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * En basit CRUD örneği - hiç özel metod yok.
 */

const moduleService = require('./module.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// Service adapter
const moduleServiceAdapter = {
  getAll: () => moduleService.getAllModules(),
  getById: (id) => moduleService.getModuleById(id),
  create: (data) => moduleService.createModule(data),
  update: (id, data) => moduleService.updateModule(id, data),
  delete: (id) => moduleService.deleteModule(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(moduleServiceAdapter, {
  entityName: 'Modül',
  entityNamePlural: 'Modüller',
});

// Export
module.exports = {
  getAllModules: crudController.getAll,
  getModuleById: crudController.getById,
  createModule: crudController.create,
  updateModule: crudController.update,
  deleteModule: crudController.delete,
};
