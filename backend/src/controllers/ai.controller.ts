import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini.service';
import { Resume } from '../models/resume.model';
import { ResumeVersion } from '../models/resumeVersion.model';
import { Job } from '../models/job.model';
import { CandidateProfile } from '../models/candidate.model';
import { AppError } from '../utils/errors';

export const analyzeResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user?.id;
    const { resumeText, title = 'Uploaded Resume' } = req.body;

    if (!candidateId) {
      return next(new AppError('Unauthorized access', 401));
    }

    if (!resumeText) {
      return next(new AppError('Resume text content is required for analysis', 400));
    }

    // Call Gemini API Service
    const analysis = await geminiService.analyzeResumeText(resumeText);

    // Save parsed details in Resume Model
    const resume = await Resume.create({
      candidate: candidateId,
      title,
      url: 'raw-text-upload', // Default placeholder if text is directly pasted
      fileType: 'json',
      isPrimary: false,
      parsedData: {
        summary: analysis.improvedSummary,
        skills: analysis.skills,
        experience: analysis.experienceSuggestions,
        atsScore: analysis.atsScore,
        suggestions: analysis.suggestions
      }
    });

    // Update candidate profile skills/experience if empty
    const profile = await CandidateProfile.findOne({ user: candidateId });
    if (profile) {
      if (profile.skills.length === 0) {
        profile.skills = analysis.skills;
      }
      profile.resumes.push(resume._id as any);
      if (!profile.primaryResume) {
        profile.primaryResume = resume._id as any;
      }
      await profile.save();
    }

    return res.status(200).json({
      status: 'success',
      data: {
        resumeId: resume._id,
        analysis
      }
    });
  } catch (error) {
    next(error);
  }
};

export const matchJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { jobId, resumeId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job posting not found', 404));
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return next(new AppError('Resume details not found', 404));
    }

    // Call Gemini matching logic
    const matchResults = await geminiService.matchResumeWithJD(resume.parsedData, job.description);

    return res.status(200).json({
      status: 'success',
      data: matchResults
    });
  } catch (error) {
    next(error);
  }
};

export const buildTailoredResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user?.id;
    const { resumeId, jdText, title } = req.body;

    if (!candidateId) {
      return next(new AppError('Unauthorized access', 401));
    }

    const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId });
    if (!resume) {
      return next(new AppError('Original resume not found', 404));
    }

    // Call Gemini tailoring logic
    const tailoredDetails = await geminiService.tailorResumeForJD(resume.parsedData, jdText);

    // Fetch existing versions to assign appropriate version number
    const versionsCount = await ResumeVersion.countDocuments({ resume: resumeId });

    const newVersion = await ResumeVersion.create({
      resume: resumeId,
      candidate: candidateId,
      title: title || `Tailored Version v${versionsCount + 1}`,
      versionNumber: versionsCount + 1,
      jdTailored: true,
      targetJdText: jdText,
      parsedData: tailoredDetails
    });

    return res.status(201).json({
      status: 'success',
      message: 'Tailored resume generated successfully',
      data: newVersion
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeId, jdText, companyName } = req.body;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return next(new AppError('Resume details not found', 404));
    }

    const coverLetter = await geminiService.generateCoverLetter(resume.parsedData, jdText, companyName);

    return res.status(200).json({
      status: 'success',
      data: coverLetter
    });
  } catch (error) {
    next(error);
  }
};

export const generateInterviewQuestions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return next(new AppError('Resume details not found', 404));
    }

    const questions = await geminiService.generateInterviewQuestions(resume.parsedData);

    return res.status(200).json({
      status: 'success',
      data: questions
    });
  } catch (error) {
    next(error);
  }
};
