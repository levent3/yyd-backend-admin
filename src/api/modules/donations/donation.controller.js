const donationService = require('./donation.service');

// ========== DONATIONS ==========

const getAllDonations = async (req, res, next) => {
  try {
    const result = await donationService.getAllDonations(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getDonationById = async (req, res, next) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Bağış bulunamadı' });
    }
    res.status(200).json(donation);
  } catch (error) {
    next(error);
  }
};

const createDonation = async (req, res, next) => {
  try {
    const donation = await donationService.createDonation(req.body);
    res.status(201).json({ message: 'Bağış kaydı oluşturuldu', donation });
  } catch (error) {
    next(error);
  }
};

const updateDonation = async (req, res, next) => {
  try {
    const donation = await donationService.updateDonation(req.params.id, req.body);
    res.status(200).json({ message: 'Bağış güncellendi', donation });
  } catch (error) {
    next(error);
  }
};

const deleteDonation = async (req, res, next) => {
  try {
    await donationService.deleteDonation(req.params.id);
    res.status(200).json({ message: 'Bağış silindi' });
  } catch (error) {
    next(error);
  }
};

// ========== DONATION CAMPAIGNS ==========

const getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await donationService.getAllCampaigns(req.query);
    res.status(200).json(campaigns);
  } catch (error) {
    next(error);
  }
};

const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await donationService.getCampaignById(parseInt(req.params.id));
    if (!campaign) {
      return res.status(404).json({ message: 'Kampanya bulunamadı' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    next(error);
  }
};

const getCampaignBySlug = async (req, res, next) => {
  try {
    const campaign = await donationService.getCampaignBySlug(req.params.slug);
    if (!campaign) {
      return res.status(404).json({ message: 'Kampanya bulunamadı' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    next(error);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const campaign = await donationService.createCampaign(req.body);
    res.status(201).json({ message: 'Kampanya oluşturuldu', campaign });
  } catch (error) {
    next(error);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await donationService.updateCampaign(parseInt(req.params.id), req.body);
    res.status(200).json({ message: 'Kampanya güncellendi', campaign });
  } catch (error) {
    next(error);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    await donationService.deleteCampaign(parseInt(req.params.id));
    res.status(200).json({ message: 'Kampanya silindi' });
  } catch (error) {
    next(error);
  }
};

// ========== DONORS ==========

const getAllDonors = async (req, res, next) => {
  try {
    const donors = await donationService.getAllDonors();
    res.status(200).json(donors);
  } catch (error) {
    next(error);
  }
};

const getDonorById = async (req, res, next) => {
  try {
    const donor = await donationService.getDonorById(parseInt(req.params.id));
    if (!donor) {
      return res.status(404).json({ message: 'Bağışçı bulunamadı' });
    }
    res.status(200).json(donor);
  } catch (error) {
    next(error);
  }
};

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

const createDonor = async (req, res, next) => {
  try {
    const donor = await donationService.createDonor(req.body);
    res.status(201).json({ message: 'Bağışçı oluşturuldu', donor });
  } catch (error) {
    next(error);
  }
};

const updateDonor = async (req, res, next) => {
  try {
    const donor = await donationService.updateDonor(parseInt(req.params.id), req.body);
    res.status(200).json({ message: 'Bağışçı güncellendi', donor });
  } catch (error) {
    next(error);
  }
};

// ========== BANK ACCOUNTS ==========

const getAllBankAccounts = async (req, res, next) => {
  try {
    const accounts = await donationService.getAllBankAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    next(error);
  }
};

const getBankAccountById = async (req, res, next) => {
  try {
    const account = await donationService.getBankAccountById(parseInt(req.params.id));
    if (!account) {
      return res.status(404).json({ message: 'Banka hesabı bulunamadı' });
    }
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};

const createBankAccount = async (req, res, next) => {
  try {
    const account = await donationService.createBankAccount(req.body);
    res.status(201).json({ message: 'Banka hesabı oluşturuldu', account });
  } catch (error) {
    next(error);
  }
};

const updateBankAccount = async (req, res, next) => {
  try {
    const account = await donationService.updateBankAccount(parseInt(req.params.id), req.body);
    res.status(200).json({ message: 'Banka hesabı güncellendi', account });
  } catch (error) {
    next(error);
  }
};

const deleteBankAccount = async (req, res, next) => {
  try {
    await donationService.deleteBankAccount(parseInt(req.params.id));
    res.status(200).json({ message: 'Banka hesabı silindi' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Donations
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,

  // Campaigns
  getAllCampaigns,
  getCampaignById,
  getCampaignBySlug,
  createCampaign,
  updateCampaign,
  deleteCampaign,

  // Donors
  getAllDonors,
  getDonorById,
  getDonorByEmail,
  createDonor,
  updateDonor,

  // Bank Accounts
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
};
