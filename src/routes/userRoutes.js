import express from "express";
import userController from "../controllers/userController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';
const router = express.Router();

// User routes
router
  .route("/")
  .get(protect, restrictTo('ADMIN'), userController.getAllUsers)
  .post(protect, restrictTo('ADMIN'), userController.createUser);

router.route('/roles')
  .get(protect, restrictTo('ADMIN'), userController.getAllRoles)

// Check if email exists
router.get('/email/:email', userController.checkEmailExists);

// Helper to get user id from params
const getUserId = (req) => req.params.id;

router
  .route("/:id")
  .get(userController.getUser)
  .patch(isOwnerOrAdmin(getUserId), userController.updateUser)
  .delete(userController.deleteUser);

export default router;
