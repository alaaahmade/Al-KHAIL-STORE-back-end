import express from "express";
import invoiceController from "../controllers/invoiceController.js";

const router = express.Router();
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
  invoiceController.updateInvoicePaymentStatus
);

export default router;
