/**
 * Payment Transaction Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metodlar: getStatistics, getStatisticsByGateway, getFailedTransactions, getPendingTransactions,
 *                getByDonation, getByRecurringDonation, getByGateway, markAsSuccess, markAsFailed, retryTransaction
 */

const paymentTransactionService = require('./payment-transaction.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const paymentTransactionServiceAdapter = {
  getAll: (query) => paymentTransactionService.getAllTransactions(query),
  getById: (id) => paymentTransactionService.getTransactionById(id),
  create: (data) => paymentTransactionService.createTransaction(data),
  update: (id, data) => paymentTransactionService.updateTransaction(id, data),
  delete: (id) => paymentTransactionService.deleteTransaction(id),
};

const crudController = createCRUDController(paymentTransactionServiceAdapter, {
  entityName: 'İşlem',
  entityNamePlural: 'İşlemler',
});

// ========== ÖZEL METODLAR ==========

// GET /api/payment-transactions/statistics - Get statistics
const getStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await paymentTransactionService.getStatistics(startDate, endDate);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// GET /api/payment-transactions/statistics/by-gateway - Get statistics by gateway
const getStatisticsByGateway = async (req, res, next) => {
  try {
    const stats = await paymentTransactionService.getStatisticsByGateway();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// GET /api/payment-transactions/failed - Get failed transactions
const getFailedTransactions = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const transactions = await paymentTransactionService.getFailedTransactions(limit ? parseInt(limit) : 50);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// GET /api/payment-transactions/pending - Get pending transactions
const getPendingTransactions = async (req, res, next) => {
  try {
    const transactions = await paymentTransactionService.getPendingTransactions();
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// GET /api/payment-transactions/donation/:donationId - Get by donation
const getByDonation = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const transactions = await paymentTransactionService.getTransactionsByDonation(donationId);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// GET /api/payment-transactions/recurring-donation/:recurringDonationId - Get by recurring donation
const getByRecurringDonation = async (req, res, next) => {
  try {
    const recurringDonationId = parseInt(req.params.recurringDonationId);
    const transactions = await paymentTransactionService.getTransactionsByRecurringDonation(recurringDonationId);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// GET /api/payment-transactions/gateway/:gateway - Get by gateway
const getByGateway = async (req, res, next) => {
  try {
    const { gateway } = req.params;
    const transactions = await paymentTransactionService.getTransactionsByGateway(gateway);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// POST /api/payment-transactions/:id/mark-success - Mark as success
const markAsSuccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await paymentTransactionService.markAsSuccess(id, req.body);
    res.json({
      message: 'İşlem başarılı olarak işaretlendi',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payment-transactions/:id/mark-failed - Mark as failed
const markAsFailed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await paymentTransactionService.markAsFailed(id, req.body);
    res.json({
      message: 'İşlem başarısız olarak işaretlendi',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payment-transactions/:id/retry - Retry transaction
const retryTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newTransaction = await paymentTransactionService.retryTransaction(id);
    res.json({
      message: 'İşlem yeniden deneniyor',
      transaction: newTransaction
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllTransactions: crudController.getAll,
  getTransactionById: crudController.getById,
  createTransaction: crudController.create,
  updateTransaction: crudController.update,
  deleteTransaction: crudController.delete,

  // Özel metodlar
  getStatistics,
  getStatisticsByGateway,
  getFailedTransactions,
  getPendingTransactions,
  getByDonation,
  getByRecurringDonation,
  getByGateway,
  markAsSuccess,
  markAsFailed,
  retryTransaction,
};
