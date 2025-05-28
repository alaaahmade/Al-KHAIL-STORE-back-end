import { AppDataSource } from "../config/database.js"; // تأكد من استيراد AppDataSource
import {Comment} from "../entities/Comment.js";
import { Product } from '../entities/Product.js';
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
  // Remove password from user objects in comments and commentReplies
  const sanitizedComments = comments.map(comment => {
    // Deep clone to avoid mutating ORM objects
    const sanitized = JSON.parse(JSON.stringify(comment));
    if (sanitized.user && sanitized.user.password) {
      delete sanitized.user.password;
    }
    if (sanitized.commentReplies && Array.isArray(sanitized.commentReplies)) {
      sanitized.commentReplies = sanitized.commentReplies.map(reply => {
        if (reply.user && reply.user.password) {
          delete reply.user.password;
        }
        return reply;
      });
    }
    return sanitized;
  });
  return sanitizedComments;
}

const getComment = async (id) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id }, relations: ["user", "product", "commentReplies", "commentReplies.user"] }); // العثور على الكومنت باستخدام الـ ID
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  return comment;
};

// Update comment
const updateComment = async (id, updateData) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id }, relations: ["user", "product", "commentReplies", "commentReplies.user"] }); // العثور على الكومنت باستخدام الـ ID
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
  const comment = await commentRepository.findOne({ where: { id } }); 
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  await commentRepository.remove(comment); // حذف الكومنت
};

// Get comments by product ID
const getCommentsByProduct = async (productId) => {
  const commentRepository = AppDataSource.getRepository(Comment); 
  const comments = await commentRepository.find({ where: { productId }, relations: ["user", "product", "commentReplies", "commentReplies.user"] }); 
  // Remove password from user objects in comments and commentReplies
  const sanitizedComments = comments.map(comment => {
    // Deep clone to avoid mutating ORM objects
    const sanitized = JSON.parse(JSON.stringify(comment));
    if (sanitized.user && sanitized.user.password) {
      delete sanitized.user.password;
    }
    if (sanitized.commentReplies && Array.isArray(sanitized.commentReplies)) {
      sanitized.commentReplies = sanitized.commentReplies.map(reply => {
        if (reply.user && reply.user.password) {
          delete reply.user.password;
        }
        return reply;
      });
    }
    return sanitized;
  });
  return sanitizedComments;
};

// Get comments by user ID
const getCommentsByUser = async (userId) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find({ where: { userId, relations: ["user", "product", "commentReplies", "commentReplies.user"] } }); // الحصول على جميع الكومنتات بناءً على الـ userId
  // Remove password from user objects in comments and commentReplies
  const sanitizedComments = comments.map(comment => {
    // Deep clone to avoid mutating ORM objects
    const sanitized = JSON.parse(JSON.stringify(comment));
    if (sanitized.user && sanitized.user.password) {
      delete sanitized.user.password;
    }
    if (sanitized.commentReplies && Array.isArray(sanitized.commentReplies)) {
      sanitized.commentReplies = sanitized.commentReplies.map(reply => {
        if (reply.user && reply.user.password) {
          delete reply.user.password;
        }
        return reply;
      });
    }
    return sanitized;
  });
  return sanitizedComments;
};

const getProductAverageRating = async (productId) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find({ where: { productId }, relations: ["user", "product", "commentReplies", "commentReplies.user"] }); // الحصول على جميع الكومنتات بناءً على الـ productId
  if (comments.length === 0) {
    return 0;
  }
  const totalRating = comments.reduce(
    (sum, comment) => sum + comment.rating,
    0
  ); 
  return totalRating / comments.length; 
};

const getReviewsWithStoreId = async (storeId) => {
  const commentRepo = AppDataSource.getRepository(Comment);
  const comments = await commentRepo.find({
    relations: ["user", "product", "commentReplies", "commentReplies.user", "product.store"],
    where: qb => {
      qb.where((qb2) => {
        qb2.where('product.store_id = :storeId', { storeId });
      });
    },
    order: {
      createdAt: "ASC", 
    },
  });
  const sanitizedComments = comments.map(comment => {
    const sanitized = JSON.parse(JSON.stringify(comment));
    if (sanitized.user && sanitized.user.password) {
      delete sanitized.user.password;
    }
    if (sanitized.commentReplies && Array.isArray(sanitized.commentReplies)) {
      sanitized.commentReplies = sanitized.commentReplies
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(reply => {
          if (reply.user && reply.user.password) {
            delete reply.user.password;
          }
          return reply;
        });
    }
    return sanitized;
  });
  return sanitizedComments;
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
  getReviewsWithStoreId
}