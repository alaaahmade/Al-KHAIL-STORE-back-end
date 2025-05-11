const { DataSource } = require("typeorm");
const entities = require("../entities");
const dotenv = require("dotenv");

dotenv.config();

// Use a test database with same structure as production
const TestDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ecommerce", // Use the same database for now
  synchronize: true, // Synchronize in test mode
  logging: false,
  entities: Object.values(entities),
  migrations: [],
  subscribers: [],
  dropSchema: false, // Do not drop schema to avoid losing data
});

module.exports = { TestDataSource };