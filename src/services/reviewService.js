
import { AppDataSource } from '../config/database.js';
import { Comment } from '../entities/Comment.js';
import { Product } from '../entities/Product.js';
import {Review} from "../entities/Review.js"
import AppError from "../utils/AppError.js"
import catchAsync from "../utils/catchAsync.js"

// Create a new review
const createReview = async (reviewData) => {
  const reviewRepo = AppDataSource.getRepository(Comment);
  const productRepo = AppDataSource.getRepository(Product);
  const product = await productRepo.findOne({ where: { id: reviewData.productId },
    relations: ["comments"] });
  if (!product) {
    throw new AppError("No product found with that ID", 404);
  }
  const review = await reviewRepo.create(reviewData);
  await reviewRepo.save(review);
  product.comments.push(review);
  await productRepo.save(product);
  return review;
}

// Get all reviews
const getAllReviews = async () => {
  const reviews = await Review.find();
  return reviews;
};

// Get review by ID
const getReview = async (id) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError("No review found with that ID", 404);
  }
  return review;
};

// Update review
const updateReview = async (id, updateData) => {
  const review = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    throw new AppError("No review found with that ID", 404);
  }
  return review;
};

// Delete review
const deleteReview = async (id) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new AppError("No review found with that ID", 404);
  }
}

// Get reviews by product ID
const getReviewsByProduct = async (req) => {
  const {productId} = req.params
  const commentRepo = AppDataSource.getRepository(Comment);
  const reviews = await commentRepo.find({
    where: { productId },
    relations: ["user", "product", "commentReplies", "commentReplies.user"],
  });
  if(!reviews){
    new AppError("No review found with that ID", 404)
  }
  return reviews;
};

// Get reviews by user ID
const getReviewsByUser = catchAsync(async (userId) => {
  const reviews = await Review.find({ userId });
  return reviews;
});

// Get average rating for a product
const getProductAverageRating = catchAsync(async (productId) => {
  const reviews = await Review.find({ productId });
  if (reviews.length === 0) {
    return 0;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
});

export const getLatestReviews = catchAsync(async () => {
  const commentRepo = AppDataSource.getRepository(Comment);
  const results = await commentRepo.find({
    relations: ["user", "product", "commentReplies", "commentReplies.user"],
    order: { createdAt: "DESC" },
    take: 3,
  });
  return results;
});


export default {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  getReviewsByProduct,
  getReviewsByUser,
  getProductAverageRating,
  getLatestReviews
}