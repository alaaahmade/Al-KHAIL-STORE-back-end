import express from "express";
import commentController from "../controllers/commentController.js";

const router = express.Router();
// Base routes
router
  .route("/")
  .post(commentController.createComment)
  .get(commentController.getAllComments);

// Routes with ID
router
  .route("/:id")
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

// Special routes
router.get("/product/:productId", commentController.getCommentsByProduct);
router.get("/user/:userId", commentController.getCommentsByUser);
router.get(
  "/product/:productId/average-rating",
  commentController.getProductAverageRating
);

export default router;
