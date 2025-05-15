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

const router = express.Router();


router.get(
  '/room/:roomId',
  protect,
  getRomeById
);

router.post(
  '/rooms',
  createOrGetChatRoom
);

// Get all chat rooms for a specific user
router.get(
  '/rooms/user/:userId',
  getUserChatRooms
);

router.post(
  '/rooms/:roomId/messages',
  sendMessage
);

router.get(
  '/rooms/:roomId/messages',
  getChatRoomMessages
);



export default router;
