const paymentTransactionRepo = require('./payment-transaction.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

// Lazy loading to avoid circular dependencies
let donationService;
let recurringDonationService;

const getDonationService = () => {
  if (!donationService) {
    donationService = require('../donations/donation.service');
  }
  return donationService;
};

const getRecurringDonationService = () => {
  if (!recurringDonationService) {
    recurringDonationService = require('../recurring-donations/recurring-donation.service');
  }
  return recurringDonationService;
};

const getAllTransactions = async (queryParams = {}) => {
  const { page, limit, status, paymentGateway, donationId, recurringDonationId, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (status) where.status = status;
  if (paymentGateway) where.paymentGateway = paymentGateway;
  if (donationId) where.donationId = donationId;
  if (recurringDonationId) where.recurringDonationId = parseInt(recurringDonationId);

  const [data, total] = await Promise.all([
    paymentTransactionRepo.findMany({ skip, take, where }),
    paymentTransactionRepo.count(where),
  ]);

  return createPaginatedResponse(data, total, parseInt(page) || 1, take);
};

const getTransactionById = (id) => {
  return paymentTransactionRepo.findById(id);
};

const createTransaction = (data) => {
  const mappedData = {
    amount: parseFloat(data.amount),
    currency: data.currency || 'TRY',
    status: data.status || 'pending',
    paymentGateway: data.paymentGateway,
    gatewayTransactionId: data.gatewayTransactionId || null,
    gatewayResponse: data.gatewayResponse || null,
    gatewayErrorCode: data.gatewayErrorCode || null,
    gatewayErrorMessage: data.gatewayErrorMessage || null,
    threeDSecure: data.threeDSecure || false,
    conversationId: data.conversationId || null,
    attemptNumber: data.attemptNumber || 1,
    retryable: data.retryable || false,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
    donationId: data.donationId || null,
    recurringDonationId: data.recurringDonationId || null
  };

  return paymentTransactionRepo.create(mappedData);
};

const updateTransaction = (id, data) => {
  const mappedData = {};

  if (data.status !== undefined) {
    mappedData.status = data.status;
    if (data.status === 'success' || data.status === 'failed') {
      mappedData.processedAt = new Date();
    }
  }

  if (data.gatewayTransactionId !== undefined) mappedData.gatewayTransactionId = data.gatewayTransactionId;
  if (data.gatewayResponse !== undefined) mappedData.gatewayResponse = data.gatewayResponse;
  if (data.gatewayErrorCode !== undefined) mappedData.gatewayErrorCode = data.gatewayErrorCode;
  if (data.gatewayErrorMessage !== undefined) mappedData.gatewayErrorMessage = data.gatewayErrorMessage;
  if (data.retryable !== undefined) mappedData.retryable = data.retryable;

  return paymentTransactionRepo.update(id, mappedData);
};

const deleteTransaction = (id) => {
  return paymentTransactionRepo.deleteById(id);
};

// Get transactions by donation
const getTransactionsByDonation = (donationId) => {
  return paymentTransactionRepo.findByDonationId(donationId);
};

// Get transactions by recurring donation
const getTransactionsByRecurringDonation = (recurringDonationId) => {
  return paymentTransactionRepo.findByRecurringDonationId(recurringDonationId);
};

// Get transactions by payment gateway
const getTransactionsByGateway = (gateway) => {
  return paymentTransactionRepo.findByPaymentGateway(gateway);
};

// Get failed transactions
const getFailedTransactions = (limit) => {
  return paymentTransactionRepo.getFailedTransactions(limit);
};

// Get pending transactions
const getPendingTransactions = () => {
  return paymentTransactionRepo.getPendingTransactions();
};

// Mark transaction as success
const markAsSuccess = (id, gatewayData = {}) => {
  return paymentTransactionRepo.update(id, {
    status: 'success',
    gatewayTransactionId: gatewayData.transactionId,
    gatewayResponse: gatewayData.response,
    processedAt: new Date()
  });
};

// Mark transaction as failed
const markAsFailed = (id, errorData = {}) => {
  return paymentTransactionRepo.update(id, {
    status: 'failed',
    gatewayErrorCode: errorData.errorCode,
    gatewayErrorMessage: errorData.errorMessage,
    gatewayResponse: errorData.response,
    retryable: errorData.retryable || false,
    processedAt: new Date()
  });
};

// Retry a failed transaction
const retryTransaction = async (id) => {
  const transaction = await paymentTransactionRepo.findById(id);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== 'failed') {
    throw new Error('Only failed transactions can be retried');
  }

  if (!transaction.retryable) {
    throw new Error('This transaction is not retryable');
  }

  // Create a new transaction with incremented attempt number
  const newTransactionData = {
    amount: transaction.amount,
    currency: transaction.currency,
    status: 'pending',
    paymentGateway: transaction.paymentGateway,
    attemptNumber: transaction.attemptNumber + 1,
    donationId: transaction.donationId,
    recurringDonationId: transaction.recurringDonationId,
    ipAddress: transaction.ipAddress,
    userAgent: transaction.userAgent
  };

  return paymentTransactionRepo.create(newTransactionData);
};

// Get statistics
const getStatistics = (startDate, endDate) => {
  return paymentTransactionRepo.getStatistics(startDate, endDate);
};

// Get statistics by gateway
const getStatisticsByGateway = () => {
  return paymentTransactionRepo.getStatisticsByGateway();
};

// ========== PAYMENT CALLBACK HANDLERS ==========

// Handle successful payment - updates transaction AND related Donation/RecurringDonation
const handleSuccessfulPayment = async (transactionId, gatewayData = {}) => {
  // Get transaction with relationships
  const transaction = await paymentTransactionRepo.findById(transactionId);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Update transaction to success
  const updatedTransaction = await paymentTransactionRepo.update(transactionId, {
    status: 'success',
    gatewayTransactionId: gatewayData.transactionId || null,
    gatewayResponse: gatewayData.response || null,
    processedAt: new Date()
  });

  // Update related Donation if exists
  if (transaction.donationId) {
    const donationSvc = getDonationService();
    await donationSvc.updateDonationPaymentStatus(transaction.donationId, 'completed', {
      transactionId: gatewayData.transactionId,
      gatewayResponse: gatewayData.response
    });
  }

  // Update related RecurringDonation if exists
  if (transaction.recurringDonationId) {
    const recurringSvc = getRecurringDonationService();
    await recurringSvc.processPaymentSuccess(transaction.recurringDonationId);
  }

  return updatedTransaction;
};

// Handle failed payment - updates transaction AND related Donation/RecurringDonation
const handleFailedPayment = async (transactionId, errorData = {}) => {
  // Get transaction with relationships
  const transaction = await paymentTransactionRepo.findById(transactionId);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Update transaction to failed
  const updatedTransaction = await paymentTransactionRepo.update(transactionId, {
    status: 'failed',
    gatewayErrorCode: errorData.errorCode || null,
    gatewayErrorMessage: errorData.errorMessage || null,
    gatewayResponse: errorData.response || null,
    retryable: errorData.retryable || false,
    processedAt: new Date()
  });

  // Update related Donation if exists
  if (transaction.donationId) {
    const donationSvc = getDonationService();
    await donationSvc.updateDonationPaymentStatus(transaction.donationId, 'failed', {
      gatewayResponse: errorData.response
    });
  }

  // Update related RecurringDonation if exists
  if (transaction.recurringDonationId) {
    const recurringSvc = getRecurringDonationService();
    await recurringSvc.processPaymentFailure(transaction.recurringDonationId, errorData.errorMessage || 'Payment failed');
  }

  return updatedTransaction;
};

// Process transaction callback from payment gateway
const processTransactionCallback = async (callbackData) => {
  const { transactionId, status, gatewayTransactionId, errorCode, errorMessage, response } = callbackData;

  const transaction = await paymentTransactionRepo.findById(transactionId);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (status === 'success') {
    return await handleSuccessfulPayment(transactionId, {
      transactionId: gatewayTransactionId,
      response
    });
  } else {
    return await handleFailedPayment(transactionId, {
      errorCode,
      errorMessage,
      response,
      retryable: true // Gateway'den gelen bilgiye göre ayarlanabilir
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDonation,
  getTransactionsByRecurringDonation,
  getTransactionsByGateway,
  getFailedTransactions,
  getPendingTransactions,
  markAsSuccess,
  markAsFailed,
  retryTransaction,
  getStatistics,
  getStatisticsByGateway,
  handleSuccessfulPayment,
  handleFailedPayment,
  processTransactionCallback
};
