import { Schema, model, Document } from 'mongoose';

export interface IChat extends Document {
  participants: Schema.Types.ObjectId[];
  lastMessage?: Schema.Types.ObjectId;
  unreadCounts: Map<string, number>; // userId -> number
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  unreadCounts: { 
    type: Map, 
    of: Number, 
    default: new Map() 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Chat = model<IChat>('Chat', ChatSchema);
export default Chat;
