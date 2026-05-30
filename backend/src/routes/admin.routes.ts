import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Secure all admin routes with protect & restrictTo admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/stats', adminController.getPlatformStats);

export default router;
