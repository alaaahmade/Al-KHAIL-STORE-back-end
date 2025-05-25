import express from "express";
import userController from "../controllers/userController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';
const router = express.Router();

// User routes
router
  .route("/")
  .get(protect, restrictTo('ADMIN'), userController.getAllUsers)
  .post(protect, restrictTo('ADMIN'), userController.createUser);

router
  .route("/customers")
  .get(protect, restrictTo('ADMIN'), userController.getCustomers);

router.route('/roles')
  .get(protect, restrictTo('ADMIN'), userController.getAllRoles);

// Check if email exists
router.get('/email/:email', userController.checkEmailExists);

// Helper to get user id from params
const getUserId = (req) => req.params.id;

// Protected routes
router
  .route("/:id")
  .get(protect, isOwnerOrAdmin(getUserId), userController.getUser)
  .patch(protect, isOwnerOrAdmin(getUserId), userController.updateUser)
  .delete(protect, isOwnerOrAdmin(getUserId), userController.deleteUser);

export default router;