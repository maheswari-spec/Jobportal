import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  chat: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  content: string;
  contentType: 'text' | 'attachment' | 'resume_link';
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true },
  contentType: { 
    type: String, 
    enum: ['text', 'attachment', 'resume_link'], 
    default: 'text' 
  },
  attachmentUrl: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Message = model<IMessage>('Message', MessageSchema);
export default Message;
