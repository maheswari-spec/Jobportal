import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['candidate', 'recruiter', 'admin'], {
      required_error: 'Role is required'
    })
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const firebaseLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Firebase idToken is required').optional(),
    role: z.enum(['candidate', 'recruiter']).optional()
  })
});
