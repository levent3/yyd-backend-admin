const volunteerService = require('./volunteer.service');

// GET /api/volunteers - Get all applications (admin)
const getAllApplications = async (req, res, next) => {
  try {
    const result = await volunteerService.getAllApplications(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/volunteers/pending-count - Get pending applications count
const getPendingCount = async (req, res, next) => {
  try {
    const count = await volunteerService.getPendingCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// GET /api/volunteers/:id - Get application by ID
const getApplicationById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const application = await volunteerService.getApplicationById(id);

    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// POST /api/volunteers - Create volunteer application (public)
const createApplication = async (req, res, next) => {
  try {
    const application = await volunteerService.createApplication(req.body);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// PUT /api/volunteers/:id - Update application
const updateApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const application = await volunteerService.updateApplication(id, req.body);
    res.json(application);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/volunteers/:id - Delete application
const deleteApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await volunteerService.deleteApplication(id);
    res.json({ message: 'Başvuru silindi' });
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
  deleteApplication
};
