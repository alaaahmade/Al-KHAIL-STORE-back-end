const ReviewReply = require("../entities");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create a new reply
exports.createReply = catchAsync(async (replyData) => {
  const reply = await ReviewReply.create(replyData);
  return reply;
});

// Get all replies for a review
exports.getRepliesByReview = catchAsync(async (reviewId) => {
  const replies = await ReviewReply.find({ reviewId });
  return replies;
});

// Get reply by ID
exports.getReply = catchAsync(async (id) => {
  const reply = await ReviewReply.findById(id);
  if (!reply) {
    throw new AppError("No reply found with that ID", 404);
  }
  return reply;
});

// Update reply
exports.updateReply = catchAsync(async (id, updateData) => {
  const reply = await ReviewReply.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!reply) {
    throw new AppError("No reply found with that ID", 404);
  }
  return reply;
});

// Delete reply
exports.deleteReply = catchAsync(async (id) => {
  const reply = await ReviewReply.findByIdAndDelete(id);
  if (!reply) {
    throw new AppError("No reply found with that ID", 404);
  }
});

// Get replies by user
exports.getRepliesByUser = catchAsync(async (userId) => {
  const replies = await ReviewReply.find({ userId });
  return replies;
});
