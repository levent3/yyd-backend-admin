/**
 * Donation Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 *
 * ÖZEL DURUM: Bu modül 4 farklı entity içeriyor:
 * 1. Donations (Bağışlar)
 * 2. Campaigns (Kampanyalar)
 * 3. Donors (Bağışçılar)
 * 4. BankAccounts (Banka Hesapları)
 *
 * Her biri için ayrı factory controller oluşturuldu.
 * Cache invalidation pattern'leri afterCreate/Update/Delete hook'larında yapılıyor.
 */

const donationService = require('./donation.service');
const { createCRUDController } = require('../../../utils/controllerFactory');
const { invalidateCache } = require('../../middlewares/cacheMiddleware');

// ========== 1. DONATIONS (Bağışlar) ==========

const donationServiceAdapter = {
  getAll: (query) => donationService.getAllDonations(query),
  getById: (id) => donationService.getDonationById(id),
  create: (data) => donationService.createDonation(data),
  update: (id, data) => donationService.updateDonation(id, data),
  delete: (id) => donationService.deleteDonation(id),
};

const donationController = createCRUDController(donationServiceAdapter, {
  entityName: 'Bağış',
  entityNamePlural: 'Bağışlar',
  // Cache invalidation: Bağış oluşturulunca/güncellenince/silinince istatistikler değişir
  cachePatterns: [
    'cache:/api/donations/campaigns*',
    'cache:/api/dashboard*',
  ],
});

// ========== 2. CAMPAIGNS (Kampanyalar) ==========

const campaignServiceAdapter = {
  getAll: (query) => donationService.getAllCampaigns(query),
  getById: (id, query) => donationService.getCampaignById(id, query.language || 'tr'),
  create: (data) => donationService.createCampaign(data),
  update: (id, data) => donationService.updateCampaign(id, data),
  delete: (id) => donationService.deleteCampaign(id),
};

const campaignController = createCRUDController(campaignServiceAdapter, {
  entityName: 'Kampanya',
  entityNamePlural: 'Kampanyalar',
  // Cache invalidation: Kampanya oluşturulunca/güncellenince/silinince cache'leri temizle
  cachePatterns: [
    'cache:/campaigns*',
    'cache:/statistics*',
    'cache:/recent-activities*',
  ],
  // beforeCreate hook: Eski formatı yeni formata dönüştür
  beforeCreate: async (req, data) => {
    // Eğer translations yoksa, eski formatı yeni formata dönüştür
    if (!data.translations && (data.title || data.description)) {
      data.translations = [{
        language: 'tr',
        title: data.title || 'Yeni Kampanya',
        slug: data.slug || null,
        description: data.description || null
      }];
      // Eski field'ları sil
      delete data.title;
      delete data.slug;
      delete data.description;
    }

    return data;
  },
});

// ========== 3. DONORS (Bağışçılar) ==========

const donorServiceAdapter = {
  getAll: () => donationService.getAllDonors(),
  getById: (id) => donationService.getDonorById(id),
  create: (data) => donationService.createDonor(data),
  update: (id, data) => donationService.updateDonor(id, data),
  delete: null, // Donor delete yok
};

const donorController = createCRUDController(donorServiceAdapter, {
  entityName: 'Bağışçı',
  entityNamePlural: 'Bağışçılar',
});

// ========== 4. BANK ACCOUNTS (Banka Hesapları) ==========

const bankAccountServiceAdapter = {
  getAll: () => donationService.getAllBankAccounts(),
  getById: (id) => donationService.getBankAccountById(id),
  create: (data) => donationService.createBankAccount(data),
  update: (id, data) => donationService.updateBankAccount(id, data),
  delete: (id) => donationService.deleteBankAccount(id),
};

const bankAccountController = createCRUDController(bankAccountServiceAdapter, {
  entityName: 'Banka hesabı',
  entityNamePlural: 'Banka hesapları',
});

// ========== ÖZEL METODLAR ==========

// GET /api/donations/campaigns/:slug - Campaign by slug
const getCampaignBySlug = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const campaign = await donationService.getCampaignBySlug(req.params.slug, language);
    if (!campaign) {
      return res.status(404).json({ message: 'Kampanya bulunamadı' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    next(error);
  }
};

// GET /api/donations/donors/email/:email - Donor by email
const getDonorByEmail = async (req, res, next) => {
  try {
    const donor = await donationService.getDonorByEmail(req.params.email);
    if (!donor) {
      return res.status(404).json({ message: 'Bağışçı bulunamadı' });
    }
    res.status(200).json(donor);
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Donations (Bağışlar)
  getAllDonations: donationController.getAll,
  getDonationById: donationController.getById,
  createDonation: donationController.create,
  updateDonation: donationController.update,
  deleteDonation: donationController.delete,

  // Campaigns (Kampanyalar)
  getAllCampaigns: campaignController.getAll,
  getCampaignById: campaignController.getById,
  getCampaignBySlug, // Özel metod
  createCampaign: campaignController.create,
  updateCampaign: campaignController.update,
  deleteCampaign: campaignController.delete,

  // Donors (Bağışçılar)
  getAllDonors: donorController.getAll,
  getDonorById: donorController.getById,
  getDonorByEmail, // Özel metod
  createDonor: donorController.create,
  updateDonor: donorController.update,

  // Bank Accounts (Banka Hesapları)
  getAllBankAccounts: bankAccountController.getAll,
  getBankAccountById: bankAccountController.getById,
  createBankAccount: bankAccountController.create,
  updateBankAccount: bankAccountController.update,
  deleteBankAccount: bankAccountController.delete,
};
