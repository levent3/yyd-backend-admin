/**
 * Volunteer Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metod (getPendingCount) elle tanımlanmış.
 */

const volunteerService = require('./volunteer.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const volunteerServiceAdapter = {
  getAll: (query) => volunteerService.getAllApplications(query),
  getById: (id) => volunteerService.getApplicationById(id),
  create: (data) => volunteerService.createApplication(data),
  update: (id, data) => volunteerService.updateApplication(id, data),
  delete: (id) => volunteerService.deleteApplication(id),
};

const crudController = createCRUDController(volunteerServiceAdapter, {
  entityName: 'Başvuru',
  entityNamePlural: 'Başvurular',
});

// ========== ÖZEL METODLAR ==========

// GET /api/volunteers/pending-count - Get pending applications count
const getPendingCount = async (req, res, next) => {
  try {
    const count = await volunteerService.getPendingCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllApplications: crudController.getAll,
  getApplicationById: crudController.getById,
  createApplication: crudController.create,
  updateApplication: crudController.update,
  deleteApplication: crudController.delete,

  // Özel metodlar
  getPendingCount,
};
