import express from "express";
import reviewController from "../controllers/reviewController.js";

const router = express.Router();

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
//   .patch(reviewController.updateReview)
//   .delete(reviewController.deleteReview);

// // Special routes
// router.get("/product/:productId", reviewController.getReviewsByProduct);
// router.get("/user/:userId", reviewController.getReviewsByUser);
// router.get(
//   "/product/:productId/average-rating",
//   reviewController.getProductAverageRating
// );

export default router;
