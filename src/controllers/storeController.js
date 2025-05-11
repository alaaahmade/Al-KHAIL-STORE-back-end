const storeService = require("../services/storeService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /api/v1/stores:
 *   post:
 *     summary: Create a new store
 *     tags: [Stores]
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
 *       201:
 *         description: Store created successfully
 */
exports.createStore = catchAsync(async (req, res, next) => {
  const store = await storeService.createStore(req.body);
  res.status(201).json({
    status: "success",
    data: {
      store,
    },
  });
});

/**
 * @swagger
 * /api/v1/stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: List of stores
 */
exports.getAllStores = catchAsync(async (req, res, next) => {
  const stores = await storeService.getAllStores();
  res.status(200).json({
    status: "success",
    results: stores.length,
    data: {
      stores,
    },
  });
});

/**
 * @swagger
 * /api/v1/stores/{id}:
 *   get:
 *     summary: Get a store by ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store details
 *       404:
 *         description: Store not found
 */
exports.getStore = catchAsync(async (req, res, next) => {
  const store = await storeService.getStoreById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      store,
    },
  });
});

/**
 * @swagger
 * /api/v1/stores/{id}:
 *   patch:
 *     summary: Update a store
 *     tags: [Stores]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Store updated successfully
 *       404:
 *         description: Store not found
 */
exports.updateStore = catchAsync(async (req, res, next) => {
  const store = await storeService.updateStore(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: {
      store,
    },
  });
});

/**
 * @swagger
 * /api/v1/stores/{id}:
 *   delete:
 *     summary: Delete a store
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Store deleted successfully
 *       404:
 *         description: Store not found
 */
exports.deleteStore = catchAsync(async (req, res, next) => {
  await storeService.deleteStore(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/v1/stores/{id}/status:
 *   patch:
 *     summary: Update store status
 *     tags: [Stores]
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
 *         description: Store status updated successfully
 *       404:
 *         description: Store not found
 */
exports.updateStoreStatus = catchAsync(async (req, res, next) => {
  const store = await storeService.updateStoreStatus(
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    status: "success",
    data: {
      store,
    },
  });
});
