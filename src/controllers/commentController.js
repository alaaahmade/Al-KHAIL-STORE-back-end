const commentService = require("../services/commentService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid input
 */
exports.createComment = catchAsync(async (req, res) => {
  const comment = await commentService.createComment(req.body);
  res.status(201).json({
    status: "success",
    data: comment,
  });
});

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
exports.getAllComments = catchAsync(async (req, res) => {
  const comments = await commentService.getAllComments();
  const safeComments = Array.isArray(comments) ? comments : [];
  res.status(200).json({
    status: "success",
    results: safeComments.length,
    data: safeComments,
  });
});

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment details
 *       404:
 *         description: Comment not found
 */
exports.getComment = catchAsync(async (req, res) => {
  const comment = await commentService.getComment(req.params.id);
  res.status(200).json({
    status: "success",
    data: comment,
  });
});

/**
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
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
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */
exports.updateComment = catchAsync(async (req, res) => {
  const comment = await commentService.updateComment(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: comment,
  });
});

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
exports.deleteComment = catchAsync(async (req, res) => {
  await commentService.deleteComment(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/comments/product/{productId}:
 *   get:
 *     summary: Get comments by product ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments for the product
 */
exports.getCommentsByProduct = catchAsync(async (req, res) => {
  const comments = await commentService.getCommentsByProduct(
    req.params.productId
  );
  const safeComments = Array.isArray(comments) ? comments : [];
  res.status(200).json({
    status: "success",
    results: safeComments.length,
    data: safeComments,
  });
});

/**
 * @swagger
 * /api/comments/user/{userId}:
 *   get:
 *     summary: Get comments by user ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments by the user
 */
exports.getCommentsByUser = catchAsync(async (req, res) => {
  const comments = await commentService.getCommentsByUser(req.params.userId);
  const safeComments = Array.isArray(comments) ? comments : [];
  res.status(200).json({
    status: "success",
    results: safeComments.length,
    data: safeComments,
  });
});

/**
 * @swagger
 * /api/comments/product/{productId}/average-rating:
 *   get:
 *     summary: Get average rating for a product
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Average rating for the product
 */
exports.getProductAverageRating = catchAsync(async (req, res) => {
  const averageRating = await commentService.getProductAverageRating(
    req.params.productId
  );
  res.status(200).json({
    status: "success",
    data: { averageRating },
  });
});
