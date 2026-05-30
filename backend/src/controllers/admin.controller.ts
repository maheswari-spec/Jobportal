import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';
import { Job } from '../models/job.model';
import { Application } from '../models/application.model';
import { Resume } from '../models/resume.model';
import { AppError } from '../utils/errors';

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { role, status, email } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (email) filter.email = { $regex: email as string, $options: 'i' };

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reportedReason } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.status = status;
    if (reportedReason) {
      user.reportedReason = reportedReason;
    }
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: `User accounts state has been changed to: ${status}`,
      data: {
        id: user._id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalResumes = await Resume.countDocuments();

    // Group signup stats by role
    const appStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        counts: {
          users: totalUsers,
          candidates: totalCandidates,
          recruiters: totalRecruiters,
          jobs: totalJobs,
          applications: totalApplications,
          resumes: totalResumes
        },
        applicationDistribution: appStats
      }
    });
  } catch (error) {
    next(error);
  }
};
