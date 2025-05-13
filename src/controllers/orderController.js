import orderService from "../services/orderService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderNumber
 *               - orderStatus
 *               - orderDate
 *               - cartId
 *               - paymentInfo
 *               - country
 *               - city
 *               - streetAddress
 *               - userId
 *               - phoneNumber
 *               - email
 *             properties:
 *               orderNumber:
 *                 type: string
 *               orderStatus:
 *                 type: string
 *               orderDate:
 *                 type: string
 *                 format: date
 *               cartId:
 *                 type: integer
 *               paymentInfo:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               userId:
 *                 type: integer
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
const createOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.createOrder(req.body);
  
  // Verify order was created properly
  if (!order || !order.id) {
    return next(new AppError("Order could not be created", 400));
  }
  
  res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 */
const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getAllOrders();

  if (!Array.isArray(orders)) {
    return next(new AppError("Orders data is not available", 500));
  }

  if (!orders || orders.length === 0) {
    return res.status(200).json({ 
      status: "success", 
      message: "No orders found", 
      data: [] 
    });
  }

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
const getOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id);
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/user/{userId}:
 *   get:
 *     summary: Get orders by user ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's orders
 */
const getOrdersByUser = catchAsync(async (req, res, next) => {
  const orders = await orderService.getOrdersByUser(req.params.userId);

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/status/{status}:
 *   get:
 *     summary: Get orders by status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Order status (e.g., PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
 *     responses:
 *       200:
 *         description: List of orders with specified status
 */
const getOrdersByStatus = catchAsync(async (req, res, next) => {
  const status = req.params.status;
  
  if (!status) {
    return next(new AppError('Status parameter is required', 400));
  }
  
  const orders = await orderService.getOrdersByStatus(status);
  
  if (!orders || !Array.isArray(orders)) {
    return next(new AppError('Failed to retrieve orders by status', 500));
  }
  
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   patch:
 *     summary: Update an order
 *     tags: [Orders]
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
 *               orderStatus:
 *                 type: string
 *               paymentInfo:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
const updateOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  
  if (!order) {
    return next(new AppError('Failed to update order', 400));
  }
  
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
const deleteOrder = catchAsync(async (req, res, next) => {
  try {
    const result = await orderService.deleteOrder(req.params.id);
    
    // If deletion is successful but no content should be returned
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 */
const updateOrderStatus = catchAsync(async (req, res, next) => {
  if (!req.body.status) {
    return next(new AppError('Status field is required', 400));
  }
  
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status
  );
  
  if (!order) {
    return next(new AppError('Failed to update order status', 400));
  }
  
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

const getRecentOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getRecentOrders();
  
  if (!orders || !Array.isArray(orders)) {
    return next(new AppError('Failed to retrieve recent orders', 500));
  }
  
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

export default {
  createOrder,
  getAllOrders,
  getOrder,
  getOrdersByUser,
  getOrdersByStatus,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getRecentOrders
};