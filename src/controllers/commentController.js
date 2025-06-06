import commentService from "../services/commentService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { AppDataSource } from '../config/database.js';
import { Comment } from '../entities/Comment.js';

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
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                     text:
 *                       type: string
 *                 description: "Array of file objects (url, type, text?)"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid input
 */
const createComment = catchAsync(async (req, res) => {
  const { content, rating, userId, productId, files } = req.body;
  const comment = await commentService.createComment({ content, rating, userId, productId, files });
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
const getAllComments = catchAsync(async (req, res) => {
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
const getComment = catchAsync(async (req, res) => {
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
const updateComment = catchAsync(async (req, res) => {
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
const deleteComment = catchAsync(async (req, res) => {
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
const getCommentsByProduct = catchAsync(async (req, res) => {
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
const getCommentsByUser = catchAsync(async (req, res) => {
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
const getProductAverageRating = catchAsync(async (req, res) => {
  const averageRating = await commentService.getProductAverageRating(
    req.params.productId
  );
  res.status(200).json({
    status: "success",
    data: { averageRating },
  });
});

const getLatest = catchAsync(async (req, res, next) => {
  const commentRepo = AppDataSource.getRepository(Comment);
  const results = await commentRepo.find({
    relations: ["user", "product", 'commentReplies', 'commentReplies.user'],
    take: 3,
  });
  res.status(200).json({
    status: 'success',
    data: [...results]
  });
});

const getReviewsByProduct = catchAsync(async (req, res) => {
  const comments = await commentService.getCommentsByProduct(req.params.productId);
  res.status(200).json({
    status: 'success',
    data: comments
  });
});

const getReviewsByUser = catchAsync(async (req, res) => {
  const comments = await commentService.getCommentsByUser(req.params.userId);
  res.status(200).json({
    status: 'success',
    data: comments
  });
});

const getReviewsWithStoreId = catchAsync(async (req, res) => {  
  const comments = await commentService.getReviewsWithStoreId(req.params.storeId);
  res.status(200).json({
    status: 'success',
    data: comments
  });
});

export default {
  createComment,
  getAllComments,
  getComment,
  updateComment,
  deleteComment,
  getCommentsByProduct,
  getCommentsByUser,
  getProductAverageRating,
  getReviewsByProduct,
  getReviewsByUser,
  getProductAverageRating,
  getLatest,
  getReviewsWithStoreId
}