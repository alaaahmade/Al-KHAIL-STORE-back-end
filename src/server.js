import {app} from "./app.js";
import { AppDataSource } from './config/database.js';
import dotenv from "dotenv";
dotenv.config(); 

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    // await seedDatabase()
    console.log("Database connected successfully");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `API Documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    if (error.code === "42P07") {
      // Table already exists error
      console.log("Tables already exist, continuing with existing schema...");

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } else {
      console.error("Error during database initialization:", error);
      process.exit(1);
    }
  }
};

initializeDatabase();
