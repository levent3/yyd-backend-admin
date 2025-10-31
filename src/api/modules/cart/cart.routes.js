const express = require('express');
const cartController = require('./cart.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get cart (Public)
 *     description: Get cart items for current session
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session ID (also can be in cookie or header)
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID in header
 *     responses:
 *       200:
 *         description: Successfully retrieved cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalAmount:
 *                   type: number
 *                 itemCount:
 *                   type: integer
 *       400:
 *         description: Session ID required
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart (Public)
 *     description: Add a donation item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               currency:
 *                 type: string
 *                 default: TRY
 *                 example: TRY
 *               donationType:
 *                 type: string
 *                 enum: [one_time, monthly]
 *                 default: one_time
 *                 example: one_time
 *               repeatCount:
 *                 type: integer
 *                 default: 1
 *                 description: For repeated donations (2-18)
 *                 example: 1
 *               projectId:
 *                 type: integer
 *                 example: 5
 *               donorName:
 *                 type: string
 *                 example: Ahmet Yılmaz
 *               donorEmail:
 *                 type: string
 *                 example: ahmet@example.com
 *               donorPhone:
 *                 type: string
 *                 example: +90 555 123 4567
 *               sessionId:
 *                 type: string
 *                 description: Optional - will be generated if not provided
 *     responses:
 *       201:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   type: object
 *                 sessionId:
 *                   type: string
 */
router.post('/', cartController.addToCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   get:
 *     summary: Get cart item by ID (Public)
 *     description: Get details of a specific cart item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved cart item
 *       404:
 *         description: Cart item not found
 */
router.get('/:id', cartController.getCartItemById);

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Update cart item (Public)
 *     description: Update cart item amount or details
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 150
 *               donationType:
 *                 type: string
 *                 enum: [one_time, monthly]
 *               repeatCount:
 *                 type: integer
 *               donorName:
 *                 type: string
 *               donorEmail:
 *                 type: string
 *               donorPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cart item updated
 */
router.put('/:id', cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Remove item from cart (Public)
 *     description: Remove a specific item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete('/:id', cartController.removeFromCart);

/**
 * @swagger
 * /api/cart/session/{sessionId}:
 *   delete:
 *     summary: Clear cart (Public)
 *     description: Remove all items from cart for a session
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/session/:sessionId', cartController.clearCart);

/**
 * @swagger
 * /api/cart/total/{sessionId}:
 *   get:
 *     summary: Get cart total (Public)
 *     description: Get total amount and item count for a cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved cart total
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAmount:
 *                   type: number
 *                 itemCount:
 *                   type: integer
 */
router.get('/total/:sessionId', cartController.getCartTotal);

/**
 * @swagger
 * /api/cart/validate/{sessionId}:
 *   post:
 *     summary: Validate cart (Public)
 *     description: Validate cart before proceeding to checkout
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart is valid
 *       400:
 *         description: Cart validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post('/validate/:sessionId', cartController.validateCart);

/**
 * @swagger
 * /api/cart/checkout:
 *   post:
 *     summary: Checkout cart (Public)
 *     description: Process cart checkout - validate, create donations, and initiate payment
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [donorName, donorEmail, donorPhone]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID (also can be in cookie or header)
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, bank_transfer, paypal]
 *                 default: credit_card
 *                 example: credit_card
 *               paymentGateway:
 *                 type: string
 *                 enum: [iyzico, paytr]
 *                 default: iyzico
 *                 example: iyzico
 *               donorName:
 *                 type: string
 *                 example: Ahmet Yılmaz
 *               donorEmail:
 *                 type: string
 *                 format: email
 *                 example: ahmet@example.com
 *               donorPhone:
 *                 type: string
 *                 example: +90 555 123 4567
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *               threeDSecure:
 *                 type: boolean
 *                 default: false
 *               conversationId:
 *                 type: string
 *                 description: Optional conversation ID for payment gateway
 *     responses:
 *       200:
 *         description: Checkout successful, payment initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     donations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     paymentResult:
 *                       type: object
 *       400:
 *         description: Checkout failed - validation error
 */
router.post('/checkout', cartController.checkoutCart);

/**
 * @swagger
 * /api/cart/complete-checkout:
 *   post:
 *     summary: Complete checkout (Payment Callback)
 *     description: Called by payment gateway after successful payment to clear cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *               paymentData:
 *                 type: object
 *                 description: Payment gateway response data
 *     responses:
 *       200:
 *         description: Checkout completed, cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Session ID required
 */
router.post('/complete-checkout', cartController.completeCheckout);

// ========== PROTECTED ROUTES (Admin) ==========

/**
 * @swagger
 * /api/cart/cleanup:
 *   post:
 *     summary: Cleanup expired carts (Admin/Cron)
 *     description: Remove all expired cart items from database
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Expired carts cleaned up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 */
router.post('/cleanup', authMiddleware, checkPermission('donations', 'delete'), cartController.cleanupExpiredCarts);

module.exports = router;
