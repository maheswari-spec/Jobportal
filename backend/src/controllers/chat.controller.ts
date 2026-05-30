import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { socketService } from '../services/socket.service';
import { AppError } from '../utils/errors';

export const getChats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Unauthorized access', 401));
    }

    // Find chats where user is a participant
    const chats = await Chat.find({ participants: userId, isActive: true })
      .populate('participants', 'email role')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'email' }
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: chats.length,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

export const getChatMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;

    if (!userId) {
      return next(new AppError('Unauthorized access', 401));
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.map(p => p.toString()).includes(userId)) {
      return next(new AppError('Chat not found or access denied', 403));
    }

    // Fetch messages
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'email')
      .sort({ createdAt: 1 });

    // Clear unread counts for this user
    if (chat.unreadCounts.has(userId)) {
      chat.unreadCounts.set(userId, 0);
      await chat.save();
    }

    return res.status(200).json({
      status: 'success',
      results: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user?.id;
    const { recipientId, recipientEmail } = req.body;

    if (!senderId) {
      return next(new AppError('Unauthorized access', 401));
    }

    let targetUserId = recipientId;
    if (!targetUserId && recipientEmail) {
      const recipient = await User.findOne({ email: recipientEmail.toLowerCase().trim() });
      if (!recipient) {
        return next(new AppError('Recipient user not found', 404));
      }
      targetUserId = recipient._id.toString();
    }

    if (!targetUserId) {
      return next(new AppError('Recipient ID or email is required to start a chat', 400));
    }

    if (targetUserId === senderId) {
      return next(new AppError('You cannot create a chat with yourself', 400));
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [senderId, targetUserId] },
      isActive: true
    }).populate('participants', 'email role');

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, targetUserId],
        unreadCounts: new Map([[senderId, 0], [targetUserId, 0]]),
        isActive: true
      });
      chat = await Chat.findById(chat._id).populate('participants', 'email role');
    }

    return res.status(201).json({
      status: 'success',
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user?.id;
    const { chatId, content, contentType = 'text', attachmentUrl } = req.body;

    if (!senderId) {
      return next(new AppError('Unauthorized access', 401));
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.map(p => p.toString()).includes(senderId)) {
      return next(new AppError('Chat not found or access denied', 403));
    }

    // Create message
    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
      contentType,
      attachmentUrl,
      isRead: false
    });

    // Update chat last message & unread count for other participants
    chat.lastMessage = message._id as any;
    chat.participants.forEach((participantId) => {
      const pIdStr = participantId.toString();
      if (pIdStr !== senderId) {
        const count = chat.unreadCounts.get(pIdStr) || 0;
        chat.unreadCounts.set(pIdStr, count + 1);
      }
    });

    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'email');

    // Broadcast message via Socket.IO
    socketService.emitToRoom(chatId, 'receive_message', populatedMessage);

    // Notify user of new message if offline/not in room
    chat.participants.forEach((participantId) => {
      const pIdStr = participantId.toString();
      if (pIdStr !== senderId) {
        socketService.sendToUser(pIdStr, 'new_message_notification', {
          chatId,
          message: populatedMessage
        });
      }
    });

    return res.status(201).json({
      status: 'success',
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
};
