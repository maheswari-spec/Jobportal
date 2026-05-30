import { z } from 'zod';

export const postJobSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    companyId: z.string().min(1, 'Company ID is required'),
    location: z.string().min(1, 'Location is required'),
    type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']),
    experienceLevel: z.enum(['Entry', 'Mid', 'Senior', 'Director']),
    salaryRange: z.object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
      currency: z.string().default('USD'),
      visible: z.boolean().default(true)
    }).optional(),
    requirements: z.array(z.string()).default([]),
    responsibilities: z.array(z.string()).default([]),
    skillsRequired: z.array(z.string()).default([])
  })
});
