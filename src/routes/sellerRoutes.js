import express from "express";
import sellerController from "../controllers/sellerController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';
const router = express.Router();

// Base routes
router
  .route("/")
  .post(protect, restrictTo('ADMIN'), sellerController.createSeller)
  .get(protect, restrictTo('ADMIN'), sellerController.getAllSellers);

// Routes with ID
router
  .route("/:id")
  .get(protect, sellerController.getSeller)
  .patch(protect, isOwnerOrAdmin(req => req.params.id), sellerController.updateSeller)
  .delete(protect, restrictTo('ADMIN'), sellerController.deleteSeller);

// Special routes
router.get("/user/:userId", protect, isOwnerOrAdmin(req => req.params.userId), sellerController.getSellerByUser);
router.get("/store/:storeId", protect, sellerController.getSellersByStore);
router.patch("/:id/status", protect, sellerController.updateStatus);

export default router;
