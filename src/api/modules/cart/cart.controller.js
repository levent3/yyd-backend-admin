const cartService = require('./cart.service');

// GET /api/cart - Get cart by session ID
const getCart = async (req, res, next) => {
  try {
    // Session ID can come from cookie, header, or query
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] || req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID gerekli' });
    }

    const cart = await cartService.getCart(sessionId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart - Add item to cart
const addToCart = async (req, res, next) => {
  try {
    // Get or create session ID
    let sessionId = req.cookies.sessionId || req.headers['x-session-id'] || req.body.sessionId;

    if (!sessionId) {
      sessionId = cartService.getOrCreateSessionId();
      // Set session ID in cookie
      res.cookie('sessionId', sessionId, {
        maxAge: 30 * 60 * 1000, // 30 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    const item = await cartService.addToCart(sessionId, req.body);

    res.status(201).json({
      message: 'Ürün sepete eklendi',
      item,
      sessionId
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:id - Update cart item
const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await cartService.updateCartItem(id, req.body);

    res.json({
      message: 'Sepet öğesi güncellendi',
      item
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:id - Remove item from cart
const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    await cartService.removeFromCart(id);

    res.json({ message: 'Ürün sepetten kaldırıldı' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/session/:sessionId - Clear cart
const clearCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await cartService.clearCart(sessionId);

    res.json({ message: 'Sepet temizlendi' });
  } catch (error) {
    next(error);
  }
};

// GET /api/cart/:id - Get cart item by ID
const getCartItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await cartService.getCartItemById(id);

    if (!item) {
      return res.status(404).json({ message: 'Sepet öğesi bulunamadı' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

// GET /api/cart/total/:sessionId - Get cart total
const getCartTotal = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const total = await cartService.getCartTotal(sessionId);

    res.json(total);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/validate/:sessionId - Validate cart before checkout
const validateCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const validation = await cartService.validateCart(sessionId);

    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    res.json({
      valid: true,
      message: 'Sepet geçerli',
      items: validation.items
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/cleanup - Cleanup expired carts (Admin/Cron)
const cleanupExpiredCarts = async (req, res, next) => {
  try {
    const result = await cartService.cleanupExpiredCarts();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/checkout - Checkout cart (validate, create donations, initiate payment)
const checkoutCart = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'] || req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID gerekli' });
    }

    const paymentInfo = {
      paymentMethod: req.body.paymentMethod || 'credit_card',
      paymentGateway: req.body.paymentGateway || 'iyzico',
      donorName: req.body.donorName,
      donorEmail: req.body.donorEmail,
      donorPhone: req.body.donorPhone,
      isAnonymous: req.body.isAnonymous || false,
      threeDSecure: req.body.threeDSecure || false,
      conversationId: req.body.conversationId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    const result = await cartService.checkoutCart(sessionId, paymentInfo);

    res.json({
      success: true,
      message: 'Checkout başarılı',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/complete-checkout - Complete checkout after payment (callback endpoint)
const completeCheckout = async (req, res, next) => {
  try {
    const { sessionId, paymentData } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID gerekli' });
    }

    const result = await cartService.completeCheckout(sessionId, paymentData);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemById,
  getCartTotal,
  validateCart,
  cleanupExpiredCarts,
  checkoutCart,
  completeCheckout
};
