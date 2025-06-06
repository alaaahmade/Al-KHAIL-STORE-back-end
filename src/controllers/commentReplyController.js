import commentReplyService from "../services/commentReplyService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

/**
 * @swagger
 * /api/comment-replies:
 *   post:
 *     summary: Create a new comment reply
 *     tags: [Comment Replies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentReply'
 *     responses:
 *       201:
 *         description: Comment reply created successfully
 *       400:
 *         description: Invalid input
 */
/**
 * @swagger
 * /api/comment-replies:
 *   post:
 *     summary: Create a new comment reply
 *     tags: [Comment Replies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               commentId:
 *                 type: integer
 *               userId:
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
 *         description: Comment reply created successfully
 *       400:
 *         description: Invalid input
 */
const createCommentReply = catchAsync(async (req, res) => {
  const { content, commentId, userId, files } = req.body;
  const reply = await commentReplyService.createCommentReply({ content, commentId, userId, files });
  res.status(201).json({
    status: "success",
    data: reply,
  });
});

/**
 * @swagger
 * /api/comment-replies:
 *   get:
 *     summary: Get all comment replies
 *     tags: [Comment Replies]
 *     responses:
 *       200:
 *         description: List of comment replies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommentReply'
 */
const getAllCommentReplies = catchAsync(async (req, res) => {
  const replies = await commentReplyService.getAllCommentReplies();

  res.status(200).json({
    status: "success",
    results: Array.isArray(replies) ? replies.length : 0,
    data: replies || [],
  });
});

/**
 * @swagger
 * /api/comment-replies/{id}:
 *   get:
 *     summary: Get a comment reply by ID
 *     tags: [Comment Replies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment reply details
 *       404:
 *         description: Comment reply not found
 */
const getCommentReply = catchAsync(async (req, res) => {
  const reply = await commentReplyService.getCommentReply(req.params.id);
  res.status(200).json({
    status: "success",
    data: reply,
  });
});

/**
 * @swagger
 * /api/comment-replies/{id}:
 *   patch:
 *     summary: Update a comment reply
 *     tags: [Comment Replies]
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
 *             $ref: '#/components/schemas/CommentReply'
 *     responses:
 *       200:
 *         description: Comment reply updated successfully
 *       404:
 *         description: Comment reply not found
 */
const updateCommentReply = catchAsync(async (req, res) => {
  const reply = await commentReplyService.updateCommentReply(
    req.params.id,
    req.body
  );
  res.status(200).json({
    status: "success",
    data: reply,
  });
});

/**
 * @swagger
 * /api/comment-replies/{id}:
 *   delete:
 *     summary: Delete a comment reply
 *     tags: [Comment Replies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comment reply deleted successfully
 *       404:
 *         description: Comment reply not found
 */
const deleteCommentReply = catchAsync(async (req, res) => {
  await commentReplyService.deleteCommentReply(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/comment-replies/comment/{commentId}:
 *   get:
 *     summary: Get replies by comment ID
 *     tags: [Comment Replies]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of replies for the comment
 */
const getRepliesByComment = catchAsync(async (req, res) => {
  const replies = await commentReplyService.getRepliesByComment(
    req.params.commentId
  );
  res.status(200).json({
    status: "success",
    results: replies.length,
    data: replies,
  });
});

/**
 * @swagger
 * /api/comment-replies/user/{userId}:
 *   get:
 *     summary: Get replies by user ID
 *     tags: [Comment Replies]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of replies by the user
 */
const getRepliesByUser = catchAsync(async (req, res) => {
  const replies = await commentReplyService.getRepliesByUser(req.params.userId);
  res.status(200).json({
    status: "success",
    results: replies.length,
    data: replies,
  });
});


export default {
  createCommentReply,
  getAllCommentReplies,
  getCommentReply,
  updateCommentReply,
  deleteCommentReply,
  getRepliesByComment,
  getRepliesByUser
}