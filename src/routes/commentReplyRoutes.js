import express from "express";
import commentReplyController from "../controllers/commentReplyController.js";

const router = express.Router();
// Base routes
router
  .route("/")
  .get(commentReplyController.getAllCommentReplies)
  .post(commentReplyController.createCommentReply);

// Routes with ID
router
  .route("/:id")
  .get(commentReplyController.getCommentReply)
  .patch(commentReplyController.updateCommentReply)
  .delete(commentReplyController.deleteCommentReply);

// Special routes
router.get("/comment/:commentId", commentReplyController.getRepliesByComment);
router.get("/user/:userId", commentReplyController.getRepliesByUser);

export default  router;
