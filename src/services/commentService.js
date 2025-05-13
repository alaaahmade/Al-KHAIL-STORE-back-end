import { AppDataSource } from "../config/database.js"; // تأكد من استيراد AppDataSource
import {Comment} from "../entities/Comment.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// Create a new comment
const createComment = async (commentData) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = commentRepository.create(commentData); // إنشاء كائن جديد
  await commentRepository.save(comment); // حفظ الكومنت في قاعدة البيانات
  return comment;
};

// Get all comments
const getAllComments = async () => {
  const commentRepository = AppDataSource.getRepository(Comment);
  const comments = await commentRepository.find({
    relations: ["user", "product", "commentReplies", "commentReplies.user"],
    order: {
      createdAt: "ASC"
    },  
  });
  comments.forEach(comment => {
    comment.commentReplies.sort((a, b) =>  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() );
  });
  return comments;
}

const getComment = async (id) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id } }); // العثور على الكومنت باستخدام الـ ID
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  return comment;
};

// Update comment
const updateComment = async (id, updateData) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id } }); // العثور على الكومنت باستخدام الـ ID
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  Object.assign(comment, updateData); // تحديث الكومنت
  await commentRepository.save(comment); // حفظ الكومنت المحدث
  return comment;
};

// Delete comment
const deleteComment = async (id) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id } }); // العثور على الكومنت باستخدام الـ ID
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  await commentRepository.remove(comment); // حذف الكومنت
};

// Get comments by product ID
const getCommentsByProduct = async (productId) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find({ where: { productId } }); // الحصول على جميع الكومنتات بناءً على الـ productId
  return comments;
};

// Get comments by user ID
const getCommentsByUser = async (userId) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find({ where: { userId } }); // الحصول على جميع الكومنتات بناءً على الـ userId
  return comments;
};

// Get average rating for a product
const getProductAverageRating = async (productId) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find({ where: { productId } }); // الحصول على جميع الكومنتات بناءً على الـ productId
  if (comments.length === 0) {
    return 0;
  }
  const totalRating = comments.reduce(
    (sum, comment) => sum + comment.rating,
    0
  ); // حساب مجموع التقييمات
  return totalRating / comments.length; // حساب المتوسط
};


export default {
  createComment,
  getAllComments,
  getComment,
  updateComment,
  deleteComment,
  getCommentsByProduct,
  getCommentsByUser,
  getProductAverageRating,
}