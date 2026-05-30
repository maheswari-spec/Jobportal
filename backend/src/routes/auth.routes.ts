import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, signupSchema, firebaseLoginSchema } from '../validators/auth.validator';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/firebase-login', validate(firebaseLoginSchema), authController.firebaseLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);

export default router;
