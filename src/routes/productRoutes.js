const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

// Product routes
router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

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

module.exports = router;
