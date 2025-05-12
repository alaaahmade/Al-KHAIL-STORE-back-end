import { DataSource } from 'typeorm';
import dotenv from "dotenv";
import { Cart,
  CartItem,
  Category,
  Comment,
  CommentReply,
  Invoice,
  Manager,
  Order,
  Product,
  Seller,
  Store,
  User
} from '../entities/index.js';


dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ecommerce",
  synchronize: process.env.DB_SYNC === "true", 
  dropSchema: process.env.DB_DROP === "true", 
  logging: false,
  entities: Object.values([
    User,
    Product,
    Category,
    Cart,
    CartItem,
    Order,
    Invoice,
    Comment,
    CommentReply,
    Manager,
    Seller,
    Store,
  ]),
  migrations: [],
  subscribers: [],
  migrationsRun: false,
  skipSchemaCheck: true,
});
