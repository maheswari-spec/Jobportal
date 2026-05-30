import { Router } from 'express';
import * as applicationController from '../controllers/application.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Candidate endpoints
router.post('/apply', protect, restrictTo('candidate'), applicationController.applyJob);
router.get('/my-applications', protect, restrictTo('candidate'), applicationController.getCandidateApplications);

// Recruiter endpoints
router.get('/job/:jobId', protect, restrictTo('recruiter', 'admin'), applicationController.getJobApplicants);
router.get('/recruiter/stats', protect, restrictTo('recruiter', 'admin'), applicationController.getRecruiterStats);
router.patch('/:id/status', protect, restrictTo('recruiter', 'admin'), applicationController.updateApplicationStatus);

export default router;
