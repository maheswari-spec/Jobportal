import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase';
import { AppError } from '../utils/errors';

export interface FirebaseAuthenticatedRequest extends Request {
  firebaseUser?: any;
}

export const verifyFirebaseIdToken = async (req: FirebaseAuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Missing Authorization header with Bearer token', 401));
  }

  const idToken = authHeader.split(' ')[1];
  if (!admin.apps.length) {
    return next(new AppError('Firebase Admin SDK is not initialized on server', 501));
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;
    return next();
  } catch (error) {
    return next(new AppError('Invalid Firebase ID token', 401));
  }
};

export default verifyFirebaseIdToken;
