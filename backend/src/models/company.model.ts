import { Schema, model, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  description?: string;
  headquarters?: string;
  jobs: Schema.Types.ObjectId[];
  recruiters: Schema.Types.ObjectId[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true, unique: true, index: true },
  logo: { type: String },
  website: { type: String },
  industry: { type: String },
  size: { 
    type: String, 
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], 
    default: '11-50' 
  },
  description: { type: String },
  headquarters: { type: String },
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  recruiters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const Company = model<ICompany>('Company', CompanySchema);
export default Company;
