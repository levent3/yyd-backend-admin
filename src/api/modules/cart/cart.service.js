const cartRepo = require('./cart.repository');
const { v4: uuidv4 } = require('uuid');

// Lazy loading to avoid circular dependencies
let donationService;
let paymentTransactionService;

const getDonationService = () => {
  if (!donationService) {
    donationService = require('../donations/donation.service');
  }
  return donationService;
};

const getPaymentTransactionService = () => {
  if (!paymentTransactionService) {
    paymentTransactionService = require('../payment-transactions/payment-transaction.service');
  }
  return paymentTransactionService;
};

// Get or create session ID
const getOrCreateSessionId = (sessionId) => {
  return sessionId || uuidv4();
};

// Get cart by session ID
const getCart = async (sessionId) => {
  const items = await cartRepo.findBySessionId(sessionId);
  const total = await cartRepo.getCartTotal(sessionId);

  return {
    sessionId,
    items,
    totalAmount: total.totalAmount,
    itemCount: total.itemCount
  };
};

// Add item to cart
const addToCart = async (sessionId, data) => {
  // Check if item already exists for this session and campaign
  const existingItem = await cartRepo.findBySessionAndCampaign(sessionId, data.projectId);

  if (existingItem) {
    // Update existing item (increase amount)
    return cartRepo.update(existingItem.id, {
      amount: existingItem.amount + parseFloat(data.amount)
    });
  }

  // Create new cart item
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expires in 30 minutes

  const mappedData = {
    sessionId,
    amount: parseFloat(data.amount),
    currency: data.currency || 'TRY',
    donationType: data.donationType || 'one_time',
    repeatCount: data.repeatCount || 1,
    projectId: data.projectId || null,
    donorName: data.donorName || null,
    donorEmail: data.donorEmail || null,
    donorPhone: data.donorPhone || null,
    expiresAt
  };

  return cartRepo.create(mappedData);
};

// Update cart item
const updateCartItem = (id, data) => {
  const mappedData = {};

  if (data.amount !== undefined) mappedData.amount = parseFloat(data.amount);
  if (data.currency !== undefined) mappedData.currency = data.currency;
  if (data.donationType !== undefined) mappedData.donationType = data.donationType;
  if (data.repeatCount !== undefined) mappedData.repeatCount = data.repeatCount;
  if (data.donorName !== undefined) mappedData.donorName = data.donorName;
  if (data.donorEmail !== undefined) mappedData.donorEmail = data.donorEmail;
  if (data.donorPhone !== undefined) mappedData.donorPhone = data.donorPhone;

  // Extend expiry time when updating
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);
  mappedData.expiresAt = expiresAt;

  return cartRepo.update(id, mappedData);
};

// Remove item from cart
const removeFromCart = (id) => {
  return cartRepo.deleteById(id);
};

// Clear cart (remove all items for session)
const clearCart = (sessionId) => {
  return cartRepo.deleteBySessionId(sessionId);
};

// Get cart item by ID
const getCartItemById = (id) => {
  return cartRepo.findById(id);
};

// Clean up expired cart items (should be run periodically)
const cleanupExpiredCarts = async () => {
  const result = await cartRepo.deleteExpired();
  return {
    message: 'Expired cart items cleaned up',
    deletedCount: result.count
  };
};

// Get cart total
const getCartTotal = (sessionId) => {
  return cartRepo.getCartTotal(sessionId);
};

// Validate cart before checkout
const validateCart = async (sessionId) => {
  const items = await cartRepo.findBySessionId(sessionId);
  const errors = [];

  if (items.length === 0) {
    errors.push('Sepet boş');
    return { valid: false, errors };
  }

  // Check for expired items
  const now = new Date();
  const expiredItems = items.filter(item => new Date(item.expiresAt) < now);

  if (expiredItems.length > 0) {
    errors.push('Sepetinizde süresi dolmuş öğeler var');
  }

  // Check for invalid amounts
  const invalidAmounts = items.filter(item => item.amount <= 0);

  if (invalidAmounts.length > 0) {
    errors.push('Sepetinizde geçersiz tutarlar var');
  }

  return {
    valid: errors.length === 0,
    errors,
    items
  };
};

// Create donations from cart items
const createDonationsFromCart = async (sessionId, donorInfo = {}) => {
  const items = await cartRepo.findBySessionId(sessionId);
  const donationSvc = getDonationService();
  const createdDonations = [];

  for (const item of items) {
    const donationData = {
      amount: item.amount,
      currency: item.currency,
      paymentMethod: donorInfo.paymentMethod || 'credit_card',
      paymentStatus: 'pending',
      paymentGateway: donorInfo.paymentGateway || 'iyzico',
      donorName: item.donorName || donorInfo.donorName,
      donorEmail: item.donorEmail || donorInfo.donorEmail,
      donorPhone: item.donorPhone || donorInfo.donorPhone,
      projectId: item.projectId,
      message: item.message || null,
      isAnonymous: donorInfo.isAnonymous || false,
      installment: item.installment || 1,
      repeatCount: item.repeatCount || 1,
      ipAddress: donorInfo.ipAddress,
      userAgent: donorInfo.userAgent
    };

    const donation = await donationSvc.createDonationWithTransaction(donationData);
    createdDonations.push(donation);
  }

  return createdDonations;
};

// Initiate payment for cart (creates transaction records)
const initiatePaymentForCart = async (donations, paymentInfo = {}) => {
  const paymentTransactionSvc = getPaymentTransactionService();
  const transactions = [];

  // Calculate total amount
  const totalAmount = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);

  // Create a payment transaction for the entire cart
  const transactionData = {
    amount: totalAmount,
    currency: donations[0]?.currency || 'TRY',
    status: 'pending',
    paymentGateway: paymentInfo.paymentGateway || 'iyzico',
    conversationId: paymentInfo.conversationId || `CART-${Date.now()}`,
    ipAddress: paymentInfo.ipAddress,
    userAgent: paymentInfo.userAgent,
    threeDSecure: paymentInfo.threeDSecure || false,
    // Link to the first donation (for tracking purposes)
    donationId: donations[0]?.id || null
  };

  const transaction = await paymentTransactionSvc.createTransaction(transactionData);
  transactions.push(transaction);

  return {
    success: true,
    transactions,
    totalAmount,
    conversationId: transactionData.conversationId,
    message: 'Ödeme işlemi başlatıldı'
  };
};

// Checkout cart (validate, create donations, initiate payment)
const checkoutCart = async (sessionId, paymentInfo = {}) => {
  // 1. Validate cart
  const validation = await validateCart(sessionId);
  if (!validation.valid) {
    throw new Error(`Sepet doğrulama başarısız: ${validation.errors.join(', ')}`);
  }

  // 2. Create donations from cart items
  const donations = await createDonationsFromCart(sessionId, paymentInfo);

  // 3. Initiate payment
  const paymentResult = await initiatePaymentForCart(donations, paymentInfo);

  // 4. Don't clear cart yet - wait for payment confirmation
  // Cart will be cleared when payment callback confirms success

  return {
    success: true,
    donations,
    paymentResult,
    message: 'Checkout işlemi başarıyla tamamlandı. Ödeme onayı bekleniyor.'
  };
};

// Complete checkout after successful payment (called from payment callback)
const completeCheckout = async (sessionId, paymentData = {}) => {
  // Clear cart after successful payment
  await clearCart(sessionId);

  return {
    success: true,
    message: 'Ödeme başarılı, sepet temizlendi'
  };
};

module.exports = {
  getOrCreateSessionId,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemById,
  cleanupExpiredCarts,
  getCartTotal,
  validateCart,
  createDonationsFromCart,
  initiatePaymentForCart,
  checkoutCart,
  completeCheckout
};
