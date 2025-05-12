import express from "express";
import orderController from "../controllers/orderController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Order routes with authentication and authorization
router
  .route("/")
  .get(protect, restrictTo('ADMIN', 'MANAGER'), orderController.getAllOrders)
  .post(protect, orderController.createOrder);

router
  .route("/:id")
  .get(
    protect,
    isOwnerOrAdmin(async (req) => {
      const order = await orderController.getOrder(req);
      return order.userId;
    }),
    orderController.getOrder
  )
  .patch(
    protect,
    isOwnerOrAdmin(async (req) => {
      const order = await orderController.getOrder(req);
      return order.userId;
    }),
    orderController.updateOrder
  )
  .delete(protect, restrictTo('ADMIN', 'MANAGER'), orderController.deleteOrder);

router.route("/user/:userId").get(protect, 
  isOwnerOrAdmin(req => Promise.resolve(Number(req.params.userId))), 
  orderController.getOrdersByUser
);

router.route("/status/:status").get(protect, restrictTo('ADMIN', 'MANAGER'), orderController.getOrdersByStatus);

router.route("/:id/status").patch(
  protect, 
  restrictTo('ADMIN', 'MANAGER'), 
  orderController.updateOrderStatus
);

export default router;