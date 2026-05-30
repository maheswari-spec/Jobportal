import { z } from 'zod';

export const updateCandidateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    title: z.string().optional(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    socialLinks: z.object({
      linkedin: z.string().url().optional().or(z.literal('')),
      github: z.string().url().optional().or(z.literal('')),
      portfolio: z.string().url().optional().or(z.literal(''))
    }).optional(),
    skills: z.array(z.string()).default([]),
    education: z.array(z.object({
      school: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string(),
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
      current: z.boolean().default(false),
      description: z.string().optional()
    })).default([]),
    certifications: z.array(z.object({
      name: z.string(),
      issuingOrg: z.string(),
      issueDate: z.string().transform((val) => new Date(val)),
      expirationDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
      credentialId: z.string().optional(),
      credentialUrl: z.string().url().optional().or(z.literal(''))
    })).default([]),
    projects: z.array(z.object({
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      githubUrl: z.string().url().optional().or(z.literal('')),
      liveUrl: z.string().url().optional().or(z.literal('')),
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined)
    })).default([]),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
      current: z.boolean().default(false),
      description: z.string(),
      achievements: z.array(z.string()).default([])
    })).default([])
  })
});

export const updateRecruiterProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    title: z.string().optional(),
    companyName: z.string().optional(),
    companyWebsite: z.string().url().or(z.literal('')).optional(),
    companyIndustry: z.string().optional(),
    companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
    companyDescription: z.string().optional(),
    companyHeadquarters: z.string().optional()
  })
});
