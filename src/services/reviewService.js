const Review = require("../entities/Review");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create a new review
exports.createReview = catchAsync(async (reviewData) => {
  const review = await Review.create(reviewData);
  return review;
});

// Get all reviews
exports.getAllReviews = catchAsync(async () => {
  const reviews = await Review.find();
  return reviews;
});

// Get review by ID
exports.getReview = catchAsync(async (id) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError("No review found with that ID", 404);
  }
  return review;
});

// Update review
exports.updateReview = catchAsync(async (id, updateData) => {
  const review = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    throw new AppError("No review found with that ID", 404);
  }
  return review;
});

// Delete review
exports.deleteReview = catchAsync(async (id) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new AppError("No review found with that ID", 404);
  }
});

// Get reviews by product ID
exports.getReviewsByProduct = catchAsync(async (productId) => {
  const reviews = await Review.find({ productId });
  return reviews;
});

// Get reviews by user ID
exports.getReviewsByUser = catchAsync(async (userId) => {
  const reviews = await Review.find({ userId });
  return reviews;
});

// Get average rating for a product
exports.getProductAverageRating = catchAsync(async (productId) => {
  const reviews = await Review.find({ productId });
  if (reviews.length === 0) {
    return 0;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
});
