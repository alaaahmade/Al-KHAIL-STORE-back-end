import express from "express"
import categoryController from "../controllers/categoryController.js"
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 */
router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo('ADMIN'), categoryController.createCategory);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category data
 *       404:
 *         description: Category not found
 *   patch:
 *     summary: Update a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 */
router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(protect, restrictTo('ADMIN'), categoryController.updateCategory)
  .delete(protect, restrictTo('ADMIN'), categoryController.deleteCategory);

export default router;
