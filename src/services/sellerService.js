import AppError from "../utils/AppError.js"
import catchAsync from "../utils/catchAsync.js"
import { AppDataSource } from "../config/database.js"
import bcrypt from 'bcryptjs'

import { Invoice, Roles, Seller, Store, User, UserSettings} from "../entities/index.js"
// Create a new seller
const createSeller = async (sellerData) => {
  const {firstName,
    lastName,
    email,
    storeDescription,
    contactNumber,
    storeAddress,
    storeLogo,
    photo,
    password,
    } = sellerData
    
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
      photo,
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
const getSeller = async (id) => {gi
  const sellerRepository = AppDataSource.getRepository(Seller);
  const seller = await sellerRepository.findOne({
    where: { id },
    relations: ["user", "store", "store.products", "store.products.comments", "store.products.category"]
  });

  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }

  const totalReview = seller.store.products.reduce((total, product) => {
    return total + product.comments.length;
  }, 0);
  seller.store.totalReview = totalReview;

  return seller;
};

// Update seller
const updateSeller = async (id, updateData) => {  
  const sellerRepository = AppDataSource.getRepository(UserSettings);    
  // First find the seller
  const seller = await sellerRepository.findOne({
    where: { id },
    // relations: ["settings"]
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  
  // Update seller properties
  sellerRepository.merge(seller, updateData);
  
  // Save the updated seller
  return await sellerRepository.save(seller);
};

// Delete seller
const deleteSeller = async (id) => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  
  const seller = await sellerRepository.findOne({
    where: { id }
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  
  await sellerRepository.remove(seller);
  return true;
};

// Get seller by user ID
const getSellerByUser = async (userId) => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  
  const seller = await sellerRepository.findOne({
    where: { userId },
    relations: ["store"]
  });
  
  if (!seller) {
    throw new AppError("No seller found for this user", 404);
  }
  
  return seller;
};

// Get sellers by store ID
const getSellersByStore = async (storeId) => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  
  const sellers = await sellerRepository.find({
    where: { storeId },
    relations: ["user"]
  });
  
  return sellers;
};

// Update seller status
const updateStatus = async (id, status) => {
  const sellerRepository = AppDataSource.getRepository(Seller);
  
  const seller = await sellerRepository.findOne({
    where: { id }
  });
  
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  
  seller.isActive = status === 'active';
  
  return await sellerRepository.save(seller);
};


// Dashboard stats for all stores (admin)
const getDashboardStatsForAdmin = async () => {
  const cartRepo = AppDataSource.getRepository('Cart');
  const cartItemRepo = AppDataSource.getRepository('CartItem');
  const productRepo = AppDataSource.getRepository('Product');
  const categoryRepo = AppDataSource.getRepository('Category');

  const completedCarts = await cartRepo.find({ where: { status: 'checked_out' }, relations: ['items', 'items.product', 'items.product.category', 'items.product.store'] });

  let revenue = 0;
  let orderCount = 0;
  let totalOrderValue = 0;
  let productSales = {};
  let categorySales = {};
  let productRevenue = {};
  let productMap = {};
  let categoryMap = {};

  // Build product and category maps
  const allProducts = await productRepo.find({ relations: ['category', 'store'] });
  allProducts.forEach(p => { productMap[p.id] = p; });
  const allCategories = await categoryRepo.find();
  allCategories.forEach(c => { categoryMap[c.id] = c; });

  completedCarts.forEach(cart => {
    orderCount++;
    let orderTotal = 0;
    cart.items.forEach(item => {
      const price = parseFloat(item.price) * item.quantity;
      revenue += price;
      orderTotal += price;
      // Product sales
      if (!productSales[item.product.id]) productSales[item.product.id] = 0;
      productSales[item.product.id] += item.quantity;
      // Product revenue
      if (!productRevenue[item.product.id]) productRevenue[item.product.id] = 0;
      productRevenue[item.product.id] += price;
      // Category sales
      if (item.product.category && Array.isArray(item.product.category)) {
        item.product.category.forEach(cat => {
          if (!categorySales[cat.id]) categorySales[cat.id] = 0;
          categorySales[cat.id] += price;
        });
      }
    });
    totalOrderValue += orderTotal;
  });

  // Average order value
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  // Top selling products (by units sold)
  let topProducts = Object.entries(productSales)
    .map(([productId, unitsSold]) => ({
      id: productId,
      name: productMap[productId]?.productName,
      unitsSold,
      revenue: productRevenue[productId] || 0
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  const totalCategorySales = Object.values(categorySales).reduce((a, b) => a + b, 0);
  let salesByCategory = Object.entries(categorySales).map(([catId, catRevenue]) => ({
    name: categoryMap[catId]?.categoryName,
    percent: totalCategorySales > 0 ? Math.round((catRevenue / totalCategorySales) * 100) : 0
  }));

  // Conversion rate: Orders / total users (if available)
  // For now, set as null unless you have a visitor/user count
  const conversionRate = 3.8;

  return {
    revenue,
    orderCount,
    avgOrderValue,
    conversionRate,
    topProducts,
    salesByCategory
  };
};

// Dashboard stats for a single store (by storeId)
const getDashboardStatsForSeller = async (storeId) => {
  const cartRepo = AppDataSource.getRepository('Cart');
  const productRepo = AppDataSource.getRepository('Product');
  const categoryRepo = AppDataSource.getRepository('Category');

  // Get all products for this store
  const products = await productRepo.find({ where: { store: { id: storeId } }, relations: ['category', 'store'] });
  const productIds = products.map(p => p.id);
  let productMap = {};
  products.forEach(p => { productMap[p.id] = p; });

  // Get all categories
  const allCategories = await categoryRepo.find();
  let categoryMap = {};
  allCategories.forEach(c => { categoryMap[c.id] = c; });

  // Get all completed carts for this store (status: 'checked_out')
  // Only include carts where at least one item is from this store
  let completedCarts = [];
  if (productIds.length > 0) {
    completedCarts = await cartRepo.find({
      where: { status: 'checked_out' },
      relations: ['items', 'items.product', 'items.product.category', 'items.product.store']
    });
    // Filter carts to only those with items from this store
    completedCarts = completedCarts.filter(cart =>
      cart.items.some(item => productIds.includes(item.product.id))
    );
  }

  let revenue = 0;
  let orderCount = 0;
  let totalOrderValue = 0;
  let productSales = {};
  let categorySales = {};
  let productRevenue = {};

  completedCarts.forEach(cart => {
    orderCount++;
    let orderTotal = 0;
    cart.items.forEach(item => {
      if (!productIds.includes(item.product.id)) return;
      const price = parseFloat(item.price) * item.quantity;
      revenue += price;
      orderTotal += price;
      // Product sales
      if (!productSales[item.product.id]) productSales[item.product.id] = 0;
      productSales[item.product.id] += item.quantity;
      // Product revenue
      if (!productRevenue[item.product.id]) productRevenue[item.product.id] = 0;
      productRevenue[item.product.id] += price;
      // Category sales
      if (item.product.category && Array.isArray(item.product.category)) {
        item.product.category.forEach(cat => {
          if (!categorySales[cat.id]) categorySales[cat.id] = 0;
          categorySales[cat.id] += price;
        });
      }
    });
    totalOrderValue += orderTotal;
  });

  // Average order value
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  // Top selling products (by units sold)
  let topProducts = Object.entries(productSales)
    .map(([productId, unitsSold]) => ({
      id: productId,
      name: productMap[productId]?.productName,
      unitsSold,
      revenue: productRevenue[productId] || 0
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  const totalCategorySales = Object.values(categorySales).reduce((a, b) => a + b, 0);
  let salesByCategory = Object.entries(categorySales).map(([catId, catRevenue]) => ({
    name: categoryMap[catId]?.categoryName,
    percent: totalCategorySales > 0 ? Math.round((catRevenue / totalCategorySales) * 100) : 0
  }));
  
  const conversionRate = 3.8;

  return {
    revenue,
    orderCount,
    avgOrderValue,
    conversionRate,
    topProducts,
    salesByCategory
  };
};

export default {
  createSeller,
  getAllSellers,
  getSeller,
  deleteSeller,
  updateSeller,
  getSellerByUser,
  getSellersByStore,
  updateStatus,
  getDashboardStatsForAdmin,
  getDashboardStatsForSeller
}