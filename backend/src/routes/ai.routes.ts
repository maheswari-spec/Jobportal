import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.post('/analyze', protect, restrictTo('candidate'), aiController.analyzeResume);
router.post('/match', protect, aiController.matchJob);
router.post('/tailor', protect, restrictTo('candidate'), aiController.buildTailoredResume);
router.post('/cover-letter', protect, restrictTo('candidate'), aiController.generateCoverLetter);
router.get('/interview-questions/:resumeId', protect, restrictTo('candidate'), aiController.generateInterviewQuestions);

export default router;
