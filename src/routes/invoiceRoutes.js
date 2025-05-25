import express from "express";
import invoiceController from "../controllers/invoiceController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to get sellerId from invoice
const getInvoiceSellerId = async (req) => {
  const invoice = await invoiceController.getInvoice(req);
  return invoice.sellerId;
};

// Base routes
router
  .route("/")
  .get(invoiceController.getAllInvoices)
  .post(invoiceController.createInvoice);

// Routes with ID
router
  .route("/:id")
  .get(invoiceController.getInvoice)
  .patch(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

// Special routes
router.get("/user/:userId", invoiceController.getInvoicesByUser);
router.get("/seller/:sellerId", invoiceController.getInvoicesBySeller);
router.get("/order/:orderId", invoiceController.getInvoicesByOrder);
router.patch(
  "/:id/payment-status",
  protect,
  restrictTo('ADMIN'),
  invoiceController.updateInvoicePaymentStatus
);

export default router;
