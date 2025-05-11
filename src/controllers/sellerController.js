const sellerService = require("../services/sellerService");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * @swagger
 * /api/sellers:
 *   post:
 *     summary: Create a new seller
 *     tags: [Sellers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - storeId
 *             properties:
 *               userId:
 *                 type: integer
 *               storeId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Seller created successfully
 */
exports.createSeller = catchAsync(async (req, res, next) => {
  const seller = await sellerService.createSeller(req.body);
  res.status(201).json({
    status: "success",
    data: seller,
  });
});

/**
 * @swagger
 * /api/sellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Sellers]
 *     responses:
 *       200:
 *         description: List of all sellers
 */
exports.getAllSellers = catchAsync(async (req, res, next) => {
  const sellers = await sellerService.getAllSellers();
  res.status(200).json({
    status: "success",
    results: sellers ? sellers.length : 0,
    data: sellers || [],
  });
});

/**
 * @swagger
 * /api/sellers/{id}:
 *   get:
 *     summary: Get a seller by ID
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seller details
 *       404:
 *         description: Seller not found
 */
exports.getSeller = catchAsync(async (req, res, next) => {
  const seller = await sellerService.getSeller(req.params.id);
  res.status(200).json({
    status: "success",
    data: seller,
  });
});

/**
 * @swagger
 * /api/sellers/{id}:
 *   patch:
 *     summary: Update a seller
 *     tags: [Sellers]
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
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Seller updated successfully
 *       404:
 *         description: Seller not found
 */
exports.updateSeller = catchAsync(async (req, res, next) => {
  const seller = await sellerService.updateSeller(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: seller,
  });
});

/**
 * @swagger
 * /api/sellers/{id}:
 *   delete:
 *     summary: Delete a seller
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Seller deleted successfully
 *       404:
 *         description: Seller not found
 */
exports.deleteSeller = catchAsync(async (req, res, next) => {
  await sellerService.deleteSeller(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/sellers/user/{userId}:
 *   get:
 *     summary: Get seller by user ID
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seller details
 *       404:
 *         description: Seller not found
 */
exports.getSellerByUser = catchAsync(async (req, res, next) => {
  const seller = await sellerService.getSellerByUser(req.params.userId);
  res.status(200).json({
    status: "success",
    data: seller,
  });
});

/**
 * @swagger
 * /api/sellers/store/{storeId}:
 *   get:
 *     summary: Get sellers by store ID
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of sellers for the store
 */
exports.getSellersByStore = catchAsync(async (req, res, next) => {
  const sellers = await sellerService.getSellersByStore(req.params.storeId);
  res.status(200).json({
    status: "success",
    results: sellers.length,
    data: sellers,
  });
});

/**
 * @swagger
 * /api/sellers/{id}/status:
 *   patch:
 *     summary: Update seller status
 *     tags: [Sellers]
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
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Seller not found
 */
exports.updateStatus = catchAsync(async (req, res, next) => {
  const seller = await sellerService.updateStatus(
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    status: "success",
    data: seller,
  });
});
