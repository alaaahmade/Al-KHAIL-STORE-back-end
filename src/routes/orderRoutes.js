import express from "express";
import orderController from "../controllers/orderController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Order routes with authentication and authorization
router
  .route("/")
  .get(protect, restrictTo('ADMIN', 'SELLER'), orderController.getAllOrders)
  .post(protect, orderController.createOrder);

router
.route("/recent")
.get(protect, restrictTo('ADMIN', 'SELLER'), orderController.getRecentOrders)


router
  .route("/:id")
  .get(
    protect,
    restrictTo('ADMIN', 'SELLER'),
    orderController.getOrder
  )
  .patch(
    protect,
    restrictTo('ADMIN', 'SELLER'),
    orderController.updateOrder
  )
  .delete(protect, restrictTo('ADMIN', 'SELLER'), orderController.deleteOrder);

router.route("/user/:userId").get(protect, 
  restrictTo('ADMIN', 'SELLER'),
  orderController.getOrdersByUser
);

router.route("/status/:status").get(protect, restrictTo('ADMIN', 'SELLER'), orderController.getOrdersByStatus);

router.route("/:id/status").patch(
  protect, 
  restrictTo('ADMIN', 'SELLER'), 
  orderController.updateOrderStatus
);

router.get('/session/:sessionId', orderController.getOrderbySessionId)

export default router;