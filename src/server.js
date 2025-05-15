import { app } from './app.js';
import { AppDataSource } from './config/database.js';
import dotenv from "dotenv";
dotenv.config(); 
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const PORT = process.env.PORT || 3000;

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ["http://localhost:8084", "http://localhost:3000"], 
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });

  // Handle client joining a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Placeholder for other chat-related events
  // socket.on('chatMessage', (msg) => { ... });
});

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    if (error.code === "42P07") {
      console.log("Tables already exist, continuing with existing schema...");

      httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } else {
      console.error("Error during database initialization:", error);
      process.exit(1);
    }
  }
};

initializeDatabase();

export { io }; 
