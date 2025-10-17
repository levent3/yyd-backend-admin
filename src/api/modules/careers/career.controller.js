const careerService = require('./career.service');

// GET /api/careers - Get all applications (admin)
const getAllApplications = async (req, res, next) => {
  try {
    const result = await careerService.getAllApplications(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/careers/pending-count - Get pending applications count
const getPendingCount = async (req, res, next) => {
  try {
    const count = await careerService.getPendingCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// GET /api/careers/:id - Get application by ID
const getApplicationById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const application = await careerService.getApplicationById(id);

    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// POST /api/careers - Create career application (public)
const createApplication = async (req, res, next) => {
  try {
    const application = await careerService.createApplication(req.body);
    res.status(201).json({
      message: 'Kariyer başvurunuz alındı',
      application
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/careers/:id - Update application (admin)
const updateApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const application = await careerService.updateApplication(id, req.body);
    res.json({
      message: 'Başvuru güncellendi',
      application
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/careers/:id - Delete application (admin)
const deleteApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await careerService.deleteApplication(id);
    res.json({ message: 'Başvuru silindi' });
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

module.exports = {
  getAllApplications,
  getPendingCount,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationsByStatus,
  getApplicationsByPosition
};
