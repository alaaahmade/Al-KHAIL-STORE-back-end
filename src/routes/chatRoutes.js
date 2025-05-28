// src/routes/chatRoutes.js
import express from 'express';
import {
  createOrGetChatRoom,
  getUserChatRooms,
  sendMessage,
  getChatRoomMessages,
  getRomeById,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

// Only authenticated users can access chat
router.get(
  '/room/:roomId',
  protect,
  getRomeById
);

router.post(
  '/rooms',
  protect,
  createOrGetChatRoom
);

// Get all chat rooms for a specific user
router.get(
  '/rooms/user/:userId',
  protect,
  getUserChatRooms
);

// Only participants or admin can send messages (ownership logic should be in controller)
router.post(
  '/rooms/:roomId/messages',
  protect,
  async(req,res, next) => {
    try {      
      const {roomId, senderId, content, files = null} = req.body

      if (!senderId || !content) {
        return res.status(400).json({ message: 'Missing senderId or content.' });
      }
  
      const response = await sendMessage({roomId, senderId, content, files})
      return res.status(200).json(response)
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }
);

router.get(
  '/rooms/:roomId/messages',
  protect,
  getChatRoomMessages
);

export default router;
