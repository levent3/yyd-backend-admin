const donationRepository = require('./donation.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const paymentTransactionRepository = require('../payment-transactions/payment-transaction.repository');
const { formatEntityWithTranslation } = require('../../../utils/translationHelper');

// ========== DONATIONS ==========

const getAllDonations = async (queryParams = {}) => {
  const { page, limit, status, paymentMethod, projectId, donorId, minAmount, maxAmount, orderId, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (status) where.paymentStatus = status;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (projectId) where.projectId = parseInt(projectId);
  if (donorId) where.donorId = parseInt(donorId);
  if (orderId) where.orderId = orderId;

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

  // Eğer ödeme tamamlandıysa, proje toplamını güncelle
  if (data.paymentStatus === 'completed' && data.projectId) {
    await donationRepository.updateProjectTotal(data.projectId);
  }

  return donation;
};

const updateDonation = async (id, data) => {
  const donation = await donationRepository.updateDonation(id, data);

  // Eğer ödeme durumu değiştiyse, proje toplamını güncelle
  if (data.paymentStatus === 'completed' && donation.projectId) {
    await donationRepository.updateProjectTotal(donation.projectId);
  }

  return donation;
};

const deleteDonation = (id) => {
  return donationRepository.deleteDonation(id);
};

// ========== DONATION CAMPAIGNS - REMOVED ==========
// NOT: Campaign fonksiyonları kaldırıldı.
// Projeler artık direkt olarak kampanya görevi görüyor.
// Campaign endpoint'leri için /api/projects kullanın.

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

  // Update project total if completed
  if (status === 'completed' && donation.projectId) {
    await donationRepository.updateProjectTotal(donation.projectId);
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

// ========== BULK PAYMENT WITH TRANSACTION ==========

/**
 * Create multiple donations in a single atomic transaction
 *
 * This ensures all-or-nothing behavior:
 * - If any donation creation fails, all donations are rolled back
 * - If 3D form creation fails, all donations are rolled back
 * - Prevents orphaned donation records in case of errors
 *
 * @param {Object} params - Bulk payment parameters
 * @param {Array} params.donations - Array of donation data objects
 * @param {Object} params.donor - Donor information (firstName, lastName, email, phone)
 * @param {String} params.orderId - Shared orderId for all donations
 * @param {Object} params.cardInfo - Card information (for BIN tracking)
 * @returns {Promise<Array>} Array of created donation objects
 *
 * @example
 * const donations = await createBulkDonationsTransaction({
 *   donations: [
 *     { amount: 100, projectId: 1, isSacrifice: false },
 *     { amount: 12000, projectId: 5, isSacrifice: true, shareCount: 3, shareholders: [...] }
 *   ],
 *   donor: { firstName: 'Ali', lastName: 'Veli', email: 'ali@test.com', phone: '+905551234567' },
 *   orderId: 'YYD-1234567890-ABC123',
 *   cardInfo: { cardBin: '540061', cardLastFour: '4581' }
 * });
 */
const createBulkDonationsTransaction = async ({ donations, donor, orderId, cardInfo }) => {
  const prisma = require('../../../config/prismaClient');

  return await prisma.$transaction(async (tx) => {
    // 1. Find or create donor within transaction
    let donorRecord = await tx.donor.findUnique({
      where: { email: donor.email }
    });

    if (!donorRecord) {
      donorRecord = await tx.donor.create({
        data: {
          fullName: `${donor.firstName} ${donor.lastName}`,
          email: donor.email,
          phoneNumber: donor.phone,
        }
      });
    }

    // 2. Create all donations within the same transaction
    const createdDonations = [];

    for (const donationData of donations) {
      const donation = await tx.donation.create({
        data: {
          amount: parseFloat(donationData.amount),
          currency: 'TRY',
          projectId: donationData.projectId ? parseInt(donationData.projectId) : null,
          donorId: donorRecord.id,
          paymentMethod: 'credit_card',
          paymentStatus: 'pending',
          paymentGateway: 'albaraka',
          isAnonymous: donationData.isAnonymous || false,
          message: donationData.message || null,
          donorName: `${donor.firstName} ${donor.lastName}`,
          donorEmail: donor.email,
          donorPhone: donor.phone,
          orderId: orderId,
          cardBin: cardInfo.cardBin,
          cardLastFour: cardInfo.cardLastFour,
          // Kurban fields
          isSacrifice: donationData.isSacrifice || false,
          sacrificeType: donationData.sacrificeType || null,
          shareCount: donationData.shareCount ? parseInt(donationData.shareCount) : 1,
          sharePrice: donationData.sharePrice ? parseFloat(donationData.sharePrice) : null,
          shareholders: donationData.shareholders || null
        }
      });

      createdDonations.push(donation);
    }

    return createdDonations;
  }, {
    // Transaction options
    maxWait: 5000, // Maximum time to wait for a transaction slot (ms)
    timeout: 10000, // Maximum transaction execution time (ms)
  });
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
  createBulkDonationsTransaction,

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
