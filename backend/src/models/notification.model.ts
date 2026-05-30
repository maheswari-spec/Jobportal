import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: Schema.Types.ObjectId;
  sender?: Schema.Types.ObjectId;
  type: 'application_status' | 'new_job' | 'new_message' | 'new_applicant' | 'system';
  title: string;
  message: string;
  read: boolean;
  metadata?: {
    jobId?: string;
    applicationId?: string;
    chatRoomId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['application_status', 'new_job', 'new_message', 'new_applicant', 'system'], 
    required: true,
    index: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  metadata: {
    jobId: { type: String },
    applicationId: { type: String },
    chatRoomId: { type: String }
  }
}, { timestamps: true });

export const Notification = model<INotification>('Notification', NotificationSchema);
export default Notification;
