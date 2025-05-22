import { AppDataSource } from '../config/database.js';
import { ChatRoom } from '../entities/ChatRoom.js';
import { Message } from '../entities/Message.js';
import { User } from '../entities/User.js';
import { io } from '../server.js';

const getChatRoomRepository = () => AppDataSource.getRepository(ChatRoom);
const getMessageRepository = () => AppDataSource.getRepository(Message);
const getUserRepository = () => AppDataSource.getRepository(User);

export const createOrGetChatRoom = async (req, res, next) => {
  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({ message: 'Both userId1 and userId2 are required.' });
  }

  if (userId1 === userId2) {
    return res.status(400).json({ message: 'Cannot create a chat room with the same user.' });
  }

  const userRepository = getUserRepository();
  const chatRoomRepository = getChatRoomRepository();

  try {
    const user1 = await userRepository.findOneBy({ id: userId1 });
    const user2 = await userRepository.findOneBy({ id: userId2 });

    if (!user1 || !user2) {
      return res.status(404).json({ message: 'One or both users not found.' });
    }

    const roomsOfUser1 = await chatRoomRepository.createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.participants', 'p1')
      .where('p1.id = :userId', { userId: user1.id })
      .leftJoinAndSelect('chatRoom.participants', 'allParticipants') 
      .getMany();

    let existingRoom = null;
    for (const room of roomsOfUser1) {
      const participantIds = room.participants.map(p => p.id);
      if (participantIds.includes(user2.id) && room.participants.length === 2) {
        existingRoom = room;
        break;
      }
    }

    if (existingRoom) {
      return res.status(200).json(existingRoom);
    }

    const newChatRoom = chatRoomRepository.create({
      participants: [user1, user2],
    });
    await chatRoomRepository.save(newChatRoom);

    const savedRoom = await chatRoomRepository.findOne({
        where: { id: newChatRoom.id },
        relations: ['participants']
    });

    return res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error in createOrGetChatRoom:', error);
    next(error);
  }
};


export const getUserChatRooms = async (req, res, next) => {
  const { userId } = req.params;
  const chatRoomRepository = getChatRoomRepository();

  try {
    const userRepository = getUserRepository();
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
// 'participants', 'messages', 'messages.sender'
const chatRooms = await chatRoomRepository
  .createQueryBuilder('chatRoom')
  .innerJoin('chatRoom.participants', 'participant')
  .where('participant.id = :userId', { userId })

  // Select all participants
  .leftJoinAndSelect('chatRoom.participants', 'allParticipants')

  // Join seller from participant
  .leftJoinAndSelect('allParticipants.seller', 'participantSeller')

  // Join store from seller
  .leftJoinAndSelect('participantSeller.store', 'participantStore')

  // Join messages and sender
  .leftJoinAndSelect('chatRoom.messages', 'messages')
  .leftJoinAndSelect('messages.sender', 'sender')

  .orderBy('messages.createdAt', 'DESC')
  .getMany();
    if( chatRooms.length > 0) {
      chatRooms.forEach(room => {
        room.participants = room.participants.filter(p => p.id !== userId);
        delete room.participants[0].password
      })
    } 
    return res.status(200).json(chatRooms);
  } catch (error) {
    console.error('Error in getUserChatRooms:', error);
    next(error);
  }
};

export const sendMessage = async ({roomId, senderId, content}) => {
  if (!senderId || !content) {
    return { status: 400, message: 'Missing senderId or content.' };
  }

  const messageRepository = getMessageRepository();
  const chatRoomRepository = getChatRoomRepository();
  const userRepository = getUserRepository();

  try {
    const chatRoom = await chatRoomRepository.findOne({ 
      where: { id: roomId },
      relations: ['participants'] 
    });

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found.' });
    }

    const sender = await userRepository.findOneBy({ id: senderId });
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found.' });
    }

    const isParticipant = chatRoom.participants.some(p => p.id === sender.id);
    if (!isParticipant) {
        return res.status(403).json({ message: 'Sender is not a participant of this chat room.' });
    }

    const message = messageRepository.create({
      content,
      sender,
      chatRoom,
    });
    await messageRepository.save(message);

    const savedMessage = await messageRepository.findOne({
        where: { id: message.id },
        relations: ['sender', 'chatRoom'] 
    });

    io.emit('messageResponse', savedMessage);

    return savedMessage

  } catch (error) {
    console.error('Error in sendMessage:', error);

  }
};

export const getChatRoomMessages = async (req, res, next) => {
  const { roomId } = req.params;
  const messageRepository = getMessageRepository();

  try {
    const chatRoomRepository = getChatRoomRepository();
    const chatRoom = await chatRoomRepository.findOneBy({id: roomId});
    if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found.' });
    }

    const messages = await messageRepository.find({
      where: { chatRoom: { id: roomId } },
      relations: ['sender'], 
      order: { createdAt: 'ASC' }, 
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getChatRoomMessages:', error);
    next(error);
  }
};


export const getRomeById = async (req, res, next) => {
  const { roomId } = req.params;
  const {id} = req.user;
  console.log(roomId);
  
  const chatRoomRepository = getChatRoomRepository();
  try {
    const chatRoom = await chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants', 'participants.seller', 'participants.seller.store',  'messages', 'messages.sender'],
    });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found.' });
    }
    if( chatRoom) {
        chatRoom.participants.forEach(item =>{
          delete item.password
        });
    } 
    return res.status(200).json(chatRoom);
  } catch (error) {
    console.error('Error in getChatRoomById:', error);
    next(error);
  }
};


export const deleteMessageService = async (messageId) => {
  const messageRepository = getMessageRepository();
  const response = await messageRepository.delete({ id: messageId });
  console.log(response);
  
  return {
    data: response
  };
};