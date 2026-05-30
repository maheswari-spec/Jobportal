import { Schema, model, Document } from 'mongoose';

export interface IRecruiterProfile extends Document {
  user: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  company?: Schema.Types.ObjectId;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecruiterProfileSchema = new Schema<IRecruiterProfile>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  company: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
  title: { type: String }
}, { timestamps: true });

export const RecruiterProfile = model<IRecruiterProfile>('RecruiterProfile', RecruiterProfileSchema);
export default RecruiterProfile;
