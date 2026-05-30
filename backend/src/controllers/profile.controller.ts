import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CandidateProfile } from '../models/candidate.model';
import { RecruiterProfile } from '../models/recruiter.model';
import { Company } from '../models/company.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/errors';

export const getProfileMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return next(new AppError('Unauthorized access', 401));
    }

    if (role === 'candidate') {
      const profile = await CandidateProfile.findOne({ user: userId })
        .populate('resumes')
        .populate('primaryResume');
      
      if (!profile) {
        return next(new AppError('Candidate profile not found', 404));
      }
      return res.status(200).json({ status: 'success', data: profile });
    }

    if (role === 'recruiter') {
      const profile = await RecruiterProfile.findOne({ user: userId })
        .populate({
          path: 'company',
          populate: { path: 'jobs' }
        });
      
      if (!profile) {
        return next(new AppError('Recruiter profile not found', 404));
      }
      return res.status(200).json({ status: 'success', data: profile });
    }

    // Admins or basic user details
    const user = await User.findById(userId).select('-passwordHash');
    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Unauthorized access', 401));
    }

    let profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    // Update fields dynamically
    const fieldsToUpdate = [
      'firstName', 'lastName', 'phone', 'title', 'avatar', 'bio', 
      'location', 'socialLinks', 'skills', 'education', 
      'certifications', 'projects', 'experience'
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        (profile as any)[field] = req.body[field];
      }
    });

    await profile.save();
    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecruiterProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Unauthorized access', 401));
    }

    let profile = await RecruiterProfile.findOne({ user: userId });
    if (!profile) {
      return next(new AppError('Recruiter profile not found', 404));
    }

    // Update direct recruiter fields
    const fieldsToUpdate = ['firstName', 'lastName', 'phone', 'avatar', 'title'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        (profile as any)[field] = req.body[field];
      }
    });

    // Handle company fields if provided
    const { companyName, companyWebsite, companyIndustry, companySize, companyDescription, companyHeadquarters } = req.body;
    
    if (companyName) {
      let company = await Company.findOne({ name: companyName });
      if (!company) {
        company = await Company.create({
          name: companyName,
          website: companyWebsite,
          industry: companyIndustry,
          size: companySize,
          description: companyDescription,
          headquarters: companyHeadquarters,
          recruiters: [userId],
          jobs: []
        });
      } else {
        // Update company fields
        if (companyWebsite) company.website = companyWebsite;
        if (companyIndustry) company.industry = companyIndustry;
        if (companySize) company.size = companySize;
        if (companyDescription) company.description = companyDescription;
        if (companyHeadquarters) company.headquarters = companyHeadquarters;
        
        if (!company.recruiters.includes(userId as any)) {
          company.recruiters.push(userId as any);
        }
        await company.save();
      }
      profile.company = company._id as any;
    }

    await profile.save();
    
    const updatedProfile = await RecruiterProfile.findById(profile._id).populate('company');

    return res.status(200).json({
      status: 'success',
      message: 'Recruiter profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};
