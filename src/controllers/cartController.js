import { AppDataSource } from '../config/database.js';
import { Order } from '../entities/Order.js';
import { User } from '../entities/User.js';
import * as cartService from "../services/cartService.js";
import catchAsync from "../utils/catchAsync.js";

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
const createCart = catchAsync(async (req, res) => {
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
const getAllCarts = catchAsync(async (req, res) => {
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
const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(
    req.params.id,
    req.user.id,
    req.user.role
  );
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
const updateCart = catchAsync(async (req, res) => {
  const cart = await cartService.updateCart(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  );
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
const deleteCart = catchAsync(async (req, res) => {
  await cartService.deleteCart(
    req.params.id,
    req.user.id,
    req.user.role
  );
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
const getCartItems = catchAsync(async (req, res) => {
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
const addCartItem = catchAsync(async (req, res) => {
  const item = await cartService.addCartItem(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  );
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
const updateCartItem = catchAsync(async (req, res) => {
  const item = await cartService.updateCartItem(
    req.params.itemId,
    req.user.id,
    req.user.role,
    req.body
  );
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
const removeCartItem = catchAsync(async (req, res) => {
  await cartService.removeCartItem(
    req.params.itemId,
    req.user.id,
    req.user.role
  );
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
const getUserCart = catchAsync(async (req, res) => {
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
const checkoutCart = catchAsync(async (req, res) => {
  const {order, sessionId, stripeSessionId} = await cartService.checkoutCart(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body // orderData
  );



  res.status(200).json({
    status: "success",
    data: {sessionId, stripeSessionId, order},
  });
});

export const emptyCartController = async(req, res) => {
  
  return await cartService.emptyCart(req);
}

export default{
  createCart,
  getAllCarts,
  getCart,
  updateCart,
  deleteCart,
  getCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  getUserCart,
  checkoutCart,
}