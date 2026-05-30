import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, chatController.getChats);
router.get('/:chatId/messages', protect, chatController.getChatMessages);
router.post('/room', protect, chatController.createChat);
router.post('/message', protect, chatController.sendMessage);

export default router;
