const { AppDataSource } = require("../config/database");
const CommentReply = require("../entities/CommentReply");
const AppError = require("../utils/AppError");

// Get the repository
const commentReplyRepository = AppDataSource.getRepository(CommentReply);

// Create a new comment reply
exports.createCommentReply = async (replyData) => {
  const reply = commentReplyRepository.create(replyData);
  await commentReplyRepository.save(reply);
  return reply;
};

// Get all comment replies
exports.getAllCommentReplies = async () => {
  const replies = await commentReplyRepository.find();
  return replies;
};

// Get comment reply by ID
exports.getCommentReply = async (id) => {
  const reply = await commentReplyRepository.findOne({ where: { id } });
  if (!reply) throw new AppError("No comment reply found with that ID", 404);
  return reply;
};

// Update comment reply
exports.updateCommentReply = async (id, updateData) => {
  const reply = await commentReplyRepository.preload({ id, ...updateData });
  if (!reply) throw new AppError("No comment reply found with that ID", 404);
  await commentReplyRepository.save(reply);
  return reply;
};

// Delete comment reply
exports.deleteCommentReply = async (id) => {
  const result = await commentReplyRepository.delete(id);
  if (result.affected === 0)
    throw new AppError("No comment reply found with that ID", 404);
};

// Get replies by comment ID
exports.getRepliesByComment = async (commentId) => {
  return await commentReplyRepository.find({
    where: { comment: { id: commentId } },
  });
};

// Get replies by user ID
exports.getRepliesByUser = async (userId) => {
  return await commentReplyRepository.find({ where: { user: { id: userId } } });
};
