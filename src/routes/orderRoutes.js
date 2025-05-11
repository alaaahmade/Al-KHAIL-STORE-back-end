const express = require("express");
const orderController = require("../controllers/orderController");
const { protect, restrictTo, isOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Order routes with authentication and authorization
router
  .route("/")
  .get(protect, restrictTo('ADMIN', 'MANAGER'), orderController.getAllOrders)
  .post(protect, orderController.createOrder);

router
  .route("/:id")
  .get(protect, isOwnerOrAdmin(req => orderController.getOrderById(req.params.id).then(order => order.userId)), orderController.getOrder)
  .patch(protect, isOwnerOrAdmin(req => orderController.getOrderById(req.params.id).then(order => order.userId)), orderController.updateOrder)
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

module.exports = router;