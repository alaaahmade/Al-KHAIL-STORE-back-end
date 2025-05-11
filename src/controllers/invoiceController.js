const invoiceService = require("../services/invoiceService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartId
 *               - sellerId
 *               - paymentMethod
 *             properties:
 *               cartId:
 *                 type: integer
 *               sellerId:
 *                 type: integer
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
exports.createInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(201).json({
    status: "success",
    data: invoice,
  });
});

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: List of all invoices
 */
exports.getAllInvoices = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getAllInvoices();

  if (!Array.isArray(invoices)) {
    return next(new AppError("Invoices data is not available", 500));
  }

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get an invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 */
exports.getInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: invoice,
  });
});

/**
 * @swagger
 * /api/invoices/user/{userId}:
 *   get:
 *     summary: Get invoices by user ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's invoices
 */
exports.getInvoicesByUser = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getInvoicesByUser(req.params.userId);
  if (!Array.isArray(invoices)) {
    return next(new AppError("Invoices data is not available", 500));
  }

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

/**
 * @swagger
 * /api/invoices/seller/{sellerId}:
 *   get:
 *     summary: Get invoices by seller ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of seller's invoices
 */
exports.getInvoicesBySeller = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getInvoicesBySeller(
    req.params.sellerId
  );
  if (!Array.isArray(invoices)) {
    return next(new AppError("Invoices data is not available", 500));
  }

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

/**
 * @swagger
 * /api/invoices/cart/{cartId}:
 *   get:
 *     summary: Get invoice by cart ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 */
exports.getInvoiceByCart = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.getInvoiceByCart(req.params.cartId);
  if (!invoice) {
    return next(new AppError("No invoice found with that cart ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: invoice,
  });
});

/**
 * @swagger
 * /api/invoices/{id}:
 *   patch:
 *     summary: Update an invoice
 *     tags: [Invoices]
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
 *               paymentMethod:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 */
exports.updateInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: invoice,
  });
});

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 */
exports.deleteInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.deleteInvoice(req.params.id);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/invoices/order/{orderId}:
 *   get:
 *     summary: Get invoices by order ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of order's invoices
 */
exports.getInvoicesByOrder = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getInvoicesByOrder(req.params.orderId);
  if (!Array.isArray(invoices)) {
    return next(new AppError("Invoices data is not available", 500));
  }

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

/**
 * @swagger
 * /api/invoices/{id}/payment-status:
 *   patch:
 *     summary: Update invoice payment status
 *     tags: [Invoices]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       404:
 *         description: Invoice not found
 */
exports.updateInvoicePaymentStatus = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.updateInvoicePaymentStatus(
    req.params.id,
    req.body.status
  );
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: invoice,
  });
});
