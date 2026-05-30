import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import chatRoutes from './chat.routes';
import aiRoutes from './ai.routes';
import adminRoutes from './admin.routes';
import firebaseRoutes from './firebase.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/chat', chatRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/firebase', firebaseRoutes);

export default router;
