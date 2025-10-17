const recurringDonationRepo = require('./recurring-donation.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

// Lazy loading to avoid circular dependencies
let donationRepository;
let paymentTransactionRepository;

const getDonationRepository = () => {
  if (!donationRepository) {
    donationRepository = require('../donations/donation.repository');
  }
  return donationRepository;
};

const getPaymentTransactionRepository = () => {
  if (!paymentTransactionRepository) {
    paymentTransactionRepository = require('../payment-transactions/payment-transaction.repository');
  }
  return paymentTransactionRepository;
};

const getAllRecurringDonations = async (queryParams = {}) => {
  const { page, limit, status, frequency, donorId, campaignId, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (status) where.status = status;
  if (frequency) where.frequency = frequency;
  if (donorId) where.donorId = parseInt(donorId);
  if (campaignId) where.campaignId = parseInt(campaignId);

  const [data, total] = await Promise.all([
    recurringDonationRepo.findMany({ skip, take, where }),
    recurringDonationRepo.count(where),
  ]);

  return createPaginatedResponse(data, total, parseInt(page) || 1, take);
};

const getRecurringDonationById = (id) => {
  return recurringDonationRepo.findById(id);
};

const createRecurringDonation = (data) => {
  // Calculate next payment date based on frequency
  const nextPaymentDate = calculateNextPaymentDate(new Date(), data.frequency);

  const mappedData = {
    amount: parseFloat(data.amount),
    currency: data.currency || 'TRY',
    frequency: data.frequency || 'monthly',
    paymentMethod: data.paymentMethod || 'credit_card',
    paymentGateway: data.paymentGateway || 'iyzico',
    cardToken: data.cardToken || null,
    cardMask: data.cardMask || null,
    cardBrand: data.cardBrand || null,
    status: 'active',
    nextPaymentDate,
    totalPaymentsPlanned: data.totalPaymentsPlanned || null,
    donorId: parseInt(data.donorId),
    campaignId: data.campaignId ? parseInt(data.campaignId) : null
  };

  return recurringDonationRepo.create(mappedData);
};

const updateRecurringDonation = (id, data) => {
  const mappedData = {};

  if (data.amount !== undefined) mappedData.amount = parseFloat(data.amount);
  if (data.currency !== undefined) mappedData.currency = data.currency;
  if (data.frequency !== undefined) mappedData.frequency = data.frequency;
  if (data.status !== undefined) mappedData.status = data.status;
  if (data.paymentMethod !== undefined) mappedData.paymentMethod = data.paymentMethod;
  if (data.cardToken !== undefined) mappedData.cardToken = data.cardToken;
  if (data.cardMask !== undefined) mappedData.cardMask = data.cardMask;
  if (data.cardBrand !== undefined) mappedData.cardBrand = data.cardBrand;
  if (data.nextPaymentDate !== undefined) mappedData.nextPaymentDate = new Date(data.nextPaymentDate);
  if (data.totalPaymentsPlanned !== undefined) mappedData.totalPaymentsPlanned = data.totalPaymentsPlanned;

  // Set timestamps based on status changes
  if (data.status === 'paused') {
    mappedData.pausedAt = new Date();
  }

  if (data.status === 'cancelled' || data.status === 'completed') {
    mappedData.endedAt = new Date();
  }

  return recurringDonationRepo.update(id, mappedData);
};

const deleteRecurringDonation = (id) => {
  return recurringDonationRepo.deleteById(id);
};

// Pause a recurring donation
const pauseRecurringDonation = (id) => {
  return recurringDonationRepo.update(id, {
    status: 'paused',
    pausedAt: new Date()
  });
};

// Resume a paused recurring donation
const resumeRecurringDonation = async (id) => {
  const recurring = await recurringDonationRepo.findById(id);

  if (!recurring) {
    throw new Error('Recurring donation not found');
  }

  if (recurring.status !== 'paused') {
    throw new Error('Only paused recurring donations can be resumed');
  }

  // Calculate next payment date from today
  const nextPaymentDate = calculateNextPaymentDate(new Date(), recurring.frequency);

  return recurringDonationRepo.update(id, {
    status: 'active',
    nextPaymentDate,
    pausedAt: null
  });
};

// Cancel a recurring donation
const cancelRecurringDonation = (id, reason = null) => {
  return recurringDonationRepo.update(id, {
    status: 'cancelled',
    endedAt: new Date(),
    lastFailureReason: reason
  });
};

// Get recurring donations by donor
const getRecurringDonationsByDonor = (donorId) => {
  return recurringDonationRepo.findByDonorId(donorId);
};

// Get recurring donations by campaign
const getRecurringDonationsByCampaign = (campaignId) => {
  return recurringDonationRepo.findByCampaignId(campaignId);
};

// Get due recurring donations (for scheduled processing)
const getDueRecurringDonations = () => {
  return recurringDonationRepo.getDueRecurringDonations();
};

// Process payment success
const processPaymentSuccess = async (id, paymentData = {}) => {
  const recurring = await recurringDonationRepo.findById(id);

  if (!recurring) {
    throw new Error('Recurring donation not found');
  }

  // 1. Create a Donation record for this recurring payment
  const donationRepo = getDonationRepository();
  const donation = await donationRepo.createDonation({
    amount: recurring.amount,
    currency: recurring.currency,
    paymentMethod: recurring.paymentMethod,
    paymentStatus: 'completed',
    paymentGateway: recurring.paymentGateway,
    transactionId: paymentData.transactionId || null,
    gatewayResponse: paymentData.gatewayResponse || null,
    donorId: recurring.donorId,
    campaignId: recurring.campaignId,
    completedAt: new Date(),
    message: `Düzenli bağış - ${recurring.frequency}`,
    isAnonymous: false
  });

  // 2. Create PaymentTransaction record
  if (paymentData.createTransaction !== false) {
    const paymentTransactionRepo = getPaymentTransactionRepository();
    await paymentTransactionRepo.create({
      amount: recurring.amount,
      currency: recurring.currency,
      status: 'success',
      paymentGateway: recurring.paymentGateway,
      gatewayTransactionId: paymentData.gatewayTransactionId || null,
      gatewayResponse: paymentData.gatewayResponse || null,
      conversationId: paymentData.conversationId || null,
      donationId: donation.id,
      recurringDonationId: recurring.id,
      processedAt: new Date(),
      attemptNumber: 1
    });
  }

  // 3. Update campaign total if campaign exists
  if (recurring.campaignId) {
    await donationRepo.updateCampaignTotal(recurring.campaignId);
  }

  // 4. Calculate next payment date
  const nextPaymentDate = calculateNextPaymentDate(new Date(), recurring.frequency);

  // 5. Check if this was the last planned payment
  const shouldComplete = recurring.totalPaymentsPlanned &&
                         (recurring.totalPaymentsMade + 1 >= recurring.totalPaymentsPlanned);

  // 6. Update recurring donation
  const updateData = {
    lastPaymentDate: new Date(),
    nextPaymentDate: shouldComplete ? null : nextPaymentDate,
    totalPaymentsMade: recurring.totalPaymentsMade + 1,
    failedAttempts: 0,
    lastFailureReason: null,
    status: shouldComplete ? 'completed' : 'active'
  };

  if (shouldComplete) {
    updateData.endedAt = new Date();
  }

  await recurringDonationRepo.update(id, updateData);

  // 7. Return updated recurring donation with created donation
  return {
    recurringDonation: await recurringDonationRepo.findById(id),
    createdDonation: donation
  };
};

// Process payment failure
const processPaymentFailure = async (id, failureReason) => {
  const recurring = await recurringDonationRepo.findById(id);

  if (!recurring) {
    throw new Error('Recurring donation not found');
  }

  const newFailedAttempts = recurring.failedAttempts + 1;

  // Cancel if too many failed attempts (e.g., 3)
  if (newFailedAttempts >= 3) {
    return cancelRecurringDonation(id, `Otomatik iptal: ${failureReason}`);
  }

  return recurringDonationRepo.incrementFailedAttempts(id, failureReason);
};

// Get statistics
const getStatistics = () => {
  return recurringDonationRepo.getStatistics();
};

// Helper function to calculate next payment date
function calculateNextPaymentDate(currentDate, frequency) {
  const nextDate = new Date(currentDate);

  switch (frequency) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
  }

  return nextDate;
}

module.exports = {
  getAllRecurringDonations,
  getRecurringDonationById,
  createRecurringDonation,
  updateRecurringDonation,
  deleteRecurringDonation,
  pauseRecurringDonation,
  resumeRecurringDonation,
  cancelRecurringDonation,
  getRecurringDonationsByDonor,
  getRecurringDonationsByCampaign,
  getDueRecurringDonations,
  processPaymentSuccess,
  processPaymentFailure,
  getStatistics
};
