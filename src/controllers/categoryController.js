const categoryService = require("../services/categoryService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - categoryImage
 *               - status
 *             properties:
 *               categoryName:
 *                 type: string
 *               categoryImage:
 *                 type: object
 *               categoryTopic:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 */
exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({
    status: "success",
    data: {
      category,
    },
  });
});

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
exports.getAllCategories = catchAsync(async (req, res, next) => {
  console.log("Getting all categories...");
  const categories = await categoryService.getAllCategories();
  console.log("Categories returned:", categories);
  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags: [Categories]
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
 *               categoryName:
 *                 type: string
 *               categoryImage:
 *                 type: object
 *               categoryTopic:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }
  const updatedCategory = await categoryService.updateCategory(
    req.params.id,
    req.body
  );
  res.status(200).json({
    status: "success",
    data: {
      category: updatedCategory,
    },
  });
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }
  await categoryService.deleteCategory(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});
