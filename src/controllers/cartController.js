const cartService = require("../services/cartService");
const catchAsync = require("../utils/catchAsync");

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Create a new cart
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Cart created successfully
 */
exports.createCart = catchAsync(async (req, res) => {
  const cart = await cartService.createCart(req.body);
  res.status(201).json({
    status: "success",
    data: cart,
  });
});

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: Get all carts
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: List of all carts
 */
exports.getAllCarts = catchAsync(async (req, res) => {
  const carts = await cartService.getAllCarts();
  res.status(200).json({
    status: "success",
    data: carts,
  });
});

/**
 * @swagger
 * /api/carts/{id}:
 *   get:
 *     summary: Get a cart by ID
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cart details
 *       404:
 *         description: Cart not found
 */
exports.getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.params.id);
  res.status(200).json({
    status: "success",
    data: cart,
  });
});

/**
 * @swagger
 * /api/carts/{id}:
 *   patch:
 *     summary: Update a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               totalPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       404:
 *         description: Cart not found
 */
exports.updateCart = catchAsync(async (req, res) => {
  const cart = await cartService.updateCart(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: cart,
  });
});

/**
 * @swagger
 * /api/carts/{id}:
 *   delete:
 *     summary: Delete a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cart deleted successfully
 *       404:
 *         description: Cart not found
 */
exports.deleteCart = catchAsync(async (req, res) => {
  await cartService.deleteCart(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/carts/{id}/items:
 *   get:
 *     summary: Get all items in a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of cart items
 */
exports.getCartItems = catchAsync(async (req, res) => {
  const items = await cartService.getCartItems(req.params.id);
  res.status(200).json({
    status: "success",
    data: items,
  });
});

/**
 * @swagger
 * /api/carts/{id}/items:
 *   post:
 *     summary: Add an item to cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 */
exports.addCartItem = catchAsync(async (req, res) => {
  const item = await cartService.addCartItem(req.params.id, req.body);
  res.status(201).json({
    status: "success",
    data: item,
  });
});

/**
 * @swagger
 * /api/carts/{id}/items/{itemId}:
 *   patch:
 *     summary: Update a cart item
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 */
exports.updateCartItem = catchAsync(async (req, res) => {
  const item = await cartService.updateCartItem(req.params.itemId, req.body);
  res.status(200).json({
    status: "success",
    data: item,
  });
});

/**
 * @swagger
 * /api/carts/{id}/items/{itemId}:
 *   delete:
 *     summary: Remove an item from cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Item removed from cart successfully
 */
exports.removeCartItem = catchAsync(async (req, res) => {
  await cartService.removeCartItem(req.params.itemId);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/carts/user/{userId}:
 *   get:
 *     summary: Get user's cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's cart details
 */
exports.getUserCart = catchAsync(async (req, res) => {
  const cart = await cartService.getUserCart(req.params.userId);
  res.status(200).json({
    status: "success",
    data: cart,
  });
});

/**
 * @swagger
 * /api/carts/{id}/checkout:
 *   post:
 *     summary: Checkout cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cart checked out successfully
 */
exports.checkoutCart = catchAsync(async (req, res) => {
  const order = await cartService.checkoutCart(req.params.id);
  res.status(200).json({
    status: "success",
    data: order,
  });
});
