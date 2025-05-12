import AppError from "../utils/AppError.js"
import catchAsync from "../utils/catchAsync.js"
import { AppDataSource } from "../config/database.js"
import {entities} from "../entities/index.js"
// Create a new seller
const createSeller = catchAsync(async (sellerData) => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  const seller = sellerRepository.create(sellerData);
  return await sellerRepository.save(seller);
});

// Get all sellers
const getAllSellers = catchAsync(async () => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  const sellers = await sellerRepository.find({
    relations: ["user", "store"]
  });
  return sellers;
});

// Get seller by ID
const getSeller = catchAsync(async (id) => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  const seller = await sellerRepository.findOne({
    where: { id },
    relations: ["user", "store"]
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  return seller;
});

// Update seller
const updateSeller = catchAsync(async (id, updateData) => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  
  // First find the seller
  const seller = await sellerRepository.findOne({
    where: { id }
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  
  // Update seller properties
  sellerRepository.merge(seller, updateData);
  
  // Save the updated seller
  return await sellerRepository.save(seller);
});

// Delete seller
const deleteSeller = catchAsync(async (id) => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  
  const seller = await sellerRepository.findOne({
    where: { id }
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  
  await sellerRepository.remove(seller);
  return true;
});

// Get seller by user ID
const getSellerByUser = catchAsync(async (userId) => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  
  const seller = await sellerRepository.findOne({
    where: { userId },
    relations: ["store"]
  });
  
  if (!seller) {
    throw new AppError("No seller found for this user", 404);
  }
  
  return seller;
});

// Get sellers by store ID
const getSellersByStore = catchAsync(async (storeId) => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  
  const sellers = await sellerRepository.find({
    where: { storeId },
    relations: ["user"]
  });
  
  return sellers;
});

// Update seller status
const updateStatus = catchAsync(async (id, status) => {
  const sellerRepository = AppDataSource.getRepository(entities.Seller);
  
  const seller = await sellerRepository.findOne({
    where: { id }
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  
  seller.isActive = status === 'active';
  
  return await sellerRepository.save(seller);
});


export default {
  createSeller,
  getAllSellers,
  getSeller,
  deleteSeller,
  updateSeller,
  getSellerByUser,
  getSellersByStore,
  updateStatus,
}