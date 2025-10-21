/**
 * Career Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metodlar (getPendingCount, getByStatus, getByPosition) elle tanımlanmış.
 */

const careerService = require('./career.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const careerServiceAdapter = {
  getAll: (query) => careerService.getAllApplications(query),
  getById: (id) => careerService.getApplicationById(id),
  create: (data) => careerService.createApplication(data),
  update: (id, data) => careerService.updateApplication(id, data),
  delete: (id) => careerService.deleteApplication(id),
};

const crudController = createCRUDController(careerServiceAdapter, {
  entityName: 'Başvuru',
  entityNamePlural: 'Başvurular',
});

// ========== ÖZEL METODLAR ==========

// GET /api/careers/pending-count - Get pending applications count
const getPendingCount = async (req, res, next) => {
  try {
    const count = await careerService.getPendingCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// GET /api/careers/status/:status - Get applications by status
const getApplicationsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const applications = await careerService.getApplicationsByStatus(status);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// GET /api/careers/position/:position - Get applications by position
const getApplicationsByPosition = async (req, res, next) => {
  try {
    const { position } = req.params;
    const applications = await careerService.getApplicationsByPosition(position);
    res.json(applications);
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
  getApplicationsByStatus,
  getApplicationsByPosition,
};
