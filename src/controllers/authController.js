import bcrypt from 'bcryptjs'
import { AppDataSource } from '../config/database.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import { generateToken } from '../middleware/auth.js'
import { User } from '../entities/User.js'
import { Cart } from '../entities/Cart.js'
import { UserSettings } from '../entities/UserSettings.js'
import { Seller } from '../entities/Seller.js'
import { Store } from '../entities/Store.js'
import { Roles } from '../entities/roles.js'
import { transporter } from '../utils/nodeMailer.js'

/**
 * Become a Seller
 * @route POST /api/auth/become-seller
 */

async function createUserIfNotExists(repo, data, roleName, next) {
  // 1. Check if user exists
  const existing = await repo.findOne({ 
    where: { email: data.email }, 
    relations: ['roles'] 
  });
  if (existing) {
    return next(new AppError('User with this email already exists', 400));
  }

  // 2. Hash password
  data.password = await bcrypt.hash(data.password, 10);

  // 3. Create user without roles first
  const user = repo.create(data);
  await repo.save(user);

  // 4. Always fetch the role by name
  const roleRepo = AppDataSource.getRepository(Roles);
  const verifiedRole = await roleRepo.findOne({ 
    where: { name: roleName },
    relations: ["users"]
  });

  if (!verifiedRole) {
    return next(new AppError(`Role with name ${roleName} not found`, 500));
  }
  
  verifiedRole.users.push(user);
  await roleRepo.save(verifiedRole);
  return repo.findOne({ 
    where: { id: user.id }, 
    relations: ['roles'] 
  });
}


const becomeASeller = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, storeName, description, phoneNumber } = req.body;

  // 1) Check if required fields exist
  if (!firstName || !lastName || !email || !password || !storeName || !description || !phoneNumber) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // 2) Check if user already exists
  const userRepository = AppDataSource.getRepository(User);
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  const newUser = await createUserIfNotExists(userRepository, {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role: 'SELLER',
    isActive: true,
    status: 'PENDING'
  }, 'SELLER', next);


  // 5) Create Store
  const storeRepo = AppDataSource.getRepository(Store);
  const newStore = storeRepo.create({
    name: storeName,
    description,
    phoneNumber,
    email,
    address: '',
    isActive: true
  });
  await storeRepo.save(newStore);

  const sellerRepo = AppDataSource.getRepository(Seller);
  const newSeller = sellerRepo.create({
    user: newUser,
    store: newStore,
    isActive: true
  });
  await sellerRepo.save(newSeller);
  newUser.seller = newSeller;

  const cartRepo = AppDataSource.getRepository(Cart);
  const newCart = cartRepo.create({
    user: newUser,
  });
  await cartRepo.save(newCart);
  newUser.cart = newCart;

  const settingsRepo = AppDataSource.getRepository(UserSettings);
  const newSettings = settingsRepo.create({
    user: newUser,
  });
  await settingsRepo.save(newSettings);
  newUser.settings = newSettings;

  await userRepository.save(newUser);

  await transporter.sendMail({
    from: process.env.EMAIL_USER || 'balantypro@gmail.com',
    to: email,
    subject: 'Al-KHAIL-STORE - Seller Request Received',
    text: `
      Hello,

      Thank you for your interest in becoming a seller on Al-KHAIL-STORE.
      We’ve received your request and our team will review it shortly.
      You’ll receive an email once it’s reviewed.

      Best regards,  
      The Al-KHAIL-STORE Team
        `
    });


  res.status(201).json({
    status: 'success',
    data: {
      message: 'We’ve received your seller request. You’ll get an email once it’s reviewed'
    }
  });
});

/**
 * User login
 * @route POST /api/auth/login-
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.status === 'BANNED') {
    return next(new AppError('Your account has been banned', 401));
  }

  if (user.status === 'PENDING') {
    return next(new AppError('Your account is pending', 401));
  }

  if (user.status !== 'ACTIVE') {
    return next(new AppError('Your account has been deactivated', 401));
  }

  const token = generateToken(user);

  // Remove password from output
  const userResponse = await userRepository.findOne({ where: { id: user.id }, relations: ["seller", "seller.store", "cart", "cart.items", 'settings'] });
  delete userResponse.password;

  res.status(200).json({
    status: 'success',
    token,
      user: userResponse
  });
});

/**
 * Register new user
 * @route POST /api/auth/register
 */
const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  // 1) Check if required fields exist
  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // 2) Check if user already exists
  const userRepository = AppDataSource.getRepository(User);
  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // 3) Hash password
  const roleRepository = AppDataSource.getRepository(Roles);
  const userRole = await roleRepository.findOne({ where: { name: 'USER' } });

  if (!userRole) {
    return next(new AppError('User role not found', 500));
  }
  const newUser =await  createUserIfNotExists(userRepository, {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role: 'USER',
    status: 'ACTIVE'
  }, 'USER', next);  

  // 5) Generate token
  const token = generateToken(newUser);

  const cartRepo = AppDataSource.getRepository(Cart);
  const newCart = cartRepo.create({
    user: newUser,
  });
  await cartRepo.save(newCart);
  newUser.cart = newCart;

  const settingsRepo = AppDataSource.getRepository(UserSettings);
  const newSettings = settingsRepo.create({
    user: newUser,
  });
  await settingsRepo.save(newSettings);
  newUser.settings = newSettings;

  await userRepository.save(newUser);


  // Remove password from output
  const userResponse = await  userRepository.findOne({ where: { id: newUser.id }, relations: ["seller", "seller.store", "cart", "cart.items", 'settings'] });
  delete userResponse.password;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: userResponse
    }
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
const getMe = catchAsync(async (req, res, next) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: req.user.id }, relations: ["seller", "seller.store", "cart", "cart.items", 'settings'] });
  const userResponse = { ...req.user, ...user };
  delete userResponse.password;

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.status === 'BANNED') {
    return next(new AppError('Your account has been banned', 401));
  }

  if (user.status === 'PENDING') {
    return next(new AppError('Your account is pending', 401));
  }

  if (user.status !== 'ACTIVE') {
    return next(new AppError('Your account has been deactivated', 401));
  }

  await userRepository.update(req.user.id, {
    lastActiveAt: new Date(),
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: userResponse
    }
  });
});

/**
 * Update password
 * @route PATCH /api/auth/update-password
 */
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // 1) Check if passwords provided
  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current password and new password', 400));
  }

  // 2) Get user from database
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: req.user.id } });

  if (!user) {
    return next(new AppError('User not found', 404));
  }
    if (user.status === 'BANNED') {
    return next(new AppError('Your account has been banned', 401));
  }

  if (user.status === 'PENDING') {
    return next(new AppError('Your account is pending', 401));
  }

  if (user.status !== 'ACTIVE') {
    return next(new AppError('Your account has been deactivated', 401));
  }

  // 3) Check if current password is correct
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 4) Update password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await userRepository.update(req.user.id, {
    lastActiveAt: new Date(),
  });
  await userRepository.save(user);

  // 5) Generate new token
  const token = generateToken(user);

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password updated successfully'
  });
});

// --- Password Reset In-Memory Store ---
const resetCodes = {};

// Helper to send email
async function sendResetEmail(email, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER || 'balantypro@gmail.com',
    to: email,
    subject: 'Al-KHAIL-STORE Password Reset Code',
    text: `
  Hello,
  
  You requested to reset your password for your Al-KHAIL-STORE account.
  
  Your password reset code is: ${code}
  
  If you did not request this, please ignore this email. This code will expire shortly for your security.
  
  Thank you,  
  The Al-KHAIL-STORE Team
    `
  });
}

/**
 * Forgot Password - Send code
 * @route POST /api/auth/forgot-password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });

  if (!user) return next(new AppError('User not found', 404));

    if (user.status === 'BANNED') {
    return next(new AppError('Your account has been banned', 401));
  }

  if (user.status === 'PENDING') {
    return next(new AppError('Your account is pending', 401));
  }

  if (user.status !== 'ACTIVE') {
    return next(new AppError('Your account has been deactivated', 401));
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }; // 10 min expiry

  await sendResetEmail(email, code);
  res.status(200).json({ message: 'Reset code sent to email.' });
});

/**
 * Verify Reset Code
 * @route POST /api/auth/verify-reset-code
 */
const verifyResetCode = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) return next(new AppError('Email and code are required', 400));
  const entry = resetCodes[email];
  if (!entry || entry.code !== code || entry.expires < Date.now()) {
    return next(new AppError('Invalid or expired code', 400));
  }
  res.status(200).json({ message: 'Code verified.' });
});

/**
 * Reset Password
 * @route POST /api/auth/reset-password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return next(new AppError('All fields required', 400));
  const entry = resetCodes[email];
  if (!entry || entry.code !== code || entry.expires < Date.now()) {
    return next(new AppError('Invalid or expired code', 400));
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });
  if (!user) return next(new AppError('User not found', 404));

  user.password = await bcrypt.hash(newPassword, 12);
  await userRepository.save(user);
  delete resetCodes[email];
  res.status(200).json({ message: 'Password reset successful.' });
});

export default {
  login,
  getMe,
  updatePassword,
  register,
  becomeASeller,
  forgotPassword,
  verifyResetCode,
  resetPassword
}