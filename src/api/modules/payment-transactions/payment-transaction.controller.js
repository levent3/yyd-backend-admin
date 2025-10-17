const paymentTransactionService = require('./payment-transaction.service');

// GET /api/payment-transactions - Get all transactions (admin)
const getAllTransactions = async (req, res, next) => {
  try {
    const result = await paymentTransactionService.getAllTransactions(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

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

// GET /api/payment-transactions/:id - Get transaction by ID
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await paymentTransactionService.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }

    res.json(transaction);
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

// POST /api/payment-transactions - Create transaction
const createTransaction = async (req, res, next) => {
  try {
    const transaction = await paymentTransactionService.createTransaction(req.body);
    res.status(201).json({
      message: 'İşlem kaydı oluşturuldu',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/payment-transactions/:id - Update transaction
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await paymentTransactionService.updateTransaction(id, req.body);
    res.json({
      message: 'İşlem güncellendi',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/payment-transactions/:id - Delete transaction
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    await paymentTransactionService.deleteTransaction(id);
    res.json({ message: 'İşlem silindi' });
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

module.exports = {
  getAllTransactions,
  getStatistics,
  getStatisticsByGateway,
  getFailedTransactions,
  getPendingTransactions,
  getTransactionById,
  getByDonation,
  getByRecurringDonation,
  getByGateway,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  markAsSuccess,
  markAsFailed,
  retryTransaction
};
