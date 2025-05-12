import express from "express";
import sellerController from "../controllers/sellerController.js";
const router = express.Router();

// Base routes
router
  .route("/")
  .post(sellerController.createSeller)
  .get(sellerController.getAllSellers);

// Routes with ID
router
  .route("/:id")
  .get(sellerController.getSeller)
  .patch(sellerController.updateSeller)
  .delete(sellerController.deleteSeller);

// Special routes
router.get("/user/:userId", sellerController.getSellerByUser);
router.get("/store/:storeId", sellerController.getSellersByStore);
router.patch("/:id/status", sellerController.updateStatus);

export default router;
