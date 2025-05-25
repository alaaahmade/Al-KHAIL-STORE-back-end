import express from"express";
import managerController from"../controllers/managerController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';
const router = express.Router();

// Base routes
router
  .route("/")
  .get(protect, restrictTo('ADMIN'), managerController.getAllManagers)
  .post(protect, restrictTo('ADMIN'), managerController.createManager);

// Routes with ID
router
  .route("/:id")
  .get(managerController.getManager)
  .patch(isOwnerOrAdmin(req => req.params.id), managerController.updateManager)
  .delete(managerController.deleteManager);

// Special routes
router.patch("/:id/password", isOwnerOrAdmin(req => req.params.id), managerController.updatePassword);
router.patch("/:id/status", managerController.updateStatus);
router.patch("/:id/permissions", managerController.updatePermissions);

export default router;
