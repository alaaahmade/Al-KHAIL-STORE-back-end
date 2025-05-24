import express from "express";
import productController from "../controllers/productController.js";
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Product routes
router
  .route("/")
  .get(productController.getAllProducts)
  .post(protect, productController.createProduct);

router
  .get('/featured', productController.getFeaturedProducts); 
  router

router.get("/categories", productController.getProductsWithCategories)

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

router
  .route("/:id/categories/:categoryId")
  .post(productController.addCategory)
  .delete(productController.removeCategory);

// Store products route
router.get("/store/:storeId", productController.getProductsByStore);


export default router;
