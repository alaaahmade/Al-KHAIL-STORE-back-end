import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import { AppDataSource } from '../config/database.js';
import {entities} from '../entities/index.js';

// Get JWT secret from environment variables or use a default for development
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id and role
 * @returns {String} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header
 */
export const protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }    

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3) Check if user still exists
    const userRepository = AppDataSource.getRepository(entities.User);
    const currentUser = await userRepository.findOne({ where: { id: decoded.id } });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('This user account has been deactivated.', 401));
    }

    // 5) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(error);
  }
};

/**
 * Authorization middleware
 * Restricts access to certain roles
 * @param {...String} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

/**
 * Check if user is owner of resource or has admin/manager role
 * @param {Function} getResourceUserId - Function to extract the owner ID from the request
 */
export const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // Skip for admins and managers
      if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
        return next();
      }

      // Get the resource owner ID using the provided function
      const resourceUserId = await getResourceUserId(req);

      // Check if the current user is the owner
      if (req.user.id !== resourceUserId) {
        return next(new AppError('You do not have permission to perform this action on this resource', 403));
      }

      next();
    } catch (error) {
      return next(error);
    }
  };
};
