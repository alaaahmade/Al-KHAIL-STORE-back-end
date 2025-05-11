const { AppDataSource } = require("../config/database"); // تأكد من استيراد AppDataSource
const Comment = require("../entities/Comment");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create a new comment
exports.createComment = catchAsync(async (commentData) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = commentRepository.create(commentData); // إنشاء كائن جديد
  await commentRepository.save(comment); // حفظ الكومنت في قاعدة البيانات
  return comment;
});

// Get all comments
exports.getAllComments = catchAsync(async () => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find(); // الحصول على جميع الكومنتات
  return comments;
});

// Get comment by ID
exports.getComment = catchAsync(async (id) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id } }); // العثور على الكومنت باستخدام الـ ID
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  return comment;
});

// Update comment
exports.updateComment = catchAsync(async (id, updateData) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id } }); // العثور على الكومنت باستخدام الـ ID
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  Object.assign(comment, updateData); // تحديث الكومنت
  await commentRepository.save(comment); // حفظ الكومنت المحدث
  return comment;
});

// Delete comment
exports.deleteComment = catchAsync(async (id) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comment = await commentRepository.findOne({ where: { id } }); // العثور على الكومنت باستخدام الـ ID
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  await commentRepository.remove(comment); // حذف الكومنت
});

// Get comments by product ID
exports.getCommentsByProduct = catchAsync(async (productId) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find({ where: { productId } }); // الحصول على جميع الكومنتات بناءً على الـ productId
  return comments;
});

// Get comments by user ID
exports.getCommentsByUser = catchAsync(async (userId) => {
  const commentRepository = AppDataSource.getRepository(Comment); // الحصول على Repository للكومنت
  const comments = await commentRepository.find({ where: { userId } }); // الحصول على جميع الكومنتات بناءً على الـ userId
  return comments;
});

// Get average rating for a product
exports.getProductAverageRating = catchAsync(async (productId) => {
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
});
