import "reflect-metadata"
import express from"express";
import cors from"cors";
import morgan from"morgan";
import swaggerUi from"swagger-ui-express";
import swaggerSpec from"./config/swagger.js";
import errorHandler from"./middleware/errorHandler.js";
import userRoutes from"./routes/userRoutes.js";
import productRoutes from"./routes/productRoutes.js";
import categoryRoutes from"./routes/categoryRoutes.js";
import cartRoutes from"./routes/cartRoutes.js";
import orderRoutes from"./routes/orderRoutes.js";
import sellerRoutes from"./routes/sellerRoutes.js";
import managerRoutes from"./routes/managerRoutes.js";
import invoiceRoutes from"./routes/invoiceRoutes.js";
import commentRoutes from"./routes/commentRoutes.js";
import commentReplyRoutes from"./routes/commentReplyRoutes.js";
import storeRoutes from"./routes/storeRoutes.js";
import authRoutes from"./routes/authRoutes.js";
import reviews from "./routes/reviewRoutes.js";
import dotenv from 'dotenv'
import { TestDataSource } from './config/database.test.js';
import { AppDataSource } from './config/database.js';
dotenv.config();


let dataSource;
if (process.env.NODE_ENV === "test") {
  dataSource = TestDataSource;
} else {
  dataSource = AppDataSource;
}
export default dataSource = dataSource;

export const app = express();
app.enable('strict routing'); 

// Middleware
app.use(cors({
  origin: ["http://localhost:8084", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

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
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 404;
  next(error);
});
