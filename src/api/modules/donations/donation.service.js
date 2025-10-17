const donationRepository = require('./donation.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const paymentTransactionRepository = require('../payment-transactions/payment-transaction.repository');

// ========== DONATIONS ==========

const getAllDonations = async (queryParams = {}) => {
  const { page, limit, status, paymentMethod, campaignId, donorId, minAmount, maxAmount, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (status) where.paymentStatus = status;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (campaignId) where.campaignId = parseInt(campaignId);
  if (donorId) where.donorId = parseInt(donorId);

  // Amount filtering
  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.gte = parseFloat(minAmount);
    if (maxAmount) where.amount.lte = parseFloat(maxAmount);
  }

  const [data, total] = await Promise.all([
    donationRepository.findMany({ skip, take, where }),
    donationRepository.count(where),
  ]);

  return createPaginatedResponse(data, total, parseInt(page) || 1, take);
};

const getDonationById = (id) => {
  return donationRepository.getDonationById(id);
};

const createDonation = async (data) => {
  // Eğer email varsa ve donor yoksa, donor oluştur veya bul
  if (data.donorEmail && !data.donorId) {
    let donor = await donationRepository.getDonorByEmail(data.donorEmail);

    if (!donor && data.donorName) {
      donor = await donationRepository.createDonor({
        fullName: data.donorName,
        email: data.donorEmail,
        phoneNumber: data.donorPhone,
      });
    }

    if (donor) {
      data.donorId = donor.id;
    }
  }

  const donation = await donationRepository.createDonation(data);

  // Eğer ödeme tamamlandıysa, kampanya toplamını güncelle
  if (data.paymentStatus === 'completed' && data.campaignId) {
    await donationRepository.updateCampaignTotal(data.campaignId);
  }

  return donation;
};

const updateDonation = async (id, data) => {
  const donation = await donationRepository.updateDonation(id, data);

  // Eğer ödeme durumu değiştiyse, kampanya toplamını güncelle
  if (data.paymentStatus === 'completed' && donation.campaignId) {
    await donationRepository.updateCampaignTotal(donation.campaignId);
  }

  return donation;
};

const deleteDonation = (id) => {
  return donationRepository.deleteDonation(id);
};

// ========== DONATION CAMPAIGNS ==========

const getAllCampaigns = (filters) => {
  return donationRepository.getAllCampaigns(filters);
};

const getCampaignById = (id) => {
  return donationRepository.getCampaignById(id);
};

const getCampaignBySlug = (slug) => {
  return donationRepository.getCampaignBySlug(slug);
};

const createCampaign = (data) => {
  return donationRepository.createCampaign(data);
};

const updateCampaign = (id, data) => {
  return donationRepository.updateCampaign(id, data);
};

const deleteCampaign = (id) => {
  return donationRepository.deleteCampaign(id);
};

// ========== DONORS ==========

const getAllDonors = () => {
  return donationRepository.getAllDonors();
};

const getDonorById = (id) => {
  return donationRepository.getDonorById(id);
};

const getDonorByEmail = (email) => {
  return donationRepository.getDonorByEmail(email);
};

const createDonor = (data) => {
  return donationRepository.createDonor(data);
};

const updateDonor = (id, data) => {
  return donationRepository.updateDonor(id, data);
};

// ========== BANK ACCOUNTS ==========

const getAllBankAccounts = () => {
  return donationRepository.getAllBankAccounts();
};

const getBankAccountById = (id) => {
  return donationRepository.getBankAccountById(id);
};

const createBankAccount = (data) => {
  return donationRepository.createBankAccount(data);
};

const updateBankAccount = (id, data) => {
  return donationRepository.updateBankAccount(id, data);
};

const deleteBankAccount = (id) => {
  return donationRepository.deleteBankAccount(id);
};

// ========== DONATION WITH PAYMENT TRANSACTION ==========

// Create donation with initial payment transaction
const createDonationWithTransaction = async (data) => {
  // Create donation
  const donation = await createDonation(data);

  // Create initial payment transaction
  if (data.paymentGateway) {
    await paymentTransactionRepository.create({
      amount: donation.amount,
      currency: donation.currency,
      status: donation.paymentStatus || 'pending',
      paymentGateway: data.paymentGateway,
      gatewayTransactionId: data.gatewayTransactionId || null,
      gatewayResponse: data.gatewayResponse || null,
      threeDSecure: data.threeDSecure || false,
      conversationId: data.conversationId || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      donationId: donation.id,
      attemptNumber: 1
    });
  }

  // Return donation with transactions
  return donationRepository.getDonationById(donation.id);
};

// Update donation payment status (called from PaymentTransaction)
const updateDonationPaymentStatus = async (donationId, status, paymentData = {}) => {
  const updateData = {
    paymentStatus: status
  };

  if (status === 'completed') {
    updateData.completedAt = new Date();
    updateData.transactionId = paymentData.transactionId || null;
    updateData.receiptUrl = paymentData.receiptUrl || null;
  } else if (status === 'failed') {
    updateData.failedAt = new Date();
  }

  if (paymentData.gatewayResponse) {
    updateData.gatewayResponse = paymentData.gatewayResponse;
  }

  const donation = await donationRepository.updateDonation(donationId, updateData);

  // Update campaign total if completed
  if (status === 'completed' && donation.campaignId) {
    await donationRepository.updateCampaignTotal(donation.campaignId);
  }

  return donation;
};

// Process donation payment (called from payment gateway callback)
const processDonationPayment = async (donationId, paymentResult) => {
  const { success, transactionId, gatewayResponse, errorMessage } = paymentResult;

  if (success) {
    return await updateDonationPaymentStatus(donationId, 'completed', {
      transactionId,
      gatewayResponse
    });
  } else {
    return await updateDonationPaymentStatus(donationId, 'failed', {
      gatewayResponse
    });
  }
};

module.exports = {
  // Donations
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  createDonationWithTransaction,
  updateDonationPaymentStatus,
  processDonationPayment,

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
