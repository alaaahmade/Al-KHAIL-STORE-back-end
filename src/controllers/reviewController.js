import { AppDataSource } from '../config/database.js';
import { Comment } from '../entities/Comment.js';
import reviewService, { getLatestReviews } from '../services/reviewService.js'
import catchAsync from '../utils/catchAsync.js';

const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await reviewService.getAllReviews();
  res.status(200).json({
    status: 'success',
    data: {
      reviews
    }
  });
});

const getReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.getReview(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

const createReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.createReview(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

const updateReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.updateReview(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

const deleteReview = catchAsync(async (req, res, next) => {
  await reviewService.deleteReview(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

const getLatest = catchAsync(async (req, res, next) => {
  const commentRepo = AppDataSource.getRepository(Comment);
  const results = await commentRepo.find({
    relations: ["user", "product", 'commentReplies', 'commentReplies.user'],
    take: 3,
  });
  res.status(200).json({
    status: 'success',
    data: [...results]
  });
});

const getReviewsByProduct = catchAsync(async(req, res, next) => {
    const result = await reviewService.getReviewsByProduct(req)
    res.status(200).json({
      status: 'success',
      data: result
    });
})

const getReviewsByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const reviews = await reviewService.getReviewsByUser(userId);
  res.status(200).json({
    status: 'success',
    data: reviews
  });
});

const getProductAverageRating = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const avg = await reviewService.getProductAverageRating(productId);
  res.status(200).json({
    status: 'success',
    data: { averageRating: avg }
  });
});

export default {
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getLatest,
  getAllReviews,
  getReviewsByProduct,
  getReviewsByUser,
  getProductAverageRating
}