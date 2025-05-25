import express from "express";
import productController from "../controllers/productController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';
import productService from "../services/productService.js";

const router = express.Router();

// Helper to get seller userId from product
const getProductSellerId = async (req) => {
  const product = await productService.getProductById(req.params.id);
  // product.store may be an object with id
  // You may need to fetch the store and get its seller
  if (product.store && product.store.seller && product.store.seller.user && product.store.seller.user.id) {
    return product.store.seller.user.id;
  }
  // fallback if store only has id
  // You may need to fetch the store entity if not populated
  // For now, assume store.seller.user.id is available
  throw new Error('Cannot determine product owner');
};

// Product routes
router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    productController.createProduct
  );

router.get('/featured', productController.getFeaturedProducts);
router.get("/categories", productController.getProductsWithCategories);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    isOwnerOrAdmin(getProductSellerId),
    productController.updateProduct
  )
  .delete(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    isOwnerOrAdmin(getProductSellerId),
    productController.deleteProduct
  );

router
  .route("/:id/categories/:categoryId")
  .post(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    isOwnerOrAdmin(getProductSellerId),
    productController.addCategory
  )
  .delete(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    isOwnerOrAdmin(getProductSellerId),
    productController.removeCategory
  );

// Store products route
router.get("/store/:storeId", productController.getProductsByStore);

export default router;
