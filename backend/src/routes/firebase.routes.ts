import { Router } from 'express';
import { checkFirebaseToken } from '../controllers/firebase.controller';
import verifyFirebaseIdToken from '../middleware/firebaseAuth.middleware';

const router = Router();

// Example protected route that requires a valid Firebase ID token
router.get('/verify', verifyFirebaseIdToken, checkFirebaseToken);

export default router;
