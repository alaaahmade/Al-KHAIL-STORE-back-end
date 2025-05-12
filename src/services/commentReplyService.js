import { AppDataSource } from "../config/database.js";
import {CommentReply} from "../entities/CommentReply.js";
import AppError from "../utils/AppError.js";

// Get the repository
const commentReplyRepository = AppDataSource.getRepository(CommentReply);

// Create a new comment reply
const createCommentReply = async (replyData) => {
  const reply = commentReplyRepository.create(replyData);
  await commentReplyRepository.save(reply);
  return reply;
};

// Get all comment replies
const getAllCommentReplies = async () => {
  const replies = await commentReplyRepository.find();
  return replies;
};

// Get comment reply by ID
const getCommentReply = async (id) => {
  const reply = await commentReplyRepository.findOne({ where: { id } });
  if (!reply) throw new AppError("No comment reply found with that ID", 404);
  return reply;
};

// Update comment reply
const updateCommentReply = async (id, updateData) => {
  const reply = await commentReplyRepository.preload({ id, ...updateData });
  if (!reply) throw new AppError("No comment reply found with that ID", 404);
  await commentReplyRepository.save(reply);
  return reply;
};

// Delete comment reply
const deleteCommentReply = async (id) => {
  const result = await commentReplyRepository.delete(id);
  if (result.affected === 0)
    throw new AppError("No comment reply found with that ID", 404);
};

// Get replies by comment ID
const getRepliesByComment = async (commentId) => {
  return await commentReplyRepository.find({
    where: { comment: { id: commentId } },
  });
};

// Get replies by user ID
const getRepliesByUser = async (userId) => {
  return await commentReplyRepository.find({ where: { user: { id: userId } } });
};


export default {
  createCommentReply,
  getAllCommentReplies,
  getCommentReply,
  updateCommentReply,
  deleteCommentReply,
  getRepliesByComment,
  getRepliesByUser
}