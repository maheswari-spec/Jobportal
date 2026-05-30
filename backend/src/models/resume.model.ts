import { Schema, model, Document } from 'mongoose';

export interface IResume extends Document {
  candidate: Schema.Types.ObjectId;
  title: string;
  url: string; // Cloudinary resource URL
  fileType: 'pdf' | 'docx' | 'json';
  isPrimary: boolean;
  parsedData?: {
    summary?: string;
    skills?: string[];
    experience?: Array<{
      company: string;
      position: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description: string;
      achievements?: string[];
    }>;
    education?: Array<{
      school: string;
      degree: string;
      fieldOfStudy: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
    }>;
    certifications?: string[];
    projects?: Array<{
      title: string;
      description: string;
      technologies?: string[];
    }>;
    atsScore?: number;
    suggestions?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx', 'json'], required: true },
  isPrimary: { type: Boolean, default: false },
  parsedData: {
    summary: { type: String },
    skills: [{ type: String }],
    experience: [Schema.Types.Mixed],
    education: [Schema.Types.Mixed],
    certifications: [{ type: String }],
    projects: [Schema.Types.Mixed],
    atsScore: { type: Number },
    suggestions: [{ type: String }]
  }
}, { timestamps: true });

export const Resume = model<IResume>('Resume', ResumeSchema);
export default Resume;
