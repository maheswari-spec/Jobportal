import { Schema, model, Document } from 'mongoose';

export interface IEducation {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface ICertification {
  name: string;
  issuingOrg: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate: Date;
  endDate?: Date;
}

export interface IExperience {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface ICandidateProfile extends Document {
  user: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  title?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  skills: string[];
  education: IEducation[];
  certifications: ICertification[];
  projects: IProject[];
  experience: IExperience[];
  resumes: Schema.Types.ObjectId[];
  primaryResume?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const CertificationSchema = new Schema<ICertification>({
  name: { type: String, required: true },
  issuingOrg: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expirationDate: { type: Date },
  credentialId: { type: String },
  credentialUrl: { type: String }
});

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date }
});

const ExperienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, required: true },
  achievements: [{ type: String }]
});

const CandidateProfileSchema = new Schema<ICandidateProfile>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  title: { type: String },
  avatar: { type: String },
  bio: { type: String },
  location: { type: String },
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String }
  },
  skills: [{ type: String, index: true }],
  education: [EducationSchema],
  certifications: [CertificationSchema],
  projects: [ProjectSchema],
  experience: [ExperienceSchema],
  resumes: [{ type: Schema.Types.ObjectId, ref: 'Resume' }],
  primaryResume: { type: Schema.Types.ObjectId, ref: 'Resume' }
}, { timestamps: true });

export const CandidateProfile = model<ICandidateProfile>('CandidateProfile', CandidateProfileSchema);
export default CandidateProfile;
