/**
 * Recurring Donation Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metodlar: getStatistics, getDueRecurringDonations, getByDonor, getByCampaign,
 *                pauseRecurringDonation, resumeRecurringDonation, cancelRecurringDonation,
 *                processPaymentSuccess, processPaymentFailure
 */

const recurringDonationService = require('./recurring-donation.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const recurringDonationServiceAdapter = {
  getAll: (query) => recurringDonationService.getAllRecurringDonations(query),
  getById: (id) => recurringDonationService.getRecurringDonationById(id),
  create: (data) => recurringDonationService.createRecurringDonation(data),
  update: (id, data) => recurringDonationService.updateRecurringDonation(id, data),
  delete: (id) => recurringDonationService.deleteRecurringDonation(id),
};

const crudController = createCRUDController(recurringDonationServiceAdapter, {
  entityName: 'Düzenli bağış',
  entityNamePlural: 'Düzenli bağışlar',
});

// ========== ÖZEL METODLAR ==========

// GET /api/recurring-donations/statistics - Get statistics
const getStatistics = async (req, res, next) => {
  try {
    const stats = await recurringDonationService.getStatistics();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// GET /api/recurring-donations/due - Get due recurring donations (admin/cron)
const getDueRecurringDonations = async (req, res, next) => {
  try {
    const donations = await recurringDonationService.getDueRecurringDonations();
    res.json(donations);
  } catch (error) {
    next(error);
  }
};

// GET /api/recurring-donations/donor/:donorId - Get by donor
const getByDonor = async (req, res, next) => {
  try {
    const donorId = parseInt(req.params.donorId);
    const donations = await recurringDonationService.getRecurringDonationsByDonor(donorId);
    res.json(donations);
  } catch (error) {
    next(error);
  }
};

// GET /api/recurring-donations/campaign/:campaignId - Get by campaign
const getByCampaign = async (req, res, next) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const donations = await recurringDonationService.getRecurringDonationsByCampaign(campaignId);
    res.json(donations);
  } catch (error) {
    next(error);
  }
};

// POST /api/recurring-donations/:id/pause - Pause recurring donation
const pauseRecurringDonation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const recurring = await recurringDonationService.pauseRecurringDonation(id);
    res.json({
      message: 'Düzenli bağış duraklatıldı',
      recurring
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/recurring-donations/:id/resume - Resume recurring donation
const resumeRecurringDonation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const recurring = await recurringDonationService.resumeRecurringDonation(id);
    res.json({
      message: 'Düzenli bağış yeniden başlatıldı',
      recurring
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/recurring-donations/:id/cancel - Cancel recurring donation
const cancelRecurringDonation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const recurring = await recurringDonationService.cancelRecurringDonation(id, reason);
    res.json({
      message: 'Düzenli bağış iptal edildi',
      recurring
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/recurring-donations/:id/payment-success - Process payment success (internal/webhook)
const processPaymentSuccess = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const recurring = await recurringDonationService.processPaymentSuccess(id);
    res.json({
      message: 'Ödeme başarılı olarak işlendi',
      recurring
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/recurring-donations/:id/payment-failure - Process payment failure (internal/webhook)
const processPaymentFailure = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const recurring = await recurringDonationService.processPaymentFailure(id, reason);
    res.json({
      message: 'Ödeme hatası işlendi',
      recurring
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllRecurringDonations: crudController.getAll,
  getRecurringDonationById: crudController.getById,
  createRecurringDonation: crudController.create,
  updateRecurringDonation: crudController.update,
  deleteRecurringDonation: crudController.delete,

  // Özel metodlar
  getStatistics,
  getDueRecurringDonations,
  getByDonor,
  getByCampaign,
  pauseRecurringDonation,
  resumeRecurringDonation,
  cancelRecurringDonation,
  processPaymentSuccess,
  processPaymentFailure,
};
