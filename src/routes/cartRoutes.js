import express from "express"
import cartController, { emptyCartController } from "../controllers/cartController.js"
import { protect, restrictTo, isOwnerOrAdmin } from "../middleware/auth.js"

const router = express.Router();

// Base routes
router
  .route("/")
  .post(protect, restrictTo('USER', 'ADMIN', 'MANAGER'), cartController.createCart)
  .get(protect, restrictTo('ADMIN', 'MANAGER'), cartController.getAllCarts); // Only admin/manager should see all carts

// Get a user's cart (only owner or admin/manager)
router.get("/user/:userId", protect, isOwnerOrAdmin(req => req.params.userId), cartController.getUserCart);

// Cart by ID (only owner or admin/manager)
router
  .route("/:id")
  .get(protect, cartController.getCart)
  .patch(protect, isOwnerOrAdmin(async req => {
    return req.user.id;
  }), cartController.updateCart)
  .delete(protect, isOwnerOrAdmin(async req => {
    return req.user.id;
  }), cartController.deleteCart);

// Cart checkout (only owner or admin/manager)
router.post("/:id/checkout", protect, cartController.checkoutCart);

// Cart items routes (only owner or admin/manager)
router
  .route("/:id/items")
  .get(protect, isOwnerOrAdmin(async req => req.user.id), cartController.getCartItems)
  .post(protect, isOwnerOrAdmin(async req => req.user.id), cartController.addCartItem)
  .delete(protect, isOwnerOrAdmin(async req => req.user.id), emptyCartController)
  // .patch(protect, isOwnerOrAdmin(async req => req.user.id), cartController.removeCartItem);

router
  .route("/:id/items/:itemId")
  .patch(protect, isOwnerOrAdmin(async req => req.user.id), cartController.updateCartItem)
  .delete(protect, isOwnerOrAdmin(async req => req.user.id), cartController.removeCartItem);

  export default  router;
