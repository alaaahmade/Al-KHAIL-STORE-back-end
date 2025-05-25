import express from "express";
import reviewController from "../controllers/reviewController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to get review owner
const getReviewOwnerId = async (req) => {
  const review = await reviewController.getReview(req);
  return review.userId;
};

// Base routes
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

// Routes with ID

router.route('/latest').get(reviewController.getLatest);

// router
//   .route("/:id")
//   .get(reviewController.getReview)
//   .patch(protect, isOwnerOrAdmin(getReviewOwnerId), reviewController.updateReview)
//   .delete(protect, isOwnerOrAdmin(getReviewOwnerId), reviewController.deleteReview);

// Special routes
router.get("/product/:productId", reviewController.getReviewsByProduct);
router.get("/user/:userId", reviewController.getReviewsByUser);
router.get(
  "/product/:productId/average-rating",
  reviewController.getProductAverageRating
);

export default router;
