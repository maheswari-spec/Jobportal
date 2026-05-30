import { Schema, model, Document } from 'mongoose';

export interface IStatusHistory {
  status: 'applied' | 'screening' | 'interviewing' | 'offered' | 'rejected' | 'hired';
  updatedBy: Schema.Types.ObjectId;
  updatedAt: Date;
  comment?: string;
}

export interface IApplication extends Document {
  job: Schema.Types.ObjectId;
  candidate: Schema.Types.ObjectId;
  resume: Schema.Types.ObjectId;
  resumeVersion?: Schema.Types.ObjectId;
  coverLetter?: string;
  status: 'applied' | 'screening' | 'interviewing' | 'offered' | 'rejected' | 'hired';
  statusHistory: IStatusHistory[];
  appliedAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistory>({
  status: { 
    type: String, 
    enum: ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'hired'], 
    required: true 
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
  comment: { type: String }
});

const ApplicationSchema = new Schema<IApplication>({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resume: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  resumeVersion: { type: Schema.Types.ObjectId, ref: 'ResumeVersion' },
  coverLetter: { type: String },
  status: { 
    type: String, 
    enum: ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'hired'], 
    default: 'applied', 
    index: true 
  },
  statusHistory: [StatusHistorySchema]
}, { timestamps: true });

export const Application = model<IApplication>('Application', ApplicationSchema);
export default Application;
