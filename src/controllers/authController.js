import bcrypt from 'bcryptjs'
import { AppDataSource } from '../config/database.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import { generateToken } from '../middleware/auth.js'
import { User } from '../entities/User.js'

/**
 * User login
 * @route POST /api/auth/login
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
    console.log({ email, password });
    
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

  // 4) If everything ok, send token to client
  const token = generateToken(user);

  // Remove password from output
  const userResponse = await userRepository.findOne({ where: { id: user.id }, relations: ["seller", "seller.store"] });
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
  const hashedPassword = await bcrypt.hash(password, 12);

  // 4) Create new user
  const newUser = userRepository.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phoneNumber,
    role: 'USER', // Default role
  });

  await userRepository.save(newUser);

  // 5) Generate token
  const token = generateToken(newUser);

  // Remove password from output
  const userResponse = await userRepository.findOne({ where: { id: newUser.id }, relations: ["seller", "seller.store"] });
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
  // User already available from auth middleware  
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: req.user.id }, relations: ["seller", "seller.store"] });
  
  const userResponse = { ...req.user, ...user };
  delete userResponse.password;
  
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

export default {
  login,
  getMe,
  updatePassword,
  register
}