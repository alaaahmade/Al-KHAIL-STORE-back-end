const { AppDataSource } = require("../config/database");
const AppError = require("../utils/AppError");
const { Invoice } = require("../entities");

const invoiceRepository = AppDataSource.getRepository(Invoice);

// Create a new invoice
exports.createInvoice = async (invoiceData) => {
  const invoice = invoiceRepository.create(invoiceData);
  return await invoiceRepository.save(invoice);
};

// Get all invoices
exports.getAllInvoices = async () => {
  const invoices = await invoiceRepository.find({
    relations: ["user", "seller", "order"],
  });
  return invoices || []; // ✅ ضمان أن ترجع مصفوفة
};

// Get invoice by ID
exports.getInvoiceById = async (id) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
    relations: ["user", "seller", "order"],
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  return invoice;
};

// Update invoice
exports.updateInvoice = async (id, updateData) => {
  const invoice = await invoiceRepository.findOne({ where: { id } });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  Object.assign(invoice, updateData);
  return await invoiceRepository.save(invoice);
};

// Delete invoice
exports.deleteInvoice = async (id) => {
  const invoice = await invoiceRepository.findOne({ where: { id } });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  await invoiceRepository.remove(invoice);
  return invoice;
};

// Get invoices by user ID
exports.getInvoicesByUser = async (userId) => {
  const invoices = await invoiceRepository.find({
    where: { userId },
    relations: ["cart", "user", "seller"],
  });
  return invoices || [];
};

// Get invoices by seller ID
exports.getInvoicesBySeller = async (sellerId) => {
  const invoices = await invoiceRepository.find({
    where: { sellerId },
    relations: ["cart", "user", "seller"],
  });
  return invoices || [];
};

// Get invoice by cart ID
exports.getInvoiceByCart = async (cartId) => {
  const invoice = await invoiceRepository.findOne({
    where: { cartId },
    relations: ["cart", "user", "seller"],
  });

  if (!invoice) {
    throw new AppError("No invoice found for that cart", 404);
  }

  return invoice;
};

// Get invoices by order ID
exports.getInvoicesByOrder = async (orderId) => {
  const invoices = await invoiceRepository.find({
    where: { orderId },
    relations: ["cart", "user", "seller"],
  });
  return invoices || [];
};

// Update invoice payment status
exports.updateInvoicePaymentStatus = async (id, status) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
    relations: ["cart", "user", "seller"],
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  invoice.status = status;
  if (status === "PAID") {
    invoice.paymentDate = new Date();
  }

  return await invoiceRepository.save(invoice);
};
