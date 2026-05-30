import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateCandidateProfileSchema, updateRecruiterProfileSchema } from '../validators/profile.validator';

const router = Router();

router.get('/me', protect, profileController.getProfileMe);
router.put('/candidate', protect, restrictTo('candidate'), validate(updateCandidateProfileSchema), profileController.updateCandidateProfile);
router.put('/recruiter', protect, restrictTo('recruiter'), validate(updateRecruiterProfileSchema), profileController.updateRecruiterProfile);

export default router;
