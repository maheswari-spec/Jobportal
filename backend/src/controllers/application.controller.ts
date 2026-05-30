import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Application } from '../models/application.model';
import { Job } from '../models/job.model';
import { Resume } from '../models/resume.model';
import { Notification } from '../models/notification.model';
import { socketService } from '../services/socket.service';
import { AppError } from '../utils/errors';

export const applyJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user?.id;
    const { jobId, resumeId, resumeVersionId, coverLetter } = req.body;

    if (!candidateId) {
      return next(new AppError('Unauthorized access', 401));
    }

    // Verify Job exists and is active
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return next(new AppError('Job posting is not active or does not exist', 400));
    }

    // Check if candidate already applied
    const existingApplication = await Application.findOne({ job: jobId, candidate: candidateId });
    if (existingApplication) {
      return next(new AppError('You have already applied to this job posting', 400));
    }

    // Verify Resume exists and belongs to candidate
    const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId });
    if (!resume) {
      return next(new AppError('Selected resume was not found or unauthorized', 400));
    }

    const application = await Application.create({
      job: jobId,
      candidate: candidateId,
      resume: resumeId,
      resumeVersion: resumeVersionId || undefined,
      coverLetter,
      status: 'applied',
      statusHistory: [{
        status: 'applied',
        updatedBy: candidateId as any,
        updatedAt: new Date(),
        comment: 'Application submitted successfully'
      }]
    });

    // Increment applicants count
    job.applicantsCount += 1;
    await job.save();

    // Notify Recruiter
    const notification = await Notification.create({
      recipient: job.recruiter,
      sender: candidateId,
      type: 'new_applicant',
      title: 'New Job Applicant',
      message: `A candidate has applied to your job posting: "${job.title}".`,
      metadata: { jobId: job._id.toString(), applicationId: application._id.toString() }
    });

    socketService.sendToUser(job.recruiter.toString(), 'notification', notification);

    return res.status(201).json({
      status: 'success',
      message: 'Applied successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user?.id;
    if (!candidateId) {
      return next(new AppError('Unauthorized access', 401));
    }

    const applications = await Application.find({ candidate: candidateId })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location' }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

export const getJobApplicants = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterId = req.user?.id;
    const { jobId } = req.params;

    if (!recruiterId) {
      return next(new AppError('Unauthorized access', 401));
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.recruiter.toString() !== recruiterId && req.user?.role !== 'admin') {
      return next(new AppError('You do not have access to view applicants for this job', 403));
    }

    const applicants = await Application.find({ job: jobId })
      .populate('candidate', 'email')
      .populate('resume')
      .populate('resumeVersion')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: applicants.length,
      data: applicants
    });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterId = req.user?.id;
    if (!recruiterId) {
      return next(new AppError('Unauthorized access', 401));
    }

    const jobs = await Job.find({ recruiter: recruiterId }).select('_id');
    const jobIds = jobs.map((job) => job._id);

    const [totalApplicants, shortlistedResumes] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'screening' })
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        jobsCount: jobs.length,
        totalApplicants,
        shortlistedResumes
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterId = req.user?.id;
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!recruiterId) {
      return next(new AppError('Unauthorized access', 401));
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    const job = application.job as any;
    if (job.recruiter.toString() !== recruiterId && req.user?.role !== 'admin') {
      return next(new AppError('You do not have authorization to modify application status', 403));
    }

    // Add status history details
    application.status = status;
    application.statusHistory.push({
      status,
      updatedBy: recruiterId as any,
      updatedAt: new Date(),
      comment
    });

    await application.save();

    // Create & dispatch push notification to Candidate
    const notification = await Notification.create({
      recipient: application.candidate,
      sender: recruiterId,
      type: 'application_status',
      title: 'Job Application Status Updated',
      message: `Your application status for "${job.title}" has been updated to "${status.toUpperCase()}".`,
      metadata: { jobId: job._id.toString(), applicationId: application._id.toString() }
    });

    socketService.sendToUser(application.candidate.toString(), 'notification', notification);

    return res.status(200).json({
      status: 'success',
      message: `Application status updated to ${status}`,
      data: application
    });
  } catch (error) {
    next(error);
  }
};
