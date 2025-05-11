const express = require("express");
const router = express.Router();
const commentReplyController = require("../controllers/commentReplyController");

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

module.exports = router;
