import { Schema, model, Document } from 'mongoose';

export interface ISavedJob extends Document {
  candidate: Schema.Types.ObjectId;
  job: Schema.Types.ObjectId;
  savedAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>({
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  savedAt: { type: Date, default: Date.now }
});

// Compound unique index to prevent duplicate bookmarks
SavedJobSchema.index({ candidate: 1, job: 1 }, { unique: true });

export const SavedJob = model<ISavedJob>('SavedJob', SavedJobSchema);
export default SavedJob;
