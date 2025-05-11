const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");

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

module.exports = router;
