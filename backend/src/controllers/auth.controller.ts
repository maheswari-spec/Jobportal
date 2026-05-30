import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { CandidateProfile } from '../models/candidate.model';
import { RecruiterProfile } from '../models/recruiter.model';
import { config } from '../config/environment';
import { AppError } from '../utils/errors';
import { hashPassword, verifyPassword } from '../utils/hash';
import { admin } from '../config/firebase';

const signAccessToken = (payload: any) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const signRefreshToken = (payload: any) => {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });
};

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const payload = { id: user._id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Set HTTP-only Cookie for security
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      role,
      isVerified: false
    });

    // Scaffold profile based on role
    if (role === 'candidate') {
      await CandidateProfile.create({
        user: user._id,
        firstName: email.split('@')[0],
        lastName: 'Candidate',
        skills: [],
        education: [],
        certifications: [],
        projects: [],
        experience: []
      });
    } else if (role === 'recruiter') {
      await RecruiterProfile.create({
        user: user._id,
        firstName: email.split('@')[0],
        lastName: 'Recruiter'
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (user.status === 'blocked') {
      return next(new AppError('Your account has been suspended.', 403));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const firebaseLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accept ID token either in request body (`idToken`) or Authorization header `Bearer <idToken>`
    const authHeader = req.headers.authorization;
    let idToken = req.body?.idToken as string | undefined;
    const role = req.body?.role || 'candidate';
    if (!idToken && authHeader && authHeader.startsWith('Bearer ')) {
      idToken = authHeader.split(' ')[1];
    }
    if (!idToken) {
      return next(new AppError('Firebase ID token is required in Authorization header or request body', 400));
    }

    if (!admin.apps.length) {
      return next(new AppError('Firebase authentication is not configured on this server.', 501));
    }

    let decodedToken: any;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken as string);
    } catch (err) {
      return next(new AppError('Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token.', 401));
    }
    const { email, uid } = decodedToken;

    if (!email) {
      return next(new AppError('Invalid token: Email missing from Firebase credential', 400));
    }

    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email }]
    });

    if (!user) {
      user = await User.create({
        email,
        firebaseUid: uid,
        role,
        isVerified: true // Firebase emails are pre-verified via provider usually
      });

      // Scaffold profile based on role
      if (role === 'candidate') {
        await CandidateProfile.create({
          user: user._id,
          firstName: email.split('@')[0],
          lastName: 'Candidate',
          skills: [],
          education: [],
          certifications: [],
          projects: [],
          experience: []
        });
      } else if (role === 'recruiter') {
        await RecruiterProfile.create({
          user: user._id,
          firstName: email.split('@')[0],
          lastName: 'Recruiter'
        });
      }
    } else {
      // Connect existing email to Firebase UID if not done already
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    if (user.status === 'blocked') {
      return next(new AppError('Your account has been suspended.', 403));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(new AppError('Firebase authentication failed: ' + (error as Error).message, 401));
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.id);
    if (!user || user.status === 'blocked') {
      return next(new AppError('User not found or suspended', 401));
    }

    const newPayload = { id: user._id, email: user.email, role: user.role };
    const accessToken = signAccessToken(newPayload);

    res.status(200).json({
      status: 'success',
      accessToken
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};
