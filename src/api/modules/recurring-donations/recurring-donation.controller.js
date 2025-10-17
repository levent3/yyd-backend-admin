const recurringDonationService = require('./recurring-donation.service');

// GET /api/recurring-donations - Get all recurring donations (admin)
const getAllRecurringDonations = async (req, res, next) => {
  try {
    const result = await recurringDonationService.getAllRecurringDonations(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

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

// GET /api/recurring-donations/:id - Get recurring donation by ID
const getRecurringDonationById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const recurring = await recurringDonationService.getRecurringDonationById(id);

    if (!recurring) {
      return res.status(404).json({ message: 'Düzenli bağış bulunamadı' });
    }

    res.json(recurring);
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

// POST /api/recurring-donations - Create recurring donation
const createRecurringDonation = async (req, res, next) => {
  try {
    const recurring = await recurringDonationService.createRecurringDonation(req.body);
    res.status(201).json({
      message: 'Düzenli bağış oluşturuldu',
      recurring
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/recurring-donations/:id - Update recurring donation
const updateRecurringDonation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const recurring = await recurringDonationService.updateRecurringDonation(id, req.body);
    res.json({
      message: 'Düzenli bağış güncellendi',
      recurring
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/recurring-donations/:id - Delete recurring donation
const deleteRecurringDonation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await recurringDonationService.deleteRecurringDonation(id);
    res.json({ message: 'Düzenli bağış silindi' });
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

module.exports = {
  getAllRecurringDonations,
  getStatistics,
  getDueRecurringDonations,
  getRecurringDonationById,
  getByDonor,
  getByCampaign,
  createRecurringDonation,
  updateRecurringDonation,
  deleteRecurringDonation,
  pauseRecurringDonation,
  resumeRecurringDonation,
  cancelRecurringDonation,
  processPaymentSuccess,
  processPaymentFailure
};
