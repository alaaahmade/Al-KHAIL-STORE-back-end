import express from "express";
import commentController from "../controllers/commentController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to get comment owner
const getCommentOwnerId = async (req) => {
  const comment = await commentController.getComment(req);
  return comment.userId;
};

// Base routes

router.get("/store/:storeId", commentController.getReviewsWithStoreId);

router
  .route("/")
  .post(commentController.createComment)
  .get(commentController.getAllComments);
  

router.route('/latest').get(commentController.getLatest);

// Routes with ID
router
  .route("/:id")
  .get(commentController.getComment)
  .patch(protect, isOwnerOrAdmin(getCommentOwnerId), commentController.updateComment)
  .delete(protect, isOwnerOrAdmin(getCommentOwnerId), commentController.deleteComment);

// Special routes
router.get("/product/:productId", commentController.getReviewsByProduct);
router.get("/user/:userId", commentController.getReviewsByUser);
router.get(
  "/product/:productId/average-rating",
  commentController.getProductAverageRating
);

export default router;
