import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  firebaseUid?: string;
  role: 'candidate' | 'recruiter' | 'admin';
  isVerified: boolean;
  status: 'active' | 'blocked';
  reportsCount: number;
  reportedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String },
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
  role: { type: String, enum: ['candidate', 'recruiter', 'admin'], default: 'candidate' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  reportsCount: { type: Number, default: 0 },
  reportedReason: { type: String },
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);
export default User;
