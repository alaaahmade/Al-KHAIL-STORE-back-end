require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const managerRoutes = require("./routes/managerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const commentRoutes = require("./routes/commentRoutes");
const commentReplyRoutes = require("./routes/commentReplyRoutes");
const storeRoutes = require("./routes/storeRoutes");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

// Export the data source based on environment
let dataSource;
if (process.env.NODE_ENV === "test") {
  dataSource = require("./config/database.test").TestDataSource;
} else {
  dataSource = require("./config/database").AppDataSource;
}
exports.dataSource = dataSource;

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/carts", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/sellers", sellerRoutes);
app.use("/api/v1/managers", managerRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/comment-replies", commentReplyRoutes);
app.use("/api/v1/stores", storeRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 404;
  next(error);
});
// app.get("/", (req, res) => {
//   res.send("Welcome to the API");
// });
module.exports = app;
