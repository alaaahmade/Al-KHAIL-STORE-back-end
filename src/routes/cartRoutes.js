import express from "express"
import cartController from "../controllers/cartController.js"

const router = express.Router();

// Base routes
router
  .route("/")
  .post(cartController.createCart)
  .get(cartController.getAllCarts);

// Special routes - specific routes should come before generic routes to avoid conflicts
router.get("/user/:userId", cartController.getUserCart);

// Routes with ID
router
  .route("/:id")
  .get(cartController.getCart)
  .patch(cartController.updateCart)
  .delete(cartController.deleteCart);

// Cart checkout route
router.post("/:id/checkout", cartController.checkoutCart);

// Cart items routes
router
  .route("/:id/items")
  .get(cartController.getCartItems)
  .post(cartController.addCartItem);

router
  .route("/:id/items/:itemId")
  .patch(cartController.updateCartItem)
  .delete(cartController.removeCartItem);

  export default  router;
