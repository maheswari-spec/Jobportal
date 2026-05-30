import { Schema, model, Document } from 'mongoose';

export interface IResumeVersion extends Document {
  resume: Schema.Types.ObjectId;
  candidate: Schema.Types.ObjectId;
  title: string;
  versionNumber: number;
  jdTailored: boolean;
  targetJdText?: string;
  parsedData: any; // Tailored version structured JSON data
  url?: string; // Cloudinary PDF URL if generated/rendered
  createdAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersion>({
  resume: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  versionNumber: { type: Number, required: true },
  jdTailored: { type: Boolean, default: false },
  targetJdText: { type: String },
  parsedData: { type: Schema.Types.Mixed, required: true },
  url: { type: String }
}, { timestamps: true });

export const ResumeVersion = model<IResumeVersion>('ResumeVersion', ResumeVersionSchema);
export default ResumeVersion;
