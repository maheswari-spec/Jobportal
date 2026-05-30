import { Request, Response, NextFunction } from 'express';

export const checkFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  // `verifyFirebaseIdToken` middleware attaches `firebaseUser` to request
  const anyReq: any = req;
  if (!anyReq.firebaseUser) {
    return res.status(401).json({ status: 'error', message: 'No firebase user attached' });
  }

  return res.status(200).json({ status: 'success', firebaseUser: anyReq.firebaseUser });
};

export default { checkFirebaseToken };
