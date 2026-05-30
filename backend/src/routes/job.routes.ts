import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { postJobSchema } from '../validators/job.validator';

const router = Router();

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobDetails);

// Recruiter specific posting endpoints
router.post('/', protect, restrictTo('recruiter'), validate(postJobSchema), jobController.createJob);
router.put('/:id', protect, restrictTo('recruiter', 'admin'), jobController.updateJob);
router.delete('/:id', protect, restrictTo('recruiter', 'admin'), jobController.deleteJob);

export default router;
