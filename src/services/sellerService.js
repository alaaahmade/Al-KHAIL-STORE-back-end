import AppError from "../utils/AppError.js"
import catchAsync from "../utils/catchAsync.js"
import { AppDataSource } from "../config/database.js"
import bcrypt from 'bcryptjs'

import { Invoice, Roles, Seller, Store, User} from "../entities/index.js"
// Create a new seller
const createSeller = async (sellerData) => {
  const {firstName,
    lastName,
    email,
    storeDescription,
    contactNumber,
    storeAddress,
    storeLogo,
    
    password,
    } = sellerData
    console.log(sellerData);
    
    const userRepo = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash(password, 12);
    const rolesRepo = AppDataSource.getRepository(Roles);
    const role = await rolesRepo.findOne({ where: { name: 'SELLER' } });
    if (!role) {
      throw new Error('SELLER role not found in the database');
    }
    
    const storeRepo = AppDataSource.getRepository(Store);
    const NewUser = userRepo.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber: contactNumber,
      role: 'SELLER',
      roles: [[role]]
    })
    await userRepo.save(NewUser);
  const sellerRepository = AppDataSource.getRepository(Seller);
  const newStore = storeRepo.create({
    name: firstName,
    description: storeDescription,
    address: storeAddress,
    phoneNumber: contactNumber,
    email,
    logo: storeLogo,
  })
  await storeRepo.save(newStore);
  const seller = sellerRepository.create({
    userId: NewUser.id,
    storeId: newStore.id
  });
  return await sellerRepository.save(seller);
};

// Get all sellers
const getAllSellers = async () => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  const invoiceRepository = AppDataSource.getRepository(Invoice);
  const sellers = await sellerRepository.find({ relations: ["user", "store", "store.products"] });

  // Get current and previous month boundaries
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // For each seller, calculate revenue for this and last month
  const sellersWithRevenue = await Promise.all(sellers.map(async (seller) => {
    // This month
    const revenueThisMonth = await invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'sum')
      .where('invoice.sellerId = :sellerId', { sellerId: seller.id })
      .andWhere('invoice.status = :status', { status: 'PAID' })
      .andWhere('invoice.createdAt >= :startOfThisMonth', { startOfThisMonth })
      .getRawOne();

    // Last month
    const revenueLastMonth = await invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'sum')
      .where('invoice.sellerId = :sellerId', { sellerId: seller.id })
      .andWhere('invoice.status = :status', { status: 'PAID' })
      .andWhere('invoice.createdAt >= :startOfLastMonth', { startOfLastMonth })
      .andWhere('invoice.createdAt <= :endOfLastMonth', { endOfLastMonth })
      .getRawOne();

    // Filter user fields (remove password and any sensitive info)
    let safeUser = undefined;
    if (seller.user) {
      const { password, ...restUser } = seller.user;
      safeUser = restUser;
    }
    // Filter store fields (customize as needed)
    let safeStore = undefined;
    if (seller.store) {
      safeStore = { ...seller.store };
    }
    // Filter products fields (customize as needed)
    let safeProducts = undefined;
    if (seller.products) {
      safeProducts = seller.products.map(({ id, productName, standardPrice, offerPrice, productStatus }) => ({
        id, productName, standardPrice, offerPrice, productStatus
      }));
    }
    return {
      id: seller.id,
      isActive: seller.isActive,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
      user: safeUser,
      store: safeStore,
      products: safeProducts,
      revenueThisMonth: parseFloat(revenueThisMonth.sum) || 0,
      revenueLastMonth: parseFloat(revenueLastMonth.sum) || 0,
    };
  }));

  return sellersWithRevenue;
}


// Get seller by ID
const getSeller = catchAsync(async (id) => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  const seller = await sellerRepository.findOne({
    where: { id },
    relations: ["user", "store", "products"]
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  return seller;
});

// Update seller
const updateSeller = catchAsync(async (id, updateData) => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  
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
  const sellerRepository = AppDataSource.getRepository(Seller);
  
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
  const sellerRepository = AppDataSource.getRepository(Seller);
  
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
  const sellerRepository = AppDataSource.getRepository(Seller);
  
  const sellers = await sellerRepository.find({
    where: { storeId },
    relations: ["user"]
  });
  
  return sellers;
});

// Update seller status
const updateStatus = catchAsync(async (id, status) => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  
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