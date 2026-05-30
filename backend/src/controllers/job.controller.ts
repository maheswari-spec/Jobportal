import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Job } from '../models/job.model';
import { Company } from '../models/company.model';
import { AppError } from '../utils/errors';

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      search, 
      type, 
      location, 
      experienceLevel, 
      minSalary, 
      page = '1', 
      limit = '10' 
    } = req.query;

    const query: any = { status: 'active' };

    // Search query matching (using text index or regex)
    if (search) {
      query.$text = { $search: search as string };
    }

    if (type) {
      query.type = type;
    }

    if (location) {
      query.location = { $regex: location as string, $options: 'i' };
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (minSalary) {
      query['salaryRange.min'] = { $gte: parseInt(minSalary as string, 10) };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const jobs = await Job.find(query)
      .populate('company', 'name logo location industry size')
      .skip(skip)
      .limit(limitNum)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 });

    const total = await Job.countDocuments(query);

    return res.status(200).json({
      status: 'success',
      results: jobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

export const getJobDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('company')
      .populate('recruiter', 'email');
    
    if (!job) {
      return next(new AppError('Job posting not found', 404));
    }

    // Increment view count atomically
    job.viewsCount += 1;
    await job.save();

    return res.status(200).json({
      status: 'success',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterId = req.user?.id;
    const { title, description, companyId, location, type, experienceLevel, salaryRange, requirements, responsibilities, skillsRequired } = req.body;

    if (!recruiterId) {
      return next(new AppError('Unauthorized access', 401));
    }

    // Verify company belongs to recruiter or exists
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const job = await Job.create({
      title,
      description,
      company: companyId,
      recruiter: recruiterId,
      location,
      type,
      experienceLevel,
      salaryRange,
      requirements,
      responsibilities,
      skillsRequired,
      status: 'active'
    });

    // Add job to company jobs array
    company.jobs.push(job._id as any);
    await company.save();

    return res.status(201).json({
      status: 'success',
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterId = req.user?.id;
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return next(new AppError('Job posting not found', 404));
    }

    // Security check: Only the recruiter who posted the job can update it
    if (job.recruiter.toString() !== recruiterId && req.user?.role !== 'admin') {
      return next(new AppError('You are not authorized to update this job posting', 403));
    }

    const fieldsToUpdate = [
      'title', 'description', 'location', 'type', 'experienceLevel', 
      'salaryRange', 'requirements', 'responsibilities', 'skillsRequired', 'status'
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        (job as any)[field] = req.body[field];
      }
    });

    await job.save();

    return res.status(200).json({
      status: 'success',
      message: 'Job posting updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterId = req.user?.id;
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return next(new AppError('Job posting not found', 404));
    }

    if (job.recruiter.toString() !== recruiterId && req.user?.role !== 'admin') {
      return next(new AppError('You are not authorized to remove this job posting', 403));
    }

    // soft-delete / archive
    job.status = 'archived';
    await job.save();

    return res.status(200).json({
      status: 'success',
      message: 'Job posting archived successfully'
    });
  } catch (error) {
    next(error);
  }
};
