import { Schema, model, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: Schema.Types.ObjectId;
  recruiter: Schema.Types.ObjectId;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Director';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
    visible: boolean;
  };
  requirements: string[];
  responsibilities: string[];
  skillsRequired: string[];
  status: 'active' | 'filled' | 'archived';
  applicantsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'], 
    required: true,
    index: true
  },
  experienceLevel: { 
    type: String, 
    enum: ['Entry', 'Mid', 'Senior', 'Director'], 
    required: true,
    index: true
  },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
    visible: { type: Boolean, default: true }
  },
  requirements: [{ type: String }],
  responsibilities: [{ type: String }],
  skillsRequired: [{ type: String, index: true }],
  status: { type: String, enum: ['active', 'filled', 'archived'], default: 'active', index: true },
  applicantsCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 }
}, { timestamps: true });

// Create text index for searchability
JobSchema.index({ title: 'text', description: 'text', location: 'text' });

export const Job = model<IJob>('Job', JobSchema);
export default Job;
