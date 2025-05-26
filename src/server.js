import { app } from './app.js';
import { AppDataSource } from './config/database.js';
import dotenv from "dotenv";
dotenv.config(); 
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { disActivateUser, handleIsActive } from './controllers/userController.js';
import { deleteMessageService, sendMessage } from './controllers/chatController.js';


const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app)

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (ori, callback) => {
      if (/^http:\/\/localhost(:\d+)?$/.test(ori)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: '*',
  },
});

io.on('connection', socket => {
  const userId = socket.handshake.auth.userId;
  console.log('`⚡:User connected with ID:', userId);

  handleIsActive(userId);

  socket.on('message', async ({ romeId, senderId, content }) => {
    const newMessage = await sendMessage({ roomId: romeId, senderId, content });    
  })  

  socket.on('delete', async ({ id }) => {
    const response = await deleteMessageService(id.toString());
    const { deletedMessage } = response.data;

    io.emit('messageDeleted', deletedMessage);
  });

  socket.on('disconnect', () => {
    const userId = socket.handshake.auth.userId;
    console.log('`⚡:🔥: A user disconnected with ID:', userId);
    try {
      disActivateUser(userId)
      
    } catch (error) {
      console.log(error);
      
    }
    
  });
});


// Initialize database connection
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    httpServer.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
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
